import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CollectionsUnitsComponent } from './collections-units.component';

describe('CollectionsUnitsComponent', () => {
    let component: CollectionsUnitsComponent;
    let fixture: ComponentFixture<CollectionsUnitsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                CollectionsUnitsComponent
            ]
        })
        .compileComponents();

        fixture = TestBed.createComponent(CollectionsUnitsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
