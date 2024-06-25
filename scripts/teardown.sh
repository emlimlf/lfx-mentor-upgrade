#!/usr/bin/env bash
set -e

usage () { 
  echo "Usage : $0 -s <stage>"
}

# Get STAGE and CLOUDFRONT configuration from command line.
while getopts ":s:c" opts; do
  case ${opts} in
    s) STAGE=${OPTARG} ;;
  esac
done

if [ -z "${STAGE}" ]; then
  usage
  exit 1
fi

echo 'Removing frontend bucket'
yarn sls client remove --stage="${STAGE}" --cloudfront="false"

# The cloudfront distribution has a trigger referencing the lambda@edge function.
# AWS won't delete lambda@edge functions with active triggers. So we remove the
# cloudfront distribution from the stack first, (removing the trigger), then tear down
# the stack. https://forums.aws.amazon.com/ann.jspa?annID=5529 
echo 'Updating to remove Cloudfront distribution'
yarn sls deploy --stage="${STAGE}" --cloudfront="false"

# Even doing this, the following call might fail, as there is an arbitary time delay
# between deleting the cloudfront distribution and the trigger being cleaned up. 
echo 'Removing Lambda@Edge function and remaining stack.'
yarn sls remove --stage="${STAGE}" --cloudfront="false"

exit 0
