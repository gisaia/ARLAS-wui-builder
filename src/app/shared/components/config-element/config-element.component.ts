import { Component, OnInit, Input, ContentChild } from '@angular/core';
import { FormControlName, FormGroupDirective } from '@angular/forms';

@Component({
  selector: 'app-config-element',
  templateUrl: './config-element.component.html',
  styleUrls: ['./config-element.component.scss']
})
export class ConfigElementComponent implements OnInit {

  @Input() description: string;
  @ContentChild(FormControlName, { static: true }) formControl: FormControlName;

  constructor(public formGroupDirective: FormGroupDirective) { }

  ngOnInit() { }

}
