import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MainFormService } from '@services/main-form/main-form.service';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss']
})
export class StatusComponent implements OnInit {

  public configName = undefined;
  public displayCurrentConfig = false;

  constructor(
    private mainService: MainFormService,
    private cdr: ChangeDetectorRef
  ) { }

  public ngOnInit() {
    this.mainService.configChange.subscribe(config => {
      this.configName = config.name;
      this.displayCurrentConfig = true;
      this.cdr.detectChanges();
    });
  }

}
