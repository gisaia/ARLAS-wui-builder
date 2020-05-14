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
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';

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

// other libs imports
import { ColorPickerModule } from 'ngx-color-picker';
import { TranslateModule } from '@ngx-translate/core';

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
import { MatPaginatorModule } from '@angular/material';

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
    HttpClientModule,
    MatPaginatorModule
  ],
  exports: [
    ConfigElementComponent,
    ConfirmModalComponent,
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
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatInputModule,
    MatSliderModule,
    MatIconModule,
    ColorPickerModule,
    TranslateModule,
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
    MatPaginatorModule
  ]
})
export class SharedModule { }
