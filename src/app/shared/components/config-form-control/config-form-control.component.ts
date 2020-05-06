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
import { Component, OnInit, Input } from '@angular/core';
import {
  ConfigFormControl, SlideToggleFormControl, SliderFormControl,
  SelectFormControl, InputFormControl, ColorFormControl, HuePaletteFormControl, HiddenFormControl, IconFormControl, ButtonFormControl
} from '@shared-models/config-form';

@Component({
  selector: 'app-config-form-control',
  templateUrl: './config-form-control.component.html',
  styleUrls: ['./config-form-control.component.scss']
})
export class ConfigFormControlComponent implements OnInit {

  @Input() public control: ConfigFormControl;
  @Input() public defaultKey: string;

  constructor() { }

  public ngOnInit() {
  }

  public isSlideToggle(): SlideToggleFormControl | null {
    return Object.getPrototypeOf(this.control) === SlideToggleFormControl.prototype ? this.control as SlideToggleFormControl : null;
  }

  public isSlider(): SliderFormControl | null {
    return Object.getPrototypeOf(this.control) === SliderFormControl.prototype ? this.control as SliderFormControl : null;
  }

  public isSelect(): SelectFormControl | null {
    return Object.getPrototypeOf(this.control) === SelectFormControl.prototype &&
      !(this.control as SelectFormControl).isAutocomplete ?
      this.control as SelectFormControl : null;
  }

  public isAutocomplete(): SelectFormControl | null {
    return Object.getPrototypeOf(this.control) === SelectFormControl.prototype &&
      (this.control as SelectFormControl).isAutocomplete ?
      this.control as SelectFormControl : null;
  }

  public isInput(): InputFormControl | null {
    return Object.getPrototypeOf(this.control) === InputFormControl.prototype ? this.control as InputFormControl : null;
  }

  public isIcon(): IconFormControl | null {
    return Object.getPrototypeOf(this.control) === IconFormControl.prototype ? this.control as IconFormControl : null;
  }

  public isColor(): ColorFormControl | null {
    return Object.getPrototypeOf(this.control) === ColorFormControl.prototype ? this.control as ColorFormControl : null;
  }

  public isHuePalette(): HuePaletteFormControl | null {
    return Object.getPrototypeOf(this.control) === HuePaletteFormControl.prototype ? this.control as HuePaletteFormControl : null;
  }

  public isHidden(): HiddenFormControl | null {
    return Object.getPrototypeOf(this.control) === HiddenFormControl.prototype ? this.control as HiddenFormControl : null;
  }

  public isButton(): ButtonFormControl | null {
    return Object.getPrototypeOf(this.control) === ButtonFormControl.prototype ? this.control as ButtonFormControl : null;
  }

}
