import { TestBed } from '@angular/core/testing';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { DefaultValuesService } from './default-values.service';

describe('DefaultValuesService', () => {
    let service: DefaultValuesService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [LoggerModule.forRoot(null)]
        });

        service = TestBed.inject(DefaultValuesService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });
});
