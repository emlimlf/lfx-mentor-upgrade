// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
export function removeUndefined<T>(obj: T) {
  return Object.keys(obj)
    .map(key => {
      const value = (obj as any)[key];
      return { key, value };
    })
    .filter(kvp => kvp.value !== undefined)
    .reduce((prev, nextKvp) => {
      return { ...prev, [nextKvp.key]: nextKvp.value };
    }, {}) as T;
}
