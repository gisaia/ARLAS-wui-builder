# Change Log

## [v14.0.0-rc.8](https://github.com/gisaia/ARLAS-wui-builder/tree/v14.0.0-rc.8) (2020-10-22)

[Full Changelog](https://github.com/gisaia/ARLAS-wui-builder/compare/v14.0.0-rc.7...v14.0.0-rc.8)

**Fixed bugs:**

- No error message should be displayed by default [\#302](https://github.com/gisaia/ARLAS-wui-builder/issues/302)

## [v14.0.0-rc.7](https://github.com/gisaia/ARLAS-wui-builder/tree/v14.0.0-rc.7) (2020-10-20)

[Full Changelog](https://github.com/gisaia/ARLAS-wui-builder/compare/v14.0.0-rc.6...v14.0.0-rc.7)

## [v14.0.0-rc.6](https://github.com/gisaia/ARLAS-wui-builder/tree/v14.0.0-rc.6) (2020-10-16)

[Full Changelog](https://github.com/gisaia/ARLAS-wui-builder/compare/v14.0.0-rc.5...v14.0.0-rc.6)

**New stuff:**

- Use basic button style in analytics section [\#305](https://github.com/gisaia/ARLAS-wui-builder/issues/305)
- Remove the possibility to open the left menu [\#304](https://github.com/gisaia/ARLAS-wui-builder/issues/304)
- Remove or lighten the background-color of description section [\#303](https://github.com/gisaia/ARLAS-wui-builder/issues/303)
- Define a primary version of Button [\#301](https://github.com/gisaia/ARLAS-wui-builder/issues/301)
- Homogenise color from sliders and slide toggles [\#300](https://github.com/gisaia/ARLAS-wui-builder/issues/300)
- Add some default value [\#285](https://github.com/gisaia/ARLAS-wui-builder/issues/285)
- Add possibility to regroup linked fields in block [\#223](https://github.com/gisaia/ARLAS-wui-builder/issues/223)
- Do not restrict the number of widgets per group [\#184](https://github.com/gisaia/ARLAS-wui-builder/issues/184)

## [v14.0.0-rc.5](https://github.com/gisaia/ARLAS-wui-builder/tree/v14.0.0-rc.5) (2020-10-14)

[Full Changelog](https://github.com/gisaia/ARLAS-wui-builder/compare/v14.0.0-rc.1...v14.0.0-rc.5)

**New stuff:**

- Add configuration object validation with the schema [\#293](https://github.com/gisaia/ARLAS-wui-builder/issues/293)

**Fixed bugs:**

- Deleted layers are kept in visaulisationsSets [\#296](https://github.com/gisaia/ARLAS-wui-builder/issues/296)
- Fix duplicated ids of contributors [\#294](https://github.com/gisaia/ARLAS-wui-builder/issues/294)
- The saved configuration does not appears on the main list. [\#284](https://github.com/gisaia/ARLAS-wui-builder/issues/284)
- Error message in console on the start of the app [\#283](https://github.com/gisaia/ARLAS-wui-builder/issues/283)

## [v14.0.0-rc.1](https://github.com/gisaia/ARLAS-wui-builder/tree/v14.0.0-rc.1) (2020-09-29)

[Full Changelog](https://github.com/gisaia/ARLAS-wui-builder/compare/v0.0.6-beta.1...v14.0.0-rc.1)

**New stuff:**

- Deal with 401/403 errors when we save a config with persistence [\#248](https://github.com/gisaia/ARLAS-wui-builder/issues/248)
- Open modal with login again message after 403 or silent-refresh error [\#247](https://github.com/gisaia/ARLAS-wui-builder/issues/247)
- Enrich header to access a protected ARLAS-server [\#237](https://github.com/gisaia/ARLAS-wui-builder/issues/237)
- Manage Visualisation sets [\#230](https://github.com/gisaia/ARLAS-wui-builder/issues/230)
- Add 'Medium' granularity for cluster and feature-metric layers [\#224](https://github.com/gisaia/ARLAS-wui-builder/issues/224)

**Fixed bugs:**

- Histogram / Timeline configuration : interval value is a string instead of a number [\#276](https://github.com/gisaia/ARLAS-wui-builder/issues/276)
- After saving a new configuration, user cannot update it until the app was reloaded [\#275](https://github.com/gisaia/ARLAS-wui-builder/issues/275)
- App crash in analytics group creation when a widget is defined [\#246](https://github.com/gisaia/ARLAS-wui-builder/issues/246)
- TranslateHttpLoader use hardcoding /assets/i18n and doest not work with custum app base href [\#241](https://github.com/gisaia/ARLAS-wui-builder/issues/241)
- Fix generation of contributor names  [\#174](https://github.com/gisaia/ARLAS-wui-builder/issues/174)

## [v0.0.6-beta.1](https://github.com/gisaia/ARLAS-wui-builder/tree/v0.0.6-beta.1) (2020-08-25)

[Full Changelog](https://github.com/gisaia/ARLAS-wui-builder/compare/v0.0.5...v0.0.6-beta.1)

**New stuff:**

- Add docker env variable to set a default server URL [\#132](https://github.com/gisaia/ARLAS-wui-builder/issues/132)

**Fixed bugs:**

- Store conf id to update with unique key LOCALSTORAGE\_CONFIG\_ID\_KEY in localstorage   [\#240](https://github.com/gisaia/ARLAS-wui-builder/issues/240)
- Bug after Log out then log in [\#239](https://github.com/gisaia/ARLAS-wui-builder/issues/239)
- Persisted configuration doesn't set the visualisation set layers correctly [\#228](https://github.com/gisaia/ARLAS-wui-builder/issues/228)

## [v0.0.5](https://github.com/gisaia/ARLAS-wui-builder/tree/v0.0.5) (2020-07-24)

[Full Changelog](https://github.com/gisaia/ARLAS-wui-builder/compare/v0.0.4...v0.0.5)

**New stuff:**

- Add a route to load a configuration from persistence [\#233](https://github.com/gisaia/ARLAS-wui-builder/issues/233)

**Fixed bugs:**

- Persisted configuration has 'arlasWui' attribute instead of 'arlas-wui' [\#227](https://github.com/gisaia/ARLAS-wui-builder/issues/227)
- Configuration stored in persistence should not contain 'extraConfigs' attribute [\#226](https://github.com/gisaia/ARLAS-wui-builder/issues/226)

## [v0.0.4](https://github.com/gisaia/ARLAS-wui-builder/tree/v0.0.4) (2020-06-29)

[Full Changelog](https://github.com/gisaia/ARLAS-wui-builder/compare/v0.0.3...v0.0.4)

**New stuff:**

- Add layer preview in map config [\#79](https://github.com/gisaia/ARLAS-wui-builder/issues/79)
- Add global map preview [\#215](https://github.com/gisaia/ARLAS-wui-builder/pull/215) ([mbarbet](https://github.com/mbarbet))

**Fixed bugs:**

- Translation are not take into account in sub modules [\#222](https://github.com/gisaia/ARLAS-wui-builder/issues/222)
- Extra config part is missing in config.json [\#218](https://github.com/gisaia/ARLAS-wui-builder/issues/218)
- Map contributor name is missing in configuration [\#217](https://github.com/gisaia/ARLAS-wui-builder/issues/217)

## [v0.0.3](https://github.com/gisaia/ARLAS-wui-builder/tree/v0.0.3) (2020-06-19)

[Full Changelog](https://github.com/gisaia/ARLAS-wui-builder/compare/0.0.2...v0.0.3)

**New stuff:**

- Layers list with arlas-wui legend [\#186](https://github.com/gisaia/ARLAS-wui-builder/issues/186)
- LOAD and SAVE unmanaged fields, keeping original values [\#160](https://github.com/gisaia/ARLAS-wui-builder/issues/160)
- Create interface to import configuration from persistence  [\#151](https://github.com/gisaia/ARLAS-wui-builder/issues/151)
- LOAD and SAVE using persistence [\#138](https://github.com/gisaia/ARLAS-wui-builder/issues/138)
- Create Side module config page [\#109](https://github.com/gisaia/ARLAS-wui-builder/issues/109)
- Add preview for each analytics components [\#108](https://github.com/gisaia/ARLAS-wui-builder/issues/108)
- Created a dialog for setting up each ANALYTICS WIDGET [\#90](https://github.com/gisaia/ARLAS-wui-builder/issues/90)
- Create LOOK'N FEEL config page [\#71](https://github.com/gisaia/ARLAS-wui-builder/issues/71)

**Fixed bugs:**

- After a loading a config with a layer / manual color, elements are repeated in the colors list [\#211](https://github.com/gisaia/ARLAS-wui-builder/issues/211)
- Some issues [\#204](https://github.com/gisaia/ARLAS-wui-builder/issues/204)
- Default values reset doesn't work as expected on Timeline [\#189](https://github.com/gisaia/ARLAS-wui-builder/issues/189)
- Make button toggler choice more intuive [\#187](https://github.com/gisaia/ARLAS-wui-builder/issues/187)
- Edit tab name reload content and reset AB tab display [\#150](https://github.com/gisaia/ARLAS-wui-builder/issues/150)
- Save imported files [\#147](https://github.com/gisaia/ARLAS-wui-builder/issues/147)
- SEARCH: search field should be `text` and autocomplete\_field should be `keyword` [\#146](https://github.com/gisaia/ARLAS-wui-builder/issues/146)
- SEARCH : the steps of autcomplete\_size slider should be of size 1 [\#145](https://github.com/gisaia/ARLAS-wui-builder/issues/145)
- Weight of heatmap / normalized count [\#144](https://github.com/gisaia/ARLAS-wui-builder/issues/144)
- Choosing collection when configuring a map layer [\#143](https://github.com/gisaia/ARLAS-wui-builder/issues/143)
- Timeline config bugs [\#142](https://github.com/gisaia/ARLAS-wui-builder/issues/142)
- Wrong field name given to PROPERTY\_SELECTOR\_SOURCE.manual [\#140](https://github.com/gisaia/ARLAS-wui-builder/issues/140)
- Avoid 2 widgets to have the same name [\#128](https://github.com/gisaia/ARLAS-wui-builder/issues/128)
- After a reset, some errors are still displayed if an export was attempted [\#119](https://github.com/gisaia/ARLAS-wui-builder/issues/119)
- Display  analytics preview : update problem [\#111](https://github.com/gisaia/ARLAS-wui-builder/issues/111)
- Fix of map layer edition [\#87](https://github.com/gisaia/ARLAS-wui-builder/issues/87)
- Some visual improvments [\#86](https://github.com/gisaia/ARLAS-wui-builder/issues/86)

## [0.0.2](https://github.com/gisaia/ARLAS-wui-builder/tree/0.0.2) (2020-04-30)

[Full Changelog](https://github.com/gisaia/ARLAS-wui-builder/compare/v0.0.1...0.0.2)

**New stuff:**

- Use content of formGroup to display preview [\#106](https://github.com/gisaia/ARLAS-wui-builder/issues/106)
- Add a hardcoded preview in analytics group  config [\#100](https://github.com/gisaia/ARLAS-wui-builder/issues/100)
- Remove init of arlas collaborative search service from startupService [\#95](https://github.com/gisaia/ARLAS-wui-builder/issues/95)
- Put all material dependencies into the shared project [\#84](https://github.com/gisaia/ARLAS-wui-builder/issues/84)
- Add LOAD of existing config file [\#104](https://github.com/gisaia/ARLAS-wui-builder/issues/104)
- Plug arlas-persistance [\#78](https://github.com/gisaia/ARLAS-wui-builder/issues/78)
- Create ANALYTICS config page [\#70](https://github.com/gisaia/ARLAS-wui-builder/issues/70)

**Fixed bugs:**

- Define interpolated style in cluster mode  [\#116](https://github.com/gisaia/ARLAS-wui-builder/issues/116)
- After cancelling a new map layer edit, user is back to the global tab but it's not selected [\#107](https://github.com/gisaia/ARLAS-wui-builder/issues/107)
- Bug : checkUrl in landing page fonction not work if a default value is used for url [\#99](https://github.com/gisaia/ARLAS-wui-builder/issues/99)
-  After resetting by clicking the banner, the collection doesn't appear anymore [\#77](https://github.com/gisaia/ARLAS-wui-builder/issues/77)
- In layer edition, normalization can be applied also to float and doubles [\#129](https://github.com/gisaia/ARLAS-wui-builder/issues/129)
- The URL pattern validator does not accept all urls [\#124](https://github.com/gisaia/ARLAS-wui-builder/issues/124)

## [v0.0.1](https://github.com/gisaia/ARLAS-wui-builder/tree/v0.0.1) (2020-04-14)

[Full Changelog](https://github.com/gisaia/ARLAS-wui-builder/compare/0.0.0...v0.0.1)

**New stuff:**

- Create TIMELINE config page [\#6](https://github.com/gisaia/ARLAS-wui-builder/issues/6)
- Create SEARCH config page [\#5](https://github.com/gisaia/ARLAS-wui-builder/issues/5)

## [0.0.0](https://github.com/gisaia/ARLAS-wui-builder/tree/0.0.0) (2020-03-19)

[Full Changelog](https://github.com/gisaia/ARLAS-wui-builder/compare/316eabb2d72ec53f8efccf934d40d8919c3dc537...0.0.0)

**New stuff:**

- Add translation  [\#29](https://github.com/gisaia/ARLAS-wui-builder/issues/29)
- Theme application [\#7](https://github.com/gisaia/ARLAS-wui-builder/issues/7)
- Create MAP config page [\#4](https://github.com/gisaia/ARLAS-wui-builder/issues/4)
- Landing page [\#3](https://github.com/gisaia/ARLAS-wui-builder/issues/3)
- Manage default values  [\#2](https://github.com/gisaia/ARLAS-wui-builder/issues/2)
- Create navigation menu [\#1](https://github.com/gisaia/ARLAS-wui-builder/issues/1)



\* *This Change Log was automatically generated by [github_changelog_generator](https://github.com/skywinder/Github-Changelog-Generator)*