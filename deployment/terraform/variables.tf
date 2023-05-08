//Deployment
variable "deployment_env" {
  type = string
  default = "prod"
}

//AWS Credentials
variable "aws_access_key" {
  type = string
}
variable "aws_secret_key" {
  type = string
}
variable "aws_token" {
  type = string
  default = ""
}
variable "aws_region" {
  type = string
  default = "us-east-1"
}

//AWS S3 Frontend Bucket
variable "frontend_s3_bucket" {
  type = string
  default = "freehands-frontend"
}
variable "frontend_s3_bucket_name" {
  type = string
  default = "Freehands Frontend"
}

variable "docker_hub_private_registry_credentials" {
  type = map(string)
}

variable "cloudfront_custom_error_responses" {
  type = list(object({
    error_caching_min_ttl = number
    error_code            = number
    response_code         = number
    response_page_path    = string
  }))
  default = [
    {
      error_caching_min_ttl = 300
      error_code            = 403
      response_code         = 200
      response_page_path    = "/index.html"
    },
    {
      error_caching_min_ttl = 300
      error_code            = 404
      response_code         = 200
      response_page_path    = "/index.html"
    }
  ]
}

variable "domain_name" {
  default = "freehandsnow.com"
  description = "App domain name"
  type = string
}

variable "backend_domain_name" {
  default = "api"
  description = "Domain name for backend"
  type = string
}

variable "mime_types" {
  default = {
    htm   = "text/html"
    html  = "text/html"
    png  = "text/html"
    woff2 = "font/woff2"
    woff = "font/woff"
    svg = "font/svg"
    ico   = "image/x-icon"
    css   = "text/css"
    ttf   = "font/ttf"
    txt   = "text/plain"
    js    = "application/javascript"
    map   = "application/javascript"
    json  = "application/json"
  }
}

variable "upload_directory" {
  default = "../../frontend/build/"
}

variable "api_auth_github_csec" {
  type = string
}

variable "api_auth_github_cid" {
  type = string
}

variable "api_version" {
  type = string
}

variable "api_auth_github_attributes" {
  type = string
  default = "email:email,avatar_url:avatar_url"
}