package api

import (
	"crypto/sha1"
	"encoding/json"
	"fmt"
	"github.com/VladimirZaets/freehands/backend/app/store"
	"github.com/go-pkgz/auth/logger"
	"github.com/go-pkgz/auth/provider"
	"github.com/go-pkgz/auth/token"
	log "github.com/go-pkgz/lgr"
	"github.com/golang-jwt/jwt"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
	"io/ioutil"
	"net/http"
)

func NewGithubProvider(attributes map[string]string, hook func(provider string, user token.User, token oauth2.Token)) provider.CustomHandlerOpt {
	p := provider.CustomHandlerOpt{
		Endpoint: github.Endpoint,
		Scopes:   []string{"user:email"},
		InfoURL:  "https://api.github.com/user",
		MapUserFn: func(data provider.UserData, bytes []byte) token.User {
			userInfo := token.User{
				ID:      "github_" + token.HashID(sha1.New(), data.Value("login")),
				Name:    data.Value("name"),
				Picture: data.Value("avatar_url"),
			}
			if userInfo.Name == "" {
				userInfo.Name = data.Value("login")
			}
			for k, v := range attributes {
				userInfo.SetStrAttr(v, data.Value(k))
			}
			return userInfo
		},
		BearerTokenHookFn: hook,
	}

	return p
}

type AuthHook func(user store.User, claims token.Claims, w http.ResponseWriter) error

type LocalHandler struct {
	logger.L
	CredChecker  provider.CredChecker
	ProviderName string
	TokenService provider.TokenService
	Issuer       string
	AvatarSaver  provider.AvatarSaver
	AuthHook     AuthHook
}

func (p LocalHandler) Name() string { return p.ProviderName }

func (p LocalHandler) LoginHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("LoginHandler")
}

func (p LocalHandler) AuthHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		RespJSON(w, http.StatusMethodNotAllowed, map[string]interface{}{"error": "Method not allowed"})
		return
	}

	if r.Body != nil {
		r.Body = http.MaxBytesReader(w, r.Body, 1024*1024)
	}
	uBody, err := ioutil.ReadAll(r.Body)
	var usr store.User
	if err := json.Unmarshal(uBody, &usr); err != nil {
		log.Printf("[ERROR] Decoding user %+v", err)
		RespJSON(w, http.StatusBadRequest, map[string]interface{}{"error": "failed to decode user"})
		return
	}
	id, err := store.RandToken()
	if err != nil {
		RespJSON(w, http.StatusInternalServerError, map[string]interface{}{"error": "failed to generate token"})
		return
	}
	usr.Id = id

	u := p.getTokenUser(&usr)
	cid, err := store.RandToken()

	if err != nil {
		RespJSON(w, http.StatusInternalServerError, map[string]interface{}{"error": "failed to generate token"})
		return
	}

	claims := token.Claims{
		User: &u,
		StandardClaims: jwt.StandardClaims{
			Id:       cid,
			Issuer:   p.Issuer,
			Audience: "freehands",
		},
		SessionOnly: false,
	}

	if p.AuthHook != nil {
		if err := p.AuthHook(usr, claims, w); err != nil {
			log.Printf("[ERROR] AuthHook failed: %+v", err)
			return
		}
	}

	if _, err = p.TokenService.Set(w, claims); err != nil {
		RespJSON(w, http.StatusInternalServerError, map[string]interface{}{"error": "failed to set token"})
		return
	}

	RespJSON(w, http.StatusOK, map[string]interface{}{"message": "ok"})
}

func (p LocalHandler) LogoutHandler(w http.ResponseWriter, r *http.Request) {}

func (p LocalHandler) getTokenUser(u *store.User) token.User {
	claimUser := token.User{
		Name: u.FirstName,
		ID:   u.Id,
	}
	claimUser.ID = u.Id
	claimUser.SetStrAttr("id", u.Id)
	claimUser.SetStrAttr("firstname", u.FirstName)
	claimUser.SetStrAttr("lastname", u.LastName)
	claimUser.SetStrAttr("email", u.Email)
	claimUser.SetStrAttr("avatar_url", u.AvatarUrl)
	claimUser.SetStrAttr("phone", u.Phone)
	claimUser.SetStrAttr("dob", u.DOB.String())
	claimUser.SetStrAttr("primary_type", u.PrimaryType)
	claimUser.SetBoolAttr("verified", u.Verified)

	return claimUser
}
