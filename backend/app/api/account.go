package api

import (
	"encoding/json"
	"github.com/go-pkgz/auth"
	"github.com/go-pkgz/auth/token"
	log "github.com/go-pkgz/lgr"
	"net/http"
)

type SocialSigninOption struct {
	Name string `json:"name"`
}

type AccountCtrl struct {
	Authorization *auth.Service
	JWTService    *token.Service
}

func NewAccountCtrl(authorization *auth.Service) *AccountCtrl {
	return &AccountCtrl{
		Authorization: authorization,
		JWTService:    authorization.TokenService(),
	}
}

func (a *AccountCtrl) getUserInfo(w http.ResponseWriter, r *http.Request) {
	claims, _, err := a.JWTService.Get(r)
	if err != nil {
		log.Printf("[ERROR] Getting claim %+v", err)
	}

	b, err := json.Marshal(claims.User)
	if err != nil {
		log.Printf("[ERROR] Marshalling claim %+v", err)
	}
	_, err = w.Write(b)
}
