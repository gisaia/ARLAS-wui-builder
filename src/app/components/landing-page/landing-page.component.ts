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
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { ArlasConfigService } from 'arlas-wui-toolkit';
import { ArlasConfigurationDescriptor } from 'arlas-wui-toolkit/services/configuration-descriptor/configurationDescriptor.service';
import { NGXLogger } from 'ngx-logger';
import { Subject } from 'rxjs';
import { StartupService } from '../../services/startup/startup.service';

@Component({
  templateUrl: './landing-page-dialog.component.html',
  styleUrls: ['./landing-page-dialog.component.scss']
})
export class LandingPageDialogComponent implements OnInit {
  @Output() public startEvent: Subject<string> = new Subject<string>();

  public configChoice = false;
  public isServerReady = false;
  public availablesCollections: string[];

  constructor(
    public dialogRef: MatDialogRef<LandingPageDialogComponent>,
    public mainFormService: MainFormService,
    private http: HttpClient,
    private logger: NGXLogger,
    private configService: ArlasConfigService,
    private startupService: StartupService,
    private configDescritor: ArlasConfigurationDescriptor,
    private formBuilderWithDefault: FormBuilderWithDefaultService,
    private translate: TranslateService) { }

  public ngOnInit(): void {
    if (!!this.mainFormService.mainForm) {
      this.mainFormService.startingConfig.init(
        this.formBuilderWithDefault.group('global', {
          serverUrl: new FormControl(null,
            [Validators.required, Validators.pattern('(https?://)([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]),
          collections: new FormControl(null, [Validators.required, Validators.maxLength(1)])
        }));
    }
  }

  public config(mode: string) {
    if (mode === 'new') {
      this.configChoice = true;
    } else {
      this.startEvent.next(mode);
    }
  }

  public cancel(): void {
    this.dialogRef.close();
  }

  public checkUrl() {
    const url = this.mainFormService.startingConfig.getFg().get('serverUrl').value;
    this.http.get(url + '/swagger.json').subscribe(
      () => {
        // Update config with new server url
        // Usefull to use toolkit method
        const currentConf = this.configService.getConfig();
        const newConf = Object.assign(currentConf, { arlas: { server: { url } } });
        this.configService.setConfig(newConf);
        // Update collaborative search Service with the new url
        this.startupService.setCollaborativeService(newConf).then(() => {
          this.configDescritor.getAllCollections().subscribe(collections => this.availablesCollections = collections);
          this.isServerReady = true;
        });
      },
      () => {
        this.logger.error(this.translate.instant('Unable to access the server. Please, verify the url.'));
        this.isServerReady = false;
      }
    );
  }
}

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit, AfterViewInit {

  @Output() public startEvent: Subject<string> = new Subject<string>();
  public dialogRef: MatDialogRef<LandingPageDialogComponent>;

  constructor(
    private dialog: MatDialog,
    private logger: NGXLogger,
    private router: Router,
    private startupService: StartupService,
    private translate: TranslateService,
    private mainFormService: MainFormService) { }

  public ngOnInit(): void {
    // Reset and clean all contents of all forms
    this.mainFormService.resetMainForm();
  }

  public openChoice() {
    this.dialogRef = this.dialog.open(LandingPageDialogComponent, { disableClose: true });
    this.dialogRef.componentInstance.startEvent.subscribe(mode => this.startEvent.next(mode));
  }

  public ngAfterViewInit() {
    this.openChoice();
    this.startEvent.subscribe(mode => {
      if (mode === 'new') {
        const collection = this.dialogRef.componentInstance.mainFormService.startingConfig.getFg().get('collections').value;
        this.startupService.setCollection(collection);
        this.dialogRef.close();
        this.router.navigate(['map-config']);
        this.logger.info(this.translate.instant('Ready to access server'));
      } else {
        // I think we need to think about two options for this part
        // A config file store in a database with arlas-persistence
        // A config file store on the file system of the user computer
        // In all cases we need to validate the folder with this code
        // const newUrl = this.dialogRef.componentInstance.mainFormService.startingConfig.getFg().get('serverUrl').value;
        // this.startupService.validLoadedConfig(newUrl)
        this.logger.error(this.translate.instant('Not available now'));
      }
    });
  }
}


