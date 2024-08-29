import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchCollectionComponent } from './search-collection.component';

describe('SearchCollectionComponent', () => {
  let component: SearchCollectionComponent;
  let fixture: ComponentFixture<SearchCollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchCollectionComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SearchCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
