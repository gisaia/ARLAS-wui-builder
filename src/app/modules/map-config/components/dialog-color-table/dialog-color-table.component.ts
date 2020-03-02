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
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource } from '@angular/material';
import { NGXLogger } from 'ngx-logger';
import { FormArray, FormBuilder, Validators, AbstractControl, FormGroup } from '@angular/forms';

export interface KeywordColor {
  keyword: string;
  color: string;
}

@Component({
  selector: 'app-dialog-color-table',
  templateUrl: './dialog-color-table.component.html',
  styleUrls: ['./dialog-color-table.component.scss']
})
export class DialogColorTableComponent implements OnInit {

  public keywordColorsForm: FormArray;
  public dataSource: MatTableDataSource<AbstractControl>;
  public displayedColumns = ['keyword', 'color'];

  constructor(
    public dialogRef: MatDialogRef<DialogColorTableComponent>,
    @Inject(MAT_DIALOG_DATA) public data: KeywordColor[],
    private logger: NGXLogger,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.dialogRef.disableClose = true;
    this.dialogRef.updateSize('600px');

    // build the form with all keywords / colors
    this.keywordColorsForm = this.formBuilder.array([]);
    this.data.forEach(v => {
      const keywordColorGrp = this.formBuilder.group({
        keyword: [''],
        color: ['']
      });
      keywordColorGrp.setValue(v);
      this.keywordColorsForm.push(keywordColorGrp);
    });
    this.dataSource = new MatTableDataSource(this.keywordColorsForm.controls);
  }

  public onCancel(): void {
    this.dialogRef.close();
  }

  public reset(fg: FormGroup) {
    fg.get('color').setValue('#ffffff');
  }


}
