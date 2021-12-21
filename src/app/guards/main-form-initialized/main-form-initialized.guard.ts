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
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { MainFormService } from '@services/main-form/main-form.service';
import { Observable } from 'rxjs';

/**
 * Redirect to root URL if the starting global form is not initialized,
 * in order to open the landing page.
 */
@Injectable({
  providedIn: 'root'
})
export class MainFormInitializedGuard implements CanActivate {

  public constructor(
    private mainFormService: MainFormService,
    private router: Router) { }

  public canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (Object.keys(this.mainFormService.startingConfig.getFg().controls).length > 0) {
      return true;

    } else {
      this.router.navigate([''], { queryParamsHandling: 'preserve' });
      return false;
    }
  }

}
