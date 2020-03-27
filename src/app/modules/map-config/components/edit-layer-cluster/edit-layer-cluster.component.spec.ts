import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLayerClusterComponent } from './edit-layer-cluster.component';

describe('EditLayerClusterComponent', () => {
  let component: EditLayerClusterComponent;
  let fixture: ComponentFixture<EditLayerClusterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditLayerClusterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditLayerClusterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
