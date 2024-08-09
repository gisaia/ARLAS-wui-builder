import { EditWidgetDialogComponent } from './edit-widget-dialog.component';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { ConfigFormGroupComponent } from '@shared-components/config-form-group/config-form-group.component';
import { MockComponent } from 'ng-mocks';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { CollectionService } from '@services/collection-service/collection.service';
import { of } from 'rxjs';
import { HistogramFormBuilderService } from '../../services/histogram-form-builder/histogram-form-builder.service';
import { FormGroup } from '@angular/forms';
import { ResultlistDataComponent } from '../resultlist-data/resultlist-data.component';
import { ConfigFormControlComponent } from '@shared-components/config-form-control/config-form-control.component';
import { ArlasColorService } from 'arlas-web-components';

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
        buildWithValues: () => new FormGroup({})
      }),
      mockProvider(ArlasColorService)
    ],
    declarations: [
      MockComponent(ConfigFormGroupComponent),
      MockComponent(ResultlistDataComponent),
      MockComponent(ConfigFormControlComponent),
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
