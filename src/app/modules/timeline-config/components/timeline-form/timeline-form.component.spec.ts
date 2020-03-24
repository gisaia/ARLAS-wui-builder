import { TimelineFormComponent } from './timeline-form.component';
import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { MockComponent, MockDirective } from 'ng-mocks';
import { ConfigElementComponent } from '@shared-components/config-element/config-element.component';
import { ResetOnChangeDirective } from '@shared-directives/reset-on-change/reset-on-change.directive';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';

describe('TimelineFormComponent', () => {
  let spectator: Spectator<TimelineFormComponent>;
  const createComponent = createComponentFactory({
    component: TimelineFormComponent,
    declarations: [
      MockComponent(ConfigElementComponent),
      ResetOnChangeDirective
    ]
  });

  beforeEach(() => spectator = createComponent({
    props: {
      submit: new Subject<boolean>().asObservable()
    }
  }));

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
