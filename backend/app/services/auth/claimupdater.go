package auth

import (
	"github.com/VladimirZaets/freehands/backend/app/store"
	"github.com/go-pkgz/auth/token"
)

type ClaimUpdater struct {
	DataService store.EntityMapper
}

func NewClaimUpdater(store store.EntityMapper) *ClaimUpdater {
	return &ClaimUpdater{
		DataService: store,
	}
}

func (c *ClaimUpdater) Update(claims token.Claims) token.Claims {
	usr, err := c.DataService.User().GetById(claims.Id)
	if err != nil {
		return claims
	}
	usr.UserToClaim(claims.User)

	return claims
}
