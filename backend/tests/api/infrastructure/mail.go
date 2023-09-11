package infrastructure

import (
	"context"
	"github.com/joho/godotenv"
	"github.com/testcontainers/testcontainers-go"
	"os"
)

type Mail struct {
	network      string
	networkAlias string
	ctx          context.Context
	container    testcontainers.Container
}

type MailParams struct {
	Network      string
	NetworkAlias string
	Ctx          context.Context
}

func NewMail(params MailParams) *Mail {
	var networkAlias string

	if params.NetworkAlias == "" {
		networkAlias = "mail"
	} else {
		networkAlias = params.NetworkAlias
	}

	return &Mail{
		network:      params.Network,
		networkAlias: networkAlias,
		ctx:          params.Ctx,
	}
}

func (m *Mail) Start() (*Mail, error) {
	pwd, err := os.Getwd()
	err = godotenv.Load(pwd + "/.env")
	if err != nil {
		return nil, err
	}

	req := testcontainers.ContainerRequest{
		Image:        "mailhog/mailhog",
		ExposedPorts: []string{"8025/tcp", "1025/tcp"},
		Networks:     []string{m.network},
		NetworkAliases: map[string][]string{
			m.network: []string{m.networkAlias},
		},
	}
	mail, err := testcontainers.GenericContainer(m.ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: req,
		Started:          true,
	})
	if err != nil {
		return nil, err
	}
	m.container = mail
	return m, nil
}

func (m *Mail) Container() testcontainers.Container {
	return m.container
}

func (m *Mail) NetworkAlias() string {
	return m.networkAlias
}
