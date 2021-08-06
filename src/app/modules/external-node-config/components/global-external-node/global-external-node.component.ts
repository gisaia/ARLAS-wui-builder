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
import { Component, OnInit, ViewChild } from '@angular/core';
import { MainFormService } from '@services/main-form/main-form.service';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { TranslateService } from '@ngx-translate/core';
import { ComputeContributor} from 'arlas-web-contributors';
import { FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ArlasSettingsService } from 'arlas-wui-toolkit/services/settings/arlas.settings.service';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-global-external-node',
  templateUrl: './global-external-node.component.html',
  styleUrls: ['./global-external-node.component.scss']
})
export class GlobalExternalNodeComponent implements OnInit {
  public externalNodeForm;
  public schemas: Array<string>;
  public selectedSchema: string;
  public editorOptions = new JsonEditorOptions();
  @ViewChild('editor', { static: false }) public editor: JsonEditorComponent;

  constructor(public mainFormService: MainFormService,
              private translateService: TranslateService,
              private arlasSettingsService: ArlasSettingsService,
              private http: HttpClient) {

    this.externalNodeForm = this.mainFormService.externalNodeConfig.getExternalNodeFg();
    this.externalNodeForm.setValidators(this.jsonValidator());
    this.editorOptions.modes = ['code', 'text', 'tree', 'view'];
    this.editorOptions.enableSort = false;
    if (this.translateService.currentLang === 'fr') {
      this.editorOptions.language = 'fr-FR';
    } else {
      this.editorOptions.language = 'en';
    }
    this.editorOptions.enableTransform = false;
    this.editorOptions.expandAll = false;
    this.editorOptions.search = true;
  }
  public jsonValidator(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      if (!!this.editor) {
        const control = group.controls.externalNode;
        if (!this.editor.isValidJson() || ( !! this.editor.getValidateSchema() && !this.editor.getValidateSchema()(this.editor.get()))) {
          control.setErrors({ jsonNotValid: true });
        } else {
          control.setErrors(null);
        }
        return;
      }
    };
  }

  public ngOnInit() {
    // tslint:disable-next-line:no-string-literal
    this.schemas = this.arlasSettingsService.settings['external_node_schemas'] ?
    // tslint:disable-next-line:no-string-literal
    this.arlasSettingsService.settings['external_node_schemas'] : [];

  }

  public updateSchema(event) {
    this.http.get(event.value).subscribe(data => {this.editorOptions.schema = data; this.editor.setOptions(this.editorOptions); });
  }

}
