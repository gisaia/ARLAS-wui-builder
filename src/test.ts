// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/dist/zone-testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { defineGlobalsInjections, mockProvider } from '@ngneat/spectator';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule, MatListModule, MatSidenavModule, MatTooltipModule, MatSlideToggleModule, MatSliderModule } from '@angular/material';
import { MatStepperModule } from '@angular/material/stepper';
import { ColorPickerModule } from 'ngx-color-picker';
import { NGXLogger } from 'ngx-logger';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

// define modules to be injected in every test
defineGlobalsInjections({
  imports: [
    RouterTestingModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
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
    MatSidenavModule,
    MatTooltipModule,
    MatStepperModule,
    MatSlideToggleModule,
    MatSliderModule,
    ColorPickerModule,
    NgxSpinnerModule,
    MatAutocompleteModule
  ],
  providers: [
    mockProvider(NGXLogger)
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

