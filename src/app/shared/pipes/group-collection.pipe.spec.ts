import { createPipeFactory, SpectatorPipe } from '@ngneat/spectator';
import { TranslateService } from '@ngx-translate/core';
import { GroupCollectionPipe } from './group-collection.pipe';

describe('GroupCollectionPipe', () => {
  let spectator: SpectatorPipe<GroupCollectionPipe>;

  const createPipe = createPipeFactory({
    pipe: GroupCollectionPipe,
    mocks: [
      TranslateService
    ]
  });

  beforeEach(() => spectator = createPipe());

  it('create an instance', () => {
    expect(spectator).toBeDefined();
  });
});
