// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { AUTH_ROUTE, STRIPE_REDIRECT_ROUTE, GITHUB_REDIRECT_ROUTE } from '../constants';

const HTTP_PORT = '80';
const HTTPS_PORT = '443';

export function getURL(route: string, location: Location) {
  const port = location.port;
  const hasStandardPort = port === HTTPS_PORT || port === HTTP_PORT || port === '';
  const redirectPort = hasStandardPort ? '' : `:${port}`;
  return `${location.protocol}//${location.hostname}${redirectPort}/${route}`;
}

export function getAuthURL(location: Location) {
  return getURL(AUTH_ROUTE, location);
}

export function getStripeRedirectRoute(location: Location) {
  return getURL(STRIPE_REDIRECT_ROUTE, location);
}

export function getGithubRedirectRoute(location: Location) {
  return getURL(GITHUB_REDIRECT_ROUTE, location);
}

export function getAuthURLFromWindow() {
  return getAuthURL(window.location);
}
