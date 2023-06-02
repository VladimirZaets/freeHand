package store

import (
	"fmt"
	"github.com/jmoiron/sqlx"
	"time"
)

type Notification struct {
	Id        string    `json:"id"`
	UserId    string    `json:"user_id" db:"user_id"`
	Message   string    `json:"message"`
	IsRead    bool      `json:"is_read" db:"is_read"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

type NotificationService struct {
	table string
	conn  *sqlx.DB
}

func NewNotificationService() *NotificationService {
	return &NotificationService{
		table: "notifications",
	}
}

func (n *NotificationService) SetConnection(conn *sqlx.DB) {
	n.conn = conn
}

func (n *NotificationService) Create(notification Notification) error {
	fmt.Printf(n.getCreateSqlStatement())

	fmt.Println(notification)
	_, err := n.conn.NamedExec(n.getCreateSqlStatement(), notification)
	if err != nil {
		return err
	}
	return nil
}

//update notification
func (n *NotificationService) Update(notification Notification) error {
	_, err := n.conn.NamedExec(n.getCreateSqlStatement(), notification)
	if err != nil {
		return err
	}
	return nil
}

func (n *NotificationService) Delete(id string) error {
	_, err := n.conn.Exec(n.getDeleteSqlStatement(), id)
	if err != nil {
		return err
	}
	return nil
}

func (n *NotificationService) getCreateSqlStatement() string {
	return fmt.Sprintf(
		"INSERT INTO %s (id, user_id, message, is_read) VALUES (:id, :user_id, :message, :is_read)",
		n.table,
	)
}

func (n *NotificationService) getDeleteSqlStatement() string {
	return fmt.Sprintf(
		"DELETE FROM %s WHERE id = ?",
		n.table,
	)
}
