import { EditWidgetDialogComponent } from './edit-widget-dialog.component';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { ConfigFormGroupComponent } from '@shared-components/config-form-group/config-form-group.component';
import { MockComponent } from 'ng-mocks';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CollectionService } from '@services/collection-service/collection.service';
import { of } from 'rxjs';
import { HistogramFormBuilderService } from '../../services/histogram-form-builder/histogram-form-builder.service';
import { FormGroup } from '@angular/forms';
import { ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';
import { EditResultlistColumnsComponent } from '../edit-resultlist-columns/edit-resultlist-columns.component';

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
      mockProvider(ArlasColorGeneratorLoader)
    ],
    declarations: [
      MockComponent(ConfigFormGroupComponent),
      MockComponent(EditResultlistColumnsComponent),
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
