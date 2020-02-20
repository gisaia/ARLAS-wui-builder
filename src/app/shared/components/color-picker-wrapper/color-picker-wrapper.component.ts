import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker-wrapper.component.html',
  styleUrls: ['./color-picker-wrapper.component.scss']
})
export class ColorPickerWrapperComponent implements OnInit {

  @Input() value: string;
  @Output() setValue = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

  public setColor(color: string) {
    this.setValue.emit(color);
  }

}
