import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TimelineConfigComponent } from './timeline-config.component';


const routes: Routes = [{
  path: '', component: TimelineConfigComponent, pathMatch: 'full'
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TimelineConfigRoutingModule { }
