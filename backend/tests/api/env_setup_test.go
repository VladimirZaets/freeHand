package api

import (
	"context"
	"fmt"
	"github.com/VladimirZaets/freehands/backend/tests/api/infrastructure"
	"github.com/testcontainers/testcontainers-go"
	"log"
	"net/http"
	"os"
	"testing"
	"time"
)

const network = "api-tests"

var URI string
var networkContainer testcontainers.Network
var databaseContainer *infrastructure.Database
var appContainer *infrastructure.App
var migrationContainer *infrastructure.Migration
var mailContainer *infrastructure.Mail
var client = http.Client{
	Timeout: 30 * time.Second,
}

func setup(ctx context.Context) {
	_, err := infrastructure.NewSetup(&infrastructure.ContainersParam{
		Context: ctx,
	}).Start()
	if err != nil {
		log.Fatal(err)
	}
	nc, err := testcontainers.GenericNetwork(ctx, testcontainers.GenericNetworkRequest{
		NetworkRequest: testcontainers.NetworkRequest{
			Name:           network,
			CheckDuplicate: true,
		},
	})
	if err != nil {
		log.Fatal(err)
	}
	networkContainer = nc

	databaseContainer, err = infrastructure.NewDatabase(&infrastructure.ContainerParam{
		Context: ctx,
		Network: network,
	}).Start()
	if err != nil {
		log.Fatal(err)
	}

	migrationContainer, err = infrastructure.NewMigration(infrastructure.MigrationParams{
		Ctx:     ctx,
		Network: network,
		ENV: map[string]string{
			"DATASTORE_HOST": fmt.Sprintf("%s:5432", databaseContainer.NetworkAlias()),
		},
	}).Start()
	if err != nil {
		log.Fatal(err)
	}

	mailContainer, err = infrastructure.NewMail(infrastructure.MailParams{
		Ctx:     ctx,
		Network: network,
	}).Start()
	if err != nil {
		log.Fatal(err)
	}

	appContainer, err = infrastructure.NewApp(infrastructure.AppParams{
		Ctx:     ctx,
		Network: network,
		ENV: map[string]string{
			"DATASTORE_HOST": fmt.Sprintf("%s:5432", databaseContainer.NetworkAlias()),
			"SMTP_HOST":      mailContainer.NetworkAlias(),
		},
	}).Start()
	if err != nil {
		log.Fatal(err)
	}

	host, err := appContainer.Container().Host(ctx)
	port, err := appContainer.Container().MappedPort(ctx, appContainer.Port())
	URI = fmt.Sprintf("http://%s:%d/api/v1", host, port.Int())
}
func teardown(ctx context.Context, cancel context.CancelFunc) {
	err := appContainer.Container().Stop(ctx, nil)
	if err != nil {
		log.Fatal(err)
	}

	err = mailContainer.Container().Stop(ctx, nil)
	if err != nil {
		log.Fatal(err)
	}

	err = migrationContainer.Container().Stop(ctx, nil)
	if err != nil {
		log.Fatal(err)
	}

	err = databaseContainer.Container().Stop(ctx, nil)
	if err != nil {
		log.Fatal(err)
	}

	err = networkContainer.Remove(ctx)
	if err != nil {
		log.Fatal(err)
	}

	cancel()
}
func TestMain(m *testing.M) {
	code := 1
	ctx, cancel := context.WithCancel(context.Background())
	defer func() {
		teardown(ctx, cancel)
		os.Exit(code)
	}()
	setup(ctx)
	exitCode := m.Run()
	teardown(ctx, cancel)
	os.Exit(exitCode)
}
