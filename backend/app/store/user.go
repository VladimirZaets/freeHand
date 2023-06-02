package store

import (
	"database/sql"
	"fmt"
	"github.com/jmoiron/sqlx"
	"golang.org/x/crypto/bcrypt"
	"log"
	"strings"
	"time"
)

type User struct {
	Id          string    `json:"id"`
	FirstName   string    `json:"firstname"`
	LastName    string    `json:"lastname"`
	DOB         time.Time `json:"dob"`
	Phone       string    `json:"phone"`
	Email       string    `json:"email"`
	Password    string    `json:"password"`
	AvatarUrl   string    `json:"avatar_url" db:"avatar_url"`
	PrimaryType string    `json:"primary_type" default:"customer" db:"primary_type"`
	Verified    bool      `json:"verified" default:"false"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

type UserParams struct {
	Field      string
	Value      string
	Attributes []string
}

type UserService struct {
	table string
	conn  *sqlx.DB
}

func NewUserService() *UserService {
	return &UserService{
		table: "users",
	}
}

func (s *UserService) Create(u User) error {
	if u.Id == "" {
		token, err := RandToken()
		if err != nil {
			return err
		}
		u.Id = token
	}
	if u.Password != "" {
		u.Password = hashPassword(u.Password)
	}
	_, err := s.conn.NamedExec(s.getCreateSqlStatement(), u)
	if err != nil {
		return err
	}
	return nil
}

func (s *UserService) CreateIfNotExists(u User) error {
	if u.Id == "" {
		token, err := RandToken()
		if err != nil {
			return err
		}
		u.Id = token
	}
	if u.Password != "" {
		u.Password = hashPassword(u.Password)
	}
	tx, err := s.conn.Beginx()
	if err != nil {
		return err
	}
	var createdUser User
	err = s.conn.Get(&createdUser, s.getByEmailSqlStatement(), u.Email)
	if err != nil && err != sql.ErrNoRows {
		return err
	}
	if createdUser.Id != "" {
		_ = tx.Rollback()
		return ErrorUserExist
	}
	_, err = tx.NamedExec(s.getCreateSqlStatement(), u)
	if err != nil {
		_ = tx.Rollback()
		return err
	}
	err = tx.Commit()

	return nil
}

func (s *UserService) GetWithParams(params UserParams) (*User, error) {
	var attributes string
	if len(params.Attributes) > 0 {
		attributes = strings.Join(params.Attributes, ", ")
	} else {
		attributes = "*"
	}
	sqlStatement := fmt.Sprintf(`SELECT %s FROM %s WHERE %s=$1`, attributes, s.table, params.Field)
	var user User
	err := s.conn.Get(&user, sqlStatement, params.Value)
	if err == sql.ErrNoRows {
		return &user, nil
	}
	if err != nil {
		log.Printf("error getting user: %s", err)
		return nil, err
	}
	return &user, nil
}

func (s *UserService) GetByEmail(email string) (*User, error) {
	sqlStatement := fmt.Sprintf(`SELECT * FROM %s WHERE email=$1`, s.table)
	//row := s.conn.QueryRow(sqlStatement, email)

	var user User
	err := s.conn.Get(&user, sqlStatement, email)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("user****", user.Email)

	//err := row.Scan(
	//	&user.Id,
	//	&user.FirstName,
	//	&user.LastName,
	//	&user.DOB,
	//	&user.Email,
	//	&user.Password,
	//	&user.AvatarUrl,
	//	&user.PrimaryType,
	//	&user.Verified,
	//	&user.CreatedAt,
	//	&user.UpdatedAt,
	//)
	//if err != nil {
	//	return nil, err
	//}
	return &user, nil
}

func (s *UserService) CreateOrUpdate(user *User) error {
	return nil
}

func (s *UserService) Delete(id string) error {
	return nil
}

func (s *UserService) SetConnection(conn *sqlx.DB) {
	s.conn = conn
}

func (s *UserService) getCreateSqlStatement() string {
	return fmt.Sprintf(
		`INSERT INTO %s 
				(id, firstname, lastname, email, primary_type, verified, avatar_url, password, dob) 
				VALUES (:id, :firstname, :lastname, :email, :primary_type, :verified, :avatar_url, :password, :dob)`,
		s.table,
	)
}

func (s *UserService) getByEmailSqlStatement() string {
	return fmt.Sprintf(`SELECT id FROM %s WHERE email=$1`, s.table)
}

func hashPassword(pws string) string {
	hash, err := bcrypt.GenerateFromPassword([]byte(pws), bcrypt.DefaultCost)
	if err != nil {
		log.Println(err)
	}
	return string(hash)
}
