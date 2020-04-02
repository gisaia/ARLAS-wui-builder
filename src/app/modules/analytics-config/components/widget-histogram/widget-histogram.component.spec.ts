import { WidgetHistogramComponent } from './widget-histogram.component';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { ConfigFormGroupComponent } from '@shared-components/config-form-group/config-form-group.component';
import { MockComponent } from 'ng-mocks';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CollectionService } from '@services/collection-service/collection.service';
import { of } from 'rxjs';

describe('WidgetHistogramComponent', () => {
  let spectator: Spectator<WidgetHistogramComponent>;

  const createComponent = createComponentFactory({
    component: WidgetHistogramComponent,
    providers: [
      {
        provide: MAT_DIALOG_DATA, useValue: null
      },
      mockProvider(CollectionService, {
        getCollectionFields: () => of([])
      })
    ],
    declarations: [
      MockComponent(ConfigFormGroupComponent)
    ],
    mocks: [
      MatDialogRef
    ]
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
