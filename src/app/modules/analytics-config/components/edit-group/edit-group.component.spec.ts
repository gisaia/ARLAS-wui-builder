import { EditGroupComponent } from './edit-group.component';
import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { FormGroup, FormControl } from '@angular/forms';

describe('EditGroupComponent', () => {
  let spectator: Spectator<EditGroupComponent>;

  const createComponent = createComponentFactory({
    component: EditGroupComponent,
    declarations: [
    ]
  });

  beforeEach(() => {
    spectator = createComponent({
      props: {
        formGroup: new FormGroup({
          icon: new FormControl(''),
          title: new FormControl(''),
          contentType: new FormControl(''),
          content: new FormControl(''),
        })
      }
    });
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
