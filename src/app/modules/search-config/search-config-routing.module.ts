import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SearchConfigComponent } from './search-config.component';


const routes: Routes = [{
  path: '', component: SearchConfigComponent, pathMatch: 'full'
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SearchConfigRoutingModule { }
