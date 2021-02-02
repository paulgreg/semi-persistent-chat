#!/bin/bash
set -euxo pipefail
git pull --rebase
npm i
./build.sh
pm2 restart semi-persistent-chat
