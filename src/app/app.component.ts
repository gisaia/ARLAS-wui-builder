import { Component, ViewChild } from '@angular/core';
import { LandingPageComponent } from '@components/landing-page/landing-page.component';
import { NGXLoggerMonitor, NGXLogInterface, NGXLogger, NgxLoggerLevel } from 'ngx-logger';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'ARLAS-wui-builder';

  @ViewChild('landing', { static: false }) public landing: LandingPageComponent;

  constructor(
    private logger: NGXLogger,
    private snackbar: MatSnackBar) {

    this.logger.registerMonitor({
      onLog(logObject: NGXLogInterface): void {
        if (logObject.level >= NgxLoggerLevel.ERROR) {
          snackbar.open(logObject.message);
        }
      }
    });
  }
}
