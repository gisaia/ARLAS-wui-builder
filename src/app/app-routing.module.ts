import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';


const routes: Routes = [
  { path: '',   redirectTo: '/map-config', pathMatch: 'full' },
  {
    path: 'map-config',
    loadChildren: () => import('./modules/map-config/map-config.module').then(m => m.MapConfigModule)
  },
  {
    path: 'timeline-config',
    loadChildren: () => import('./modules/timeline-config/timeline-config.module').then(m => m.TimelineConfigModule)
  },
  {
    path: 'search-config',
    loadChildren: () => import('./modules/search-config/search-config.module').then(m => m.SearchConfigModule)
  },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
