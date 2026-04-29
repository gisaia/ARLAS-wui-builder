/*
 * Licensed to Gisaïa under one or more contributor
 * license agreements. See the NOTICE.txt file distributed with
 * this work for additional information regarding copyright
 * ownership. Gisaïa licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { Injector, NgModule } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LayerFiltersComponent } from '@shared-components/layer-filters/filters.component';
import { GetCollectionDisplayNamePipe } from 'arlas-web-components';
import { ArlasToolkitSharedModule } from 'arlas-wui-toolkit';
import { ColorPickerDirective } from 'ngx-color-picker';
import { StartupService } from '../services/startup/startup.service';
import { CollectionsUnitsComponent } from './components/collections-units/collections-units.component';
import { ColorPickerWrapperComponent } from './components/color-picker-wrapper/color-picker-wrapper.component';
import { ConfigElementComponent } from './components/config-element/config-element.component';
import { ConfigFormControlComponent } from './components/config-form-control/config-form-control.component';
import { MultiSelectSearchComponent } from './components/config-form-control/multi-select-search/multi-select-search.component';
import { ConfigFormGroupArrayComponent } from './components/config-form-group-array/config-form-group-array.component';
import { ConfigFormGroupComponent } from './components/config-form-group/config-form-group.component';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal.component';
import { HistogramBucketFormGroupComponent } from './components/histogram-bucket-form-group/histogram-bucket-form-group.component';
import { InputModalComponent } from './components/input-modal/input-modal.component';
import { AlertOnChangeDirective } from './directives/alert-on-change/alert-on-change.directive';
import { AutoFocusDirective } from './directives/auto-focus/auto-focus.directive';
import { ResetOnChangeDirective } from './directives/reset-on-change/reset-on-change.directive';
import { GroupCollectionPipe } from './pipes/group-collection.pipe';
import { HistogramBucketPipe } from './pipes/histogram-buckets/histogram-buckets.pipe';
import { ObjectvaluesPipe } from './pipes/objectvalues.pipe';
import { OrderConfigFormTabControlsPipe } from './pipes/order-config-form-tab.pipe';


@NgModule({
    exports: [
        ConfigElementComponent,
        ConfirmModalComponent,
        AlertOnChangeDirective,
        ResetOnChangeDirective,
        ObjectvaluesPipe,
        HistogramBucketPipe,
        GroupCollectionPipe,
        ConfigFormGroupComponent,
        ConfigFormControlComponent,
        HistogramBucketFormGroupComponent,
        LayerFiltersComponent,
        // Standalone
        MultiSelectSearchComponent,
        OrderConfigFormTabControlsPipe,
        GetCollectionDisplayNamePipe,
        HistogramBucketFormGroupComponent,
        ColorPickerWrapperComponent,
    ],
    imports: [
        ArlasToolkitSharedModule,
        MultiSelectSearchComponent,
        OrderConfigFormTabControlsPipe,
        GetCollectionDisplayNamePipe,
        TranslatePipe,
        ColorPickerDirective,
        AlertOnChangeDirective,
        ResetOnChangeDirective,
        AutoFocusDirective,
        InputModalComponent,
        ConfigElementComponent,
        ConfirmModalComponent,
        ObjectvaluesPipe,
        HistogramBucketPipe,
        ConfigFormGroupComponent,
        ConfigFormControlComponent,
        ConfigFormGroupArrayComponent,
        CollectionsUnitsComponent,
        GroupCollectionPipe,
        HistogramBucketFormGroupComponent,
        LayerFiltersComponent,
        ColorPickerWrapperComponent,
    ],
    providers: [
        provideHttpClient(withInterceptorsFromDi())
    ]
})
export class SharedModule {
  public constructor(translateService: TranslateService, injector: Injector) {
    StartupService.translationLoaded(translateService, injector);
  }
}
