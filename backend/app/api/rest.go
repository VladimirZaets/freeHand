package api

import (
	"context"
	"fmt"
	"github.com/VladimirZaets/freehands/backend/app/services/auth"
	"github.com/VladimirZaets/freehands/backend/app/services/mail"
	"github.com/VladimirZaets/freehands/backend/app/store"
	log "github.com/go-pkgz/lgr"
	"net/http"
	"sync"
	"time"

	"github.com/didip/tollbooth/v7"
	"github.com/didip/tollbooth_chi"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/cors"
	R "github.com/go-pkgz/rest"
)

type ctrl struct {
	Account       *AccountCtrl
	Notifications *NotificationsCtrl
}

type MiddlewareManager interface {
	Middleware(http.Handler) http.Handler
}

type Secrets struct {
	EmailVerification string
	PasswordReset     string
	Auth              string
}

type RestParams struct {
	AppName           string
	httpServer        *http.Server
	httpsServer       *http.Server
	AllowedHosts      []string
	UpdateLimiter     float64
	DisableSignature  bool
	Version           string
	Authenticator     auth.Manager
	DataService       store.EntityMapper
	CaptchaMiddleware MiddlewareManager
	EmailService      mail.Emailer
	AuthHandlers      *auth.Handlers
	CredentialChecker *auth.CredentialChecker
	Secrets           Secrets
}

type Rest struct {
	AppName           string
	httpServer        *http.Server
	httpsServer       *http.Server
	AllowedHosts      []string
	lock              sync.Mutex
	UpdateLimiter     float64
	DisableSignature  bool
	Version           string
	Authenticator     auth.Manager
	DataService       store.EntityMapper
	Ctrl              ctrl
	AuthHandlers      *auth.Handlers
	CredentialChecker *auth.CredentialChecker
	Captcha           MiddlewareManager
	EmailService      mail.Emailer
}

func NewRest(params RestParams) *Rest {
	return &Rest{
		AppName:          params.AppName,
		AllowedHosts:     params.AllowedHosts,
		UpdateLimiter:    params.UpdateLimiter,
		DisableSignature: params.DisableSignature,
		Version:          params.Version,
		Authenticator:    params.Authenticator,
		DataService:      params.DataService,
		Ctrl: ctrl{
			Account: NewAccountCtrl(
				params.Authenticator.TokenService(),
				params.DataService,
				params.EmailService,
				params.Secrets,
			),
			Notifications: NewNotificationCtrl(
				params.Authenticator.TokenService(),
				params.DataService,
				params.EmailService,
				params.Secrets,
			),
		},
		httpServer:        params.httpServer,
		httpsServer:       params.httpsServer,
		Captcha:           params.CaptchaMiddleware,
		AuthHandlers:      params.AuthHandlers,
		CredentialChecker: params.CredentialChecker,
		EmailService:      params.EmailService,
	}
}

func (s *Rest) Run(address string, port int) {
	log.Printf("[INFO] activate http rest server on %s:%d", address, port)

	s.lock.Lock()
	s.httpServer = s.makeHTTPServer(address, port, s.routes())
	s.httpServer.ErrorLog = log.ToStdLogger(log.Default(), "WARN")
	s.lock.Unlock()

	err := s.httpServer.ListenAndServe()
	log.Printf("[WARN] http server terminated, %s", err)
}

func (s *Rest) Shutdown() {
	log.Printf("[WARN] shutdown rest server")
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()
	s.lock.Lock()
	if s.httpServer != nil {
		if err := s.httpServer.Shutdown(ctx); err != nil {
			log.Printf("[DEBUG] http shutdown error, %s", err)
		}
		log.Printf("[DEBUG] shutdown http server completed")
	}

	if s.httpsServer != nil {
		log.Printf("[WARN] shutdown https server")
		if err := s.httpsServer.Shutdown(ctx); err != nil {
			log.Printf("[DEBUG] https shutdown error, %s", err)
		}
		log.Printf("[DEBUG] shutdown https server completed")
	}
	s.lock.Unlock()
}

func (s *Rest) makeHTTPServer(address string, port int, router http.Handler) *http.Server {
	return &http.Server{
		Addr:              fmt.Sprintf("%s:%d", address, port),
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
		IdleTimeout:       30 * time.Second,
	}
}

func (s *Rest) routes() chi.Router {
	router := chi.NewRouter()
	router.Use(middleware.Throttle(1000), middleware.RealIP, R.Recoverer(log.Default()))
	if !s.DisableSignature {
		router.Use(R.AppInfo(s.AppName, fmt.Sprintf("%s corp.", s.AppName), s.Version))
	}
	router.Use(R.Ping)

	corsMiddleware := cors.New(cors.Options{
		AllowedOrigins:   s.AllowedHosts,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-XSRF-Token", "X-JWT"},
		ExposedHeaders:   []string{"Authorization"},
		AllowCredentials: true,
		MaxAge:           300,
	})
	router.Use(corsMiddleware.Handler)
	authHandler, _ := s.Authenticator.Handlers()
	authMiddleware := s.Authenticator.Middleware()

	router.Route("/api/v1", func(rapi chi.Router) {
		rapi.Group(func(ropen chi.Router) {
			ropen.Use(middleware.Timeout(30 * time.Second))
			ropen.Use(tollbooth_chi.LimitHandler(tollbooth.NewLimiter(10, nil)))
			ropen.Use(s.Captcha.Middleware)
			ropen.Mount("/auth", authHandler)
			ropen.Post("/auth/local/confirm", s.Ctrl.Account.EmailVerification)
		})
		rapi.Group(func(ropen chi.Router) {
			ropen.Use(middleware.Timeout(30 * time.Second))
			ropen.Use(tollbooth_chi.LimitHandler(tollbooth.NewLimiter(10, nil)))
		})
		rapi.Group(func(ropen chi.Router) {
			ropen.Use(middleware.Timeout(30 * time.Second))
			ropen.Use(tollbooth_chi.LimitHandler(tollbooth.NewLimiter(10, nil)))
			ropen.Use(authMiddleware.Auth, middleware.NoCache)
			ropen.Get("/user", s.Ctrl.Account.GetUserInfo)
			ropen.Get("/user/notifications", s.Ctrl.Notifications.List)
			ropen.Put("/user/notification", s.Ctrl.Notifications.Update)
		})
	})

	return router
}

func (s *Rest) updateLimiter() float64 {
	lmt := 10.0
	if s.UpdateLimiter > 0 {
		lmt = s.UpdateLimiter
	}
	return lmt
}
