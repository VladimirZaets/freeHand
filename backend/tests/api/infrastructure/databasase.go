package infrastructure

import (
	"context"
	"github.com/joho/godotenv"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
	"os"
)

type DatabaseParams struct {
	Network      string
	NetworkAlias string
	Ctx          context.Context
}

type Database struct {
	network      string
	networkAlias string
	ctx          context.Context
	container    testcontainers.Container
}

func NewDatabase(params *ContainerParam) *Database {
	var networkAlias string

	if params.NetworkAlias == "" {
		networkAlias = "database"
	} else {
		networkAlias = params.NetworkAlias
	}

	return &Database{
		network:      params.Network,
		networkAlias: networkAlias,
		ctx:          params.Context,
	}
}

func (d *Database) Start() (*Database, error) {
	pwd, err := os.Getwd()
	err = godotenv.Load(pwd + "/.env")
	if err != nil {
		return nil, err
	}
	req := testcontainers.ContainerRequest{
		FromDockerfile: testcontainers.FromDockerfile{
			Context:    "../../../database",
			Dockerfile: "Dockerfile",
		},
		Networks: []string{d.network},
		NetworkAliases: map[string][]string{
			d.network: []string{d.networkAlias},
		},
		Env: map[string]string{
			"POSTGRES_DB":                os.Getenv("DATASTORE_DATABASE"),
			"POSTGRES_SEARCH_PATH":       os.Getenv("DATASTORE_SEARCH_PATH"),
			"POSTGRES_PASSWORD":          os.Getenv("DATASTORE_PASSWORD"),
			"POSTGRES_APP_USER":          os.Getenv("DATASTORE_USERNAME"),
			"POSTGRES_APP_USER_PASSWORD": os.Getenv("DATASTORE_PASSWORD"),
		},
		ExposedPorts: []string{"5432/tcp"},
		WaitingFor:   wait.ForListeningPort("5432/tcp"),
	}

	db, err := testcontainers.GenericContainer(d.ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: req,
		Started:          true,
	})

	if err != nil {
		return nil, err
	}
	d.container = db
	return d, nil
}

func (d *Database) NetworkAlias() string {
	return d.networkAlias
}

func (d *Database) Container() testcontainers.Container {
	return d.container
}
