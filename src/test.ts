// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { getTestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { defineGlobalsInjections, mockProvider } from '@ngneat/spectator';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { ColorPickerModule } from 'ngx-color-picker';
import { NGXLogger } from 'ngx-logger';
import { NgxSpinnerModule } from 'ngx-spinner';
import 'zone.js/dist/zone-testing';
import { MatChipsModule } from '@angular/material/chips';

// define modules to be injected in every test
defineGlobalsInjections({
  imports: [
    RouterTestingModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatChipsModule,
    MatTabsModule,
    MatSnackBarModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatRadioModule,
    MatSidenavModule,
    MatTooltipModule,
    MatSelectModule,
    MatStepperModule,
    MatSlideToggleModule,
    MatSliderModule,
    ColorPickerModule,
    NgxSpinnerModule,
    MatAutocompleteModule,
    TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: TranslateFakeLoader } }),
    MatBadgeModule,
    HttpClientModule
  ],
  providers: [
    mockProvider(NGXLogger),
    TranslateService
  ]
});

declare const require: any;

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);
// Then we find all the tests.
const context = require.context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys().map(context);

