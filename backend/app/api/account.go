package api

import (
	"encoding/json"
	"net/http"
)

type SocialSigninOption struct {
	Name string `json:"name"`
}

func getSocialMediaLoginOptionsCtrl(w http.ResponseWriter, r *http.Request) {
	options := []SocialSigninOption{{Name: "facebook"}, {Name: "google"}}

	b, _ := json.Marshal(options)
	w.Write([]byte(b))
}
