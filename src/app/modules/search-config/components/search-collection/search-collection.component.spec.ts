import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { mockProvider } from '@ngneat/spectator';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { NGXLogger } from 'ngx-logger';
import { SearchCollectionComponent } from './search-collection.component';


describe('SearchCollectionComponent', () => {
  let component: SearchCollectionComponent;
  let fixture: ComponentFixture<SearchCollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [SearchCollectionComponent],
    imports: [TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useClass: TranslateFakeLoader
            }
        })],
    providers: [
        mockProvider(NGXLogger),
        mockProvider(ArlasCollaborativesearchService),
        provideHttpClient(withInterceptorsFromDi())
    ]
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
