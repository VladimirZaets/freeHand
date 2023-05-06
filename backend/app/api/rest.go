package api

import (
	"context"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/didip/tollbooth/v7"
	"github.com/didip/tollbooth_chi"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/cors"
	"github.com/go-pkgz/auth"
	log "github.com/go-pkgz/lgr"
	R "github.com/go-pkgz/rest"
)

type Rest struct {
	httpServer       *http.Server
	httpsServer      *http.Server
	AllowedHosts     []string
	lock             sync.Mutex
	UpdateLimiter    float64
	DisableSignature bool
	Version          string
	Authenticator    *auth.Service
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
	log.Print("[WARN] shutdown rest server")
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()
	s.lock.Lock()
	if s.httpServer != nil {
		if err := s.httpServer.Shutdown(ctx); err != nil {
			log.Printf("[DEBUG] http shutdown error, %s", err)
		}
		log.Print("[DEBUG] shutdown http server completed")
	}

	if s.httpsServer != nil {
		log.Print("[WARN] shutdown https server")
		if err := s.httpsServer.Shutdown(ctx); err != nil {
			log.Printf("[DEBUG] https shutdown error, %s", err)
		}
		log.Print("[DEBUG] shutdown https server completed")
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
		router.Use(R.AppInfo("freehands", "vzaets", s.Version))
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
	accountCtrl := NewAccountCtrl(s.Authenticator)
	//authMiddleware := s.Authenticator.Middleware()

	router.Route("/api/v1", func(rapi chi.Router) {
		rapi.Group(func(ropen chi.Router) {
			ropen.Use(middleware.Timeout(30 * time.Second))
			ropen.Use(tollbooth_chi.LimitHandler(tollbooth.NewLimiter(10, nil)))
			ropen.Mount("/auth", authHandler)
		})
		rapi.Group(func(ropen chi.Router) {
			ropen.Use(middleware.Timeout(30 * time.Second))
			ropen.Use(tollbooth_chi.LimitHandler(tollbooth.NewLimiter(10, nil)))
			//ropen.Use(authMiddleware.Auth, middleware.NoCache)
			ropen.Get("/user", accountCtrl.getUserInfo)
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
