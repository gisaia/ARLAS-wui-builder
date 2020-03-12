/*
Licensed to Gisaïa under one or more contributor
license agreements. See the NOTICE.txt file distributed with
this work for additional information regarding copyright
ownership. Gisaïa licenses this file to you under
the Apache License, Version 2.0 (the "License"); you may
not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/
import { Injectable, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';
import { MainFormService } from '@services/main-form/main-form.service';
import { updateValueAndValidity } from '@utils/tools';
import { LayersComponent } from '@map-config/components/layers/layers.component';
import { Contributor, Config, LayerSource } from './models-config';
import { Layer, PaintColor } from './models-map-config';
import { NGXLogger } from 'ngx-logger';
import { FormGroup, FormArray } from '@angular/forms';
import { COLOR_SOURCE, GEOMETRY_TYPE, KeywordColor } from '@map-config/components/edit-layer-features/models';
import * as FileSaver from 'file-saver';
import { MapConfig, Paint } from './models-map-config';
import { ProportionedColor } from '@map-config/components/dialog-palette-selector/model';

const MAIN_FORM_VALIDATE_COMPONENTS = [
  LayersComponent
];

@Injectable({
  providedIn: 'root'
})
export class MainFormImportExportService {

  private exportExpected = false;

  constructor(
    private logger: NGXLogger,
    private mainFormService: MainFormService,
    private componentFactoryResolver: ComponentFactoryResolver
  ) { }

  get isExportExpected() {
    return this.exportExpected;
  }

  public attemptExport(vCref: ViewContainerRef) {

    if (!this.exportExpected) {
      // On first save, instanciate all related views, for them to inject their form in the mainForm.
      // This allows a global validation.
      MAIN_FORM_VALIDATE_COMPONENTS.forEach(
        c => this.componentFactoryResolver.resolveComponentFactory(c).create(vCref.injector));

      this.exportExpected = true;
    }

    // update the validity of the whole form
    this.mainFormService.mainForm.markAllAsTouched();
    updateValueAndValidity(this.mainFormService.mainForm, false, false);

    if (this.mainFormService.mainForm.valid) {
      this.doExport();
    }
  }

  private doExport() {
    const mapConfigGlobal = this.mainFormService.mapConfig.getGlobalFg();
    const mapConfigLayers = this.mainFormService.mapConfig.getLayersFa();

    this.doExportConfig(mapConfigGlobal, mapConfigLayers);
    this.doExportConfigMap(mapConfigLayers);


  }

  private doExportConfig(mapConfigGlobal: FormGroup, mapConfigLayers: FormArray) {
    const config: Config = {
      arlas: {
        web: {
          contributors: []
        }
      }
    };

    const mapContributor: Contributor = {
      type: 'map',
      identifier: 'map_contributor_id',
      geoQueryOp: mapConfigGlobal.value.geographicalOperator,
      geoQueryField: mapConfigGlobal.value.requestGeometries[0].requestGeom,
      layers_sources: []
    };

    const layersSources: Array<LayerSource> = mapConfigLayers.controls.map((layerFg: FormGroup) => {
      const modeValues = layerFg.value.modeFg;
      const colorValues = modeValues.styleStep.colorFg;
      const layerSource: LayerSource = {
        id: layerFg.value.name,
        source: 'feature',
        minzoom: modeValues.visibilityStep.zoomMinCtrl,
        maxzoom: modeValues.visibilityStep.zoomMaxCtrl,
        maxfeatures: modeValues.visibilityStep.featuresMaxCtrl
      };
      switch (modeValues.styleStep.colorSourceCtrl) {
        case COLOR_SOURCE.fix: {
          break;
        }
        case COLOR_SOURCE.provided: {
          layerSource.include_fields = [colorValues.colorProvidedFieldCtrl];
          break;
        }
        case COLOR_SOURCE.generated: {
          layerSource.color_from_field = colorValues.colorGeneratedFieldCtrl;
          break;
        }
        case COLOR_SOURCE.manual: {
          layerSource.include_fields = [colorValues.colorManualFg.colorManualFieldCtrl];
          break;
        }
        case COLOR_SOURCE.interpolated: {
          const interpolatedValues = colorValues.colorInterpolatedFg;
          if (interpolatedValues.colorInterpolatedNormalizeCtrl) {
            layerSource.normalization_fields = [
              {
                on: interpolatedValues.colorInterpolatedFieldCtrl,
                per: interpolatedValues.colorInterpolatedNormalizeLocalFieldCtrl,
                scope: interpolatedValues.colorInterpolatedScopeCtrl
              }
            ];
          } else {
            layerSource.include_fields = [interpolatedValues.colorInterpolatedFieldCtrl];
          }
          break;
        }
      }
      return layerSource;
    });

    mapContributor.layers_sources = layersSources;
    config.arlas.web.contributors.push(mapContributor);

    this.saveJson(config, 'config.json');
  }

  doExportConfigMap(mapConfigLayers: FormArray) {
    const layers: Array<Layer> = mapConfigLayers.controls.map((layerFg: FormGroup) => {
      const modeValues = layerFg.value.modeFg;
      const colorValues = modeValues.styleStep.colorFg;

      const paint: Paint = {};
      const colorOpacity = modeValues.styleStep.opacityCtrl;

      const color: Array<string | Array<string> | number> | PaintColor | string = (() => {
        switch (modeValues.styleStep.colorSourceCtrl) {
          case COLOR_SOURCE.fix:
            return colorValues.colorFixCtrl;
          case COLOR_SOURCE.provided:
            return this.getArray(colorValues.colorProvidedFieldCtrl);
          case COLOR_SOURCE.generated:
            return this.getArray(colorValues.colorGeneratedFieldCtrl + '_color');
          case COLOR_SOURCE.manual:
            return [
              'match',
              this.getArray(colorValues.colorManualFg.colorManualFieldCtrl + '_color')
            ].concat(
              (colorValues.colorManualFg.colorManualValuesCtrl as Array<KeywordColor>)
                .flatMap(kc => kc.keyword !== 'OTHER' ? [kc.keyword, kc.color] : [kc.color])
            );
          case COLOR_SOURCE.interpolated: {
            const interpolatedValues = colorValues.colorInterpolatedFg;
            let interpolatedColor: Array<string | Array<string | number>>;
            if (interpolatedValues.colorInterpolatedNormalizeCtrl) {
              interpolatedColor = [
                'interpolate',
                ['linear'],
                this.getArray(interpolatedValues.colorInterpolatedFieldCtrl
                  .concat(':').concat(interpolatedValues.colorInterpolatedScopeCtrl)
                  .concat(interpolatedValues.colorInterpolatedNormalizeByKeyCtrl ?
                    ':' + interpolatedValues.colorInterpolatedNormalizeLocalFieldCtrl : ''))
              ];
            } else {
              interpolatedColor = [
                'interpolate',
                ['linear'],
                this.getArray(interpolatedValues.colorInterpolatedFieldCtrl)
              ];
            }
            return interpolatedColor.concat((interpolatedValues.colorInterpolatedPaletteCtrl as Array<ProportionedColor>)
              .flatMap(pc => [pc.proportion, pc.color]));
          }
        }
      })();

      switch (modeValues.geometryStep.geometryTypeCtrl) {
        case GEOMETRY_TYPE.fill: {
          paint.fillOpacity = colorOpacity;
          paint.fillColor = color;
          break;
        }
        case GEOMETRY_TYPE.line: {
          paint.lineOpacity = colorOpacity;
          paint.lineColor = color;
          break;
        }
        case GEOMETRY_TYPE.circle: {
          paint.circleOpacity = colorOpacity;
          paint.circleColor = color;
          break;
        }
      }


      return {
        id: layerFg.value.name,
        type: modeValues.geometryStep.geometryTypeCtrl,
        source: layerFg.value.mode,
        minzoom: modeValues.visibilityStep.zoomMinCtrl,
        maxzoom: modeValues.visibilityStep.zoomMaxCtrl,
        layout: {
          visibility: modeValues.visibilityStep.visibleCtrl ? 'visible' : 'none'
        },
        paint,
        filter: [
          [
            '==',
            'geometry_path',
            modeValues.geometryStep.geometryCtrl,
          ],
          [
            '==',
            'feature_type',
            'hit'
          ]
        ]
      };
    });

    const mapConfig: MapConfig = {
      layers
    };

    this.saveJson(mapConfig, 'config.map.json', true);
  }

  private saveJson(json: any, filename: string, keysToSnakeCase = false) {
    const blob = new Blob([JSON.stringify(json, (key, value) => {
      if (keysToSnakeCase && value && typeof value === 'object' && !Array.isArray(value)) {
        // convert keys to snake-keys. In fact we cannot declare a property with a snake-cased name,
        // (so in models interfaces properties are are camel case)
        const replacement = {};
        for (const k in value) {
          if (Object.hasOwnProperty.call(value, k)) {
            replacement[
              k.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
                .map(x => x.toLowerCase())
                .join('-')
            ] = value[k];
          }
        }
        return replacement;
      }
      return value;
    }, 2)], { type: 'application/json;charset=utf-8' });
    FileSaver.saveAs(blob, filename);
  }

  private getArray(value: string) {
    return [
      'get',
      // flatten the fields
      value.replace(/\./g, '_')
    ];
  }

}
