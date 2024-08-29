import { Component, Input, OnInit } from '@angular/core';
import { FormArray } from '@angular/forms';
import { SearchCollectionFormGroup, SearchGlobalFormBuilderService }
  from '@search-config/services/search-global-form-builder/search-global-form-builder.service';

@Component({
  selector: 'arlas-search-collection',
  templateUrl: './search-collection.component.html',
  styleUrls: ['./search-collection.component.scss']
})
export class SearchCollectionComponent implements OnInit {

  @Input() public searchConfigurations: FormArray<SearchCollectionFormGroup>;

  public constructor(private searchGlobalFormBuilderService: SearchGlobalFormBuilderService) { }

  public ngOnInit(): void {

  }

  public addSearchConfiguration(): void {
    const searchConfiguration = this.searchGlobalFormBuilderService.buildSearchMainCollection();
    this.searchConfigurations.push(searchConfiguration);
  }

  public deleteSearchConfiguration(i: number): void {
    this.searchConfigurations.removeAt(i);
  }
}
