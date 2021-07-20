import { Component, OnInit, OnDestroy } from '@angular/core';
import { MainFormService } from '@services/main-form/main-form.service';
import { FormArray, FormControl } from '@angular/forms';
import { ResultlistConfigForm } from '@analytics-config/services/resultlist-form-builder/resultlist-form-builder.service';
import { CollectionService } from '@services/collection-service/collection.service';
import { MatDialog } from '@angular/material/dialog';
import { InputModalComponent } from '@shared-components/input-modal/input-modal.component';
import { Subscription } from 'rxjs';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { ConfigExportHelper } from '@services/main-form-manager/config-export-helper';

@Component({
  selector: 'app-global-result-list',
  templateUrl: './global-result-list.component.html',
  styleUrls: ['./global-result-list.component.scss']
})
export class GlobalResultListComponent implements OnDestroy {

  public listsFa: FormArray;
  private newAfterClosedSub: Subscription;
  public selected = new FormControl(0);

  public preview = [];

  constructor(
    public mainFormService: MainFormService,
    private collectionService: CollectionService,
    private dialog: MatDialog,
    private defaultValuesService: DefaultValuesService
  ) {
    this.listsFa = this.mainFormService.resultListConfig.getResultListsFa();
    this.updatePreview();
  }

  public addResultList() {
    const dialogRef = this.dialog.open(InputModalComponent);
    this.newAfterClosedSub = dialogRef.afterClosed().subscribe(name => {
      if (name) {
        const formGroup = new ResultlistConfigForm(this.mainFormService.getMainCollection(), this.collectionService, name);
        this.defaultValuesService.setDefaultValueRecursively('analytics.widgets.resultlist', formGroup);
        this.listsFa.push(formGroup);
        this.selected.setValue(this.listsFa.length - 1);
      }
    });
  }

  public updatePreview() {
    this.preview = ConfigExportHelper.getResultListComponent(this.listsFa);
  }

  public ngOnDestroy() {
    if (this.newAfterClosedSub) { this.newAfterClosedSub.unsubscribe(); }
  }

}
