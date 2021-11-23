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

// angular imports
import { NgModule, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule, HttpClient } from '@angular/common/http';

// material imports
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule } from '@angular/material/chips';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule } from '@angular/material/sort';

// other libs imports
import { ColorPickerModule } from 'ngx-color-picker';

// shared imports
import { ConfigElementComponent } from './components/config-element/config-element.component';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal.component';
import { AlertOnChangeDirective } from './directives/alert-on-change/alert-on-change.directive';
import { ColorPickerWrapperComponent } from './components/color-picker-wrapper/color-picker-wrapper.component';
import { ResetOnChangeDirective } from './directives/reset-on-change/reset-on-change.directive';
import { ObjectvaluesPipe } from './pipes/objectvalues.pipe';
import { AutoFocusDirective } from './directives/auto-focus/auto-focus.directive';
import { ConfigFormGroupComponent } from './components/config-form-group/config-form-group.component';
import { ConfigFormControlComponent } from './components/config-form-control/config-form-control.component';
import { ArlasToolkitSharedModule } from 'arlas-wui-toolkit/shared.module';
import { InputModalComponent } from './components/input-modal/input-modal.component';
import { ConfigFormGroupArrayComponent } from './components/config-form-group-array/config-form-group-array.component';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { StartupService } from '@services/startup/startup.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTreeModule } from '@angular/material';
import { FiltersComponent } from '@map-config/components/filters/filters.component';
import { CollectionsUnitsComponent } from '@look-and-feel-config/components/collections-units/collections-units.component';


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
    AutoFocusDirective,
    ConfigFormGroupComponent,
    ConfigFormControlComponent,
    InputModalComponent,
    ConfigFormGroupArrayComponent,
    FiltersComponent,
    CollectionsUnitsComponent
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
    })
  ],
  exports: [
    ConfigElementComponent,
    ConfirmModalComponent,
    InputModalComponent,
    AlertOnChangeDirective,
    ColorPickerWrapperComponent,
    ResetOnChangeDirective,
    ObjectvaluesPipe,
    AutoFocusDirective,
    ConfigFormGroupComponent,
    ConfigFormControlComponent,
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
  constructor(translateService: TranslateService, injector: Injector) {
    StartupService.translationLoaded(translateService, injector);
  }
}
