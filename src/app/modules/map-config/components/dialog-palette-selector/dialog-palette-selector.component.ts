import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import * as d3i from 'd3-interpolate';
import * as d3c from 'd3-color';
import { NGXLogger } from 'ngx-logger';

export interface PaletteData {
  defaultPalettes: string[][];
  selectedPalette: string[];
}

@Component({
  selector: 'app-dialog-palette',
  templateUrl: './dialog-palette-selector.component.html',
  styleUrls: ['./dialog-palette-selector.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DialogPaletteSelectorComponent implements OnInit {

  public defaultPalettes: string[][];
  public selectedPalette: string[];

  constructor(
    public dialogRef: MatDialogRef<DialogPaletteSelectorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PaletteData,
    private logger: NGXLogger) { }

  ngOnInit() {
    this.dialogRef.disableClose = true;
    this.dialogRef.updateSize('800px');

    this.prepareDefaultPalettes();
  }

  private prepareDefaultPalettes() {
    this.selectedPalette = this.data.selectedPalette;
    this.defaultPalettes = this.data.defaultPalettes.map(p => {
      if (p.length === 5) {
        return p;
      } else if (p.length === 3) {
        return [
          p[0],
          this.interpolateColor(p[0], p[1], 0.5),
          p[1],
          this.interpolateColor(p[1], p[2], 0.5),
          p[2]
        ];
      } else if (p.length === 2) {
        return [
          p[0],
          this.interpolateColor(p[0], p[1], 0.25),
          this.interpolateColor(p[0], p[1], 0.5),
          this.interpolateColor(p[0], p[1], 0.75),
          p[1]
        ];
      }
    });
  }

  private interpolateColor(color1: string, color2: string, step: number) {
    return d3c.color(d3i.interpolateRgb(color1, color2)(step)).hex();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  public selectPalette(index: number) {
    this.selectedPalette = this.defaultPalettes[index];
  }

}
