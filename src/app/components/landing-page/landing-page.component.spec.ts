import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { LandingPageComponent, LandingPageDialogComponent } from './landing-page.component';
import { MatDialogRef } from '@angular/material';

describe('LandingPageComponent', () => {
  let spectator: Spectator<LandingPageComponent>;

  const createComponent = createComponentFactory({
    component: LandingPageComponent,
    providers: [
      { provide: MatDialogRef, useValue: {} },
    ],
    entryComponents: [
      LandingPageDialogComponent
    ]
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

});
