#!/bin/bash

trap 'kill 0' EXIT
source ./server/.env

PORT=8080
DISABLE_BROWSE_PAGES=true
while [ "$2" != "" ]; do
    case $2 in
    --besticon-port)
				shift
        PORT_ARG=$2
        ;;
    --besticon-enable-html)
				DISABLE_BROWSE_PAGES_ARG=false
        shift # remove `-t` or `--tag` from `$1`
        ;;
    esac
    shift # remove the current value for `$1` and use the next
done
PORT=$PORT_ARG
DISABLE_BROWSE_PAGES=$DISABLE_BROWSE_PAGES_ARG

if [[ "$1" == 'start' ]]; then
	node server/server.js &
elif [[ "$1" == 'dev' ]]; then
	nodemon server/server.js &
	sass --watch client/public/scripts/sass:client/public &
fi

eval "./server/besticon/iconserver_$(echo $OSTYPE | tr -d '.0123456789') > /dev/null" &

echo "Running Besticon server on port $PORT"

wait
