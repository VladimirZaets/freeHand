package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/stretchr/testify/assert"
	"io"
	"net/http"
	"reflect"
	"testing"
)

// auth/list
func TestAuthProviders(t *testing.T) {
	responseBody := []string{}
	expectedResult := []string{"local", "github"}
	response, err := http.Get(fmt.Sprintf("%s/auth/list", URI))
	if err != nil {
		assert.NoError(t, err, "http.Get()")
	}
	body, err := io.ReadAll(response.Body)
	if err != nil {
		assert.NoError(t, err, "io.ReadAll()")
	}
	err = json.Unmarshal(body, &responseBody)
	if err != nil {
		assert.NoError(t, err, "json.Unmarshal()")
	}
	assert.True(t, reflect.DeepEqual(responseBody, expectedResult), "Unexpected result")
}

// auth/local/callback
func TestCreateAccount(t *testing.T) {
	successRequestBytes, err := json.Marshal(GetUserCreateData(t).Success)
	if err != nil {
		assert.NoError(t, err, "json.Unmarshal()")
	}
	dataReader := bytes.NewBuffer(successRequestBytes)
	requestURL := fmt.Sprintf("%s/auth/local/callback", URI)
	req, err := http.NewRequest(http.MethodPost, requestURL, dataReader)
	if err != nil {
		assert.NoError(t, err, "Create request")
	}
	res, err := client.Do(req)
	if err != nil {
		assert.NoError(t, err, "Do request")
	}
	var responseBody map[string]string
	//fmt.Println("KEY", setCookieA[0])
	//fmt.Println("VALUE", setCookieA[1])
	body, err := io.ReadAll(res.Body)
	if err != nil {
		assert.NoError(t, err, "Read response body")
	}
	err = json.Unmarshal(body, &responseBody)
	if err != nil {
		assert.NoError(t, err, "Unmarshal response body")
	}
	setCookie := res.Header.Get("Set-Cookie")
	assert.True(t, responseBody["message"] == "ok")

	c := ParseAuthCookie(setCookie, "JWT")
	req2, err := http.NewRequest(http.MethodGet, fmt.Sprintf("%s/auth/user", URI), nil)
	req2.AddCookie(c)
	q, _ := req2.Cookie("JWT")
	fmt.Println(q, "QQQQ")
	res2, err := client.Do(req2)
	if err != nil {
		assert.NoError(t, err, "RES2")
	}
	fmt.Println(res2)
	body2, err := io.ReadAll(res2.Body)
	if err != nil {
		assert.NoError(t, err, "RES22")
	}
	fmt.Println(body2)

}
