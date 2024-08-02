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
import { Directive, ElementRef, Input, AfterContentInit, OnDestroy } from '@angular/core';

/**
 * Autofocus on a field once it is inserted into the DOM (it can be from a "*ngIf")
 */
@Directive({
  selector: '[arlasAutoFocus]'
})
export class AutoFocusDirective implements AfterContentInit, OnDestroy {

  @Input() public arlasAutoFocus: boolean;
  public constructor(private el: ElementRef) {
  }

  public ngAfterContentInit() {
    let elem = this.el;
    setTimeout(() => {
      elem.nativeElement.focus();
      elem = null;
    }, 500);

  }

  public ngOnDestroy() {
    this.arlasAutoFocus = null;
  }
}
