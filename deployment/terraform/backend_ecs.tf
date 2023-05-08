resource "aws_ecs_cluster" "backend_service_cluster" {
  name = "backend_service_cluster"
}

resource "aws_cloudwatch_log_group" "backend_service_freehands" {
  name = "/ecs/service-freehands"
}

resource "aws_ecs_service" "backend_service_freehands" {
  name            = "backend_service_freehands"
  task_definition = aws_ecs_task_definition.backend_service_freehands.arn

  cluster     = aws_ecs_cluster.backend_service_cluster.id
  launch_type     = "FARGATE"

  desired_count = 1

  load_balancer {
    target_group_arn = aws_lb_target_group.backend_service_freehands.arn
    container_name   = "freehands"
    container_port   = "8080"
  }

  network_configuration {
    assign_public_ip = false

    security_groups = [
      aws_security_group.egress_all.id,
      aws_security_group.ingress_api.id,
    ]

    subnets = [
      aws_subnet.private_d.id,
      aws_subnet.private_e.id,
    ]
  }
}

resource "aws_lb_target_group" "backend_service_freehands" {
  name        = "backend-service-freehands"
  port        = 8080
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.app_vpc.id

  health_check {
    enabled = true
    path    = "/ping"
  }

  depends_on = [aws_alb.backend_service_lb_freehands]
}

resource "aws_alb" "backend_service_lb_freehands" {
  name               = "backend-service-lb-freehands"
  internal           = false
  load_balancer_type = "application"

  subnets = [
    aws_subnet.public_d.id,
    aws_subnet.public_e.id,
  ]

  security_groups = [
    aws_security_group.http.id,
    aws_security_group.https.id,
    aws_security_group.egress_all.id,
  ]

  depends_on = [aws_internet_gateway.igw]
}

resource "aws_iam_role" "ecs_task_role" {
  name = "ecs-task-role"

  assume_role_policy = <<EOF
{
 "Version": "2012-10-17",
 "Statement": [
   {
     "Action": "sts:AssumeRole",
     "Principal": {
       "Service": "ecs-tasks.amazonaws.com"
     },
     "Effect": "Allow",
     "Sid": ""
   }
 ]
}
EOF
}

resource "aws_iam_role" "backend_service_freehands_task_execution_role" {
  name               = "distribution-portal-task-execution-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume_role.json
}

data "aws_iam_policy_document" "ecs_task_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role" {
  role       = aws_iam_role.backend_service_freehands_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}



resource "aws_secretsmanager_secret" "docker_hub_private_registry" {
  name = "docker-hub-private-registry"
  description = "Docker Hub private registry credentials"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "docker_hub_private_registry_secret" {
  secret_id     = aws_secretsmanager_secret.docker_hub_private_registry.id
  secret_string = jsonencode(var.docker_hub_private_registry_credentials)
}

resource "aws_iam_role_policy_attachment" "ecs-task-to-secret" {
  role       = aws_iam_role.backend_service_freehands_task_execution_role.name
  policy_arn = aws_iam_policy.ecs-to-secret.arn
}

resource "aws_iam_policy" "ecs-to-secret" {
  name       = "ecs-to-secret"
  policy = <<-EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": [
          "kms:Decrypt",
          "secretsmanager:GetSecretValue"
        ],
        "Effect": "Allow",
        "Resource": [
          "${aws_secretsmanager_secret.docker_hub_private_registry.arn}"
        ]
      }
    ]
  }
  EOF
}


resource "aws_iam_role_policy" "password_policy_secretsmanager" {
  name = "esc-to-secretsmanager-read"
  role = aws_iam_role.ecs_task_role.id

  policy = <<-EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": [
          "kms:Decrypt",
          "secretsmanager:GetSecretValue"
        ],
        "Effect": "Allow",
        "Resource": [
          "${aws_secretsmanager_secret.docker_hub_private_registry.arn}"
        ]
      }
    ]
  }
  EOF
}

resource "aws_ecs_task_definition" "backend_service_freehands" {
  family = "backend_service_freehands"
  container_definitions = <<EOF
  [
    {
      "name": "freehands",
      "image": "docker.io/vzaets/freehands:${var.api_version}",
      "repositoryCredentials" : {
        "credentialsParameter" : "${aws_secretsmanager_secret.docker_hub_private_registry.arn}"
      },
      "environment": [
                {
                    "name": "AUTH_GITHUB_CSEC",
                    "value": "${var.api_auth_github_csec}"
                },
                {
                    "name": "AUTH_GITHUB_CID",
                    "value": "${var.api_auth_github_cid}"
                },
                {
                    "name": "ENV",
                    "value": "${var.deployment_env}"
                },
                {
                    "name": "AUTH_GITHUB_ATTRIBUTES",
                    "value": "${var.api_auth_github_attributes}"
                },
                {
                    "name": "ALLOWED_HOSTS",
                    "value": "https://www.${var.domain_name}, https://${var.domain_name}"
                },
                {
                    "name": "API_URL",
                    "value": "https://${var.backend_domain_name}.${var.domain_name}"
                },
                {
                    "name": "CREDENTIALS",
                    "value": "${aws_secretsmanager_secret.docker_hub_private_registry.arn}"
                }
            ],
      "portMappings": [
        {
          "containerPort": 8080
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-region": "us-east-1",
          "awslogs-group": "/ecs/service-freehands",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
  EOF
  depends_on = [aws_secretsmanager_secret.docker_hub_private_registry]
  cpu = 256
  memory = 512
  requires_compatibilities = ["FARGATE"]
  execution_role_arn = aws_iam_role.backend_service_freehands_task_execution_role.arn
  task_role_arn = aws_iam_role.ecs_task_role.arn
  network_mode = "awsvpc"
}

resource "aws_alb_listener" "distribution-portal_http" {
  load_balancer_arn = aws_alb.backend_service_lb_freehands.arn
  port              = "80"
  protocol          = "HTTP"

    default_action {
      type = "redirect"
      redirect {
        port        = "443"
        protocol    = "HTTPS"
        status_code = "HTTP_301"
      }
    }
}

resource "aws_alb_listener" "distribution-portal_https" {
  load_balancer_arn = aws_alb.backend_service_lb_freehands.arn
  port              = "443"
  protocol          = "HTTPS"

  ssl_policy = "ELBSecurityPolicy-2016-08"
  certificate_arn   = aws_acm_certificate.api_certificate.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend_service_freehands.arn
  }

  depends_on = [aws_acm_certificate_validation.api_certificate]
}

output "alb_url" {
  value = "http://${aws_alb.backend_service_lb_freehands.dns_name}"
}

output "api_url_https" {
  value = "https://${aws_route53_record.backend_domain.name}.${var.domain_name}"
}