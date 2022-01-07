import { FormControl, FormGroup } from '@angular/forms';
import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator';
import { MainFormService } from '@services/main-form/main-form.service';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { ArlasSettingsService } from 'arlas-wui-toolkit';
import { GlobalExternalNodeComponent } from './global-external-node.component';

describe('GlobalExternalNodeComponent', () => {
  let spectator: Spectator<GlobalExternalNodeComponent>;

  const createComponent = createComponentFactory({
    component: GlobalExternalNodeComponent,
    imports : [NgJsonEditorModule],
    providers: [
      mockProvider(ArlasSettingsService, {
        settings: {}
      }),
      mockProvider(MainFormService, {
        externalNodeConfig: {
          getExternalNodeFg: () => new FormGroup({
            externalNode: new FormControl(null),

          })
        }
      }) ]
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
