import { TestBed } from '@angular/core/testing';
import { mockArlasSettingsService } from '@app/test/arlas-settings.service.mock';
import { mockMainFormService } from '@app/test/main-form.service.mock';
import { MainFormService } from '@services/main-form/main-form.service';
import { ArlasSettingsService } from 'arlas-wui-toolkit';
import { beforeEach, describe, expect, it } from 'vitest';
import { MenuService } from './menu.service';

describe('MenuService', () => {
    let service: MenuService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: MainFormService,
                    useValue: mockMainFormService
                },
                {
                    provide: ArlasSettingsService,
                    useValue: mockArlasSettingsService
                }
            ]
        });

        service = TestBed.inject(MenuService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });
});
