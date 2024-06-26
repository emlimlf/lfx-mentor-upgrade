// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthHttpInterceptor } from './core/auth-http-interceptor';
import { DiscoverComponent } from './pages/discover/discover.component';
import { RedirectingComponent } from './redirecting/redirecting/redirecting.component';
import { NotFoundComponent } from './shared/not-found/not-found.component';

const routes: Routes = [
  {
    path: 'mentee',
    loadChildren: 'app/pages/mentee/mentee.module#MenteeModule',
  },
  {
    path: 'mentor',
    loadChildren: 'app/pages/mentor/mentor.module#MentorModule',
  },
  {
    path: 'project',
    loadChildren: 'app/pages/projects/project.module#ProjectModule',
  },
  {
    path: 'profile',
    loadChildren: 'app/pages/profile/profile.module#ProfileModule',
  },
  {
    path: 'participate',
    loadChildren: 'app/pages/participate/participate.module#ParticipateModule',
  },
  {
    path: 'auth',
    component: RedirectingComponent,
  },
  {
    path: '',
    component: DiscoverComponent,
  },
  {
    path: '404',
    component: NotFoundComponent,
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: '/404',
  },
];
@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthHttpInterceptor,
      multi: true,
    },
  ],
})
export class AppRoutingModule {}
