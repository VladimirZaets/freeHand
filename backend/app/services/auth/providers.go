package auth

import (
	"crypto/sha1"
	"encoding/json"
	"fmt"
	"github.com/VladimirZaets/freehands/backend/app/services/rest"
	"github.com/VladimirZaets/freehands/backend/app/store"
	"github.com/go-pkgz/auth/logger"
	"github.com/go-pkgz/auth/provider"
	"github.com/go-pkgz/auth/token"
	log "github.com/go-pkgz/lgr"
	"github.com/golang-jwt/jwt"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
	"io/ioutil"
	"mime"
	"net/http"
)

const (
	MaxHTTPBodySize = 1024 * 1024
	Audience        = "freehands"
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

type credentials struct {
	Email    string
	Password string
}

type LocalHandler struct {
	logger.L
	CredChecker  provider.CredChecker
	ProviderName string
	TokenService provider.TokenService
	Issuer       string
	AvatarSaver  provider.AvatarSaver
	AuthHook     AuthHook
	UserIDFunc   provider.UserIDFunc
}

func (p LocalHandler) Name() string { return p.ProviderName }

func (p LocalHandler) LoginHandler(w http.ResponseWriter, r *http.Request) {
	creds, err := p.getCredentials(w, r)
	if err != nil {
		fmt.Println(err)
		rest.RespJSON(w, http.StatusBadRequest, err)
		return
	}

	if p.CredChecker == nil {
		fmt.Println("no credential checker")
		rest.RespJSON(w, http.StatusInternalServerError, map[string]interface{}{"error": "no credential checker"})
		return
	}
	ok, err := p.CredChecker.Check(creds.Email, creds.Password)

	if err != nil {
		rest.RespJSON(w, http.StatusInternalServerError, err)
		return
	}

	if !ok {
		fmt.Println("email or password is incorrect")
		rest.RespJSON(w, http.StatusBadRequest, map[string]interface{}{"error": "email or password is incorrect"})
		return
	}
	if p.UserIDFunc == nil {
		fmt.Println("no userid func")
		rest.RespJSON(w, http.StatusInternalServerError, map[string]interface{}{"error": "no userid func"})
		return
	}
	userID := p.UserIDFunc(creds.Email, r)
	usr := store.User{
		Id:    userID,
		Email: creds.Email,
	}
	u := p.getTokenUser(&usr)
	claims := token.Claims{
		User: &u,
		StandardClaims: jwt.StandardClaims{
			Id:       userID,
			Issuer:   p.Issuer,
			Audience: Audience,
		},
		SessionOnly: false,
	}
	if _, err = p.TokenService.Set(w, claims); err != nil {
		rest.RespJSON(w, http.StatusInternalServerError, map[string]interface{}{"error": "failed to set token"})
		return
	}
	rest.RespJSON(w, http.StatusOK, map[string]interface{}{"message": "ok"})
}

func (p LocalHandler) getCredentials(w http.ResponseWriter, r *http.Request) (credentials, error) {
	if r.Method != "POST" {
		return credentials{}, fmt.Errorf("method %s not supported", r.Method)
	}

	if r.Body != nil {
		r.Body = http.MaxBytesReader(w, r.Body, MaxHTTPBodySize)
	}
	contentType := r.Header.Get("Content-Type")
	if contentType != "" {
		mt, _, err := mime.ParseMediaType(r.Header.Get("Content-Type"))
		if err != nil {
			return credentials{}, err
		}
		contentType = mt
	}

	// POST with json body
	if contentType == "application/json" {
		var creds credentials
		if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
			return credentials{}, fmt.Errorf("failed to parse request body: %w", err)
		}
		return creds, nil
	}

	// POST with form
	if err := r.ParseForm(); err != nil {
		return credentials{}, fmt.Errorf("failed to parse request: %w", err)
	}

	return credentials{
		Email:    r.Form.Get("user"),
		Password: r.Form.Get("passwd"),
	}, nil
}

func (p LocalHandler) AuthHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		rest.RespJSON(w, http.StatusMethodNotAllowed, map[string]interface{}{"error": "Method not allowed"})
		return
	}

	if r.Body != nil {
		r.Body = http.MaxBytesReader(w, r.Body, MaxHTTPBodySize)
	}
	uBody, err := ioutil.ReadAll(r.Body)
	var usr store.User
	if err := json.Unmarshal(uBody, &usr); err != nil {
		log.Printf("[ERROR] Decoding user %+v", err)
		rest.RespJSON(w, http.StatusBadRequest, map[string]interface{}{"error": "failed to decode user"})
		return
	}
	id, err := store.RandToken()
	if err != nil {
		rest.RespJSON(w, http.StatusInternalServerError, map[string]interface{}{"error": "failed to generate token"})
		return
	}
	usr.Id = id

	u := p.getTokenUser(&usr)
	cid, err := store.RandToken()

	if err != nil {
		rest.RespJSON(w, http.StatusInternalServerError, map[string]interface{}{"error": "failed to generate token"})
		return
	}

	claims := token.Claims{
		User: &u,
		StandardClaims: jwt.StandardClaims{
			Id:       cid,
			Issuer:   p.Issuer,
			Audience: Audience,
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
		rest.RespJSON(w, http.StatusInternalServerError, map[string]interface{}{"error": "failed to set token"})
		return
	}

	rest.RespJSON(w, http.StatusOK, map[string]interface{}{"message": "ok"})
}

func (p LocalHandler) LogoutHandler(w http.ResponseWriter, r *http.Request) {
	if _, _, err := p.TokenService.Get(r); err != nil {
		rest.RespJSON(w, http.StatusForbidden, map[string]interface{}{"message": "logout not allowed"})
		return
	}
	p.TokenService.Reset(w)
	rest.RespJSON(w, http.StatusOK, map[string]interface{}{"message": "ok"})
}

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
