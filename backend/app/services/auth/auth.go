package auth

import (
	"github.com/VladimirZaets/freehands/backend/app/store"
	"github.com/go-pkgz/auth"
	"github.com/go-pkgz/auth/avatar"
	"github.com/go-pkgz/auth/middleware"
	"github.com/go-pkgz/auth/provider"
	"github.com/go-pkgz/auth/token"
	log "github.com/go-pkgz/lgr"
	"net/http"
	"time"
)

type TokenManager interface {
	Get(r *http.Request) (token.Claims, string, error)
}

type Claim struct {
	token.Claims
}

func GetUserInfo(r *http.Request) (user token.User, err error) {
	return token.GetUserInfo(r)
}

type Manager interface {
	Handlers() (http.Handler, http.Handler)
	Middleware() middleware.Authenticator
	AddProvider(string, string, string)
	AddDevProvider(string, int)
	AddAppleProvider(appleConfig provider.AppleConfig, privKeyLoader provider.PrivateKeyLoaderInterface) error
	AddCustomProvider(name string, client auth.Client, copts provider.CustomHandlerOpt)
	AddDirectProvider(name string, credChecker provider.CredChecker)
	AddDirectProviderWithUserIDFunc(name string, credChecker provider.CredChecker, ufn provider.UserIDFunc)
	AddVerifProvider(name, msgTmpl string, sender provider.Sender)
	AddCustomHandler(handler provider.Provider)
	DevAuth() (*provider.DevAuthServer, error)
	Provider(name string) (provider.Service, error)
	Providers() []provider.Service
	TokenService() *token.Service
	AvatarProxy() *avatar.Proxy
}

type Service struct {
	auth.Service
}

func GetClient(cid string, csec string) auth.Client {
	return auth.Client{
		Cid:     cid,
		Csecret: csec,
	}
}

func GetAuthenticator(
	dataService store.EntityMapper,
	apiurl string,
	address string,
	cookieDomain string,
	secret string,
) Manager {
	return auth.NewService(auth.Opts{
		URL:            apiurl,
		Issuer:         address,
		SecureCookies:  true,
		TokenDuration:  time.Minute * 5,
		CookieDuration: time.Hour * 24,
		DisableXSRF:    true,
		SecretReader: token.SecretFunc(func(aud string) (string, error) {
			return secret, nil
		}),
		AvatarStore:     avatar.NewNoOp(),
		ClaimsUpd:       NewClaimUpdater(dataService),
		JWTCookieDomain: cookieDomain,
		Logger:          log.Default(),
	})
}
