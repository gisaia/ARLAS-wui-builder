/*
 * Licensed to Gisaïa under one or more contributor
 * license agreements. See the NOTICE.txt file distributed with
 * this work for additional information regarding copyright
 * ownership. Gisaïa licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { MainFormService } from '@services/main-form/main-form.service';
import { CollectionReferenceDescription, CollectionReferenceDescriptionProperty } from 'arlas-api';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { CollectionService } from '../../services/collection-service/collection.service';

interface FlatDescription {
  expandable: boolean;
  name: string;
  level: number;
}

interface CollectionReferencePropertyExtended {
  name: string;
  type?: CollectionReferenceDescriptionProperty.TypeEnum;
  format?: string;
  properties?: CollectionReferencePropertyExtended[];
  taggable?: boolean;
  indexed?: boolean;
}

const typeEnum = CollectionReferenceDescriptionProperty.TypeEnum;

@Component({
  selector: 'arlas-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss']
})
export class CollectionComponent implements OnInit, OnDestroy {

  public TypeEnum = typeEnum;

  public collectionsDef: {
    collection: CollectionReferenceDescription;
    fields: any;
    treeControl: FlatTreeControl<FlatDescription>;
  }[] = [];

  public hasChild = (_: number, node: FlatDescription) => node.expandable;

  private transformer = (node: CollectionReferencePropertyExtended, level: number) => ({
    expandable: !!node.type && node.type === typeEnum.OBJECT,
    name: node.name,
    type: this.typeToText(node.type),
    indexed: node.indexed,
    level
  });

  public treeFlattener = new MatTreeFlattener(this.transformer, node => node.level, node => node.expandable, node => node.properties);

  private readonly destroyRef = inject(DestroyRef);
  private readonly arlasCss = inject(ArlasCollaborativesearchService);
  private readonly mainService = inject(MainFormService);
  private readonly collectionService = inject(CollectionService);

  public ngOnInit() {
    const collections = this.mainService.getAllCollections(this.collectionService);

    collections.forEach((c, i) => {
      this.arlasCss.describe(c)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(collectionRef => {
          const treeControl = new FlatTreeControl<FlatDescription>(node => node.level, node => node.expandable);
          const dataSource = new MatTreeFlatDataSource(treeControl, this.treeFlattener);
          dataSource.data = this.transform(collectionRef.properties);
          this.collectionsDef.push({ collection: collectionRef, fields: dataSource, treeControl });
        });
    });
  }

  public transform(objects: {
    [key: string]: CollectionReferenceDescriptionProperty;
  }): CollectionReferencePropertyExtended[] {
    return Object.keys(objects).sort((a, b) => a.localeCompare(b)).map(key => {
      const object: any = objects[key];

      if (!!object.properties) {
        object.properties = this.transform(objects[key].properties);
      }
      object.name = key;
      return object;
    });
  }

  public typeToText(type: CollectionReferenceDescriptionProperty.TypeEnum): string {
    let newType;
    switch (type) {
      case typeEnum.DOUBLE:
      case typeEnum.FLOAT:
      case typeEnum.INTEGER:
      case typeEnum.LONG:
        newType = 'NUMBER';
        break;
      case typeEnum.GEOSHAPE:
        newType = 'GEOMETRY (LINES & POLYGONS)';
        break;
      case typeEnum.GEOPOINT:
        newType = 'GEOMETRY (POINTS)';
        break;
      default:
        newType = type;
    }
    return newType;
  }

  public ngOnDestroy() {
    this.collectionsDef = [];
  }
}
