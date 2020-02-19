import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigElementComponent } from './components/config-element/config-element.component';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AlertOnChangeDirective } from './directives/alert-on-change.directive';

@NgModule({
  declarations: [ConfigElementComponent, ConfirmModalComponent, AlertOnChangeDirective],
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule
  ],
  exports: [
    ConfigElementComponent,
    ConfirmModalComponent,
    AlertOnChangeDirective
  ]
})
export class SharedModule { }
