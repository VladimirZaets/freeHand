package api

import (
	"encoding/json"
	"fmt"
	"github.com/VladimirZaets/freehands/backend/app/services/auth"
	"github.com/VladimirZaets/freehands/backend/app/services/mail"
	"github.com/VladimirZaets/freehands/backend/app/services/rest"
	"github.com/VladimirZaets/freehands/backend/app/store"
	log "github.com/go-pkgz/lgr"
	"github.com/golang-jwt/jwt"
	"io/ioutil"
	"net/http"
	"time"
)

type SocialSigninOption struct {
	Name string `json:"name"`
}

type AccountCtrl struct {
	JWTService   auth.TokenManager
	DataService  store.EntityMapper
	EmailService mail.Emailer
	Secrets      Secrets
}

func NewAccountCtrl(
	tokenService auth.TokenManager,
	dataService store.EntityMapper,
	emailer mail.Emailer,
	secrets Secrets,
) *AccountCtrl {
	return &AccountCtrl{
		JWTService:   tokenService,
		DataService:  dataService,
		EmailService: emailer,
		Secrets:      secrets,
	}
}

type TypeResolving struct {
	Dob string `json:"dateOfBirth"`
}

type Password struct {
	Password string `json:"password"`
}

type VerificationToken struct {
	Token string `json:"token"`
}

func (a *AccountCtrl) EmailVerification(w http.ResponseWriter, r *http.Request) {
	var b VerificationToken
	err := json.NewDecoder(r.Body).Decode(&b)
	if err != nil {
		log.Printf("[ERROR] %+v", err)
		rest.RespJSON(w, http.StatusBadRequest, map[string]interface{}{"message": "Bad request"})
		return
	}
	claims := jwt.StandardClaims{}
	token, err := jwt.ParseWithClaims(b.Token, &claims, func(t *jwt.Token) (interface{}, error) {
		if t == nil {
			return nil, fmt.Errorf("failed to call token keyFunc, because token is nil")
		}
		return []byte(a.Secrets.EmailVerification), nil
	})

	if !claims.VerifyExpiresAt(time.Now().Unix(), true) {
		fmt.Printf("[ERROR] %+v", err)
		rest.RespJSON(w, http.StatusBadRequest, map[string]interface{}{"message": "Token expired"})
		return
	}

	if !token.Valid {
		log.Printf("[ERROR] %+v", err)
		rest.RespJSON(w, http.StatusBadRequest, map[string]interface{}{"message": "Token invalid"})
		return
	}

	user, err := a.DataService.User().GetByEmail(claims.Subject)
	if err != nil {
		log.Printf("[ERROR] %+v", err)
		rest.RespJSON(w, http.StatusBadRequest, map[string]interface{}{"message": "User not found"})
		return
	}
	user.Verified = true
	err = a.DataService.User().Update(user)
	if err != nil {
		log.Printf("[ERROR] %+v", err)
		rest.RespJSON(w, http.StatusInternalServerError, map[string]interface{}{"message": "Something went wrong"})
		return
	}

	rest.RespJSON(w, http.StatusOK, map[string]interface{}{"message": "Ok"})
}

func (a *AccountCtrl) CreateUser(w http.ResponseWriter, r *http.Request) {
	u, err := ioutil.ReadAll(r.Body)
	var user store.User
	if err := json.Unmarshal(u, &user); err != nil {
		log.Printf("[ERROR] Decoding user %+v", err)
		rest.RespJSON(w, http.StatusBadRequest, map[string]interface{}{"message": "Bad request"})
		return
	}

	var typeResolving TypeResolving
	if err := json.Unmarshal(u, &typeResolving); err != nil {
		log.Printf("[ERROR] Decoding user %+v", err)
		rest.RespJSON(w, http.StatusBadRequest, map[string]interface{}{"message": "Bad request"})
		return
	}

	err = a.DataService.User().CreateIfNotExists(user)

	if err == store.ErrorAlreadyExist {
		log.Printf("[ERROR] %+v", err)
		rest.RespJSON(w, http.StatusConflict, map[string]interface{}{"message": "User already exists"})
		return
	}

	if err != nil {
		log.Printf("[ERROR] Creating user %+v", err)
		rest.RespJSON(w, http.StatusInternalServerError, map[string]interface{}{"message": "Internal server error"})
		return
	}

	rest.RespJSON(w, http.StatusOK, map[string]interface{}{"message": "Ok"})
}

func (a *AccountCtrl) GetUserInfo(w http.ResponseWriter, r *http.Request) {
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

func (a *AccountCtrl) CreatePassword(w http.ResponseWriter, r *http.Request) {
	a.passwordUpdate(w, r, false)
}

func (a *AccountCtrl) ResetPassword(w http.ResponseWriter, r *http.Request) {
	a.passwordUpdate(w, r, true)
}

func (a *AccountCtrl) passwordUpdate(w http.ResponseWriter, r *http.Request, required bool) {
	claims, _, err := a.JWTService.Get(r)
	if err != nil {
		log.Printf("[ERROR] Getting claim %+v", err)
		rest.RespJSON(w, http.StatusBadRequest, map[string]interface{}{"message": "Bad request"})
		return
	}
	var p Password
	err = json.NewDecoder(r.Body).Decode(&p)
	if err != nil {
		log.Printf("[ERROR] %+v", err)
		rest.RespJSON(w, http.StatusBadRequest, map[string]interface{}{"message": "Bad request"})
		return
	}

	if p.Password == "" {
		log.Printf("[ERROR] Password is empty")
		rest.RespJSON(w, http.StatusBadRequest, map[string]interface{}{"message": "Password is empty"})
		return
	}

	usr, err := a.DataService.User().GetById(claims.User.ID)

	if err != nil {
		log.Printf("[ERROR] Getting user %+v", err)
		rest.RespJSON(w, http.StatusInternalServerError, map[string]interface{}{"message": "Something went wrong"})
		return
	}
	if usr.Password != "" && required {
		log.Printf("[ERROR] Password already exists")
		rest.RespJSON(w, http.StatusConflict, map[string]interface{}{"message": "Password already exists"})
		return
	}
	updateUser := store.User{
		Email:    usr.Email,
		Password: p.Password,
	}
	err = a.DataService.User().Update(updateUser)
	if err != nil {
		log.Printf("[ERROR] Updating user %+v", err)
		rest.RespJSON(w, http.StatusInternalServerError, map[string]interface{}{"message": "Something went wrong"})
		return
	}
	rest.RespJSON(w, http.StatusOK, map[string]interface{}{"message": "Ok"})
}
