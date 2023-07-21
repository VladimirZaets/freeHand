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

func (s *NotificationService) SetConnection(conn *sqlx.DB) {
	s.conn = conn
}

func (n *NotificationService) Create(notification Notification) error {
	if notification.Id == "" {
		id, err := RandToken()
		if err != nil {
			return err
		}
		notification.Id = id
	}

	_, err := n.conn.NamedExec(n.getCreateSqlStatement(), notification)
	if err != nil {
		return err
	}
	return nil
}

func (n *NotificationService) List(id string) ([]Notification, error) {
	result := []Notification{}
	selectString := fmt.Sprintf("SELECT * FROM %s WHERE user_id = $1", n.table)
	notification := Notification{}
	rows, err := n.conn.Queryx(selectString, id)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		err := rows.StructScan(&notification)
		if err != nil {
			return result, err
		}
		result = append(result, notification)
	}

	return result, nil
}

func (n *NotificationService) Update(notification Notification) error {
	if notification.Id == "" {
		id, err := RandToken()
		if err != nil {
			return err
		}
		notification.Id = id
	}

	_, err := n.conn.NamedExec(n.getUpdateSqlStatement(), notification)
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

func (n *NotificationService) getUpdateSqlStatement() string {
	return fmt.Sprintf(
		"UPDATE %s SET is_read=:is_read WHERE id=:id",
		n.table,
	)
}

func (n *NotificationService) getDeleteSqlStatement() string {
	return fmt.Sprintf(
		"DELETE FROM %s WHERE id = ?",
		n.table,
	)
}
