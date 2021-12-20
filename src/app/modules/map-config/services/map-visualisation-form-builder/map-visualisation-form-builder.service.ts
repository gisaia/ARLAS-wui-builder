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
import { Injectable } from '@angular/core';
import { FormArray } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { MainFormService } from '@services/main-form/main-form.service';
import {
    ConfigFormGroup, HiddenFormControl, InputFormControl, SlideToggleFormControl, VisualisationCheckboxFormControl
} from '@shared-models/config-form';

export class MapVisualisationFormGroup extends ConfigFormGroup {

    constructor(
        layersFa: FormArray
    ) {
        super({
            name: new InputFormControl(
                '',
                marker('Name'),
                marker('Name of the visualisation set.'),
                'text',
                {
                    childs: () => [this.customControls.id, this.customControls.layers]
                }
            ),
            displayed: new SlideToggleFormControl(
                '',
                marker('Displayed'),
                marker('When loading the map, this visualisation sets is displayed/not displayed.')
            ),
            layers: new HiddenFormControl(
                '',
                null,
                {
                    optional: true
                },
                layersFa.value
            ),
            id: new HiddenFormControl(
                '',
                null,
                {
                    optional: true
                })
        });
    }

    public customControls = {
        name: this.get('name') as InputFormControl,
        displayed: this.get('displayed') as SlideToggleFormControl,
        layers: this.get('layers') as VisualisationCheckboxFormControl,
        id: this.get('id') as HiddenFormControl
    };
}

@Injectable({
    providedIn: 'root'
})
export class MapVisualisationFormBuilderService {

    constructor(
        private mainFormService: MainFormService
    ) { }

    public buildVisualisation() {
        const mapVisualisationFormGroup = new MapVisualisationFormGroup(
            this.mainFormService.mapConfig.getLayersFa()
        );
        return mapVisualisationFormGroup;
    }
}
