import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { StatusComponent } from './status.component';

describe('StatusComponent', () => {
    let component: StatusComponent;
    let fixture: ComponentFixture<StatusComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                StatusComponent
            ]
        })
        .compileComponents();

        fixture = TestBed.createComponent(StatusComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
