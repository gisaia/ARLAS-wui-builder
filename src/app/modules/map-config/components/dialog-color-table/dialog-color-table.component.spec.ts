import { DialogColorTableComponent } from './dialog-color-table.component';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MockComponent } from 'ng-mocks';
import { ColorPickerWrapperComponent } from '@shared-components/color-picker-wrapper/color-picker-wrapper.component';

describe('DialogColorTableComponent', () => {
  let spectator: Spectator<DialogColorTableComponent>;

  const createComponent = createComponentFactory({
    component: DialogColorTableComponent,
    providers: [
      mockProvider(MatDialogRef),
      { provide: MAT_DIALOG_DATA, useValue: [] }
    ],
    entryComponents: [
      DialogColorTableComponent
    ],
    declarations: [
      MockComponent(ColorPickerWrapperComponent)
    ]
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
