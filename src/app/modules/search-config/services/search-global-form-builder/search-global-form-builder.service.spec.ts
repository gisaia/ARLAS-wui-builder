import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CollectionService } from '@services/collection-service/collection.service';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { SearchGlobalFormBuilderService } from './search-global-form-builder.service';

describe('SearchGlobalFormBuilderService', () => {
  let spectator: SpectatorService<SearchGlobalFormBuilderService>;

  const createService = createServiceFactory({
    service: SearchGlobalFormBuilderService,
    providers: [
      mockProvider(CollectionService),
      mockProvider(ArlasCollaborativesearchService)
    ],
    imports: [
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateFakeLoader
        }
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
