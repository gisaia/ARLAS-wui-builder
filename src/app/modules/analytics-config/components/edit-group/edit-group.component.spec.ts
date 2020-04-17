import { EditGroupComponent } from './edit-group.component';
import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { FormGroup, FormControl } from '@angular/forms';
import { AlertOnChangeDirective } from '@shared-directives/alert-on-change/alert-on-change.directive';
import { ResetOnChangeDirective } from '@shared-directives/reset-on-change/reset-on-change.directive';

describe('EditGroupComponent', () => {
  let spectator: Spectator<EditGroupComponent>;

  const createComponent = createComponentFactory({
    component: EditGroupComponent,
    declarations: [
      AlertOnChangeDirective,
      ResetOnChangeDirective
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
