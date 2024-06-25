// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { TestBed, inject } from '@angular/core/testing';
import { FlagsService, FLAGS_TOKEN, FlagList } from './flags.service';
import { LoggerService } from './logger.service';

describe('FlagsService', () => {
  let spy: any;

  beforeEach(() => {
    const flags: FlagList = {
      FLAG_FIRST_FEATURE: true,
      FLAG_SECOND_FEATURE: false
    };
    spy = jasmine.createSpyObj('LoggerService', ['error', 'warn', 'verbose']);

    TestBed.configureTestingModule({
      providers: [FlagsService, { provide: FLAGS_TOKEN, useValue: flags }, { provide: LoggerService, useValue: spy }]
    });
  });

  describe('allowed', () => {
    it(
      'should return true for true flag',
      inject([FlagsService], (service: FlagsService) => {
        const allowed = service.allowed('FLAG_FIRST_FEATURE');
        expect(allowed).toBeTruthy();
      })
    );

    it(
      'should return false for false flag',
      inject([FlagsService], (service: FlagsService) => {
        const allowed = service.allowed('FLAG_SECOND_FEATURE');
        expect(allowed).toBeFalsy();
      })
    );

    it(
      'should return false and log an error for absent flags',
      inject([FlagsService], (service: FlagsService) => {
        const allowed = service.allowed('FLAG_ABSENT');
        expect(allowed).toBeFalsy();
        expect(spy.error).toHaveBeenCalled();
      })
    );
  });
});
