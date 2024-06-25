// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
export interface Page<T> {
  firstIndex?: number;
  entries: T[];
  projects?: T[];
  users?: T[];
  employers?: T[];
  link: {
    nextCursor?: string;
    previousCursor?: string;
  };
}
