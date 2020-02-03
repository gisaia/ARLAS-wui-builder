import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MapConfigComponent } from './components/map-config/map-config.component';
import { TimelineConfigComponent } from './components/timeline-config/timeline-config.component';
import { SearchConfigComponent } from './components/search-config/search-config.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';


const routes: Routes = [
  { path: 'map-config', component: MapConfigComponent }, 
  { path: 'timeline-config', component: TimelineConfigComponent },
  { path: 'search-config', component: SearchConfigComponent },
  { path: '',   redirectTo: '/map-config', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
