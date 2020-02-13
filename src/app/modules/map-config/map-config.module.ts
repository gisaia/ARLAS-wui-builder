import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapConfigRoutingModule } from './map-config-routing.module';
import { MapConfigComponent } from './map-config.component';
import { GlobalComponent } from './components/global/global.component';
import { LayersComponent } from './components/layers/layers.component';
import { EditLayerComponent } from './components/edit-layer/edit-layer.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { SharedModule } from '../../modules/shared/shared.module';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmModalComponent } from '../../modules/shared/components/confirm-modal/confirm-modal.component';
@NgModule({
  entryComponents: [
    ConfirmModalComponent
  ],
  declarations: [
    MapConfigComponent,
    GlobalComponent,
    LayersComponent,
    EditLayerComponent
  ],
  imports: [
    CommonModule,
    MapConfigRoutingModule,
    MatTabsModule,
    MatSnackBarModule,
    MatTableModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    SharedModule,
    MatButtonModule
  ]
})
export class MapConfigModule { }
