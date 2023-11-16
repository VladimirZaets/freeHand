package api

import (
	"encoding/json"
	"github.com/go-pkgz/auth/token"
	"io"
	"net/http"
	"os"
	"strconv"
	"strings"
)

type dataStruct struct {
	Initialized bool `default:"false"`
	Request     request
	Response    response
}

type request struct {
	Success map[string]string `json:"success"`
}

type response struct {
	Success token.User `json:"success"`
}

var userCreateData dataStruct

func GetUserCreateData() (*dataStruct, error) {
	if userCreateData.Initialized {
		return &userCreateData, nil
	}

	data, err := os.Open("./data/user_create.json")
	if err != nil {
		return nil, err
	}
	dataBytes, err := io.ReadAll(data)
	if err != nil {
		return nil, err
	}

	dataJson := dataStruct{
		Request: request{
			Success: map[string]string{},
		},
		Response: response{
			Success: token.User{},
		},
	}
	err = json.Unmarshal(dataBytes, &dataJson)
	if err != nil {
		return nil, err
	}
	userCreateData = dataJson
	userCreateData.Initialized = true

	return &userCreateData, nil
}

func ParseAuthCookie(s string, name string) *http.Cookie {
	sp := strings.Split(s, ";")
	for i := range sp {
		sp[i] = strings.TrimSpace(sp[i])
	}
	c := http.Cookie{Name: name}
	for _, v := range sp {
		vsp := strings.Split(v, "=")
		switch vsp[0] {
		case c.Name:
			c.Value = vsp[1]
		case "Path":
			c.Path = vsp[1]
		case "Domain":
			c.Domain = vsp[1]
		case "Max-Age":
			{
				ma, _ := strconv.Atoi(vsp[1])
				c.MaxAge = ma
			}
		case "HttpOnly":
			{
				c.HttpOnly = true
			}
		case "Secure":
			{
				c.Secure = true
			}
		}
	}

	return &c
}
