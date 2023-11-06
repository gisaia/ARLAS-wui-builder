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

import { ShortcutsService } from '@analytics-config/services/shortcuts/shortcuts.service';
import { CdkDragDrop, CdkDragEnter, CdkDragMove, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'arlas-shortcuts',
  templateUrl: './shortcuts.component.html',
  styleUrls: ['./shortcuts.component.scss']
})
export class ShortcutsComponent {
  public dropListReceiverElement?: HTMLElement;
  public dragDropInfo?: {
    dragIndex: number;
    dropIndex: number;
  };
  @ViewChild('dropShortcutsListContainer') public dropListContainer?: ElementRef;


  public constructor(public shortcutService: ShortcutsService) {

  }

  public dragEntered(event: CdkDragEnter<number>) {
    const drag = event.item;
    const dropList = event.container;
    const dragIndex = drag.data;
    const dropIndex = dropList.data;

    this.dragDropInfo = { dragIndex, dropIndex };

    const phContainer = dropList.element.nativeElement;
    const phElement = phContainer.querySelector('.cdk-drag-placeholder');

    if (phElement) {
      phContainer.removeChild(phElement);
      if (this.dragDropInfo.dragIndex > this.dragDropInfo.dropIndex) {
        phContainer.parentElement?.insertBefore(phElement, phContainer);
      } else if (this.dragDropInfo.dragIndex < this.dragDropInfo.dropIndex) {
        phContainer.parentElement?.insertBefore(phElement, phContainer.nextSibling);

      }

    }
  }

  public dragMoved(event: CdkDragMove<number>) {
    if (!this.dropListContainer || !this.dragDropInfo) {
      return;
    }

    const placeholderElement =
      this.dropListContainer.nativeElement.querySelector(
        '.cdk-drag-placeholder'
      );

    const receiverElement =
      this.dragDropInfo.dragIndex > this.dragDropInfo.dropIndex
        ? placeholderElement?.nextElementSibling
        : placeholderElement?.previousElementSibling;

    if (!receiverElement) {
      return;
    }

    this.dropListReceiverElement = receiverElement;
  }

  public dragDropped(event: CdkDragDrop<number>) {
    if (!!this.dragDropInfo && this.dragDropInfo.dragIndex !== undefined && this.dragDropInfo.dropIndex !== undefined) {
      const shortcuts = this.shortcutService.shortcuts;
      moveItemInArray(shortcuts, this.dragDropInfo.dragIndex, this.dragDropInfo.dropIndex);
      this.shortcutService.reorderFromList();
    }
    if (!this.dropListReceiverElement) {
      return;
    }

    this.dropListReceiverElement = undefined;
    this.dragDropInfo = undefined;
  }

}
