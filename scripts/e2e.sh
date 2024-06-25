#!/usr/bin/env bash
set -e
trap 'trap - SIGINT; kill -SIGINT $$' SIGINT;

usage () {
  echo "Usage : $0 -s <stage>"
}


# Get STAGE and CLOUDFRONT configuration from command line.
while getopts ":s:" opts; do
  case ${opts} in
    s) STAGE=${OPTARG} ;;
  esac
done

if [ -z "${STAGE}" ]; then
  usage
  exit 1
fi

# Hardcoded e2e urls go here
WEBSITE_URL=$(../node_modules/.bin/serverless get-domain --stage=${STAGE} --cloudfront=true --distribution=CloudfrontDistribution)

echo "Testing ${WEBSITE_URL}"

# Run protractor and save the return code.
protractor --baseUrl="https://${WEBSITE_URL}/" ./protractor.conf.js
