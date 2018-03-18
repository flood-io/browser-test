#!/bin/bash
set -e
set +x

. $(dirname $0)/env.sh

command -v docker >/dev/null 2>&1 && {
  [ -f /lib/x86_64-linux-gnu/libdevmapper.so.1.02 ] || ln -s /lib/x86_64-linux-gnu/libdevmapper.so.1.02.1 /lib/x86_64-linux-gnu/libdevmapper.so.1.02 && ldconfig

  echo "~~~ Docker build"
  docker build -t $DOCKER_IMAGE .

  echo "+++ :github: :npm: Release"
  docker run --rm --env-file .env $DOCKER_IMAGE bash -c "npx semantic-release" && echo OK || exit 1
}