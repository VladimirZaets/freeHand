#!/bin/sh

psql -U postgres -d freehands << EOF
        CREATE ROLE freehands LOGIN PASSWORD 'freehands';
        grant ALL PRIVILEGES ON DATABASE freehands TO freehands;
        create schema api;
        grant ALL PRIVILEGES ON SCHEMA api TO freehands;
EOF