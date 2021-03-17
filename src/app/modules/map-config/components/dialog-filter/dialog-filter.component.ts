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
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MapFilterFormGroup } from '@map-config/services/map-layer-form-builder/map-layer-form-builder.service';
import { FormControl } from '@angular/forms';
import { CollectionService } from '@services/collection-service/collection.service';

@Component({
  selector: 'app-filter',
  templateUrl: './dialog-filter.component.html',
  styleUrls: ['./dialog-filter.component.scss']
})
export class DialogFilterComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogFilterComponent>,
    public collectionService: CollectionService,
    @Inject(MAT_DIALOG_DATA) public data: {mapForm: MapFilterFormGroup, collection: string}
  ) { }

  public ngOnInit() {
    this.dialogRef.disableClose = false;
    this.dialogRef.updateSize('800px');
  }

  public save() {
    this.data.mapForm.markAllAsTouched();
    if (this.data.mapForm.valid) {
      this.dialogRef.close(this.data);
    }
  }

  /** fetches list of keywords to select given the prefix */
  public updateList(event: {prefix: string, control: FormControl}) {
    if (this.data.mapForm.customControls.filterOperation.value === 'IN') {
      this.data.mapForm.customControls.filterInValues.setSyncOptions([]);
      this.collectionService.getTermAggregation(
        this.data.collection,
        this.data.mapForm.customControls.filterField.value.value, true, undefined, event.prefix).then(keywords => {
          this.data.mapForm.customControls.filterInValues.setSyncOptions(keywords.map(k => ({ value: k, label: k })));
        });
    }
  }

}
