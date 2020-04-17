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
import { CommonModule } from '@angular/common';
import { ConfigElementComponent } from './components/config-element/config-element.component';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AlertOnChangeDirective } from './directives/alert-on-change/alert-on-change.directive';
import { ColorPickerWrapperComponent } from './components/color-picker-wrapper/color-picker-wrapper.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { ResetOnChangeDirective } from './directives/reset-on-change/reset-on-change.directive';
import { TranslateModule } from '@ngx-translate/core';
import { PropertySelectorComponent } from './components/property-selector/property-selector.component';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { ObjectvaluesPipe } from './pipes/objectvalues.pipe';
import { AutoFocusDirective } from './directives/auto-focus/auto-focus.directive';
import { ConfigFormGroupComponent as ConfigFormGroupComponent } from './components/config-form-group/config-form-group.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { ConfigFormControlComponent } from './components/config-form-control/config-form-control.component';
import { ArlasToolkitSharedModule } from 'arlas-wui-toolkit/shared.module';

@NgModule({
  declarations: [
    ConfigElementComponent,
    ConfirmModalComponent,
    AlertOnChangeDirective,
    ColorPickerWrapperComponent,
    ResetOnChangeDirective,
    PropertySelectorComponent,
    ObjectvaluesPipe,
    AutoFocusDirective,
    ConfigFormGroupComponent,
    ConfigFormControlComponent
  ],
  imports: [
    ArlasToolkitSharedModule,
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    ColorPickerModule,
    TranslateModule,
    MatSelectModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSliderModule,
    MatAutocompleteModule,
    MatIconModule
  ],
  exports: [
    ConfigElementComponent,
    ConfirmModalComponent,
    AlertOnChangeDirective,
    ColorPickerWrapperComponent,
    ResetOnChangeDirective,
    PropertySelectorComponent,
    ObjectvaluesPipe,
    AutoFocusDirective,
    ConfigFormGroupComponent
  ]
})
export class SharedModule { }
