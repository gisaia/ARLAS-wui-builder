import { GlobalComponent } from './global.component';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { ConfigElementComponent } from '@shared-components/config-element/config-element.component';
import { MockComponent } from 'ng-mocks';
import { CollectionService } from '@services/collection-service/collection.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { FormGroup } from '@angular/forms';
import { GlobalComponentForm } from './global.component.form';
import { of } from 'rxjs';

describe('GlobalComponent', () => {

  let spectator: Spectator<GlobalComponent>;
  const createComponent = createComponentFactory({
    component: GlobalComponent,
    declarations: [
      MockComponent(ConfigElementComponent)
    ],
    mocks: [
      CollectionService
    ]
  });

  beforeEach(() => spectator = createComponent());

  it('should contain 2 config elements', () => {
    expect(spectator.queryAll('app-config-element')).toHaveLength(2);
  });

});
