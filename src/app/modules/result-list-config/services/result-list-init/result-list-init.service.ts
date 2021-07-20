import { Injectable } from '@angular/core';
import { FormArray } from '@angular/forms';
import { MainFormService } from '@services/main-form/main-form.service';

@Injectable({
  providedIn: 'root'
})
export class ResultListInitService {

  constructor(
    private mainFormService: MainFormService
  ) { }

  public initModule() {

    this.mainFormService.resultListConfig.initResultListsFa(
      new FormArray([], [])
    );
  }
}
