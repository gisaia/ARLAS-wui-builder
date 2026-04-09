import { TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { LookAndFeelInitService } from './look-and-feel-init.service';

describe('LookAndFeelInitService', () => {
    let service: LookAndFeelInitService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                LoggerModule.forRoot(null),
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
                }),
            ]
        });

        service = TestBed.inject(LookAndFeelInitService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });
});
