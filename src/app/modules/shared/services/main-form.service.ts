import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class MainFormService {

  constructor() { }

  public mainForm = new FormGroup({});
}
