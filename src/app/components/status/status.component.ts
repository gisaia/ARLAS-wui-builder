/*
 * Licensed to Gisaïa under one or more contributor
 * license agreements. See the NOTICE.txt file distributed with
 * this work for additional information regarding copyright
 * ownership. Gisaïa licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { MainFormService } from '@services/main-form/main-form.service';

@Component({
  selector: 'arlas-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss'],
  imports: [
    TranslatePipe,
    FormsModule,
    MatTooltipModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class StatusComponent implements OnInit {

  public displayCurrentConfig = false;
  public editingConfigName = false;
  public editingName?: string;

  public constructor(
    protected mainService: MainFormService,
    private readonly cdr: ChangeDetectorRef
  ) { }

  public ngOnInit() {
    this.mainService.configChange.subscribe(config => {
      this.mainService.configurationName = config?.name;
      this.displayCurrentConfig = true;
      this.cdr.detectChanges();
    });
  }

  public finishEditConfigName() {
    this.mainService.configurationName = this.editingName;
    this.editingConfigName = false;
  }

  public startEditConfigName() {
    this.editingConfigName = true;
    this.editingName = this.mainService.configurationName;
  }
}
