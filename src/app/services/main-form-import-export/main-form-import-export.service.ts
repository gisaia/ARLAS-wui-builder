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
import { Injectable, ComponentFactoryResolver, ReflectiveInjector, ViewContainerRef, Injector } from '@angular/core';
import { MainFormService } from '@services/main-form/main-form.service';
import { updateValueAndValidity } from '@utils/tools';
import { LayersComponent } from '@map-config/components/layers/layers.component';

const MAIN_FORM_VALIDATE_COMPONENTS = [
  LayersComponent
];

@Injectable({
  providedIn: 'root'
})
export class MainFormImportExportService {

  private exportExpected = false;

  constructor(
    private mainFormService: MainFormService,
    private componentFactoryResolver: ComponentFactoryResolver
  ) { }

  public setExportExpected(vCref: ViewContainerRef) {

    if (!this.exportExpected) {
      // On first save, instanciate all related views, for them to inject their form in the mainForm.
      // This allows a global validation.
      MAIN_FORM_VALIDATE_COMPONENTS.forEach(
        c => this.componentFactoryResolver.resolveComponentFactory(c).create(vCref.injector));
    }

    // update the validity of the whole form
    this.mainFormService.mainForm.markAllAsTouched();
    updateValueAndValidity(this.mainFormService.mainForm, false, false);

    this.exportExpected = true;
  }

  get isExportExpected() {
    return this.exportExpected;
  }
}
