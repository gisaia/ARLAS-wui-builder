import { beforeEach, describe, expect, it } from "vitest";
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { mockProvider } from '@ngneat/spectator';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { NGXLogger } from 'ngx-logger';
import { SearchCollectionComponent } from './search-collection.component';


describe('SearchCollectionComponent', () => {
    let component: SearchCollectionComponent;
    let fixture: ComponentFixture<SearchCollectionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot({
                    loader: {
                        provide: TranslateLoader,
                        useClass: TranslateNoOpLoader
                    }
                }), SearchCollectionComponent],
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
