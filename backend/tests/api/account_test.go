package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/go-pkgz/auth/token"
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
// auth/user
func TestCreateAccount(t *testing.T) {
	//GET mock data
	var mockData, err = GetUserCreateData()
	if err != nil {
		assert.NoError(t, err, "Get mock data")
	}
	successRequestData := mockData.Request.Success
	successResponseData := mockData.Response.Success
	successRequestBytes, err := json.Marshal(successRequestData)
	successResponseBytes, err := json.Marshal(successResponseData)
	if err != nil {
		assert.NoError(t, err, "json.Unmarshal()")
	}

	//User creation request
	requestURL := fmt.Sprintf("%s/auth/local/callback", URI)
	userCreateReq, err := http.NewRequest(http.MethodPost, requestURL, bytes.NewBuffer(successRequestBytes))
	if err != nil {
		assert.NoError(t, err, "Create user request")
	}
	userCreateRes, err := client.Do(userCreateReq)
	if err != nil {
		assert.NoError(t, err, "Perform request")
	}
	var userCreateResBodyMap map[string]string
	userCreateResBody, err := io.ReadAll(userCreateRes.Body)
	if err != nil {
		assert.NoError(t, err, "Read response body")
	}
	err = json.Unmarshal(userCreateResBody, &userCreateResBodyMap)
	if err != nil {
		assert.NoError(t, err, "Unmarshal response body")
	}
	setCookie := userCreateRes.Header.Get("Set-Cookie")
	assert.True(t, userCreateResBodyMap["message"] == "ok")
	assert.True(t, userCreateRes.StatusCode == http.StatusOK)

	//User info request
	jwt := ParseAuthCookie(setCookie, "JWT")
	userInfoReq, err := http.NewRequest(http.MethodGet, fmt.Sprintf("%s/auth/user", URI), nil)
	userInfoReq.AddCookie(jwt)
	userInfoRes, err := client.Do(userInfoReq)
	if err != nil {
		assert.NoError(t, err, "Perform user info request")
	}
	userInfoResBody, err := io.ReadAll(userInfoRes.Body)
	if err != nil {
		assert.NoError(t, err, "Unmarshal response body")
	}
	var user token.User
	var userRequest token.User
	err = json.Unmarshal(userInfoResBody, &user)
	err = json.Unmarshal(successResponseBytes, &userRequest)
	if err != nil {
		assert.NoError(t, err, "Unmarshal response body")
	}
	userRequest.ID = user.ID
	userRequest.SetStrAttr("id", user.ID)
	assert.True(t, userInfoRes.StatusCode == http.StatusOK)
	assert.True(t, reflect.DeepEqual(user, userRequest), "Unexpected result")

	//Test user already exists
	userCreateResAlreadyExist, err := client.Do(userCreateReq)
	if err != nil {
		assert.NoError(t, err, "Perform request")
	}
	var userCreateResAlreadyExistBodyMap map[string]string
	userCreateResAlreadyExistBody, err := io.ReadAll(userCreateResAlreadyExist.Body)
	if err != nil {
		assert.NoError(t, err, "Read response body")
	}
	err = json.Unmarshal(userCreateResAlreadyExistBody, &userCreateResAlreadyExistBodyMap)
	if err != nil {
		assert.NoError(t, err, "Unmarshal response body")
	}
	assert.True(t, userCreateResAlreadyExist.StatusCode == http.StatusConflict)
	assert.True(t, userCreateResAlreadyExistBodyMap["error"] == "User already exists")

	//Test missed required fields
	missedRequestData := mockData.Request.Success
	missedRequestData["email"] = ""
	missedRequestDataBytes, err := json.Marshal(missedRequestData)
	missedCreateReq, err := http.NewRequest(http.MethodPost, requestURL, bytes.NewBuffer(missedRequestDataBytes))
	if err != nil {
		assert.NoError(t, err, "Create user request")
	}
	missedCreateRes, err := client.Do(missedCreateReq)
	if err != nil {
		assert.NoError(t, err, "Perform request")
	}
	var missedCreateResBodyMap map[string]string
	missedCreateResBody, err := io.ReadAll(missedCreateRes.Body)
	if err != nil {
		assert.NoError(t, err, "Read response body")
	}
	err = json.Unmarshal(missedCreateResBody, &missedCreateResBodyMap)
	if err != nil {
		assert.NoError(t, err, "Unmarshal response body")
	}
	fmt.Println(missedCreateResBodyMap)
}
