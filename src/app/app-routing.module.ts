/*
Licensed to Gisaïa under one or more contributor
license agreements. See the NOTICE.txt file distributed with
this work for additional information regarding copyright
ownership. Gisaïa licenses this file to you under
the Apache License, Version 2.0 (the "License"); you may
not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingPageComponent } from '@components/landing-page/landing-page.component';
import { MainFormInitializedGuard } from '@guards/main-form-initialized/main-form-initialized.guard';
import { CollectionComponent } from '@components/collection/collection.component';


const routes: Routes = [
  { path: '', component: LandingPageComponent},
  {
    path: 'load', children: [
      { path: '', component: LandingPageComponent, pathMatch: 'full' },
      { path: 'import', component: LandingPageComponent },
      { path: ':id', component: LandingPageComponent}
    ]
  },
  { path: 'callback', redirectTo: '' },
  {
    path: 'collection', component: CollectionComponent, canActivate: [MainFormInitializedGuard]
  },
  {
    path: 'map-config',
    loadChildren: () => import('./modules/map-config/map-config.module').then(m => m.MapConfigModule),
    canActivate: [MainFormInitializedGuard]
  },
  {
    path: 'timeline-config',
    loadChildren: () => import('./modules/timeline-config/timeline-config.module').then(m => m.TimelineConfigModule),
    canActivate: [MainFormInitializedGuard]
  },
  {
    path: 'search-config',
    loadChildren: () => import('./modules/search-config/search-config.module').then(m => m.SearchConfigModule),
    canActivate: [MainFormInitializedGuard]
  },
  {
    path: 'analytics-config',
    loadChildren: () => import('./modules/analytics-config/analytics-config.module').then(m => m.AnalyticsConfigModule),
    canActivate: [MainFormInitializedGuard]
  },
  {
    path: 'data-table-config',
    loadChildren: () => import('./modules/result-list-config/result-list-config.module').then(m => m.ResultListConfigModule),
    canActivate: [MainFormInitializedGuard]
  },
  {
    path: 'side-modules',
    loadChildren: () => import('./modules/side-modules-config/side-modules-config.module').then(m => m.SideModulesConfigModule),
    canActivate: [MainFormInitializedGuard]
  },
  {
    path: 'look-and-feel',
    loadChildren: () => import('./modules/look-and-feel-config/look-and-feel-config.module').then(m => m.LookAndFeelConfigModule),
    canActivate: [MainFormInitializedGuard]
  },  {
    path: 'extra-node',
    loadChildren: () => import('./modules/external-node-config/external-node-config.module').then(m => m.ExternalNodeConfigModule),
    canActivate: [MainFormInitializedGuard]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
