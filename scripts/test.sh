#!/usr/bin/env bash
set -e
echo 'Testing Frontend'
./node_modules/.bin/karma start ./karma.conf.js --singleRun=true --verbose

echo 'Testing lambda@edge'
cd edge
yarn test