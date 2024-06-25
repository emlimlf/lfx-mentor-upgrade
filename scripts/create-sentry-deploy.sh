#!/usr/bin/env bash
set -e

if [ -z "${SENTRY_AUTH_TOKEN}" ]; then
  echo "Environment variable SENTRY_AUTH_TOKEN must be set when creating sentry release"
  exit 1
fi

while getopts ":s:c" opts; do
  case ${opts} in
    s) STAGE=${OPTARG} ;;
  esac
done

if [ -z "${STAGE}" ]; then
  usage
  exit 1
fi

export SENTRY_ORG=the-linux-foundation
SENTRY_CLI=../node_modules/.bin/sentry-cli
VERSION=$($SENTRY_CLI releases propose-version)
$SENTRY_CLI releases -p lf-jobing deploys "$VERSION" new -e "$STAGE"
