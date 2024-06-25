// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Injectable, Inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

const SKILLS = require('../../../skills.json');

interface ApiSkill {
  uuid: string;
  skill_name: string;
}

@Injectable()
export class SkillsService {
  skillsList: string[] = SKILLS;

  constructor() {}

  public search(searchText: string, max: number = 10): Observable<string[]> {
    searchText = (searchText || '').toLowerCase();
    if (max < 0) {
      if (!searchText) {
        return of(this.skillsList);
      }
      return of(this.skillsList.filter(skillName => skillName.toLowerCase().startsWith(searchText)));
    } else {
      if (!searchText) {
        return of(this.skillsList.slice(0, max));
      }
      return of(this.skillsList.filter(skillName => skillName.toLowerCase().startsWith(searchText)).slice(0, max));
    }
  }
}
