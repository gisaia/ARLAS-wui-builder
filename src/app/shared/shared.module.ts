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

import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injector, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { FiltersComponent } from '@map-config/components/filters/filters.component';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { StartupService } from '@services/startup/startup.service';
import { CollectionsUnitsComponent } from '@shared-components/collections-units/collections-units.component';

import { ArlasToolkitSharedModule } from 'arlas-wui-toolkit';
import { ColorPickerModule } from 'ngx-color-picker';
import { ColorPickerWrapperComponent } from './components/color-picker-wrapper/color-picker-wrapper.component';
import { ConfigElementComponent } from './components/config-element/config-element.component';
import { ConfigFormControlComponent } from './components/config-form-control/config-form-control.component';
import { ConfigFormGroupArrayComponent } from './components/config-form-group-array/config-form-group-array.component';
import { ConfigFormGroupComponent } from './components/config-form-group/config-form-group.component';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal.component';
import { HistogramBucketFormGroupComponent } from './components/histogram-bucket-form-group/histogram-bucket-form-group.component';
import { InputModalComponent } from './components/input-modal/input-modal.component';
import { AlertOnChangeDirective } from './directives/alert-on-change/alert-on-change.directive';
import { AutoFocusDirective } from './directives/auto-focus/auto-focus.directive';
import { ResetOnChangeDirective } from './directives/reset-on-change/reset-on-change.directive';
import { HistogramBucketPipe } from './pipes/histogram-buckets/histogram-buckets.pipe';
import { ObjectvaluesPipe } from './pipes/objectvalues.pipe';
import { GroupCollectionPipe } from './pipes/group-collection.pipe';
import { MatExpansionModule } from '@angular/material/expansion';
import { GetCollectionDisplayModule } from 'arlas-web-components';


export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    ConfigElementComponent,
    ConfirmModalComponent,
    AlertOnChangeDirective,
    ColorPickerWrapperComponent,
    ResetOnChangeDirective,
    ObjectvaluesPipe,
    HistogramBucketPipe,
    AutoFocusDirective,
    ConfigFormGroupComponent,
    HistogramBucketFormGroupComponent,
    ConfigFormControlComponent,
    InputModalComponent,
    ConfigFormGroupArrayComponent,
    FiltersComponent,
    CollectionsUnitsComponent,
    GroupCollectionPipe
  ],
  imports: [
    ArlasToolkitSharedModule,
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCheckboxModule,
    ColorPickerModule,
    MatSelectModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    FormsModule,
    MatExpansionModule,
    MatInputModule,
    MatSliderModule,
    MatAutocompleteModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatStepperModule,
    MatAutocompleteModule,
    MatDividerModule,
    MatTooltipModule,
    MatRadioModule,
    MatChipsModule,
    DragDropModule,
    MatSidenavModule,
    MatBadgeModule,
    MatListModule,
    MatButtonToggleModule,
    HttpClientModule,
    MatPaginatorModule,
    MatMenuModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      },
      isolate: false
    }),
    GetCollectionDisplayModule
  ],
  exports: [
    ConfigElementComponent,
    ConfirmModalComponent,
    InputModalComponent,
    AlertOnChangeDirective,
    ColorPickerWrapperComponent,
    ResetOnChangeDirective,
    ObjectvaluesPipe,
    HistogramBucketPipe,
    GroupCollectionPipe,
    AutoFocusDirective,
    ConfigFormGroupComponent,
    ConfigFormControlComponent,
    HistogramBucketFormGroupComponent,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatInputModule,
    MatSliderModule,
    MatIconModule,
    ColorPickerModule,
    MatTabsModule,
    MatTableModule,
    MatStepperModule,
    MatAutocompleteModule,
    MatDividerModule,
    MatTooltipModule,
    MatRadioModule,
    MatChipsModule,
    DragDropModule,
    MatSidenavModule,
    MatBadgeModule,
    MatListModule,
    HttpClientModule,
    MatPaginatorModule,
    MatMenuModule,
    MatCheckboxModule,
    MatTreeModule,
    TranslateModule,
    MatSortModule
  ]
})
export class SharedModule {
  public constructor(translateService: TranslateService, injector: Injector) {
    StartupService.translationLoaded(translateService, injector);
  }
}
