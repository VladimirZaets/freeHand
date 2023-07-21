package mail

import (
	"bytes"
	"crypto/tls"
	"fmt"
	"github.com/k3a/html2text"
	"gopkg.in/gomail.v2"
	"html/template"
)

type Emailer interface {
	SendTemplate(template string, data interface{}, to string, subject string) error
}

type Mail struct {
	d           *gomail.Dialer
	from        string
	t           *template.Template
	tslInsecure bool
}

type MailParams struct {
	Host         string
	Port         int
	User         string
	Password     string
	From         string
	TemplatesUrl string
	TSLInsecure  bool
}

func NewMail(params MailParams) (*Mail, error) {
	temp, err := template.ParseGlob(fmt.Sprintf("%s/*.html", params.TemplatesUrl))
	d := gomail.NewDialer(params.Host, params.Port, params.User, params.Password)
	d.TLSConfig = &tls.Config{InsecureSkipVerify: params.TSLInsecure}

	if err != nil {
		return nil, err
	}

	return &Mail{
		from:        params.From,
		d:           d,
		t:           temp,
		tslInsecure: params.TSLInsecure,
	}, nil
}

func (s *Mail) SendTemplate(template string, data interface{}, to string, subject string) error {
	var body bytes.Buffer
	m := gomail.NewMessage()
	m.SetHeader("From", s.from)
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	if err := s.t.ExecuteTemplate(&body, template, &data); err != nil {
		fmt.Println(err)
		return err
	}
	m.SetBody("text/html", body.String())
	m.AddAlternative("text/plain", html2text.HTML2Text(body.String()))
	if err := s.d.DialAndSend(m); err != nil {
		fmt.Println(err)
		return err
	}
	return nil
}
