resource "aws_s3_bucket" "www_frontend_s3_bucket" {
  bucket = "wwww.${var.domain_name}"
  force_destroy = true

  tags = {
    Name        = "wwww.${var.domain_name}"
    Environment = var.deployment_env
  }
}

resource "aws_s3_bucket" "frontend_s3_bucket" {
  bucket = var.domain_name
  force_destroy = true

  tags = {
    Name        = var.domain_name
    Environment = var.deployment_env
  }
}

resource "aws_s3_bucket_acl" "www_frontend_s3_bucket_acl" {
  bucket = aws_s3_bucket.www_frontend_s3_bucket.id
  acl    = "private"
  depends_on = [aws_s3_bucket_ownership_controls.www_frontend_s3_bucket_ownership]
}

resource "aws_s3_bucket_acl" "frontend_s3_bucket_acl" {
  bucket = aws_s3_bucket.frontend_s3_bucket.id
  acl    = "private"
  depends_on = [aws_s3_bucket_ownership_controls.frontend_s3_bucket_ownership]
}

resource "aws_s3_bucket_website_configuration" "frontend_s3_bucket_website" {
    bucket = aws_s3_bucket.frontend_s3_bucket.id
    redirect_all_requests_to {
      host_name = "www.${var.domain_name}"
      protocol = "https"
    }
}

resource "aws_s3_bucket_ownership_controls" "www_frontend_s3_bucket_ownership" {
  bucket = aws_s3_bucket.www_frontend_s3_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_ownership_controls" "frontend_s3_bucket_ownership" {
  bucket = aws_s3_bucket.frontend_s3_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_object" "frontend_s3_bucket_data" {
  for_each      = fileset(var.upload_directory, "**/*.*")
  bucket        = aws_s3_bucket.www_frontend_s3_bucket.id
  key           = replace(each.value, var.upload_directory, "")
  source        = "${var.upload_directory}${each.value}"
  acl           = "private"
  etag          = filemd5("${var.upload_directory}${each.value}")
  content_type  = lookup(var.mime_types, split(".", each.value)[length(split(".", each.value)) - 1])
}
