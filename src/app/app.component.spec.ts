import { LeftMenuComponent } from '@components/left-menu/left-menu.component';
import { StatusComponent } from '@components/status/status.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { MockComponent } from 'ng-mocks';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let spectator: Spectator<AppComponent>;

  const createComponent = createComponentFactory({
    component: AppComponent,
    declarations: [
      MockComponent(LeftMenuComponent),
      MockComponent(StatusComponent)
    ]
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it(`should have as title 'ARLAS-wui-builder'`, () => {
    expect(spectator.component.title).toEqual('ARLAS-wui-builder');
  });

  it('should contain the left menu and the page content', () => {
    expect(spectator.query('app-left-menu')).toBeDefined();
    expect(spectator.query('outer-outlet')).toBeDefined();
  });
});
