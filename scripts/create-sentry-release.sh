#!/usr/bin/env bash
set -e

if [ -z "${SENTRY_AUTH_TOKEN}" ]; then
  echo "Environment variable SENTRY_AUTH_TOKEN must be set when creating sentry release"
  exit 1
fi

export SENTRY_ORG="the-linux-foundation"
SENTRY_CLI=../node_modules/.bin/sentry-cli
VERSION=$($SENTRY_CLI releases propose-version)
$SENTRY_CLI releases new -p lf-jobspring "$VERSION"
#$SENTRY_CLI releases set-commits --auto "$VERSION"
$SENTRY_CLI releases -p lf-jobspring files "$VERSION" upload-sourcemaps ./dist
$SENTRY_CLI releases -p lf-jobspring finalize "$VERSION"
