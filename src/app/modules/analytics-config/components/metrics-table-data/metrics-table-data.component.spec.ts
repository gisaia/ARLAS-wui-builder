
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { MetricsTableDataComponent } from './metrics-table-data.component';
import { MatDialogModule } from '@angular/material/dialog';

describe('MetricsTableDataComponent', () => {
  let spectator: Spectator<MetricsTableDataComponent>;

  const createComponent = createComponentFactory({
    component: MetricsTableDataComponent,
    declarations: [
    ],
    imports: [
      MatDialogModule],
  });

  beforeEach(() => {
    spectator = createComponent({
      props: {
        collection: 'test'
      }
    });
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
