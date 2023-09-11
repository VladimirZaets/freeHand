package infrastructure

import (
	"context"
	"fmt"
	"github.com/joho/godotenv"
	"github.com/testcontainers/testcontainers-go"
	"os"
)

type Migration struct {
	network      string
	networkAlias string
	ctx          context.Context
	container    testcontainers.Container
	env          map[string]string
}

type MigrationParams struct {
	Network      string
	NetworkAlias string
	Ctx          context.Context
	ENV          map[string]string
}

func NewMigration(params MigrationParams) *Migration {
	var networkAlias string

	if params.NetworkAlias == "" {
		networkAlias = "migration"
	} else {
		networkAlias = params.NetworkAlias
	}

	return &Migration{
		network:      params.Network,
		networkAlias: networkAlias,
		ctx:          params.Ctx,
		env:          params.ENV,
	}
}

func (m *Migration) Start() (*Migration, error) {
	pwd, err := os.Getwd()
	err = godotenv.Load(pwd + "/.env")
	if err != nil {
		return nil, err
	}

	if _, ok := m.env["DATASTORE_HOST"]; !ok {
		m.env["DATASTORE_HOST"] = os.Getenv("DATASTORE_HOST")
	}

	req := testcontainers.ContainerRequest{
		FromDockerfile: testcontainers.FromDockerfile{
			Context:    "../../../database",
			Dockerfile: "Dockerfile-migration",
		},
		Entrypoint: []string{
			"migrate",
			"-path",
			"/migrations/",
			"-database",
			fmt.Sprintf(
				"%s://%s:%s@%s/%s?sslmode=disable&search_path=%s",
				os.Getenv("DATASTORE_DRIVER"),
				os.Getenv("DATASTORE_USERNAME"),
				os.Getenv("DATASTORE_PASSWORD"),
				m.env["DATASTORE_HOST"],
				os.Getenv("DATASTORE_DATABASE"),
				os.Getenv("DATASTORE_SEARCH_PATH"),
			),
			"up",
		},
		Networks: []string{m.network},
		NetworkAliases: map[string][]string{
			m.network: []string{m.networkAlias},
		},
	}

	migrate, err := testcontainers.GenericContainer(m.ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: req,
		Started:          true,
	})

	if err != nil {
		return nil, err
	}

	m.container = migrate
	return m, nil
}

func (m *Migration) Container() testcontainers.Container {
	return m.container
}
