#!/bin/bash

trap 'kill 0' EXIT
. ./server/.env

DISABLE_BROWSE_PAGES=true
PORT=8080

# while [ "$2" != "" ]; do
#     case $2 in
#         --besticon-port)
#             shift
#             PORT=$2
#             ;;
#         --besticon-enable-html)
#             DISABLE_BROWSE_PAGES=false
#             shift # remove `-t` or `--tag` from `$1`
#             ;;
#     esac
#     shift # remove the current value for `$1` and use the next
# done

if [[ "$1" == 'start' ]]; then
    node server/server.js "$@" &
elif [[ "$1" == 'dev' ]]; then
    nodemon server/server.js "$@" &
    sass --watch client/public/scripts/sass:client/public &
fi

eval "PORT=$PORT DISABLE_BROWSE_PAGES=$DISABLE_BROWSE_PAGES ./server/besticon/besticon_$(uname -s)_$(uname -m) > /dev/null" &
echo "Running Besticon server"

wait
