package auth

import (
	"errors"
	"fmt"
	"github.com/VladimirZaets/freehands/backend/app/services/rest"
	"github.com/VladimirZaets/freehands/backend/app/store"
	"github.com/go-pkgz/auth/provider"
	"github.com/go-pkgz/auth/token"
	log "github.com/go-pkgz/lgr"
	"golang.org/x/oauth2"
	"net/http"
	"strings"
)

type Handlers struct {
	DataService store.EntityMapper
}

func NewHandlers(dataStore store.EntityMapper) *Handlers {
	return &Handlers{
		DataService: dataStore,
	}
}

func (h *Handlers) UserIDFunc(email string, r *http.Request) string {
	usr, err := h.DataService.User().GetByEmail(email)
	if err != nil {
		log.Printf("[ERROR] Getting user by email %v", err)
		return ""
	}
	return usr.Id
}

func (h *Handlers) GetLocalAuthUserHandler() AuthHook {
	return func(user store.User, claims token.Claims, w http.ResponseWriter) error {
		err := h.DataService.User().CreateIfNotExists(user)
		if errors.Is(err, store.ErrorAlreadyExist) {
			rest.RespJSON(w, http.StatusConflict, map[string]interface{}{"error": "User already exists"})
			return err
		}
		if err != nil {
			log.Printf("[ERROR] Creating user %+v", err)
			rest.RespJSON(w, http.StatusInternalServerError, map[string]interface{}{"error": "Something went wrong"})
			return err
		}

		err = h.DataService.Notification().Create(store.Notification{
			UserId:  user.Id,
			Message: "Welcome to FreeHands! We sent you an email with a link to confirm your email address. Please verify your email address to use all features of FreeHands!.",
			IsRead:  false,
		})

		if err != nil {
			log.Printf("[ERROR] Creating notification %+v", err)
		}

		return nil
	}
}

func (h *Handlers) GetGithubAuthUserHandler() provider.BearerTokenHook {
	return func(provider string, user token.User, token oauth2.Token) {
		var usr store.User
		spl := strings.Split(user.Name, " ")
		if len(spl) > 1 {
			usr.FirstName = spl[0]
			usr.LastName = spl[1]
		} else {
			usr.FirstName = spl[0]
		}
		usr.Id = user.ID
		usr.AvatarUrl = fmt.Sprintf("%v", user.Attributes["avatar_url"])
		usr.Email = fmt.Sprintf("%v", user.Attributes["email"])

		err := h.DataService.User().CreateIfNotExists(usr)

		if err != nil {
			log.Printf("[ERROR] %+v", err)
			return
		}
	}
}
