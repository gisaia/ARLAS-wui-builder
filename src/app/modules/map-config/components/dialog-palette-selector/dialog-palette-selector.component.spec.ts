import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { DialogPaletteSelectorComponent } from './dialog-palette-selector.component';
import { MockComponent } from 'ng-mocks';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { ColorPickerWrapperComponent } from '@shared-components/color-picker-wrapper/color-picker-wrapper.component';

describe('DialogPaletteSelectorComponent', () => {
  let spectator: Spectator<DialogPaletteSelectorComponent>;

  const createComponent = createComponentFactory({
    component: DialogPaletteSelectorComponent,
    providers: [
      mockProvider(MatDialogRef),
      { provide: MAT_DIALOG_DATA, useValue: { defaultPalettes: [], selectedPalette: '' } }
    ],
    entryComponents: [
      DialogPaletteSelectorComponent
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
