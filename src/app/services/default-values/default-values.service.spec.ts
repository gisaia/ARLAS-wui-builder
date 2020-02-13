import { DefaultValuesService } from './default-values.service';
import { SpectatorService, createServiceFactory } from '@ngneat/spectator';
import { HttpClient } from '@angular/common/http';

describe('DefaultValuesService', () => {
  let spectator: SpectatorService<DefaultValuesService>;
  const createService = createServiceFactory({
    service: DefaultValuesService,
    providers: [],
    entryComponents: [],
    mocks: [HttpClient]
  });

  beforeEach(() => spectator = createService());

  it('should be defined', () => {
    expect(spectator.service).toBeDefined();
  });
});
