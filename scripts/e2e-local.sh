#!/usr/bin/env bash


usage () { 
  echo "Usage : $0 -s <stage> -r <region>"
}

# Get STAGE and CLOUDFRONT configuration from command line.
while getopts ":s:r:" opts; do
  case ${opts} in
    s) STAGE=${OPTARG} ;;
    r) REGION=${OPTARG} ;;
    *) break ;;
  esac
done

if [ -z "${STAGE}" ]; then
  usage
  exit 1
fi

if [ -z "${REGION}" ]; then
  usage
  exit 1
fi

# Start the webpack-dev-server as a forked process and grab its process id.
yarn start -r "${REGION}" -s "${STAGE}" --client-log-level error --quiet --no-info 2>/dev/null &
DEV_SERVER_ID=$! 

echo "Waiting for webpack-dev-server on https://localhost:4200"
while ! nc -z localhost 4200; do
  sleep 1
done
echo "webpack-dev-server started"

# Run protractor and save the return code.
protractor ./protractor.conf.js
PROTRACTOR_EXIT_CODE=$? 


# Kill the dev server, and return with the exit code from protractor.
kill -9 ${DEV_SERVER_ID}
exit ${PROTRACTOR_EXIT_CODE}