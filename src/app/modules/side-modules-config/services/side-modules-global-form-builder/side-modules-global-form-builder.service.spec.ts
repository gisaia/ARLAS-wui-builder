import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator';
import { CollectionService } from '@services/collection-service/collection.service';
import { ArlasCollaborativesearchService, ArlasConfigurationDescriptor } from 'arlas-wui-toolkit';
import { of } from 'rxjs';
import { SideModulesGlobalFormBuilderService } from './side-modules-global-form-builder.service';

describe('SideModulesGlobalFormBuilderService', () => {
  let spectator: SpectatorService<SideModulesGlobalFormBuilderService>;

  const createService = createServiceFactory({
    service: SideModulesGlobalFormBuilderService,
    providers: [
      mockProvider(ArlasConfigurationDescriptor),
      mockProvider(ArlasCollaborativesearchService),
      mockProvider(CollectionService, {
        getGroupCollectionItems: () => of()
      })
    ]
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
