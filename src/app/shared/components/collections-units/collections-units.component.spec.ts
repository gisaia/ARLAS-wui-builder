import { FormArray } from '@angular/forms';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { CollectionsUnitsComponent } from './collections-units.component';


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
