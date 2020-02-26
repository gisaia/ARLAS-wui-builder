import { Component } from '@angular/core';

interface Page {
  link: string;
  name: string;
  icon: string;
  tooltip: string;
  enabled: boolean;
}

@Component({
  selector: 'app-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.scss']
})
export class LeftMenuComponent {

  constructor() { }

  public isLabelDisplayed = true;

  public pages: Page[] = [
    { name: 'Map', link: '/map-config', icon: 'map', tooltip: 'Map configuration', enabled: true },
    { name: 'Timeline', link: '/timeline-config', icon: 'timeline', tooltip: 'Timeline configuration', enabled: true },
    { name: 'Search', link: '/search-config', icon: 'search', tooltip: 'Search configuration', enabled: true },
    { name: 'Analytics', link: 'some-link', icon: 'bar_chart', tooltip: 'Analytics configuration', enabled: false },
    { name: 'Look \'n feel', link: 'some-link', icon: 'send', tooltip: 'Look \'n fell configuration', enabled: false },
  ];
}
