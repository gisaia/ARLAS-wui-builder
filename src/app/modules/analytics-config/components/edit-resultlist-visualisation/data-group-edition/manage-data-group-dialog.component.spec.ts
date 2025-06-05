import {
  ResultlistFormBuilderService
} from '@analytics-config/services/resultlist-form-builder/resultlist-form-builder.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mockProvider } from '@ngneat/spectator';
import { CollectionService } from '@services/collection-service/collection.service';
import { TOKEN_LOGGER_CONFIG } from 'ngx-logger';

import { ManageDataGroupDialogComponent } from './manage-data-group-dialog.component';

describe('DataGroupEditionComponent', () => {
  let component: ManageDataGroupDialogComponent;
  let fixture: ComponentFixture<ManageDataGroupDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageDataGroupDialogComponent],
      providers: [
        {provide: MAT_DIALOG_DATA, useValue: {}},
        {provide: TOKEN_LOGGER_CONFIG, useValue: {}},
        mockProvider(ResultlistFormBuilderService),
        mockProvider(CollectionService)
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ManageDataGroupDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
