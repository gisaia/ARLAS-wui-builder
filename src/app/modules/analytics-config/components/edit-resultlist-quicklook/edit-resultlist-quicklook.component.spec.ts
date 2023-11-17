import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditResultlistQuicklookComponent } from './edit-resultlist-quicklook.component';

describe('EditResultlistQuicklookComponent', () => {
  let component: EditResultlistQuicklookComponent;
  let fixture: ComponentFixture<EditResultlistQuicklookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditResultlistQuicklookComponent ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(EditResultlistQuicklookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
