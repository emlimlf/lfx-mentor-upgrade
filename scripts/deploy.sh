#!/usr/bin/env bash
set -e

trap 'trap - SIGINT; kill -SIGINT $$' SIGINT;

usage () {
  echo "Usage : $0 -s <stage> -r <region of api> [-c](enable cloudfront)"
}

# Get STAGE and CLOUDFRONT configuration from command line.
CLOUDFRONT=false
while getopts ":s:r:c" opts; do
  case ${opts} in
    s) STAGE=${OPTARG} ;;
    r) REGION=${OPTARG} ;;
    c) CLOUDFRONT=true ;;
    *) break ;;
  esac
done
# Removes the parsed command line opts
shift $((OPTIND-1))

if [ -z "${STAGE}" ]; then
  usage
  exit 1
fi

if [ -z "${REGION}" ]; then
  usage
  exit 1
fi

echo "Finding the API URL for stage $STAGE and $REGION"

API_URL=$(./scripts/get-backend-endpoint.sh -s "$STAGE" -r "$REGION")
EXIT_CODE=$?
if [ $EXIT_CODE != 0 ]; then
  echo $API_URL
  exit 1
fi

#echo 'Removing Dist Directory'
#rm -rf dist
#
#echo 'Building Distribution'
#yarn build --env.prod=true --env.stage="${STAGE}" --env.region="${REGION}" --env.apiURL="${API_URL}" $@

echo 'Building Edge Function'
cd edge
yarn build --env.apiURL="${API_URL}" --env.stage="${STAGE}" --env.region="${REGION}"
cd ../

echo 'Deploying Cloudfront and lambda@edge'
yarn sls deploy --stage="${STAGE}" --cloudfront="${CLOUDFRONT}"

echo 'Deploying Frontend Bucket'
yarn sls client deploy --stage="${STAGE}" --cloudfront="${CLOUDFRONT}" --no-confirm

if [ ${CLOUDFRONT} = true ]; then
  echo 'Invalidating Cloudfront'
  yarn sls invalidate --stage="${STAGE}" --cloudfront="${CLOUDFRONT}"
fi

exit 0