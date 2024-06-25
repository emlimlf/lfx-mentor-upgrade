// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
export interface Identity {
  name: string;
  avatarUrl: string;
}

export interface Organization extends Identity {
  id: string;
}
