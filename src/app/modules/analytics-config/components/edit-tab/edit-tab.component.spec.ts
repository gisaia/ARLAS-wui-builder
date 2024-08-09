import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { EditTabComponent } from './edit-tab.component';


describe('EditTabComponent', () => {
  let spectator: Spectator<EditTabComponent>;

  const createComponent = createComponentFactory({
    component: EditTabComponent,
    providers: [
      {
        provide: MAT_DIALOG_DATA, useValue: {
          icon: 'close',
          name: 'test',
          showIcon: true,
          showName: false
        }
      },
    ],
    declarations: [
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
