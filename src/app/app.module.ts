// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
// import { STORAGE_TOKEN } from '@app/core/state/auth.effects';
import { SharedModule } from '@app/shared';
import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { InlineSVGModule } from 'ng-inline-svg';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { AuthService } from 'app/services/auth.service';
import { EmployerService } from './services/employer.service';
import { MenteeService } from './services/mentee.service';
import { SkillsService } from './services/skills.service';
import { FileUploadService } from './core/file-upload.service';
import { RedirectingModule } from './redirecting/redirecting.module';
import { reducers, ProjectService } from '@app/core';
import { DiscoverComponent } from './pages/discover/discover.component';
import { FundingIdentityComponent } from './pages/profile/funding-identity/funding-identity.component';
import { DiscoverDetailsComponent } from './pages/discover/discover-details/discover-details.component';
import { DownloadService } from './services/download.service';
import { DocViewerComponent } from './pages/doc-viewer/doc-viewer.component';
import { ProjectsSectionComponent } from './pages/discover/projects-section/projects-section.component';
import { ProfileComponent } from './pages/discover/profile/profile.component';
import { SupporterWallComponent } from './pages/discover/supporter-wall/supporter-wall.component';
import { PaginationService } from './services/pagination.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    DiscoverComponent,
    FundingIdentityComponent,
    DiscoverDetailsComponent,
    DocViewerComponent,
    ProjectsSectionComponent,
    ProfileComponent,
    SupporterWallComponent,
  ],
  // entryComponents: [DocViewerComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NgxDocViewerModule,
    SharedModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    RedirectingModule,
    NgbModule.forRoot(),
    StoreModule.forRoot(reducers as any),
    // EffectsModule.forRoot(effects),
    InlineSVGModule.forRoot(),
    // StoreRouterConnectingModule.forRoot({
    //   stateKey: 'router'
    // }),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production, // Restrict extension to log-only mode
    }),
  ],
  providers: [
    AuthService,
    EmployerService,
    MenteeService,
    FileUploadService,
    SkillsService,
    DownloadService,
    ProjectService,
    NgbActiveModal,
    PaginationService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
