package infrastructure

import (
	"context"
	"fmt"
	"github.com/testcontainers/testcontainers-go"
	"io"
	"os"
	"path/filepath"
)

type Setup struct {
	temporaryFolder string
	migrationFolder string
	configFolder    string
	network         string
	context         context.Context
	files           map[string][]string

	networkInstance   testcontainers.Network
	databaseContainer *Database
}

type ContainerParam struct {
	Network      string
	Context      context.Context
	ENV          map[string]string
	NetworkAlias string
}

type ContainersParam struct {
	Context context.Context
	Network string
}

type Config struct {
	Path  string
	Name  string
	Files []string
}

func NewSetup(param *ContainersParam) *Setup {
	if param.Network == "" {
		param.Network = "api-network"
	}

	return &Setup{
		temporaryFolder: "tmp",
		migrationFolder: "migrations",
		configFolder:    "configs",
		network:         param.Network,
		files: map[string][]string{
			"database": {
				"../../../database/Dockerfile",
				"../../../database/init.sh",
			},
			"migration": {
				"../../../database/Dockerfile-migration",
				"../../../database/migration/*",
			},
		},
	}
}

func (s *Setup) Database(cp *ContainerParam) (*Database, error) {
	if cp.Context == nil {
		cp.Context = s.context
	}

	if cp.Network == "" {
		cp.Network = s.network
	}
	dbc, err := NewDatabase(cp).Start()
	if err != nil {
		return nil, err
	}
	s.databaseContainer = dbc
	return s.databaseContainer, nil
}

func (s *Setup) Start() (*Setup, error) {
	for folder, paths := range s.files {
		f := fmt.Sprintf("%s/%s", s.temporaryFolder, folder)
		err := os.MkdirAll(f, os.ModePerm)
		if err != nil {
			return nil, err
		}
		for _, path := range paths {
			if filepath.Base(path) == "*" {
				p := path[:len(path)-1]
				fmt.Println("P", p)
				files, err := os.ReadDir(p)
				if err != nil {
					return nil, err
				}
				for _, file := range files {
					if !file.IsDir() {
						_, err := copyFile(
							fmt.Sprintf("%s%s", p, file.Name()),
							fmt.Sprintf("%s/%s", f, file.Name()),
						)
						if err != nil {
							return nil, err
						}
					}
				}
			} else {
				_, err := copyFile(path, fmt.Sprintf("%s/%s", f, filepath.Base(path)))
				if err != nil {
					return nil, err
				}
			}
		}
	}

	return s, nil
}

func copyFile(src, dst string) (int64, error) {
	sourceFileStat, err := os.Stat(src)
	if err != nil {
		return 0, err
	}

	if !sourceFileStat.Mode().IsRegular() {
		return 0, fmt.Errorf("%s is not a regular file", src)
	}

	source, err := os.Open(src)
	if err != nil {
		return 0, err
	}
	defer source.Close()

	destination, err := os.Create(dst)
	if err != nil {
		return 0, err
	}
	defer destination.Close()
	nBytes, err := io.Copy(destination, source)
	return nBytes, err
}
