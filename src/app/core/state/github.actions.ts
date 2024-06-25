// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Action } from '@ngrx/store';

export enum GithubActionTypes {
  CONNECT_GITHUB = '[Github] CONNECT_GITHUB',
  GITHUB_CONNECTED = '[Github] GITHUB_CONNECTED'
}

export class ConnectGithubAction implements Action {
  readonly type = GithubActionTypes.CONNECT_GITHUB;
  readonly payload: {
    redirectPath: any[];
  };

  /**
   * Trigger's an github login, by redirecting to an external website.
   * @param redirectPath The redirect path using angular's Router path format, eg [ '/some-path', {'some-param': 1} ]
   */
  constructor(redirectPath: any[]) {
    this.payload = { redirectPath };
  }
}

export class GithubConnectedAction implements Action {
  readonly type = GithubActionTypes.CONNECT_GITHUB;
  constructor(public readonly payload: string) {}
}

export type GithubActionsUnion = ConnectGithubAction | GithubConnectedAction;
