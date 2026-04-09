import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { MapConfigComponent } from './map-config.component';

describe('MapConfigComponent', () => {
    let component: MapConfigComponent;
    let fixture: ComponentFixture<MapConfigComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                MapConfigComponent,
                RouterModule.forRoot([]),
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
                }),
            ]
        })
        .compileComponents();

        fixture = TestBed.createComponent(MapConfigComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
