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

import { MatDialog } from '@angular/material/dialog';
import { CollectionService } from '@services/collection-service/collection.service';
import { DefaultConfig } from '@services/default-values/default-values.service';
import { PROPERTY_TYPE } from '@shared-services/property-selector-form-builder/models';
import { PropertySelectorFormGroup } from '@shared-services/property-selector-form-builder/property-selector-form-builder.service';
import { ArlasColorService } from 'arlas-web-components';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { mockCollectionService } from './collection.service.mock';

export const mockPropertySelectorBuilderService = {
    build: vi.fn(() => new PropertySelectorFormGroup(
        {} as DefaultConfig, {} as MatDialog,
        mockCollectionService as unknown as CollectionService,
        {} as ArlasColorService, '', of([]), PROPERTY_TYPE.color, '', [], false))
};
