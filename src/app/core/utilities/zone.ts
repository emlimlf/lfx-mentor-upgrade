// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { NgZone } from '@angular/core';
import { SchedulerLike, Subscription } from 'rxjs';

class LeaveZoneScheduler implements SchedulerLike {
  constructor(private zone: NgZone, private scheduler: SchedulerLike) {}

  schedule(...args: any[]): Subscription {
    return this.zone.runOutsideAngular(() => this.scheduler.schedule.apply(this.scheduler, args));
  }

  now(): number {
    return this.scheduler.now();
  }
}

class EnterZoneScheduler implements SchedulerLike {
  constructor(private zone: NgZone, private scheduler: SchedulerLike) {}

  schedule(...args: any[]): Subscription {
    return this.zone.run(() => this.scheduler.schedule.apply(this.scheduler, args));
  }

  now(): number {
    return this.scheduler.now();
  }
}

/**
 * Zones are used by our e2e testings framework, protractor, to detect when work is still being done by the app. This can
 * cause issues with long running background operations, like effects and timers, because protractor will never timeout.
 * These utilities help us move observables to backgrounded zones that are ignored by protractor.
 * https://stackoverflow.com/questions/43121400/run-ngrx-effect-outside-of-angulars-zone-to-prevent-timeout-in-protractor
 */
export function leaveZone(zone: NgZone, scheduler: SchedulerLike): SchedulerLike {
  return new LeaveZoneScheduler(zone, scheduler);
}

export function enterZone(zone: NgZone, scheduler: SchedulerLike): SchedulerLike {
  return new EnterZoneScheduler(zone, scheduler);
}
