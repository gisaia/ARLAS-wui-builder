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
import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import * as d3i from 'd3-interpolate';
import * as d3c from 'd3-color';
import { NGXLogger } from 'ngx-logger';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ProportionedColor, DialogPaletteSelectorData } from './model';

@Component({
  selector: 'app-dialog-palette',
  templateUrl: './dialog-palette-selector.component.html',
  styleUrls: ['./dialog-palette-selector.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DialogPaletteSelectorComponent implements OnInit {

  public defaultPalettes: ProportionedColor[][];
  public selectedPalette: ProportionedColor[];

  constructor(
    public dialogRef: MatDialogRef<DialogPaletteSelectorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogPaletteSelectorData,
    private logger: NGXLogger) { }

  ngOnInit() {
    this.dialogRef.disableClose = true;
    this.dialogRef.updateSize('800px');
    this.prepareDefaultPalettes();
  }

  private prepareDefaultPalettes() {
    this.selectedPalette = this.data.selectedPalette;
    this.defaultPalettes = this.data.defaultPalettes.map((p: Array<string>) => {
      const minMaxDiff = this.data.max - this.data.min;

      return p.map((c: string, i: number) => {
        return { proportion: this.computeProportion(p.length, i), color: c };
      });
    });
  }

  public resetProportions() {
    this.selectedPalette = this.selectedPalette.map((c: ProportionedColor, i: number) => {
      return {
        proportion: this.computeProportion(this.selectedPalette.length, i),
        color: c.color
      };
    });
  }

  private computeProportion(length: number, index: number) {
    return this.data.min + index * (this.data.max - this.data.min) / (length - 1);
  }

  public getSelectedPaletteGradients() {
    return this.selectedPalette.map(
      c => c.color + ' ' + (100 * (c.proportion - this.data.min) / (this.data.max - this.data.min)) + '%').join(',');
  }

  drop(event: CdkDragDrop<string[]>) {
    // only reverse the color, proportions should stay consistent
    const previousColor = this.selectedPalette[event.previousIndex].color;
    const currentColor = this.selectedPalette[event.currentIndex].color;
    this.selectedPalette[event.currentIndex].color = previousColor;
    this.selectedPalette[event.previousIndex].color = currentColor;
  }

  private interpolateColor(color1: string, color2: string, step: number) {
    return d3c.color(d3i.interpolateRgb(color1, color2)(step)).hex();
  }

  public selectPalette(index: number) {
    this.selectedPalette = this.defaultPalettes[index].slice();
  }

  public reverse() {
    this.selectedPalette = this.selectedPalette.map((c: ProportionedColor) => {
      return {
        color: c.color,
        proportion: 1 - c.proportion
      };
    }).reverse();
  }

  public add(index: number) {
    const newColor = (index === this.selectedPalette.length - 1) ?
      this.selectedPalette[index].color :
      this.interpolateColor(this.selectedPalette[index].color, this.selectedPalette[index + 1].color, 0.5);
    this.selectedPalette.splice(index + 1, 0, { proportion: this.selectedPalette[index].proportion, color: newColor });
  }

  public remove(index: number) {
    this.selectedPalette.splice(index, 1);
  }

  public isValid() {
    return this.selectedPalette[0].proportion === this.data.min
      && this.selectedPalette.slice(-1)[0].proportion === this.data.max
      && this.selectedPalette.slice(0, -1).map((c: ProportionedColor, i: number) =>
        c.proportion < this.selectedPalette[i + 1].proportion).reduce((a, b) => a && b);
  }

}