import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { SideModulesImportService } from './side-modules-import.service';

describe('SideModulesImportService', () => {
    let service: SideModulesImportService;

    beforeEach(() => {
        TestBed.configureTestingModule({});

        service = TestBed.inject(SideModulesImportService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });
});
