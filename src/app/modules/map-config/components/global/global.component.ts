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
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Expression } from 'arlas-api';
import { MainFormService } from '@services/main-form/main-form.service';

@Component({
  selector: 'app-global',
  templateUrl: './global.component.html',
  styleUrls: ['./global.component.scss']
})
export class GlobalComponent implements OnInit {

  public operators = [
    Expression.OpEnum.Intersects,
    Expression.OpEnum.Notintersects,
    Expression.OpEnum.Notwithin,
    Expression.OpEnum.Within
  ];

  constructor(public mainFormService: MainFormService) { }

  ngOnInit() {
    this.mainFormService.addMapConfigGlobalFormIfInexisting(new FormGroup({
      targetGeometries: new FormControl(),
      geographicalOperator: new FormControl()
    }));
  }

  public getMapConfigFormGroup() {
    return this.mainFormService.getMapConfigGlobalForm();
  }

}
