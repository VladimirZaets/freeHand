package api

import (
	"encoding/json"
	"github.com/VladimirZaets/freehands/backend/app/services/auth"
	"github.com/VladimirZaets/freehands/backend/app/services/rest"
	"github.com/VladimirZaets/freehands/backend/app/store"
	log "github.com/go-pkgz/lgr"
	"io/ioutil"
	"net/http"
)

type SocialSigninOption struct {
	Name string `json:"name"`
}

type AccountCtrl struct {
	JWTService  auth.TokenManager
	DataService store.EntityMapper
}

func NewAccountCtrl(tokenService auth.TokenManager, dataService store.EntityMapper) *AccountCtrl {
	return &AccountCtrl{
		JWTService:  tokenService,
		DataService: dataService,
	}
}

type TypeResolving struct {
	Dob string `json:"dateOfBirth"`
}

func (a *AccountCtrl) createUser(w http.ResponseWriter, r *http.Request) {
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
