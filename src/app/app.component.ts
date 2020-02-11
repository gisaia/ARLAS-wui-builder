import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  title = 'ARLAS-wui-builder';

  @ViewChild('landing', { static: false }) public landing: LandingPageComponent;

  constructor(public snackbar: MatSnackBar) {
  }

  public ngAfterViewInit(): void {
    this.landing.openChoice();
    this.landing.startEvent.subscribe(mode => {
      if (mode === 'new') {
        this.landing.dialogRef.close();
      } else {
        this.snackbar.open('Not available now', '', { duration: 2000 });
      }
    });
  }
}
