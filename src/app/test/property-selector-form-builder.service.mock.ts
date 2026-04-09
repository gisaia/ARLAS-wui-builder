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
