#!/bin/sh
psql -U postgres
create database freehands;
\c freehands;
DO $$
BEGIN
  EXECUTE format('CREATE ROLE freehands LOGIN PASSWORD ''%1$s'';',
                 current_setting('custom.db_freehands_user_password'));
END;
$$ LANGUAGE plpgsql;
grant ALL PRIVILEGES ON DATABASE freehands TO freehands;
create schema api;
grant ALL PRIVILEGES ON SCHEMA api TO freehands;
