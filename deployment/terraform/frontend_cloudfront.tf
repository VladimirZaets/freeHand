resource "aws_cloudfront_distribution" "www_cloudfront_frontend" {
  origin {
    domain_name = aws_s3_bucket.www_frontend_s3_bucket.bucket_regional_domain_name
    origin_id = "www.${var.domain_name}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.www_frontend_access_identity.cloudfront_access_identity_path
    }
  }

  dynamic "custom_error_response" {
    for_each = var.cloudfront_custom_error_responses
    content {
      error_code            = custom_error_response.value.error_code
      response_code         = custom_error_response.value.response_code
      error_caching_min_ttl = custom_error_response.value.error_caching_min_ttl
      response_page_path    = custom_error_response.value.response_page_path
    }
  }
  aliases = ["www.${var.domain_name}"]
  enabled = true
  default_root_object = "index.html"

  default_cache_behavior {
    viewer_protocol_policy = "redirect-to-https"
    compress = true
    allowed_methods = ["GET", "HEAD"]
    cached_methods = ["GET", "HEAD"]
    target_origin_id = "www.${var.domain_name}"

    forwarded_values {
      query_string = "true"
      headers = ["Origin"]
      cookies {
        forward = "all"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.api_certificate.arn
    cloudfront_default_certificate = true
    ssl_support_method = "sni-only"
  }
}

resource "aws_cloudfront_distribution" "cloudfront_frontend" {
  origin {
    domain_name = aws_s3_bucket_website_configuration.frontend_s3_bucket_website.website_endpoint
    origin_id = var.domain_name
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1", "TLSv1.1", "TLSv1.2"]
    }
  }

  aliases = [var.domain_name]
  enabled = true
  default_root_object = ""

  default_cache_behavior {
    viewer_protocol_policy = "redirect-to-https"
    compress = true
    allowed_methods = ["GET", "HEAD"]
    cached_methods = ["GET", "HEAD"]
    target_origin_id = var.domain_name

    forwarded_values {
      query_string = "true"
      headers = ["Origin"]
      cookies {
        forward = "all"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.api_certificate.arn
    cloudfront_default_certificate = true
    ssl_support_method = "sni-only"
  }
}

resource "aws_cloudfront_origin_access_identity" "www_frontend_access_identity" {
  comment = "CloudFront Origin Access Identity to Frontend S3 Bucket"
}

resource "aws_cloudfront_origin_access_identity" "frontend_access_identity" {
  comment = "CloudFront Origin Access Identity to Frontend S3 Bucket"
}

data "aws_iam_policy_document" "www_cloudfront_to_frontend_s3_policy" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.www_frontend_s3_bucket.arn}/*"]

    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.www_frontend_access_identity.iam_arn]
    }
  }
}

data "aws_iam_policy_document" "cloudfront_to_frontend_s3_policy" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.frontend_s3_bucket.arn}/*"]

    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.frontend_access_identity.iam_arn]
    }
  }
}

resource "aws_s3_bucket_policy" "www_frontend_s3_bucket_policy_to_cloudfront" {
  bucket = aws_s3_bucket.www_frontend_s3_bucket.id
  policy = data.aws_iam_policy_document.www_cloudfront_to_frontend_s3_policy.json
}

resource "aws_s3_bucket_policy" "frontend_s3_bucket_policy_to_cloudfront" {
  bucket = aws_s3_bucket.frontend_s3_bucket.id
  policy = data.aws_iam_policy_document.cloudfront_to_frontend_s3_policy.json
}