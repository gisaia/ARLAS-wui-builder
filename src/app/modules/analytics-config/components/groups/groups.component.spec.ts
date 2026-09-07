import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { mockArlasStartupService } from '@app/test/arlas-startup.service.mock';
import { mockMainFormService } from '@app/test/main-form.service.mock';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { MainFormService } from '@services/main-form/main-form.service';
import { AnalyticsService, ArlasStartupService, ArlasTaskService, GET_OPTIONS } from 'arlas-wui-toolkit';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GroupsComponent } from './groups.component';

describe('GroupsComponent', () => {
    let component: GroupsComponent;
    let fixture: ComponentFixture<GroupsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                GroupsComponent,
                LoggerModule.forRoot(null),
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
                }),
                RouterModule.forRoot([])
            ],
            providers: [
                ArlasTaskService,
                {
                    provide: GET_OPTIONS,
                    useValue: () => { }
                },
                {
                    provide: ArlasStartupService,
                    useValue: mockArlasStartupService
                },
                {
                    provide: MainFormService,
                    useValue: mockMainFormService
                },
                {
                    provide: AnalyticsService,
                    useValue: {
                        initializeGroups: vi.fn(),
                        selectTab: vi.fn()
                    }
                }
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(GroupsComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('contentFg', new FormGroup([]));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
