package cmd

import (
	"context"
	"fmt"
	"github.com/VladimirZaets/freehands/backend/app/api"
	"github.com/VladimirZaets/freehands/backend/app/middleware"
	"github.com/VladimirZaets/freehands/backend/app/services/auth"
	"github.com/VladimirZaets/freehands/backend/app/services/mail"
	"github.com/VladimirZaets/freehands/backend/app/store"
	"os"
	"os/signal"
	"syscall"
	"time"

	log "github.com/go-pkgz/lgr"
)

type AuthGroup struct {
	CID        string            `long:"cid" env:"CID" description:"OAuth client ID"`
	CSEC       string            `long:"csec" env:"CSEC" description:"OAuth client secret"`
	Attributes map[string]string `long:"attributes" env:"ATTRIBUTES" description:"OAuth attributes" env-delim:","`
}

type DataStore struct {
	Host       string `long:"host" env:"HOST" description:"datasource host"`
	Username   string `long:"username" env:"USERNAME" description:"datasource username"`
	Password   string `long:"password" env:"PASSWORD" description:"datasource password"`
	Database   string `long:"database" env:"DATABASE" description:"datasource database"`
	SearchPath string `long:"search-path" env:"SEARCH_PATH" description:"datasource search path"`
	Driver     string `long:"driver" env:"DRIVER" description:"datasource driver"`
	SSLMode    string `long:"ssl-mode" env:"SSL_MODE" default:"disable" description:"datasource ssl mode"`
}

type Secrets struct {
	Email   string `long:"email" env:"EMAIL" description:"email secret"`
	Auth    string `long:"auth" env:"AUTH" description:"auth secret"`
	Captcha string `long:"captcha" env:"CAPTCHA" description:"captcha secret"`
}

type SMTP struct {
	Host         string `long:"host" env:"HOST" description:"smtp host"`
	Port         int    `long:"port" env:"PORT" description:"smtp port"`
	Username     string `long:"username" env:"USERNAME" description:"smtp username"`
	Password     string `long:"password" env:"PASSWORD" description:"smtp password"`
	From         string `long:"from" env:"FROM" description:"smtp from"`
	TSLInsecure  bool   `long:"tls-insecure" env:"TLS_INSECURE" description:"smtp tls insecure"`
	TemplatesUrl string `long:"templates-url" env:"TEMPLATES_URL" description:"templates url"`
}

type Client struct {
	Domain string `long:"domain" env:"DOMAIN" description:"client domain"`
	Port   int    `long:"port" env:"PORT" description:"client port"`
	SSL    bool   `long:"ssl" env:"SSL" description:"client ssl"`
}

type ServerCommand struct {
	AppName      string   `long:"app-name" env:"APP_NAME" default:"freehands" description:"application name"`
	Port         int      `long:"port" env:"APP_PORT" default:"8080" description:"port"`
	Address      string   `long:"address" env:"APP_ADDRESS" default:"" description:"listening address"`
	APIUrl       string   `long:"api-url" env:"API_URL" required:"true" description:"url to api"`
	ENV          string   `long:"env" env:"ENV" default:"dev" description:"environment"`
	AllowedHosts []string `long:"allowed-hosts" env:"ALLOWED_HOSTS" description:"limit hosts/sources allowed " env-delim:","`
	Client       Client   `group:"client" namespace:"client" env-namespace:"CLIENT"`
	Secrets      Secrets  `group:"secrets" namespace:"secrets" env-namespace:"SECRETS"`
	SMTP         SMTP     `group:"smtp" namespace:"smtp" env-namespace:"SMTP"`
	Auth         struct {
		TTL struct {
			JWT    time.Duration `long:"jwt" env:"JWT" default:"5m" description:"JWT TTL"`
			Cookie time.Duration `long:"cookie" env:"COOKIE" default:"200h" description:"auth cookie TTL"`
		} `group:"ttl" namespace:"ttl" env-namespace:"TTL"`
		Google   AuthGroup `group:"google" namespace:"google" env-namespace:"GOOGLE" description:"Google OAuth"`
		Github   AuthGroup `group:"github" namespace:"github" env-namespace:"GITHUB" description:"Github OAuth"`
		Facebook AuthGroup `group:"facebook" namespace:"facebook" env-namespace:"FACEBOOK" description:"Facebook OAuth"`
	} `group:"auth" namespace:"auth" env-namespace:"AUTH"`
	DataStore DataStore `group:"datastore" namespace:"datastore" env-namespace:"DATASTORE"`
}

func (s *ServerCommand) Execute(_ []string) error {
	log.Printf("[INFO] start server on port %s:%d", s.Address, s.Port)
	resetEnv(
		"AUTH_GOOGLE_CSEC",
		"AUTH_GITHUB_CSEC",
		"AUTH_FACEBOOK_CSEC",
		"AUTH_MICROSOFT_CSEC",
		"AUTH_TWITTER_CSEC",
		"AUTH_YANDEX_CSEC",
		"AUTH_PATREON_CSEC",
		"TELEGRAM_TOKEN",
		"SMTP_PASSWORD",
		"ADMIN_PASSWD",
	)

	ctx, cancel := context.WithCancel(context.Background())
	go func() { // catch signal and invoke graceful termination
		stop := make(chan os.Signal, 1)
		signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
		<-stop
		log.Printf("[WARN] interrupt signal")
		cancel()
	}()

	app, err := s.newServerApp(ctx)

	if err != nil {
		log.Printf("[PANIC] failed to setup application, %+v", err)
		return err
	}

	if err = app.run(ctx); err != nil {
		log.Printf("[ERROR] server terminated with error %+v", err)
		return err
	}
	log.Printf("[INFO] server terminated")
	return nil
}

func (s *ServerCommand) newServerApp(ctx context.Context) (*serverApp, error) {
	log.Printf("[INFO] start server on port %s:%d", s.Address, s.Port)

	dataService := store.NewDataStore(store.DataStoreParams{
		Host:       s.DataStore.Host,
		Username:   s.DataStore.Username,
		Password:   s.DataStore.Password,
		DBName:     s.DataStore.Database,
		SearchPath: s.DataStore.SearchPath,
		Driver:     s.DataStore.Driver,
		SSLMode:    s.DataStore.SSLMode,
	})

	authenticator := auth.GetAuthenticator(dataService, s.APIUrl, s.Address, s.getJwtCookieDomain(), s.Secrets.Auth)
	mailService, err := mail.NewMail(mail.MailParams{
		Host:         s.SMTP.Host,
		Port:         s.SMTP.Port,
		From:         s.SMTP.From,
		Password:     s.SMTP.Password,
		User:         s.SMTP.Username,
		TSLInsecure:  s.SMTP.TSLInsecure,
		TemplatesUrl: s.SMTP.TemplatesUrl,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to make mail service: %w", err)
	}
	srv := api.NewRest(api.RestParams{
		Authenticator: authenticator,
		AllowedHosts:  s.AllowedHosts,
		DataService:   dataService,
		AppName:       s.AppName,
		EmailService:  mailService,
		AuthHandlers: auth.NewHandlers(dataService, mailService, auth.ConfirmationParams{
			TTL:    time.Hour,
			URL:    fmt.Sprintf("%s://%s:%d", getClientProtocol(s.Client.SSL), s.Client.Domain, s.Client.Port),
			Secret: s.Secrets.Email,
		}),
		CredentialChecker: auth.NewCredentialChecker(dataService),
		Secrets: api.Secrets{
			EmailVerification: s.Secrets.Email,
		},
		CaptchaMiddleware: middleware.NewRecaptcha(
			s.Secrets.Captcha,
			s.Client.Domain,
			[]string{
				"/api/v1/auth/local/login",
				"/api/v1/auth/local/callback",
			},
		),
	})

	err = s.addAuthProviders(authenticator, srv)
	if err != nil {
		return nil, fmt.Errorf("failed to make authenticator: %w", err)
	}

	return &serverApp{
		ServerCommand: s,
		rest:          srv,
		terminated:    make(chan struct{}),
		authenticator: authenticator,
		dataService:   dataService,
	}, nil
}

func getClientProtocol(ssl bool) string {
	if ssl {
		return "https"
	}
	return "http"
}

func (s *ServerCommand) getJwtCookieDomain() string {
	var jwtCookieDomain string
	if s.ENV == "prod" {
		jwtCookieDomain = fmt.Sprintf(".%s", s.Client.Domain)
	} else {
		jwtCookieDomain = s.Client.Domain
	}
	return jwtCookieDomain
}

func (s *ServerCommand) addAuthProviders(authenticator auth.Manager, rest *api.Rest) error {
	providersCount := 0

	authenticator.AddCustomHandler(auth.LocalHandler{
		L:            log.Default(),
		ProviderName: "local",
		TokenService: authenticator.TokenService(),
		Issuer:       s.AppName,
		AvatarSaver:  authenticator.AvatarProxy(),
		AuthHook:     rest.AuthHandlers.GetLocalAuthUserHandler(),
		CredChecker:  rest.CredentialChecker,
		UserIDFunc:   rest.AuthHandlers.UserIDFunc,
	})

	if s.Auth.Google.CID != "" && s.Auth.Google.CSEC != "" {
		authenticator.AddProvider("google", s.Auth.Google.CID, s.Auth.Google.CSEC)
		providersCount++
	}
	if s.Auth.Github.CID != "" && s.Auth.Github.CSEC != "" {
		authenticator.AddCustomProvider(
			"github",
			auth.GetClient(s.Auth.Github.CID, s.Auth.Github.CSEC),
			auth.NewGithubProvider(s.Auth.Github.Attributes, rest.AuthHandlers.GetGithubAuthUserHandler()),
		)
		providersCount++
	}

	if s.Auth.Facebook.CID != "" && s.Auth.Facebook.CSEC != "" {
		authenticator.AddProvider("facebook", s.Auth.Facebook.CID, s.Auth.Facebook.CSEC)
		providersCount++
	}

	if providersCount == 0 {
		log.Printf("[WARN] no auth providers defined")
	}

	return nil
}

type serverApp struct {
	*ServerCommand
	rest          *api.Rest
	terminated    chan struct{}
	authenticator auth.Manager
	dataService   *store.DataStore
}

func (a *serverApp) run(ctx context.Context) error {
	go func() {
		// shutdown on context cancellation
		<-ctx.Done()
		log.Print("[INFO] shutdown initiated")
		a.rest.Shutdown()
	}()

	err := a.dataService.Connect()
	if err != nil {
		close(a.terminated)
	}
	a.rest.Run(a.Address, a.Port)

	close(a.terminated)
	return nil
}

func (a *serverApp) Wait() {
	<-a.terminated
}
