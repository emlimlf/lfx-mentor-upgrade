// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  API_URL: 'https://api.people.dev.platform.linuxfoundation.org/',
  AUTH_DOMAIN: 'linuxfoundation-dev.auth0.com',
  // AUTH_REDIRECT_URL: 'https://people.dev.platform.linuxfoundation.org/auth',
  AUTH_REDIRECT_URL: 'https://localhost:4200/auth',
  AUTH_CLIENT_ID: '6HLOUKZwiqYvH0jhi9QMLyY8SrY8l8PA',
  FUNDSPRING_URL: 'https://funding.dev.platform.linuxfoundation.org',
  COMMUNITYBRIDGE_URL: 'https://communitybridge.dev.platform.linuxfoundation.org/',
  LFx_Header_URL: 'https://cdn.dev.platform.linuxfoundation.org/lfx-header-v2.js',
  LFx_Footer_URL: 'https://cdn.dev.platform.linuxfoundation.org/lfx-footer.js',
  datadogEnv: '',
  traceOrigins: [],
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
