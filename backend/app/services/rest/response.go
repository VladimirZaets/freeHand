package rest

import (
	"bytes"
	"encoding/json"
	"net/http"
)

func RespJSON(w http.ResponseWriter, code int, data interface{}) {
	w.WriteHeader(code)
	buf := &bytes.Buffer{}
	enc := json.NewEncoder(buf)
	enc.SetEscapeHTML(true)
	if err := enc.Encode(data); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	_, _ = w.Write(buf.Bytes())
}
