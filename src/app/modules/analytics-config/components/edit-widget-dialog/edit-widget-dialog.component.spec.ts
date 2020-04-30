import { EditWidgetDialogComponent } from './edit-widget-dialog.component';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { ConfigFormGroupComponent } from '@shared-components/config-form-group/config-form-group.component';
import { MockComponent } from 'ng-mocks';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CollectionService } from '@services/collection-service/collection.service';
import { of } from 'rxjs';
import { HistogramFormBuilderService } from '../../services/histogram-form-builder/histogram-form-builder.service';
import { FormGroup } from '@angular/forms';

describe('EditWidgetDialogComponent', () => {
  let spectator: Spectator<EditWidgetDialogComponent>;

  const createComponent = createComponentFactory({
    component: EditWidgetDialogComponent,
    providers: [
      {
        provide: MAT_DIALOG_DATA, useValue: {
          widgetType: 'histogram',
          formData: {}
        }
      },
      mockProvider(CollectionService, {
        getCollectionFields: () => of([])
      }),
      mockProvider(HistogramFormBuilderService, {
        build: () => new FormGroup({})
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
