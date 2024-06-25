// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Project } from '@app/core/models';
import { Action, createFeatureSelector, createSelector } from '@ngrx/store';
import { PrivateProjectActionsUnion, PrivateProjectsActionTypes } from './private-project.actions';

export const projectsSelector = createFeatureSelector<ProjectsModel>('privateProjects');
export const createPrivateProjectSelector = createSelector(projectsSelector, projectsModel => {
  if (projectsModel.privateProjectList.length > 0) {
    return projectsModel.privateProjectList[0];
  }
  return [];
});

export interface ProjectsModel {
  privateProjectList: any[];
}

export function privateProjectsReducer(
  state: Readonly<ProjectsModel> = { privateProjectList: [] },
  action: Action
): Readonly<ProjectsModel> {
  const projectAction = action as PrivateProjectActionsUnion;
  switch (projectAction.type) {
    case PrivateProjectsActionTypes.LOAD_PROJECT:
      return { privateProjectList: [...state.privateProjectList] };
    case PrivateProjectsActionTypes.PROJECT_LOADED:
      return { privateProjectList: [...state.privateProjectList, projectAction.payload] };
    case PrivateProjectsActionTypes.PROJECT_LOADED_FAILED:
      return { privateProjectList: [...state.privateProjectList] };
  }
  return state;
}
