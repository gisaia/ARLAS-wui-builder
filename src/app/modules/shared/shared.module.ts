import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigElementComponent } from './components/config-element/config-element.component';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  declarations: [ConfigElementComponent, ConfirmModalComponent],
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule
  ],
  exports: [
    ConfigElementComponent,
    ConfirmModalComponent
  ]
})
export class SharedModule { }
