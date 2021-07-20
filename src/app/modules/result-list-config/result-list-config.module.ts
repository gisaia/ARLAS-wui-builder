import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { GlobalResultListComponent } from './components/global-result-list/global-result-list.component';
import { ResultListConfigRoutingModule } from './result-list-config-routing.module';
import { ArlasToolkitSharedModule } from 'arlas-wui-toolkit';

@NgModule({
  declarations: [
    GlobalResultListComponent
  ],
  imports: [
    ArlasToolkitSharedModule,
    ResultListConfigRoutingModule,
    SharedModule
  ]
})
export class ResultListConfigModule { }
