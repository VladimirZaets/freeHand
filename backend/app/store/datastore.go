package store

import (
	"crypto/rand"
	"crypto/sha1"
	"fmt"
	log "github.com/go-pkgz/lgr"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

type UserManager interface {
	GetById(id string) (User, error)
	GetByEmail(email string) (User, error)
	CreateIfNotExists(User) error
	Update(User) error
}

type NotificationManager interface {
	Create(notification Notification) error
	List(userId string) ([]Notification, error)
	Update(notification Notification) error
}

type EntityMapper interface {
	User() UserManager
	Notification() NotificationManager
}

type DataStore struct {
	conn         *sqlx.DB
	connString   string
	driver       string
	user         *UserService
	notification *NotificationService
}

type DataStoreParams struct {
	Host       string
	Username   string
	Password   string
	SearchPath string
	Driver     string
	DBName     string
	SSLMode    string
}

func NewDataStore(params DataStoreParams) *DataStore {
	connStr := fmt.Sprintf(
		"%s://%s:%s@%s/%s?sslmode=%s&search_path=%s",
		params.Driver,
		params.Username,
		params.Password,
		params.Host,
		params.DBName,
		params.SSLMode,
		params.SearchPath,
	)

	return &DataStore{
		connString:   connStr,
		driver:       params.Driver,
		user:         NewUserService(),
		notification: NewNotificationService(),
	}
}

func (d *DataStore) Connect() error {
	db, err := sqlx.Connect(d.driver, d.connString)

	if err != nil {
		log.Printf("[ERROR] DB connection failed: %+v. Connection string: %s", err, d.connString)
		return err
	}
	fmt.Println("DB Connection is setup")
	d.conn = db
	d.user.SetConnection(db)
	d.notification.SetConnection(db)
	return nil
}

func (d *DataStore) User() UserManager {
	return d.user
}

func (d *DataStore) Notification() NotificationManager {
	return d.notification
}

func RandToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("can't get random: %w", err)
	}
	s := sha1.New()
	if _, err := s.Write(b); err != nil {
		return "", fmt.Errorf("can't write randoms to sha1: %w", err)
	}
	return fmt.Sprintf("%x", s.Sum(nil)), nil
}
