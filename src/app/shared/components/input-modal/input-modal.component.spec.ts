import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputModalComponent } from './input-modal.component';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { createComponentFactory, Spectator } from '@ngneat/spectator';

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
