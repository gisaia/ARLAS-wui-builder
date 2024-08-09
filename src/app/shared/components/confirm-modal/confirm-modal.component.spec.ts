import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { ConfirmModalComponent } from './confirm-modal.component';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

describe('ConfirmModalComponent', () => {
  let spectator: Spectator<ConfirmModalComponent>;

  const createComponent = createComponentFactory({
    component: ConfirmModalComponent,
    providers: [
      { provide: MatDialogRef, useValue: {} },
      { provide: MAT_DIALOG_DATA, useValue: { message: 'test' } }
    ]
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should contain 1 title, 1 content and 2 buttons', () => {
    expect(spectator.queryAll('[mat-dialog-title]')).toHaveLength(1);
    expect(spectator.queryAll('[mat-dialog-content]')).toHaveLength(1);
    expect(spectator.queryAll('button')).toHaveLength(2);
  });

});
