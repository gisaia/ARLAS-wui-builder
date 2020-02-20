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
import { SharedModule } from '@shared/shared.module';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmModalComponent } from '@shared/components/confirm-modal/confirm-modal.component';
import { EditLayerFeaturesComponent } from './components/edit-layer-features/edit-layer-features.component';
import { MatStepperModule } from '@angular/material/stepper';
import { ConfirmExitGuard } from '@app/guards/confirm-exit.guard';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { DialogColorTableComponent } from './components/dialog-color-table/dialog-color-table.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  entryComponents: [
    ConfirmModalComponent,
    DialogColorTableComponent
  ],
  declarations: [
    MapConfigComponent,
    GlobalComponent,
    LayersComponent,
    EditLayerComponent,
    EditLayerFeaturesComponent,
    DialogColorTableComponent
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
    MatButtonModule,
    MatStepperModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatDialogModule,
    MatIconModule,
    MatTooltipModule
  ],
  providers: [
    ConfirmExitGuard
  ]
})
export class MapConfigModule { }
