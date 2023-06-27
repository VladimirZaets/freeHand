package auth

import (
	"fmt"
	"github.com/VladimirZaets/freehands/backend/app/store"
	"golang.org/x/crypto/bcrypt"
)

type CredentialChecker struct {
	DataService store.EntityMapper
}

func NewCredentialChecker(store store.EntityMapper) *CredentialChecker {
	return &CredentialChecker{
		DataService: store,
	}
}

func (h *CredentialChecker) Check(email string, password string) (bool, error) {
	usr, err := h.DataService.User().GetByEmail(email)
	if err != nil {
		return false, err
	}
	err = bcrypt.CompareHashAndPassword([]byte(usr.Password), []byte(password))
	if err != nil {
		fmt.Println(usr.Email, err)
		return false, nil
	}
	return true, nil
}
