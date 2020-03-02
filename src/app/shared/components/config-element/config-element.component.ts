import { Component, OnInit, ContentChild, Input } from '@angular/core';
import { FormControlName, FormGroupDirective } from '@angular/forms';

@Component({
  selector: 'app-config-element',
  templateUrl: './config-element.component.html',
  styleUrls: ['./config-element.component.scss']
})
export class ConfigElementComponent implements OnInit {

  @ContentChild(FormControlName, { static: true }) formControl: FormControlName;
  @Input() fullSize = false;

  constructor(public formGroupDirective: FormGroupDirective) { }

  ngOnInit() { }

}
