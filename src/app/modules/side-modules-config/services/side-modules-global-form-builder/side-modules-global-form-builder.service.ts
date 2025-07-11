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
import { inject, Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { marker } from '@colsen1991/ngx-translate-extract-marker';
import { CollectionService } from '@services/collection-service/collection.service';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import {
  ConfigFormGroup,
  InputFormControl,
  SelectFormControl,
  SliderFormControl,
  SlideToggleFormControl
} from '@shared-models/config-form';
import { urlValidator } from '@utils/validators';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';

export class SideModulesGlobalFormGroup extends ConfigFormGroup {

  public constructor(collectionService: CollectionService, arlasCss: ArlasCollaborativesearchService) {
    super({
      server: new ConfigFormGroup({
        maxAgeCache: new InputFormControl(
          '',
          marker('maxAgeCache'),
          marker('maxAgeCache description'),
          'number'
        ),
        mainCollection: new SelectFormControl(
          arlasCss.defaultCollection,
          marker('Main collection'),
          marker('Main collection of the dashboard. Corresponds to the collection proposed by default.'),
          false,
          [],
          {
            optional: false,
            isCollectionSelect: true
          },
          collectionService.getGroupCollectionItems()
        )
      }).withTitle(marker('ARLAS server')),
      useShare: new SlideToggleFormControl(
        '',
        marker('Share module'),
        marker('Share module description'),
        {
          resetDependantsOnChange: true
        }
      ),
      useDownload: new SlideToggleFormControl(
        '',
        marker('Download module'),
        marker('Download module description'),
        {
          resetDependantsOnChange: true
        }
      ),
      useTagger: new SlideToggleFormControl(
        '',
        marker('Tagger module'),
        marker('Tagger module description'),
        {
          resetDependantsOnChange: true
        }
      ),
      share: new ConfigFormGroup(
        {
          maxForFeature: new SliderFormControl(
            '',
            marker('Max for feature'),
            '',
            100,
            10000,
            100
          ),
          maxForTopology: new SliderFormControl(
            '',
            marker('Feature metrics'),
            '',
            100,
            10000,
            100
          ),
        },
        {
          dependsOn: () => [this.customControls.useShare],
          onDependencyChange: (control) => control.enableIf(this.customControls.useShare.value)
        }),
      tagger: new ConfigFormGroup(
        {
          serverUrl: new InputFormControl(
            '',
            marker('Tagger server URL'),
            '',
            undefined,
            {
              validators: [urlValidator]
            }
          ),
          collection: new SelectFormControl(
            '',
            marker('Collection'),
            '',
            true,
            [],
            {
              optional: false,
              isCollectionSelect: true
            },
            collectionService.getGroupCollectionItems()
          )
        },
        {
          dependsOn: () => [this.customControls.useTagger],
          onDependencyChange: (control) => control.enableIf(this.customControls.useTagger.value)
        }
      ),
      unmanagedFields: new FormGroup({
        sortExcludedTypes: new FormControl()
      })
    });
  }

  public customControls = {
    server: {
      maxAgeCache: this.get('server.maxAgeCache') as InputFormControl,
      mainCollection: this.get('server.mainCollection') as SelectFormControl
    },
    useShare: this.get('useShare') as SlideToggleFormControl,
    useDownload: this.get('useDownload') as SlideToggleFormControl,
    useTagger: this.get('useTagger') as SlideToggleFormControl,
    share: {
      maxForFeature: this.get('share.maxForFeature') as SliderFormControl,
      maxForTopology: this.get('share.maxForTopology') as SliderFormControl,
    },
    tagger: {
      serverUrl: this.get('tagger.serverUrl') as InputFormControl,
      collection: this.get('tagger.collection') as SelectFormControl,
    },
    unmanagedFields: {
      sortExcludedTypes: this.get('unmanagedFields.sortExcludedTypes')
    }
  };

  public customGroups = {
    share: this.get('share') as ConfigFormGroup,
    tagger: this.get('tagger') as ConfigFormGroup,
    server: this.get('server') as ConfigFormGroup
  };

}

@Injectable({
  providedIn: 'root'
})
export class SideModulesGlobalFormBuilderService {
  private readonly defaultValuesService = inject(DefaultValuesService);
  private readonly collectionService = inject(CollectionService);
  private readonly arlasCss = inject(ArlasCollaborativesearchService);

  public build() {
    const globalFg = new SideModulesGlobalFormGroup(this.collectionService, this.arlasCss);

    this.defaultValuesService.setDefaultValueRecursively('sideModules.global', globalFg);
    return globalFg;
  }
}
