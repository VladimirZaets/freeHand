package api

import (
	"encoding/json"
	"github.com/VladimirZaets/freehands/backend/app/services/auth"
	"github.com/VladimirZaets/freehands/backend/app/services/mail"
	"github.com/VladimirZaets/freehands/backend/app/services/rest"
	"github.com/VladimirZaets/freehands/backend/app/store"
	log "github.com/go-pkgz/lgr"
	"io/ioutil"
	"net/http"
)

type NotificationsCtrl struct {
	DataService store.EntityMapper
	JWTService  auth.TokenManager
	MailService mail.Emailer
	Secrets     Secrets
}

func NewNotificationCtrl(
	tokenService auth.TokenManager,
	dataService store.EntityMapper,
	mailer mail.Emailer,
	secrets Secrets,
) *NotificationsCtrl {
	return &NotificationsCtrl{
		JWTService:  tokenService,
		DataService: dataService,
		MailService: mailer,
		Secrets:     secrets,
	}
}

func (a *NotificationsCtrl) List(w http.ResponseWriter, r *http.Request) {
	usr, err := auth.GetUserInfo(r)
	if err != nil {
		log.Printf("[ERROR] %+v", err)
		rest.RespJSON(w, http.StatusInternalServerError, map[string]interface{}{"message": "Internal server error"})
		return
	}

	data, err := a.DataService.Notification().List(usr.ID)
	if err != nil {
		log.Printf("[ERROR] %+v", err)
		rest.RespJSON(w, http.StatusInternalServerError, map[string]interface{}{"message": "Internal server error"})
		return
	}
	rest.RespJSON(w, http.StatusOK, data)
}

func (a *NotificationsCtrl) Update(w http.ResponseWriter, r *http.Request) {
	usr, err := auth.GetUserInfo(r)
	if err != nil {
		log.Printf("[ERROR] %+v", err)
		rest.RespJSON(w, http.StatusInternalServerError, map[string]interface{}{"message": "Internal server error"})
		return
	}

	n, err := ioutil.ReadAll(r.Body)
	var notification store.Notification
	if err := json.Unmarshal(n, &notification); err != nil {
		log.Printf("[ERROR] Decoding notification %+v", err)
		rest.RespJSON(w, http.StatusBadRequest, map[string]interface{}{"message": "Bad request"})
		return
	}

	if notification.UserId != usr.ID {
		rest.RespJSON(w, http.StatusUnauthorized, map[string]interface{}{"message": "Unauthorized"})
	}

	err = a.DataService.Notification().Update(notification)

	if err != nil {
		log.Printf("[ERROR] Updating notification %+v", err)
		rest.RespJSON(w, http.StatusInternalServerError, map[string]interface{}{"message": "Internal server error"})
		return
	}

	rest.RespJSON(w, http.StatusOK, map[string]interface{}{"message": "Ok"})
}
