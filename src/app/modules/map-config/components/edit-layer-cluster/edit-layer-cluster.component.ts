import { Component, OnInit, forwardRef } from '@angular/core';
import { EditLayerClusterComponentForm } from './edit-layer-cluster.component.form';
import { NGXLogger } from 'ngx-logger';
import { FormBuilder, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PROPERTY_SELECTOR_SOURCE } from '@shared-components/property-selector/models';

@Component({
  selector: 'app-edit-layer-cluster',
  templateUrl: './edit-layer-cluster.component.html',
  styleUrls: ['./edit-layer-cluster.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EditLayerClusterComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => EditLayerClusterComponent),
      multi: true
    }
  ]
})
export class EditLayerClusterComponent extends EditLayerClusterComponentForm implements OnInit {

  public PROPERTY_SELECTOR_SOURCE = PROPERTY_SELECTOR_SOURCE;

  constructor(
    protected logger: NGXLogger,
    protected formBuilder: FormBuilder
  ) {
    super(logger, formBuilder);
  }

  ngOnInit() {
    super.ngOnInit();

    // by getting a reference to the embedded form in this variable,
    // it will used by the parent ControlValueAccessor implementation to write values on-the-fly
    this.formFg = this.embeddedFeaturesComponent.formFg;
    this.registerAggGeometry();
  }

  public getPointFields() {
    return this.embeddedFeaturesComponent.collectionGeoPointFields;
  }

}
