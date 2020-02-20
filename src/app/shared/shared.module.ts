import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigElementComponent } from './components/config-element/config-element.component';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AlertOnChangeDirective } from './directives/alert-on-change.directive';
import { ColorPickerWrapperComponent } from './components/color-picker-wrapper/color-picker-wrapper.component';
import { ColorPickerModule } from 'ngx-color-picker';

@NgModule({
  declarations: [ConfigElementComponent, ConfirmModalComponent, AlertOnChangeDirective, ColorPickerWrapperComponent],
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    ColorPickerModule
  ],
  exports: [
    ConfigElementComponent,
    ConfirmModalComponent,
    AlertOnChangeDirective,
    ColorPickerWrapperComponent
  ]
})
export class SharedModule { }
