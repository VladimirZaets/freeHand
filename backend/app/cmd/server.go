package cmd

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/VladimirZaets/freehands/backend/app/api"
	"github.com/go-pkgz/auth"
	"github.com/go-pkgz/auth/avatar"
	"github.com/go-pkgz/auth/provider"
	"github.com/go-pkgz/auth/token"
	log "github.com/go-pkgz/lgr"
)

type AuthGroup struct {
	CID        string            `long:"cid" env:"CID" description:"OAuth client ID"`
	CSEC       string            `long:"csec" env:"CSEC" description:"OAuth client secret"`
	Attributes map[string]string `long:"attributes" env:"ATTRIBUTES" description:"OAuth attributes" env-delim:","`
}

type ServerCommand struct {
	Port         int      `long:"port" env:"APP_PORT" default:"8080" description:"port"`
	Address      string   `long:"address" env:"APP_ADDRESS" default:"" description:"listening address"`
	APIUrl       string   `long:"api-url" env:"API_URL" required:"true" description:"url to api"`
	ENV          string   `long:"env" env:"ENV" default:"dev" description:"environment"`
	AllowedHosts []string `long:"allowed-hosts" env:"ALLOWED_HOSTS" description:"limit hosts/sources allowed " env-delim:","`
	Auth         struct {
		TTL struct {
			JWT    time.Duration `long:"jwt" env:"JWT" default:"5m" description:"JWT TTL"`
			Cookie time.Duration `long:"cookie" env:"COOKIE" default:"200h" description:"auth cookie TTL"`
		} `group:"ttl" namespace:"ttl" env-namespace:"TTL"`
		Google   AuthGroup `group:"google" namespace:"google" env-namespace:"GOOGLE" description:"Google OAuth"`
		Github   AuthGroup `group:"github" namespace:"github" env-namespace:"GITHUB" description:"Github OAuth"`
		Facebook AuthGroup `group:"facebook" namespace:"facebook" env-namespace:"FACEBOOK" description:"Facebook OAuth"`
	} `group:"auth" namespace:"auth" env-namespace:"AUTH"`
}

func (s *ServerCommand) Execute(_ []string) error {
	log.Printf("[INFO] start server on port %s:%d", s.Address, s.Port)
	resetEnv(
		"SECRET",
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

	authenticator := s.getAuthenticator()
	err := s.addAuthProviders(authenticator)

	if err != nil {
		return nil, fmt.Errorf("failed to make authenticator: %w", err)
	}
	srv := &api.Rest{
		Authenticator: authenticator,
		AllowedHosts:  s.AllowedHosts,
	}

	return &serverApp{
		ServerCommand: s,
		rest:          srv,
		terminated:    make(chan struct{}),
		authenticator: authenticator,
	}, nil
}

func (s *ServerCommand) getAuthenticator() *auth.Service {
	return auth.NewService(auth.Opts{
		URL:            s.APIUrl,
		Issuer:         "freehands",
		SecureCookies:  true,
		TokenDuration:  time.Minute * 5,
		CookieDuration: time.Hour * 24,
		DisableXSRF:    true,
		SecretReader: token.SecretFunc(func(aud string) (string, error) { // get secret per site
			log.Printf("aud", aud)
			return "secret", nil
		}),
		AvatarStore: avatar.NewNoOp(),
		ClaimsUpd: token.ClaimsUpdFunc(func(c token.Claims) token.Claims { // set attributes, on new token or refresh
			return c
		}),
		JWTCookieDomain: s.getJwtCookieDomain(),
		Logger:          log.Default(),
	})
}

func (s *ServerCommand) getJwtCookieDomain() string {
	var jwtCookieDomain string
	if s.ENV == "prod" {
		jwtCookieDomain = ".freehandsnow.com"
	} else {
		jwtCookieDomain = "localhost"
	}
	return jwtCookieDomain
}

func (s *ServerCommand) addAuthProviders(authenticator *auth.Service) error {
	providersCount := 0

	if s.Auth.Google.CID != "" && s.Auth.Google.CSEC != "" {
		authenticator.AddProvider("google", s.Auth.Google.CID, s.Auth.Google.CSEC)
		providersCount++
	}
	if s.Auth.Github.CID != "" && s.Auth.Github.CSEC != "" {
		authenticator.AddProviderWithUserAttributes(
			"github",
			s.Auth.Github.CID,
			s.Auth.Github.CSEC,
			s.Auth.Github.Attributes)
		providersCount++
	}
	if s.Auth.Facebook.CID != "" && s.Auth.Facebook.CSEC != "" {
		authenticator.AddProvider("facebook", s.Auth.Facebook.CID, s.Auth.Facebook.CSEC)
		providersCount++
	}

	authenticator.AddDirectProvider("local", provider.CredCheckerFunc(func(user, password string) (ok bool, err error) {
		ok, err = checkUserSomehow(user, password)
		return ok, err
	}))

	if providersCount == 0 {
		log.Printf("[WARN] no auth providers defined")
	}

	return nil
}

func checkUserSomehow(user string, password string) (bool, error) {
	fmt.Println("user", user)
	fmt.Println("password", password)
	return true, nil
}

type serverApp struct {
	*ServerCommand
	rest          *api.Rest
	terminated    chan struct{}
	authenticator *auth.Service
	//dataService *service.DataStore
}

func (a *serverApp) run(ctx context.Context) error {
	go func() {
		// shutdown on context cancellation
		<-ctx.Done()
		log.Print("[INFO] shutdown initiated")
		a.rest.Shutdown()
	}()

	a.rest.Run(a.Address, a.Port)

	close(a.terminated)
	return nil
}

func (a *serverApp) Wait() {
	<-a.terminated
}
