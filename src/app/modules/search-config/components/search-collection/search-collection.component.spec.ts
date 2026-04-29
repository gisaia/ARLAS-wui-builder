import { ComponentFixture, TestBed } from '@angular/core/testing';
import { mockCollectionService } from '@app/test/collection.service.mock';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { CollectionService } from '@services/collection-service/collection.service';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { SearchCollectionComponent } from './search-collection.component';

describe('SearchCollectionComponent', () => {
    let component: SearchCollectionComponent;
    let fixture: ComponentFixture<SearchCollectionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                SearchCollectionComponent,
                LoggerModule.forRoot(null),
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
                }),
            ],
            providers: [
                {
                    provide: CollectionService,
                    useValue: mockCollectionService
                }
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
