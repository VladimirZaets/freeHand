package main

import (
	"github.com/jessevdk/go-flags"
	"os"

	"github.com/VladimirZaets/freehands/backend/app/cmd"
	log "github.com/go-pkgz/lgr"
)

type Opts struct {
	ServerCmd cmd.ServerCommand `command:"server"`
	Debug     bool              `long:"debug" env:"DEBUG" description:"debug mode"`
}

func main() {
	var opts Opts
	p := flags.NewParser(&opts, flags.Default)
	p.CommandHandler = func(command flags.Commander, args []string) error {
		setupLog(opts.Debug)
		err := command.Execute(args)

		if err != nil {
			log.Printf("[ERROR] failed with %+v", err)
		}
		return err
	}

	if _, err := p.Parse(); err != nil {
		if flagsErr, ok := err.(*flags.Error); ok && flagsErr.Type == flags.ErrHelp {
			os.Exit(0)
		} else {
			os.Exit(1)
		}
	}
}

func setupLog(dbg bool) {
	if dbg {
		log.Setup(log.Debug, log.CallerFile, log.CallerFunc, log.Msec, log.LevelBraces)
		return
	}
	log.Setup(log.Msec, log.LevelBraces)
}
