#!/bin/sh

trap 'kill 0' EXIT

while [ "$2" != "" ]; do
    case $2 in
    --besticon-port)
				shift
        PORT=$2
        ;;
    --besticon-disable-html)
				DISABLE_BROWSE_PAGES=true
        shift # remove `-t` or `--tag` from `$1`
        ;;
    esac
    shift # remove the current value for `$1` and use the next
done

if [[ "$1" == 'start' ]]; then
	node server/server.js &
elif [[ "$1" == 'dev' ]]; then
	nodemon server/server.js &
	sass --watch client/public/scripts/sass:client/public &
fi

setsid eval "PORT=$PORT ./server/besticon/iconserver_$(echo $OSTYPE | tr -d '.0123456789')" > /dev/null &
echo "Running Besticon server on port $PORT"

wait
