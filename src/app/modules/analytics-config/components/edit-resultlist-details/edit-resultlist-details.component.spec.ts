import { EditResultlistDetailsComponent } from './edit-resultlist-details.component';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { ConfigFormControlComponent } from '@shared-components/config-form-control/config-form-control.component';
import { MockComponent } from 'ng-mocks';
import { ResultlistFormBuilderService } from '@analytics-config/services/resultlist-form-builder/resultlist-form-builder.service';
import { FormArray } from '@angular/forms';

describe('EditResultlistDetailsComponent', () => {
  let spectator: Spectator<EditResultlistDetailsComponent>;

  const createComponent = createComponentFactory({
    component: EditResultlistDetailsComponent,
    declarations: [
      MockComponent(ConfigFormControlComponent)
    ],
    providers: [
      mockProvider(ResultlistFormBuilderService)
    ]
  });

  beforeEach(() => {
    spectator = createComponent({
      props: {
        control: new FormArray([])
      }
    });
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
