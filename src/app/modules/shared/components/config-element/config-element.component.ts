import { Component, OnInit, Input, ContentChild } from '@angular/core';
import { FormControlName, FormControl, NgForm, ControlContainer, FormGroup, FormGroupDirective } from '@angular/forms';
import { Validators } from '@angular/forms';
import { MatLabel } from '@angular/material';

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
