// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
export enum LoadingStatus {
  LOADING = 'loading',
  LOAD_FAILED = 'load failed',
  LOADED = 'loaded'
}

export interface RemoteDataLoading {
  status: LoadingStatus.LOADING;
}

export interface RemoteDataLoadFailed {
  status: LoadingStatus.LOAD_FAILED;
}

export interface RemoteDataLoaded<T> {
  status: LoadingStatus.LOADED;
  entry: T;
}

export type RemoteData<T> = RemoteDataLoading | RemoteDataLoadFailed | RemoteDataLoaded<T>;
