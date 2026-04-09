import { TestBed } from '@angular/core/testing';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { StartingConfigFormBuilderService } from './starting-config-form-builder.service';

describe('StartingConfigFormBuilderService', () => {
    let service: StartingConfigFormBuilderService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                LoggerModule.forRoot(null)
            ]
        });

        service = TestBed.inject(StartingConfigFormBuilderService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });
});
