import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageDataGroupDialogComponent } from './manage-data-group-dialog.component';

describe('DataGroupEditionComponent', () => {
  let component: ManageDataGroupDialogComponent;
  let fixture: ComponentFixture<ManageDataGroupDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageDataGroupDialogComponent]
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
