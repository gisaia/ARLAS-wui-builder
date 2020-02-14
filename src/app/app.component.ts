import { Component, ViewChild } from '@angular/core';
import { LandingPageComponent } from '@components/landing-page/landing-page.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'ARLAS-wui-builder';

  @ViewChild('landing', { static: false }) public landing: LandingPageComponent;

  constructor() {
  }
}
