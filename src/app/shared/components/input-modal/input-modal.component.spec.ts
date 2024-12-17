import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { InputModalComponent } from './input-modal.component';

describe('InputModalComponent', () => {
  let spectator: Spectator<InputModalComponent>;

  const createComponent = createComponentFactory({
    component: InputModalComponent,
    providers: [
      {
        provide: MatDialogRef, useValue: {}
      },
      { provide: MAT_DIALOG_DATA, useValue: {} },
    ]
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

});
