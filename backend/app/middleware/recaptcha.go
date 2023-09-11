package middleware

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/VladimirZaets/freehands/backend/app/services/rest"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"
)

type Recaptcha struct {
	secret   string
	url      string
	host     string
	required []string
}

type RecaptchaResponse struct {
	Success     bool   `json:"success"`
	ChallengeTs string `json:"challenge_ts"`
	Hostname    string `json:"hostname"`
}

func NewRecaptcha(secret string, host string, required []string) *Recaptcha {
	return &Recaptcha{
		host:     host,
		secret:   secret,
		url:      "https://www.google.com/recaptcha/api/siteverify",
		required: required,
	}
}

type RecaptchaParams struct {
	GRecaptchaResponse string `json:"g-recaptcha-response"`
}

func (c *Recaptcha) IsEnabled() bool {
	return c.secret != ""
}

func (c *Recaptcha) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(rw http.ResponseWriter, r *http.Request) {
		if !c.isRecaptchaRequired(r.URL.Path) {
			next.ServeHTTP(rw, r)
			return
		}
		var recaptchaParams RecaptchaParams
		body, err := ioutil.ReadAll(r.Body)
		r.Body = ioutil.NopCloser(bytes.NewBuffer(body))
		if err != nil {
			fmt.Printf("Error reading body: %v", err)
			http.Error(rw, "can't read body", http.StatusBadRequest)
			return
		}
		err = json.Unmarshal(body, &recaptchaParams)
		if err != nil {
			fmt.Println("Can't unmarshall", err)
			http.Error(rw, "Something went wrong. Please try again later", http.StatusInternalServerError)
			return
		}
		ok, err := c.Verify(recaptchaParams.GRecaptchaResponse)
		if err != nil {
			fmt.Println(err)
			http.Error(rw, "Something went wrong. Please try again later", http.StatusInternalServerError)
			return
		}

		if !ok {
			fmt.Println("Invalid Captcha")
			rest.RespJSON(rw, http.StatusBadRequest, map[string]interface{}{"error": "Invalid Captcha"})
			return
		}
		next.ServeHTTP(rw, r)
	})
}

func (c *Recaptcha) isRecaptchaRequired(url string) bool {
	for _, a := range c.required {
		if a == url {
			return true
		}
	}
	return false
}

func (c *Recaptcha) Verify(token string) (bool, error) {
	data := url.Values{}
	data.Add("secret", c.secret)
	data.Add("response", token)
	resp, err := http.Post(
		c.url,
		"application/x-www-form-urlencoded",
		strings.NewReader(data.Encode()),
	)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return false, err
	}
	var response RecaptchaResponse
	err = json.Unmarshal(body, &response)
	if err != nil {
		return false, err
	}

	if response.Success == false {
		return false, nil
	}

	if response.Hostname != c.host {
		return false, nil
	}

	return true, nil
}
