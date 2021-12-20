/*
Licensed to Gisaïa under one or more contributor
license agreements. See the NOTICE.txt file distributed with
this work for additional information regarding copyright
ownership. Gisaïa licenses this file to you under
the Apache License, Version 2.0 (the "License"); you may
not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/
import { Component, ViewChild, OnInit } from '@angular/core';
import { LandingPageComponent } from '@components/landing-page/landing-page.component';
import { NGXLogInterface, NGXLogger, NgxLoggerLevel } from 'ngx-logger';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IconService } from '@services/icon-service/icon.service';
import { MainFormService } from './services/main-form/main-form.service';
import { Title } from '@angular/platform-browser';
import { ArlasSettingsService } from 'arlas-wui-toolkit';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public title = 'ARLAS-wui-builder';
  @ViewChild('landing', { static: false }) public landing: LandingPageComponent;

  constructor(
    private mainFormService: MainFormService,
    private logger: NGXLogger,
    private snackbar: MatSnackBar,
    private iconService: IconService,
    private titleService: Title,
    private arlasSettingsService: ArlasSettingsService) {

    this.logger.registerMonitor({
      onLog(logObject: NGXLogInterface): void {
        if (logObject.level >= NgxLoggerLevel.ERROR) {
          snackbar.open(logObject.message);
        }
      }
    });
  }

  public ngOnInit(): void {
    // tslint:disable-next-line:no-string-literal
    this.title = this.arlasSettingsService.settings['tab_name'] ?
      // tslint:disable-next-line:no-string-literal
      this.arlasSettingsService.settings['tab_name'] : 'ARLAS-wui-builder';
    this.titleService.setTitle(this.title);
    this.iconService.registerIcons();
  }
}
