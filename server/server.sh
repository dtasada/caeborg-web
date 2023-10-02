#!/usr/bin/env bash

trap 'kill 0' EXIT
. ./.env

PORT=8080

if [[ "$1" == 'start' ]]; then
	bun run server/server.js "$@" &
elif [[ "$1" == 'dev' ]]; then
	bun run --hot server/server.js --url=http://localhost "$@" &
	sass --watch client/public/styles:client/public/.css &
fi

eval "PORT=$PORT DISABLE_BROWSE_PAGES=true ./server/besticon/besticon_$(uname -s)_$(uname -m) > /dev/null" &
echo "Running Besticon server"

wait
