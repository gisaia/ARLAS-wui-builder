import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MainFormService } from '@app/services/main-form/main-form.service';

@Component({
  selector: 'app-global',
  templateUrl: './global.component.html',
  styleUrls: ['./global.component.scss']
})
export class GlobalComponent implements OnInit {

  constructor(private mainFormService: MainFormService) { }

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
