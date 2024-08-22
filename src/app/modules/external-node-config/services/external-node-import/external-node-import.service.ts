/*
 * Licensed to Gisaïa under one or more contributor
 * license agreements. See the NOTICE.txt file distributed with
 * this work for additional information regarding copyright
 * ownership. Gisaïa licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { Injectable } from '@angular/core';
import { MainFormService } from '@services/main-form/main-form.service';
import { importElements } from '@services/main-form-manager/tools';
import { Config } from '@services/main-form-manager/models-config';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ExternalNodeImportService {

  public constructor(
        private mainFormService: MainFormService
  ) { }

  public doImport(config: Config) {

    const configOptions = config.arlas.web.externalNode ? config.arlas.web.externalNode : {};

    const globalExternalNodeFg = this.mainFormService.externalNodeConfig.getExternalNodeFg() as FormGroup;

    if (configOptions) {

      importElements([
        {
          value: configOptions,
          control: globalExternalNodeFg.controls.externalNode
        }
      ]);


    }
  }
}
