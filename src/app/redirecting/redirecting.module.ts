// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { NgModule } from '@angular/core';

import { SharedModule } from '@app/shared';
import { RedirectingComponent } from './redirecting/redirecting.component';


@NgModule({
    declarations: [RedirectingComponent],
    imports: [SharedModule],
    exports: [RedirectingComponent],
})
export class RedirectingModule {}