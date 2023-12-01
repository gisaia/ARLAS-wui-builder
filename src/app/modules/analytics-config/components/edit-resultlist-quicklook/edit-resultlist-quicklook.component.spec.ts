import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditResultlistQuicklookComponent } from './edit-resultlist-quicklook.component';
import { ResultlistFormBuilderService } from '@analytics-config/services/resultlist-form-builder/resultlist-form-builder.service';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { HttpClientModule } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';

describe('EditResultlistQuicklookComponent', () => {
  let spectator: Spectator<EditResultlistQuicklookComponent>;

  const createComponent = createComponentFactory({
    component: EditResultlistQuicklookComponent,
    providers: [
      mockProvider(ResultlistFormBuilderService)
    ]
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
