import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { AwcColorGeneratorLoader, ColorGeneratorLoader, ColorGeneratorModule } from 'arlas-web-components';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { EditResultlistQuicklookComponent } from './edit-resultlist-quicklook.component';

describe('EditResultlistQuicklookComponent', () => {
    let component: EditResultlistQuicklookComponent;
    let fixture: ComponentFixture<EditResultlistQuicklookComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                EditResultlistQuicklookComponent,
                LoggerModule.forRoot(null),
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
                }),
                ColorGeneratorModule.forRoot({
                    loader: {
                        provide: ColorGeneratorLoader,
                        useClass: AwcColorGeneratorLoader
                    }
                }),
            ]
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
