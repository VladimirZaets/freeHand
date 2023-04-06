package api

import (
	"fmt"
	"net/http"

	"github.com/go-pkgz/auth/token"
)

type User struct {
	// set by service
	Name     string `json:"name"`
	ID       string `json:"id"`
	Picture  string `json:"picture"`
	Audience string `json:"aud,omitempty"`

	// set by client
	IP         string                 `json:"ip,omitempty"`
	Email      string                 `json:"email,omitempty"`
	Attributes map[string]interface{} `json:"attrs,omitempty"`
	Role       string                 `json:"role,omitempty"`
}

type contextKey string

func getUserInfo(w http.ResponseWriter, r *http.Request) {
	//ctx := r.Context()
	u, _ := GetUserInfo(r)
	//u, _ := ctx.Value(contextKey("user")).(User)
	fmt.Println(u.Name, u.Picture)
	// resultUser := &User{
	// 	Name: "vova",
	// }

	//b, _ := json.Marshal(resultUser)
	//w.Write([]byte(b))
}

func GetUserInfo(r *http.Request) (u User, err error) {

	ctx := r.Context()
	fmt.Println("oo11k", ctx == nil)

	if ctx == nil {
		return User{}, fmt.Errorf("no info about user")
	}

	_, c := ctx.Value(token.ContextKey("user")).(token.User)
	fmt.Println(c)

	if u, ok := ctx.Value(token.ContextKey("user")).(User); ok {
		fmt.Println("ook", u.Name)
		//return u, nil
	}

	fmt.Println("i", u)
	return User{}, fmt.Errorf("user can't be parsed")
}
