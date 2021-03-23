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
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MainFormService } from '@services/main-form/main-form.service';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss']
})
export class StatusComponent implements OnInit {

  public displayCurrentConfig = false;
  public editingConfigName = false;
  public editingName: string;
  constructor(
    public mainService: MainFormService,
    private cdr: ChangeDetectorRef
  ) { }

  public ngOnInit() {
    this.mainService.configChange.subscribe(config => {
      this.mainService.configurationName = config.name;
      this.displayCurrentConfig = true;
      this.cdr.detectChanges();
    });
  }

  public finishEditConfigName() {
    this.mainService.configurationName = this.editingName;
    this.editingConfigName = false;
  }

  public startEditConfigName(event) {
    this.editingConfigName = true;
    this.editingName = this.mainService.configurationName;
  }

}
