#!/usr/bin/env bash
trap 'trap - SIGINT; kill -SIGINT $$' SIGINT;

usage () {
  echo "Usage : $0 -s <stage> -r <region>"
}

# Get STAGE from the command line.
while getopts ":s:r:" opts; do
  case ${opts} in
    s) STAGE=${OPTARG} ;;
    r) REGION=${OPTARG} ;;
  esac
done

# If the stage wasn't defined, quit.
if [ -z "${STAGE}" ]; then
  usage
  exit 2
fi

# If the region wasn't defined, quit.
if [ -z "${REGION}" ]; then
  usage
  exit 3
fi

export SLS=../node_modules/.bin/serverless

cd ../backend

# Matches a url that looks like https://{API_GATEWAY_ID}.execute-api.{REGION}.amazonaws.com/{STAGE}/
export GREP_STRING="https://.*\.execute-api\.$REGION\.amazonaws\.com/$STAGE/"

# Grab the URL from project-vars.yml, if it exists for this stage
URL=$(grep apiEndpoint_${STAGE} ../project-vars.yml | sed "s|apiUrl_.*: \(.*\)|https://\1/|g")
if [ "$URL" == "" ]; then
  if [ -f ../frontend/src/environments/environment.${STAGE}.ts ]; then
    # If URL was not set from project-vars.yml, check the environment file for that STAGE
    URL=$(grep API_URL ../frontend/src/environments/environment.${STAGE}.ts | sed 's~.*API_URL: .\(.*\)..~\1~g')
  fi
fi

# If URL wasn't set from project-vars.yml or environment file, get it from last backend deployment (backend sls)
if [ "$URL" == "" ]; then
  # Have to be in the backend directory to query the correct serverless stack.
  cd ../backend
  # Grabs the first word that matches the regex from sls info.
  URL=$($SLS info --stage="$STAGE" --region="$REGION" | grep -o -m 1 "$GREP_STRING")
fi

echo $URL
