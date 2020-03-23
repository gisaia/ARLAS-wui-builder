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
import { ComponentFactoryResolver, Injectable, ViewContainerRef } from '@angular/core';
import { LayersComponent } from '@map-config/components/layers/layers.component';
import { MainFormService } from '@services/main-form/main-form.service';
import { updateValueAndValidity } from '@utils/tools';
import * as FileSaver from 'file-saver';
import { NGXLogger } from 'ngx-logger';
import { LAYER_MODE } from '@map-config/components/edit-layer/models';
import { ConfigExportHelper } from './config-export-helper';
import { ConfigMapExportHelper } from './config-map-export-helper';

const MAIN_FORM_VALIDATE_COMPONENTS = [
  LayersComponent
];

@Injectable({
  providedIn: 'root'
})
export class MainFormImportExportService {

  private exportExpected = false;

  constructor(
    private logger: NGXLogger,
    private mainFormService: MainFormService,
    private componentFactoryResolver: ComponentFactoryResolver
  ) { }

  get isExportExpected() {
    return this.exportExpected;
  }

  public attemptExport(vCref: ViewContainerRef) {

    if (!this.exportExpected) {
      // On first save, instanciate all related views, for them to inject their form in the mainForm.
      // This allows a global validation.
      MAIN_FORM_VALIDATE_COMPONENTS.forEach(
        c => this.componentFactoryResolver.resolveComponentFactory(c).create(vCref.injector));

      this.exportExpected = true;
    }

    // update the validity of the whole form
    this.mainFormService.mainForm.markAllAsTouched();
    updateValueAndValidity(this.mainFormService.mainForm, false, false);

    if (this.mainFormService.mainForm.valid) {
      this.doExport();
    }
  }

  private doExport() {
    const mapConfigGlobal = this.mainFormService.mapConfig.getGlobalFg();
    const mapConfigLayers = this.mainFormService.mapConfig.getLayersFa();

    const sourceByMode = new Map<string, string>();
    sourceByMode.set(LAYER_MODE.features, 'feature');
    sourceByMode.set(LAYER_MODE.featureMetric, 'feature-metric');

    this.saveJson(
      ConfigExportHelper.process(mapConfigGlobal, mapConfigLayers, sourceByMode),
      'config.json');

    this.saveJson(
      ConfigMapExportHelper.process(mapConfigLayers, sourceByMode),
      'config.map.json',
      true);
  }

  private saveJson(json: any, filename: string, keysToSnakeCase = false) {
    const blob = new Blob([JSON.stringify(json, (key, value) => {
      if (Array.isArray(value) && value.length === 0) {
        // do not export empty array, they are useless
        return undefined;
      } else if (keysToSnakeCase && value && typeof value === 'object' && !Array.isArray(value)) {
        // convert keys to snake-keys. In fact we cannot declare a property with a snake-cased name,
        // (so in models interfaces properties are are camel case)
        const replacement = {};
        for (const k in value) {
          if (Object.hasOwnProperty.call(value, k)) {
            replacement[
              k.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
                .map(x => x.toLowerCase())
                .join('-')
            ] = value[k];
          }
        }
        return replacement;
      }
      return value;
    }, 2)], { type: 'application/json;charset=utf-8' });
    FileSaver.saveAs(blob, filename);
  }

}
