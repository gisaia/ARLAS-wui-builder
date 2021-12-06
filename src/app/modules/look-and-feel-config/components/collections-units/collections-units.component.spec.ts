import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionsUnitsComponent } from './collections-units.component';
import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { FormArray } from '@angular/forms';


describe('CollectionsUnitsComponent', () => {
  let spectator: Spectator<CollectionsUnitsComponent>;
  const createComponent = createComponentFactory({
    component: CollectionsUnitsComponent,
    declarations: [
    ],
    providers: []
  });

  beforeEach(() => spectator = createComponent({
    props: {
      unitsArray: new FormArray([])
    }
  }));

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
