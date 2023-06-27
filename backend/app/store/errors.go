package store

import (
	"errors"
)

var ErrorAlreadyExist error = errors.New("Entity already exist")
