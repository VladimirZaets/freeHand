package infrastructure

import (
	"context"
	"github.com/docker/go-connections/nat"
	"github.com/joho/godotenv"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
	"os"
)

type TestLogConsumer struct {
	Msgs []string
}

func (g *TestLogConsumer) Accept(l testcontainers.Log) {
	g.Msgs = append(g.Msgs, string(l.Content))
}

type App struct {
	network      string
	networkAlias string
	ctx          context.Context
	logs         TestLogConsumer
	container    testcontainers.Container
	env          map[string]string
}

type AppParams struct {
	Network      string
	NetworkAlias string
	Ctx          context.Context
	ENV          map[string]string
}

func NewApp(params AppParams) *App {
	var networkAlias string

	if params.NetworkAlias == "" {
		networkAlias = "app"
	} else {
		networkAlias = params.NetworkAlias
	}

	return &App{
		network:      params.Network,
		networkAlias: networkAlias,
		ctx:          params.Ctx,
		env:          params.ENV,
		logs: TestLogConsumer{
			Msgs: []string{},
		},
	}
}

func (a *App) Container() testcontainers.Container {
	return a.container
}

func (a *App) Start() (*App, error) {
	pwd, err := os.Getwd()
	err = godotenv.Load(pwd + "/.env")
	if err != nil {
		return nil, err
	}

	if _, ok := a.env["DATASTORE_HOST"]; !ok {
		a.env["DATASTORE_HOST"] = os.Getenv("DATASTORE_HOST")
	}

	if _, ok := a.env["SMTP_HOST"]; !ok {
		a.env["SMTP_HOST"] = os.Getenv("SMTP_HOST")
	}

	req := testcontainers.ContainerRequest{
		FromDockerfile: testcontainers.FromDockerfile{
			Context:    "../../../backend",
			Dockerfile: "Dockerfile",
		},
		Networks: []string{a.network},
		NetworkAliases: map[string][]string{
			a.network: []string{a.networkAlias},
		},
		ExposedPorts: []string{"8080/tcp"},
		Env: map[string]string{
			"SMTP_TEMPLATES_URL":     os.Getenv("SMTP_TEMPLATES_URL"),
			"SMPT_TLS_INSECURE":      os.Getenv("SMPT_TLS_INSECURE"),
			"SMPT_USERNAME":          os.Getenv("SMPT_USERNAME"),
			"SMTP_FROM":              os.Getenv("SMTP_FROM"),
			"SMTP_PORT":              os.Getenv("SMTP_PORT"),
			"SMTP_HOST":              a.env["SMTP_HOST"],
			"SECRETS_EMAIL":          os.Getenv("SECRETS_EMAIL"),
			"SECRETS_AUTH":           os.Getenv("SECRETS_AUTH"),
			"CLIENT_SSL":             os.Getenv("CLIENT_SSL"),
			"CLIENT_PORT":            os.Getenv("CLIENT_PORT"),
			"CLIENT_DOMAIN":          os.Getenv("CLIENT_DOMAIN"),
			"DATASTORE_DRIVER":       os.Getenv("DATASTORE_DRIVER"),
			"DATASTORE_SEARCH_PATH":  os.Getenv("DATASTORE_SEARCH_PATH"),
			"DATASTORE_DATABASE":     os.Getenv("DATASTORE_DATABASE"),
			"DATASTORE_PASSWORD":     os.Getenv("DATASTORE_PASSWORD"),
			"DATASTORE_USERNAME":     os.Getenv("DATASTORE_USERNAME"),
			"DATASTORE_HOST":         a.env["DATASTORE_HOST"],
			"ALLOWED_HOSTS":          os.Getenv("ALLOWED_HOSTS"),
			"AUTH_GITHUB_ATTRIBUTES": os.Getenv("AUTH_GITHUB_ATTRIBUTES"),
			"AUTH_GITHUB_CSEC":       os.Getenv("AUTH_GITHUB_CSEC"),
			"AUTH_GITHUB_CID":        os.Getenv("AUTH_GITHUB_CID"),
			"API_URL":                os.Getenv("API_URL"),
		},
		WaitingFor: wait.ForListeningPort("8080/tcp"),
	}

	app, err := testcontainers.GenericContainer(a.ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: req,
		Started:          true,
	})

	if err != nil {
		return nil, err
	}

	app.FollowOutput(&a.logs)
	err = app.StartLogProducer(a.ctx)
	if err != nil {
		return nil, err
	}
	a.container = app
	return a, nil
}

func (a *App) Logs() TestLogConsumer {
	return a.logs
}

func (a *App) Port() nat.Port {
	return "8080"
}
