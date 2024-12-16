
import { ResultlistFormBuilderService } from '@analytics-config/services/resultlist-form-builder/resultlist-form-builder.service';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { EditResultlistQuicklookComponent } from './edit-resultlist-quicklook.component';

describe('EditResultlistQuicklookComponent', () => {
  let spectator: Spectator<EditResultlistQuicklookComponent>;

  const createComponent = createComponentFactory({
    component: EditResultlistQuicklookComponent,
    providers: [
      mockProvider(ResultlistFormBuilderService)
    ]
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
