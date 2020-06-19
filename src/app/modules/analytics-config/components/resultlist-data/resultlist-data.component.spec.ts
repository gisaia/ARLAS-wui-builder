import { ResultlistDataComponent } from './resultlist-data.component';
import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { MockComponent } from 'ng-mocks';
import { EditResultlistColumnsComponent } from '../edit-resultlist-columns/edit-resultlist-columns.component';
import { EditResultlistDetailsComponent } from '../edit-resultlist-details/edit-resultlist-details.component';
import { FormArray, FormGroup, FormControl } from '@angular/forms';

describe('ResultlistDataComponent', () => {
  let spectator: Spectator<ResultlistDataComponent>;

  const createComponent = createComponentFactory({
    component: ResultlistDataComponent,
    declarations: [
      MockComponent(EditResultlistColumnsComponent),
      MockComponent(EditResultlistDetailsComponent),
    ]
  });

  beforeEach(() => {
    spectator = createComponent({
      props: {
        control: new FormGroup({
          columns: new FormControl(''),
          details: new FormControl(''),
        })
      }
    });
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
