package api

import (
	"encoding/json"
	"github.com/stretchr/testify/assert"
	"io"
	"net/http"
	"os"
	"strconv"
	"strings"
	"testing"
)

type dataStruct struct {
	Initialized bool              `default:"false"`
	Success     map[string]string `json:"success"`
}

var userCreateData dataStruct
var authCookie *http.Cookie

func GetUserCreateData(t *testing.T) *dataStruct {
	if userCreateData.Initialized {
		return &userCreateData
	}

	data, err := os.Open("./data/user_create.json")
	if err != nil {
		assert.NoError(t, err, "Read data file")
	}
	dataBytes, err := io.ReadAll(data)
	if err != nil {
		assert.NoError(t, err, "Read data file")
	}

	dataJson := dataStruct{
		Success: map[string]string{},
	}
	err = json.Unmarshal(dataBytes, &dataJson)
	if err != nil {
		assert.NoError(t, err, "json.Unmarshal()")
	}
	userCreateData = dataJson
	userCreateData.Initialized = true

	return &userCreateData
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
