import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { AppComponent } from './app.component';
import { MockComponent } from 'ng-mocks';
import { LeftMenuComponent } from '@components/left-menu/left-menu.component';
import { TranslateService, TranslateModule, TranslateFakeLoader, TranslateLoader } from '@ngx-translate/core';

describe('AppComponent', () => {
  let spectator: Spectator<AppComponent>;

  const createComponent = createComponentFactory({
    component: AppComponent,
    imports: [
      TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: TranslateFakeLoader } })
    ],
    declarations: [
      MockComponent(LeftMenuComponent)
    ],
    providers: [
      TranslateService
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
