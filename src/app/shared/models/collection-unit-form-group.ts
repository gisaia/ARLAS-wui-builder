import { marker } from '@colsen1991/ngx-translate-extract-marker';
import { ConfigFormGroup, InputFormControl, SlideToggleFormControl } from './config-form';

export class CollectionUnitFormGroup extends ConfigFormGroup {
  public constructor() {
    super({
      unit: new InputFormControl(
        '',
        marker('collection unit'),
        marker('Unit desc')
      ),
      collection: new InputFormControl(
        '',
        marker('collection'),
        marker('collection desc')
      ),
      ignored: new SlideToggleFormControl(false,
        '',
        '')
    });
  }

  public customControls = {
    unit: this.get('unit') as InputFormControl,
    collection: this.get('collection') as InputFormControl,
    ignored: this.get('ignored') as SlideToggleFormControl
  };
}
