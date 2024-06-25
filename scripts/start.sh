#!/usr/bin/env bash
set -e
trap 'trap - SIGINT; kill -SIGINT $$' SIGINT;

usage () {
  echo "Usage : $0 -s <stage> -r <region>"
}

# Get STAGE from the command line.
while getopts ":s:r:" opts; do
  case ${opts} in
    s) STAGE=${OPTARG} ;;
    r) REGION=${OPTARG} ;;
    *) break ;;
  esac
done
shift $((OPTIND-1))

# If the stage wasn't defined, quit.
if [ -z "${STAGE}" ]; then
  usage
  exit 1
fi

# If the region wasn't defined, quit.
if [ -z "${REGION}" ]; then
  usage
  exit 1
fi

API_URL=$(./scripts/get-backend-endpoint.sh -s "$STAGE" -r "$REGION")
EXIT_CODE=$?
if [ $EXIT_CODE != 0 ]; then
  echo $API_URL
  exit 1
fi

webpack-dev-server --port=4200 --env.stage="$STAGE" --env.region="$REGION" --env.apiURL="$API_URL" $@
