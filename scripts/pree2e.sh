#!/usr/bin/env sh
set -e
yarn install
# Sets up a 1024x768 virtual display on linux
export DISPLAY=:99
# Starts running the webdriver
webdriver-manager update --standalone false --gecko false --quiet --versions.chrome 2.38
