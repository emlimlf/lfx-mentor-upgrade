// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { CommonModule } from '@angular/common';
import { ErrorHandler, NgModule } from '@angular/core';
import { AuthGuardService } from './auth-guard.service';
import { FlagsService } from './flags.service';
import { GithubService } from './github.service';
import { FileUploadService } from './file-upload.service';
import { LoggerService } from './logger.service';
import { OrganizationService } from './organization.service';
import { ProjectService } from './project.service';
import { RepositoryService } from './repository.service';
import { SentryErrorHandler } from './sentry.error-hander';
import { SentryService } from './sentry.service';
import { StripeService } from './stripe.service';
import { SubscriptionService } from './subscription.service';
import { TransactionsService } from './transactions.service';

/**
 * CoreModule is where all singleton services should be shared/provided.
 */
@NgModule({
  imports: [CommonModule],
  providers: [
    FlagsService,
    LoggerService,
    AuthGuardService,
    SentryService,
    ProjectService,
    StripeService,
    SubscriptionService,
    GithubService,
    RepositoryService,
    TransactionsService,
    OrganizationService,
    FileUploadService,
    ErrorHandler,
    { provide: ErrorHandler, useClass: SentryErrorHandler },
  ],
})
export class CoreModule {}
