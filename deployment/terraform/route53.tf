data "aws_route53_zone" "hosted_zone" {
  name         = var.domain_name
  private_zone = false
}

resource "aws_route53_record" "backend_domain" {
  name    = var.backend_domain_name
  type    = "A"
  zone_id = data.aws_route53_zone.hosted_zone.id

  alias {
    evaluate_target_health = true
    name                   = aws_alb.backend_service_lb_freehands.dns_name
    zone_id                = aws_alb.backend_service_lb_freehands.zone_id
  }
}

resource "aws_route53_record" "frontend_domain" {
  name    = var.domain_name
  type    = "A"
  zone_id = data.aws_route53_zone.hosted_zone.id

  alias {
    evaluate_target_health = false
    name                   = aws_cloudfront_distribution.cloudfront_frontend.domain_name
    zone_id                = aws_cloudfront_distribution.cloudfront_frontend.hosted_zone_id
  }
}

resource "aws_route53_record" "frontend_domain_www" {
  name    = "www.${var.domain_name}"
  type    = "A"
  zone_id = data.aws_route53_zone.hosted_zone.id

  alias {
    evaluate_target_health = false
    name                   = aws_cloudfront_distribution.www_cloudfront_frontend.domain_name
    zone_id                = aws_cloudfront_distribution.www_cloudfront_frontend.hosted_zone_id
  }
}

resource "aws_acm_certificate" "api_certificate" {
  domain_name       = "*.${var.domain_name}"
  validation_method = "DNS"

  subject_alternative_names = [
    var.domain_name
  ]

  tags = {
    Name = "freehands-backend-certificate"
  }
}

resource "aws_route53_record" "api_certificate_validation" {
  for_each = {
    for dvo in aws_acm_certificate.api_certificate.domain_validation_options : dvo.domain_name => {
        name    = dvo.resource_record_name
        record    = dvo.resource_record_value
        type = dvo.resource_record_type
        }
    }

    allow_overwrite = true
    name            = each.value.name
    records = [each.value.record]
    ttl             = 60
    type = each.value.type
    zone_id = data.aws_route53_zone.hosted_zone.id
  }


resource "aws_acm_certificate_validation" "api_certificate" {
  certificate_arn = aws_acm_certificate.api_certificate.arn
  validation_record_fqdns = [
    for record in aws_route53_record.api_certificate_validation :
    record.fqdn
  ]
}