# Change Log

## [v27.0.6](https://github.com/gisaia/ARLAS-wui-builder/tree/v27.0.6) (2025-08-21)

**Fixed bugs:**

- \[GLOBE\] Globe button doesn't appear in preview, instead there is the 3D button [\#1111](https://github.com/gisaia/ARLAS-wui-builder/issues/1111) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]
- Display error in analytics tab icons [\#1082](https://github.com/gisaia/ARLAS-wui-builder/issues/1082) [[ANALYTICS](https://github.com/gisaia/ARLAS-wui-builder/labels/ANALYTICS)]
- \[PREVIEW\] Saving a preview does not work and prompt an non authorization error [\#1113](https://github.com/gisaia/ARLAS-wui-builder/issues/1113) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]
- \[PREVIEW\] Basemap is never displayed [\#1112](https://github.com/gisaia/ARLAS-wui-builder/issues/1112) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]
- \[PRIORITY\] The javascript transformation in the resultlist doesn't wok anymore [\#1109](https://github.com/gisaia/ARLAS-wui-builder/issues/1109)
- Checking visualisation sets in the builder are buggy [\#1107](https://github.com/gisaia/ARLAS-wui-builder/issues/1107) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]
- Superposition of text in Histogram configuration [\#1106](https://github.com/gisaia/ARLAS-wui-builder/issues/1106)

## [v27.0.5](https://github.com/gisaia/ARLAS-wui-builder/tree/v27.0.5) (2025-08-01)

**New stuff:**

- \[MAP CONFIGURATION\] Allow configuring the The geometry used to check features on the screen extent [\#1096](https://github.com/gisaia/ARLAS-wui-builder/issues/1096)
- all collections used in the dashboard should be displayed [\#1062](https://github.com/gisaia/ARLAS-wui-builder/issues/1062)
- Allow for dashboard main collection change [\#1049](https://github.com/gisaia/ARLAS-wui-builder/issues/1049)

**Fixed bugs:**

- Use the dashboard name in config.json on save  [\#934](https://github.com/gisaia/ARLAS-wui-builder/issues/934)

**Miscellaneous:**

- Remove the collection module as it is replaced by the Collection's view in ARLAS-hub [\#1100](https://github.com/gisaia/ARLAS-wui-builder/issues/1100)

## [v27.0.4](https://github.com/gisaia/ARLAS-wui-builder/tree/v27.0.4) (2025-06-19)

**New stuff:**

- Add toggle to enable globe mode [\#1087](https://github.com/gisaia/ARLAS-wui-builder/issues/1087) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]

**Fixed bugs:**

- Loading a dashboard with the builder with histogram changes `interval-1` into `interval-1hour` [\#1090](https://github.com/gisaia/ARLAS-wui-builder/issues/1090)
- Handle textare size in forms [\#1085](https://github.com/gisaia/ARLAS-wui-builder/issues/1085)

## [v27.0.3](https://github.com/gisaia/ARLAS-wui-builder/tree/v27.0.3) (2025-05-23)

**Fixed bugs:**

- "Save preview" is not working [\#1077](https://github.com/gisaia/ARLAS-wui-builder/issues/1077) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]
- Zoom in Map Preview not working [\#1076](https://github.com/gisaia/ARLAS-wui-builder/issues/1076) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]
- Details configuration in result list is empty for existing configuration [\#1075](https://github.com/gisaia/ARLAS-wui-builder/issues/1075)

## [v27.0.2](https://github.com/gisaia/ARLAS-wui-builder/tree/v27.0.2) (2025-04-28)

**Fixed bugs:**

- Error when creating a heatmap layer [\#891](https://github.com/gisaia/ARLAS-wui-builder/issues/891)
- \[Metrics Table\] cardinality metrics should propose keywords fields instead of numerical fields [\#1070](https://github.com/gisaia/ARLAS-wui-builder/issues/1070)
- The left sidebar disappears on esc-key click [\#1068](https://github.com/gisaia/ARLAS-wui-builder/issues/1068)
- Improve widget ui [\#1065](https://github.com/gisaia/ARLAS-wui-builder/issues/1065) [[ANALYTICS](https://github.com/gisaia/ARLAS-wui-builder/labels/ANALYTICS)]
- When you are in the color palette edition, it opens a black bar on the right of the app [\#1064](https://github.com/gisaia/ARLAS-wui-builder/issues/1064)
- Creating new widgets doesn't work [\#1063](https://github.com/gisaia/ARLAS-wui-builder/issues/1063)

**Miscellaneous:**

- Update dependencies information in About section [\#1069](https://github.com/gisaia/ARLAS-wui-builder/issues/1069)
- Missing default cell coloring strategy in datatables [\#1011](https://github.com/gisaia/ARLAS-wui-builder/issues/1011)

## [v27.0.1](https://github.com/gisaia/ARLAS-wui-builder/tree/v27.0.1) (2025-03-20)

**Fixed bugs:**

- Updating a widget should remove the collaboration of the former one [\#1004](https://github.com/gisaia/ARLAS-wui-builder/issues/1004)
- openid: Buttons to create/import dashboard are not displayed when using keycloak [\#1048](https://github.com/gisaia/ARLAS-wui-builder/issues/1048)
- openid: looping calls to arlas-persistence when using keycloak [\#1047](https://github.com/gisaia/ARLAS-wui-builder/issues/1047)

**Miscellaneous:**

- Run the application on port 8080 instead of 80 [\#1045](https://github.com/gisaia/ARLAS-wui-builder/issues/1045)

## [v27.0.0](https://github.com/gisaia/ARLAS-wui-builder/tree/v27.0.0) (2025-02-11)

**New stuff:**

- The sliders in the Visibility tab of a layer are not aligned [\#789](https://github.com/gisaia/ARLAS-wui-builder/issues/789)
- Easier heat map creation [\#725](https://github.com/gisaia/ARLAS-wui-builder/issues/725)
- Replace ARLAS\_ENABLE\_H3 var by ARLAS\_ENABLE\_ADVANCED\_FEATURES [\#1031](https://github.com/gisaia/ARLAS-wui-builder/issues/1031)
- Allow applying an geohash/geotile aggregation on a geoshape field [\#949](https://github.com/gisaia/ARLAS-wui-builder/issues/949)

**Fixed bugs:**

- Colour picker is not entirely visible when choosing colours in the powerbar configuration [\#869](https://github.com/gisaia/ARLAS-wui-builder/issues/869)
- add a new data table or analysis are broken [\#1037](https://github.com/gisaia/ARLAS-wui-builder/issues/1037)
- Cut explenation of result usage within the datatable 'calculation' section of a field [\#993](https://github.com/gisaia/ARLAS-wui-builder/issues/993)

**Miscellaneous:**

- Add send message on chat when release [\#1030](https://github.com/gisaia/ARLAS-wui-builder/issues/1030)
- Move palettes actions [\#1028](https://github.com/gisaia/ARLAS-wui-builder/issues/1028)

## [v26.1.2](https://github.com/gisaia/ARLAS-wui-builder/tree/v26.1.2) (2025-01-06)

## [v26.1.1](https://github.com/gisaia/ARLAS-wui-builder/tree/v26.1.1) (2025-01-06)

## [v26.1.0](https://github.com/gisaia/ARLAS-wui-builder/tree/v26.1.0) (2024-12-02)

**Fixed bugs:**

- Impossible to get collections in builder without IAM [\#1012](https://github.com/gisaia/ARLAS-wui-builder/issues/1012)

## [v26.0.5](https://github.com/gisaia/ARLAS-wui-builder/tree/v26.0.5) (2024-11-13)

**New stuff:**

- Enhance proposed collections list [\#1006](https://github.com/gisaia/ARLAS-wui-builder/issues/1006)

**Fixed bugs:**

- Impossible to manage powerbars colors [\#996](https://github.com/gisaia/ARLAS-wui-builder/issues/996) [[ANALYTICS](https://github.com/gisaia/ARLAS-wui-builder/labels/ANALYTICS)]
- Special Caracter no longer works in datatable details 'calculation' field [\#994](https://github.com/gisaia/ARLAS-wui-builder/issues/994)
- Some dashboards don't laod due to 'hidden-props'  [\#991](https://github.com/gisaia/ARLAS-wui-builder/issues/991)
- Redundant calls to server to get the collections list [\#1005](https://github.com/gisaia/ARLAS-wui-builder/issues/1005)

## [v26.0.4](https://github.com/gisaia/ARLAS-wui-builder/tree/v26.0.4) (2024-09-16)

## [v26.0.1](https://github.com/gisaia/ARLAS-wui-builder/tree/v26.0.1) (2024-09-11)

## [v26.0.0](https://github.com/gisaia/ARLAS-wui-builder/tree/v26.0.0) (2024-09-11)

**New stuff:**

- Add a configuration to map in builder [\#958](https://github.com/gisaia/ARLAS-wui-builder/issues/958)
- Add a title for detail section of the resultlist [\#957](https://github.com/gisaia/ARLAS-wui-builder/issues/957)
- Init configuration of metrics table [\#953](https://github.com/gisaia/ARLAS-wui-builder/issues/953)
- Use 'symbol' instead of 'label' in Geometry\_Type to enhance code readabiluty [\#923](https://github.com/gisaia/ARLAS-wui-builder/issues/923)
- Add more precision to the existing description of initial zoom selection [\#918](https://github.com/gisaia/ARLAS-wui-builder/issues/918)
- Include hex-aggregation and activate it according to deployment [\#960](https://github.com/gisaia/ARLAS-wui-builder/issues/960)
- \[builder\] Add an input next to sliders to better precise the values [\#763](https://github.com/gisaia/ARLAS-wui-builder/issues/763)
- \[collection\] replace collection name by the display\_name of the collection [\#719](https://github.com/gisaia/ARLAS-wui-builder/issues/719)
- Support H3 cells aggregation [\#637](https://github.com/gisaia/ARLAS-wui-builder/issues/637)

**Fixed bugs:**

- ARLAS Builder maps : Strange button around legend in layer preview tab [\#971](https://github.com/gisaia/ARLAS-wui-builder/issues/971)
- Import config.json file with existing preview ID could crash all the hub app [\#967](https://github.com/gisaia/ARLAS-wui-builder/issues/967)
- Update of metric not working [\#914](https://github.com/gisaia/ARLAS-wui-builder/issues/914)

## [v25.1.0](https://github.com/gisaia/ARLAS-wui-builder/tree/v25.1.0) (2024-07-18)

**Fixed bugs:**

- BUILDER: Default visibility level for a layer is 1 to 23. It should be 0 to 23. [\#951](https://github.com/gisaia/ARLAS-wui-builder/issues/951)

**Miscellaneous:**

- Set labels and units for X and Y axis of a histogram [\#938](https://github.com/gisaia/ARLAS-wui-builder/issues/938) [[WIDGET](https://github.com/gisaia/ARLAS-wui-builder/labels/WIDGET)]

## [v25.0.0](https://github.com/gisaia/ARLAS-wui-builder/tree/v25.0.0) (2024-05-15)

**New stuff:**

- Handle metrics in heatmap representation [\#667](https://github.com/gisaia/ARLAS-wui-builder/issues/667) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]

**Fixed bugs:**

- Applying timeline filter \[use\_timeline\_filter\] with IAM throws an error because org is missing [\#933](https://github.com/gisaia/ARLAS-wui-builder/issues/933)
- Saving the preview in Postgres database triggers a 500 error [\#931](https://github.com/gisaia/ARLAS-wui-builder/issues/931)
- Saving imported dahsboard fails [\#930](https://github.com/gisaia/ARLAS-wui-builder/issues/930)
- ARLAS Builder: Save preview does not work [\#929](https://github.com/gisaia/ARLAS-wui-builder/issues/929)
- ARLAS Builder: building a heatmap deselect the geometry [\#927](https://github.com/gisaia/ARLAS-wui-builder/issues/927)
- Le choix du placement d'un layer "label" n'affiche pas l'option "point" [\#902](https://github.com/gisaia/ARLAS-wui-builder/issues/902)

**Miscellaneous:**

- Store the preview id in the config.json [\#916](https://github.com/gisaia/ARLAS-wui-builder/issues/916)

## [v24.3.0](https://github.com/gisaia/ARLAS-wui-builder/tree/v24.3.0) (2023-12-20)

## [v24.2.0](https://github.com/gisaia/ARLAS-wui-builder/tree/v24.2.0) (2023-11-27)

## [v24.1.0](https://github.com/gisaia/ARLAS-wui-builder/tree/v24.1.0) (2023-11-27)

## [v24.0.1](https://github.com/gisaia/ARLAS-wui-builder/tree/v24.0.1) (2023-05-23)

## [v24.0.0](https://github.com/gisaia/ARLAS-wui-builder/tree/v24.0.0) (2023-05-16)

## [v23.2.1](https://github.com/gisaia/ARLAS-wui-builder/tree/v23.2.1) (2023-03-24)

**Fixed bugs:**

- Switch to network analytics mode, log out the user. [\#871](https://github.com/gisaia/ARLAS-wui-builder/issues/871)

## [v23.1.1](https://github.com/gisaia/ARLAS-wui-builder/tree/v23.1.1) (2023-03-07)

**Fixed bugs:**

- \[Custom Config\] invalid form on save or download in Arlas 23 [\#867](https://github.com/gisaia/ARLAS-wui-builder/issues/867)

## [v23.2.0](https://github.com/gisaia/ARLAS-wui-builder/tree/v23.2.0) (2023-02-17)

## [v23.2.0-alpha.2](https://github.com/gisaia/ARLAS-wui-builder/tree/v23.2.0-alpha.2) (2023-02-09)

**New stuff:**

- i18n: extract markers with enums in them [\#826](https://github.com/gisaia/ARLAS-wui-builder/issues/826)

**Fixed bugs:**

- Forbid Text field in data table column [\#856](https://github.com/gisaia/ARLAS-wui-builder/issues/856)
- Switching "Global" map tabs while editing a layer, doesn't go back to the current tab if we cancel the switch [\#786](https://github.com/gisaia/ARLAS-wui-builder/issues/786)

## [v23.1.0](https://github.com/gisaia/ARLAS-wui-builder/tree/v23.1.0) (2022-11-29)

**Fixed bugs:**

- In previews, the basemap icon is outside of the preview map [\#818](https://github.com/gisaia/ARLAS-wui-builder/issues/818)

## [v23.0.5](https://github.com/gisaia/ARLAS-wui-builder/tree/v23.0.5) (2022-11-22)

## [v23.0.4](https://github.com/gisaia/ARLAS-wui-builder/tree/v23.0.4) (2022-11-21)

**Fixed bugs:**

- The normalise option of the interpolated settings is not evenly spaced bottom and top-wise [\#837](https://github.com/gisaia/ARLAS-wui-builder/issues/837)
- Filter on boolean for Network Analytics layer not possible [\#823](https://github.com/gisaia/ARLAS-wui-builder/issues/823)
- Basemap icon in previews is not centered [\#819](https://github.com/gisaia/ARLAS-wui-builder/issues/819)
- In this configuration, the map style of the layer PM10 is said not to exist [\#841](https://github.com/gisaia/ARLAS-wui-builder/issues/841)
- When resetting the midpoints of the palette the icons in the circle move and are not centered [\#808](https://github.com/gisaia/ARLAS-wui-builder/issues/808)
- The initialisation of the opacity settings of Network Analytics with interpolated Hits count is at 0 for both minimum and maximum [\#797](https://github.com/gisaia/ARLAS-wui-builder/issues/797)
- When creating 2 widgets with the same information displayed, deleting one deletes the other [\#794](https://github.com/gisaia/ARLAS-wui-builder/issues/794) [[ANALYTICS](https://github.com/gisaia/ARLAS-wui-builder/labels/ANALYTICS)]
- The animation when changing the selected range of an histogram is bigger than its height [\#792](https://github.com/gisaia/ARLAS-wui-builder/issues/792) [[ANALYTICS](https://github.com/gisaia/ARLAS-wui-builder/labels/ANALYTICS)]
- The date format can be different in the Timeline and the Detailed Timeline [\#791](https://github.com/gisaia/ARLAS-wui-builder/issues/791)
- Filter on keyword or boolean not working/possible [\#784](https://github.com/gisaia/ARLAS-wui-builder/issues/784)

## [v23.0.3](https://github.com/gisaia/ARLAS-wui-builder/tree/v23.0.3) (2022-09-27)

**New stuff:**

- Display labels along the line [\#780](https://github.com/gisaia/ARLAS-wui-builder/issues/780) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]

**Fixed bugs:**

- The name of donuts appear to their side when building the analytics [\#795](https://github.com/gisaia/ARLAS-wui-builder/issues/795) [[ANALYTICS](https://github.com/gisaia/ARLAS-wui-builder/labels/ANALYTICS)]
- Changing a max value in label size interpolation does not work [\#783](https://github.com/gisaia/ARLAS-wui-builder/issues/783)

## [v23.0.2](https://github.com/gisaia/ARLAS-wui-builder/tree/v23.0.2) (2022-09-09)

**New stuff:**

- Add the possibility to change widgets order inside a group [\#459](https://github.com/gisaia/ARLAS-wui-builder/issues/459) [[ANALYTICS](https://github.com/gisaia/ARLAS-wui-builder/labels/ANALYTICS)]

**Fixed bugs:**

- Impossible to save a configuration that has been downloaded [\#811](https://github.com/gisaia/ARLAS-wui-builder/issues/811)

## [v23.0.1](https://github.com/gisaia/ARLAS-wui-builder/tree/v23.0.1) (2022-09-02)

**Fixed bugs:**

- The builder of a metric has a useless scrollbar that has a range of a few pixels [\#799](https://github.com/gisaia/ARLAS-wui-builder/issues/799)
- Cluster layer : The Order field is mandatory but not listed as required [\#788](https://github.com/gisaia/ARLAS-wui-builder/issues/788)
- The label of raw geometries dropdown list is empty as well as the description on the side [\#787](https://github.com/gisaia/ARLAS-wui-builder/issues/787)
- Autocompletion for interpolation field is not triggered after clearing a previous value [\#785](https://github.com/gisaia/ARLAS-wui-builder/issues/785)

## [v22.0.6](https://github.com/gisaia/ARLAS-wui-builder/tree/v22.0.6) (2022-07-18)

**New stuff:**

- Handle geographical fields and operations for each collection  [\#729](https://github.com/gisaia/ARLAS-wui-builder/issues/729)

## [v22.0.5](https://github.com/gisaia/ARLAS-wui-builder/tree/v22.0.5) (2022-07-11)

## [v23.0.0](https://github.com/gisaia/ARLAS-wui-builder/tree/v23.0.0) (2022-07-11)

## [v22.0.4](https://github.com/gisaia/ARLAS-wui-builder/tree/v22.0.4) (2022-07-08)

## [v22.0.3](https://github.com/gisaia/ARLAS-wui-builder/tree/v22.0.3) (2022-07-08)

## [v22.0.2](https://github.com/gisaia/ARLAS-wui-builder/tree/v22.0.2) (2022-07-07)

## [v22.0.1](https://github.com/gisaia/ARLAS-wui-builder/tree/v22.0.1) (2022-07-06)

**New stuff:**

- replace the minimum/maximum values by start/end values [\#762](https://github.com/gisaia/ARLAS-wui-builder/issues/762)
- Limitation on the size of circles [\#760](https://github.com/gisaia/ARLAS-wui-builder/issues/760)
- Add label visualisation for a variable : can not lookup for variable names [\#751](https://github.com/gisaia/ARLAS-wui-builder/issues/751)
- Enhance the histogram/timeline buckets configuration [\#749](https://github.com/gisaia/ARLAS-wui-builder/issues/749)
- Reduce the number of calls to \_count endpoint by layers forms [\#744](https://github.com/gisaia/ARLAS-wui-builder/issues/744)

**Fixed bugs:**

- Filter infinity values in layers with styling based on metrics [\#752](https://github.com/gisaia/ARLAS-wui-builder/issues/752)
- Preview creation issues [\#750](https://github.com/gisaia/ARLAS-wui-builder/issues/750)
- Save preview for hub doesn't work [\#743](https://github.com/gisaia/ARLAS-wui-builder/issues/743)
- Metric widgets that have same metrics but different filters have values duplicated [\#742](https://github.com/gisaia/ARLAS-wui-builder/issues/742)

## [v22.0.0](https://github.com/gisaia/ARLAS-wui-builder/tree/v22.0.0) (2022-05-25)

**Fixed bugs:**

- Drag and drop of groups doesn't work properly [\#721](https://github.com/gisaia/ARLAS-wui-builder/issues/721)

**Miscellaneous:**

- Generate a map image using the preview [\#639](https://github.com/gisaia/ARLAS-wui-builder/issues/639) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]

## [v21.0.0](https://github.com/gisaia/ARLAS-wui-builder/tree/v21.0.0) (2022-04-05)

**New stuff:**

- display icons for label layers [\#717](https://github.com/gisaia/ARLAS-wui-builder/issues/717)
- Add label alignment [\#715](https://github.com/gisaia/ARLAS-wui-builder/issues/715)

## [v20.1.1](https://github.com/gisaia/ARLAS-wui-builder/tree/v20.1.1) (2022-02-24)

**New stuff:**

- \[Powerbars\] Add option to set filter default operator \(Eq, Ne\) and display button to switch [\#675](https://github.com/gisaia/ARLAS-wui-builder/issues/675) [[ANALYTICS](https://github.com/gisaia/ARLAS-wui-builder/labels/ANALYTICS)]

**Fixed bugs:**

- Powerbars default operator wrongly initialized [\#683](https://github.com/gisaia/ARLAS-wui-builder/issues/683)

## [v20.1.0](https://github.com/gisaia/ARLAS-wui-builder/tree/v20.1.0) (2022-02-21)

**New stuff:**

- Add configuration to enable powerbars widgets to be scrollable [\#666](https://github.com/gisaia/ARLAS-wui-builder/issues/666)

## [v20.0.1](https://github.com/gisaia/ARLAS-wui-builder/tree/v20.0.1) (2022-02-04)

## [v20.0.0](https://github.com/gisaia/ARLAS-wui-builder/tree/v20.0.0) (2022-02-02)

**Fixed bugs:**

- thumbnail/image url input not initialized when inserting fields [\#661](https://github.com/gisaia/ARLAS-wui-builder/issues/661)
- RESULTLIST: the tiles section \(render\) is emptied at dashboard releoad [\#656](https://github.com/gisaia/ARLAS-wui-builder/issues/656)
- Layers beyond zoom 22 disappear [\#663](https://github.com/gisaia/ARLAS-wui-builder/issues/663)
- Color picker popup is too high, that colors can't be chosen [\#615](https://github.com/gisaia/ARLAS-wui-builder/issues/615)

## [v19.2.0](https://github.com/gisaia/ARLAS-wui-builder/tree/v19.2.0) (2021-12-06)

**New stuff:**

- Handle collections that don't have centroid/geometry path in layers declarations [\#631](https://github.com/gisaia/ARLAS-wui-builder/issues/631) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]
- Make the window of choosing icon larger [\#614](https://github.com/gisaia/ARLAS-wui-builder/issues/614) [[ANALYTICS](https://github.com/gisaia/ARLAS-wui-builder/labels/ANALYTICS)]
- Sort and filter layers list by name [\#612](https://github.com/gisaia/ARLAS-wui-builder/issues/612) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]

**Fixed bugs:**

- Resultlist grid view is not reset after collection change [\#630](https://github.com/gisaia/ARLAS-wui-builder/issues/630)

## [v19.1.0](https://github.com/gisaia/ARLAS-wui-builder/tree/v19.1.0) (2021-10-25)

## [v19.0.3](https://github.com/gisaia/ARLAS-wui-builder/tree/v19.0.3) (2021-10-21)

## [v19.0.2](https://github.com/gisaia/ARLAS-wui-builder/tree/v19.0.2) (2021-10-11)

**Fixed bugs:**

- Network Analytics & Cluster layers should not be rendered as 'Window' render\_mode [\#606](https://github.com/gisaia/ARLAS-wui-builder/issues/606)

## [v19.0.1](https://github.com/gisaia/ARLAS-wui-builder/tree/v19.0.1) (2021-10-06)

**New stuff:**

- Set render mode to all elements by default [\#603](https://github.com/gisaia/ARLAS-wui-builder/issues/603)

**Fixed bugs:**

- Render mode should be activated for 'Geometric features' only [\#604](https://github.com/gisaia/ARLAS-wui-builder/issues/604)
- zoomMin slider can reach -3 which [\#601](https://github.com/gisaia/ARLAS-wui-builder/issues/601) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]

## [v19.0.0](https://github.com/gisaia/ARLAS-wui-builder/tree/v19.0.0) (2021-09-28)

**New stuff:**

- Configurate the 'Scrollable top hits' size at 'Global configuration' section [\#580](https://github.com/gisaia/ARLAS-wui-builder/issues/580) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]
- Add the possibility to configure the stroke of fill layer [\#579](https://github.com/gisaia/ARLAS-wui-builder/issues/579) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]
- Support interaction between list elements and "scrollable top hits" layers [\#577](https://github.com/gisaia/ARLAS-wui-builder/issues/577)
- Configure grid view in resultlist with a thumbnail [\#576](https://github.com/gisaia/ARLAS-wui-builder/issues/576)
- Change the server url when importing a configuration file when it's not accessible [\#512](https://github.com/gisaia/ARLAS-wui-builder/issues/512)

**Fixed bugs:**

- Stroke of polygon map style does not appear in previsualisation [\#590](https://github.com/gisaia/ARLAS-wui-builder/issues/590)

**Miscellaneous:**

- Add external json nodes to the arlas configuration [\#575](https://github.com/gisaia/ARLAS-wui-builder/issues/575)
- Apply same pagination between map and result list [\#574](https://github.com/gisaia/ARLAS-wui-builder/issues/574)
- Synchronise data displayed on the map and the result list [\#573](https://github.com/gisaia/ARLAS-wui-builder/issues/573)

## [v18.1.1](https://github.com/gisaia/ARLAS-wui-builder/tree/v18.1.1) (2021-09-14)

## [v18.1.0](https://github.com/gisaia/ARLAS-wui-builder/tree/v18.1.0) (2021-09-13)

**Fixed bugs:**

- Loading a configuration with a mono-collection timeline does not work on version 18 [\#586](https://github.com/gisaia/ARLAS-wui-builder/issues/586) [[TIMELINE](https://github.com/gisaia/ARLAS-wui-builder/labels/TIMELINE)]

## [v18.0.3](https://github.com/gisaia/ARLAS-wui-builder/tree/v18.0.3) (2021-08-23)

## [v18.0.2](https://github.com/gisaia/ARLAS-wui-builder/tree/v18.0.2) (2021-08-16)

## [v18.0.1](https://github.com/gisaia/ARLAS-wui-builder/tree/v18.0.1) (2021-08-06)

**New stuff:**

- Add the possibility to apply a timeline filter to widgets and layers of other collections  [\#557](https://github.com/gisaia/ARLAS-wui-builder/issues/557) [[TIMELINE](https://github.com/gisaia/ARLAS-wui-builder/labels/TIMELINE)]

## [v18.0.0](https://github.com/gisaia/ARLAS-wui-builder/tree/v18.0.0) (2021-07-12)

**New stuff:**

- Add the possibility to display a timeline for each collection on the same graph [\#568](https://github.com/gisaia/ARLAS-wui-builder/issues/568)

## [v17.2.4](https://github.com/gisaia/ARLAS-wui-builder/tree/v17.2.4) (2021-06-30)

## [v17.2.3](https://github.com/gisaia/ARLAS-wui-builder/tree/v17.2.3) (2021-06-30)

## [v17.2.2](https://github.com/gisaia/ARLAS-wui-builder/tree/v17.2.2) (2021-06-30)

## [v17.2.1](https://github.com/gisaia/ARLAS-wui-builder/tree/v17.2.1) (2021-06-25)

## [v17.2.0](https://github.com/gisaia/ARLAS-wui-builder/tree/v17.2.0) (2021-06-24)

## [v17.1.1](https://github.com/gisaia/ARLAS-wui-builder/tree/v17.1.1) (2021-06-07)

**Fixed bugs:**

- concatenate collection name to ids of all widgets [\#567](https://github.com/gisaia/ARLAS-wui-builder/issues/567)

## [v17.1.0](https://github.com/gisaia/ARLAS-wui-builder/tree/v17.1.0) (2021-06-04)

**New stuff:**

- Metric value  precision is missing [\#561](https://github.com/gisaia/ARLAS-wui-builder/issues/561) [[WIDGET](https://github.com/gisaia/ARLAS-wui-builder/labels/WIDGET)]

**Fixed bugs:**

- Source names should include collection names [\#563](https://github.com/gisaia/ARLAS-wui-builder/issues/563)
- Missing collection information in contributor ID [\#559](https://github.com/gisaia/ARLAS-wui-builder/issues/559) [[ANALYTICS](https://github.com/gisaia/ARLAS-wui-builder/labels/ANALYTICS)]

## [v17.0.1](https://github.com/gisaia/ARLAS-wui-builder/tree/v17.0.1) (2021-05-21)

**New stuff:**

- Add the possibility to choose which collection to explore [\#399](https://github.com/gisaia/ARLAS-wui-builder/issues/399) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]

## [v17.0.0](https://github.com/gisaia/ARLAS-wui-builder/tree/v17.0.0) (2021-05-19)

**New stuff:**

- Add a required step of choosing the collection from which data is fetched for layers [\#543](https://github.com/gisaia/ARLAS-wui-builder/issues/543) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]
- Add a required step of choosing the collection from which data is fetched for widgets [\#542](https://github.com/gisaia/ARLAS-wui-builder/issues/542) [[WIDGET](https://github.com/gisaia/ARLAS-wui-builder/labels/WIDGET)]
- Remove filtering dashboards by collection when importing widgets or layers [\#541](https://github.com/gisaia/ARLAS-wui-builder/issues/541)

## [v16.1.3](https://github.com/gisaia/ARLAS-wui-builder/tree/v16.1.3) (2021-04-30)

## [v16.1.2](https://github.com/gisaia/ARLAS-wui-builder/tree/v16.1.2) (2021-04-27)

**Fixed bugs:**

- Range and Equal fitlers in Map are not correct [\#551](https://github.com/gisaia/ARLAS-wui-builder/issues/551)

## [v16.1.1](https://github.com/gisaia/ARLAS-wui-builder/tree/v16.1.1) (2021-04-26)

**Fixed bugs:**

- Duplicating a layer crashes all the layers list [\#547](https://github.com/gisaia/ARLAS-wui-builder/issues/547) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]
- Icon of a duplicated layer is wrong [\#546](https://github.com/gisaia/ARLAS-wui-builder/issues/546) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]
- hover and select layers should not be available for Layer Importation [\#544](https://github.com/gisaia/ARLAS-wui-builder/issues/544) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]

## [v16.1.0](https://github.com/gisaia/ARLAS-wui-builder/tree/v16.1.0) (2021-04-21)

**New stuff:**

- Add visualisation set column in the list of layers [\#536](https://github.com/gisaia/ARLAS-wui-builder/issues/536)
- Add the possibility to "qualify" the global count unit  [\#506](https://github.com/gisaia/ARLAS-wui-builder/issues/506) [[LOOK AND FEEL](https://github.com/gisaia/ARLAS-wui-builder/labels/LOOK%20AND%20FEEL)]
- Support dasharrays in line layers [\#431](https://github.com/gisaia/ARLAS-wui-builder/issues/431) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]

**Fixed bugs:**

- When hovering/selecting a donut node, the other nodes should be transparent [\#533](https://github.com/gisaia/ARLAS-wui-builder/issues/533)
- Enable the previewed layer [\#491](https://github.com/gisaia/ARLAS-wui-builder/issues/491) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]

## [v16.0.4](https://github.com/gisaia/ARLAS-wui-builder/tree/v16.0.4) (2021-04-12)

## [v16.0.3](https://github.com/gisaia/ARLAS-wui-builder/tree/v16.0.3) (2021-04-09)

**New stuff:**

- Sort the fields list \(in collection view\) alphabetically [\#520](https://github.com/gisaia/ARLAS-wui-builder/issues/520)
- Sort the fields list \(in dropdown lists\) alphabetically [\#507](https://github.com/gisaia/ARLAS-wui-builder/issues/507)

**Fixed bugs:**

- Layers order inside a visualisation set is lost if one of the layers is edited [\#527](https://github.com/gisaia/ARLAS-wui-builder/issues/527)
- Details of resultlist are not visible in the preview [\#525](https://github.com/gisaia/ARLAS-wui-builder/issues/525)
- Remove normamisation by key for clusters [\#523](https://github.com/gisaia/ARLAS-wui-builder/issues/523)
- Normalizing a field in map invalidates the form [\#522](https://github.com/gisaia/ARLAS-wui-builder/issues/522)
- Property useColorService should be export as boolean in resultList [\#516](https://github.com/gisaia/ARLAS-wui-builder/issues/516) [[ANALYTICS](https://github.com/gisaia/ARLAS-wui-builder/labels/ANALYTICS)]
- Properties MargePanForLoad and MargePanForCount should be exported as number not string [\#514](https://github.com/gisaia/ARLAS-wui-builder/issues/514) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]
- Widget layouts is lost after 2 editions of a dashboard [\#511](https://github.com/gisaia/ARLAS-wui-builder/issues/511) [[ANALYTICS](https://github.com/gisaia/ARLAS-wui-builder/labels/ANALYTICS)]
- Importing a layer or a widget crashes when 'dash.doc\_value.arlas' is undefined [\#510](https://github.com/gisaia/ARLAS-wui-builder/issues/510)
- Sliders positioned to 0 make the forms invalid [\#489](https://github.com/gisaia/ARLAS-wui-builder/issues/489) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]

## [v16.0.2](https://github.com/gisaia/ARLAS-wui-builder/tree/v16.0.2) (2021-03-31)

**Fixed bugs:**

- Layer filter doesn't export good values  [\#504](https://github.com/gisaia/ARLAS-wui-builder/issues/504) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]

## [v16.0.1](https://github.com/gisaia/ARLAS-wui-builder/tree/v16.0.1) (2021-03-31)

**New stuff:**

- Visualisation set status should be expressed by an informative icon rather than a checkbox [\#493](https://github.com/gisaia/ARLAS-wui-builder/issues/493) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]
- Add the granularity of cluster mode in the layers list, 'Visualisation type' column [\#492](https://github.com/gisaia/ARLAS-wui-builder/issues/492) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]
- Give simpler terms for fields types in 'Collection' view [\#488](https://github.com/gisaia/ARLAS-wui-builder/issues/488)

**Fixed bugs:**

- 'Taggable fields' missing translation in 'Collection' view [\#490](https://github.com/gisaia/ARLAS-wui-builder/issues/490)

## [v16.0.0](https://github.com/gisaia/ARLAS-wui-builder/tree/v16.0.0) (2021-03-29)

**New stuff:**

- Allow min 2 buckets instead of 10 in histograms [\#494](https://github.com/gisaia/ARLAS-wui-builder/issues/494)
- Make lines caps rounded so that connections between linestrings are smooth [\#458](https://github.com/gisaia/ARLAS-wui-builder/issues/458)
- Make Tab title configurable [\#441](https://github.com/gisaia/ARLAS-wui-builder/issues/441)
- Rename a dashboard [\#430](https://github.com/gisaia/ARLAS-wui-builder/issues/430)
- Activate color service by column [\#409](https://github.com/gisaia/ARLAS-wui-builder/issues/409) [[ANALYTICS](https://github.com/gisaia/ARLAS-wui-builder/labels/ANALYTICS)]
- Add the possibility to apply a filter on a configured layer [\#400](https://github.com/gisaia/ARLAS-wui-builder/issues/400) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]
- add the possiblity to sort the chosen network field [\#394](https://github.com/gisaia/ARLAS-wui-builder/issues/394) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]
- Add external layers: interactions with layers on the map or elements in the data table [\#388](https://github.com/gisaia/ARLAS-wui-builder/issues/388) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]
- Import an existing widget from a different dashboard [\#331](https://github.com/gisaia/ARLAS-wui-builder/issues/331) [[ANALYTICS](https://github.com/gisaia/ARLAS-wui-builder/labels/ANALYTICS)]
- Import an existing layer from a different dashboard [\#330](https://github.com/gisaia/ARLAS-wui-builder/issues/330) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]

**Fixed bugs:**

- The Analytics Board initialisation doesn't set the layout properly [\#464](https://github.com/gisaia/ARLAS-wui-builder/issues/464) [[ANALYTICS](https://github.com/gisaia/ARLAS-wui-builder/labels/ANALYTICS)]

**Miscellaneous:**

- Duplicate a layer [\#344](https://github.com/gisaia/ARLAS-wui-builder/issues/344) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]

## [v15.0.2](https://github.com/gisaia/ARLAS-wui-builder/tree/v15.0.2) (2021-02-25)

**Fixed bugs:**

- Resultlist details of an item are displayed in red in preview [\#466](https://github.com/gisaia/ARLAS-wui-builder/issues/466) [[ANALYTICS](https://github.com/gisaia/ARLAS-wui-builder/labels/ANALYTICS)]

## [v15.0.1](https://github.com/gisaia/ARLAS-wui-builder/tree/v15.0.1) (2021-02-23)

**New stuff:**

- Add a new Granularity for cluster mode [\#333](https://github.com/gisaia/ARLAS-wui-builder/issues/333) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]

## [v15.0.0](https://github.com/gisaia/ARLAS-wui-builder/tree/v15.0.0) (2021-02-18)

**New stuff:**

- Change 'Timeline' icon in the left menu, using a time notion [\#452](https://github.com/gisaia/ARLAS-wui-builder/issues/452)
- Set Data table size to 100 instead of 0 currently [\#433](https://github.com/gisaia/ARLAS-wui-builder/issues/433) [[ANALYTICS](https://github.com/gisaia/ARLAS-wui-builder/labels/ANALYTICS)]
- Add description about authentication to download data [\#429](https://github.com/gisaia/ARLAS-wui-builder/issues/429) [[SIDE](https://github.com/gisaia/ARLAS-wui-builder/labels/SIDE)]
- Add min/max features columns in Layers table [\#408](https://github.com/gisaia/ARLAS-wui-builder/issues/408) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]
- Add the possibility to define a metric in Powerbars [\#406](https://github.com/gisaia/ARLAS-wui-builder/issues/406) [[ANALYTICS](https://github.com/gisaia/ARLAS-wui-builder/labels/ANALYTICS)]

**Fixed bugs:**

- Enhance display of layers list in Visualisation set form [\#451](https://github.com/gisaia/ARLAS-wui-builder/issues/451)
- Fix translation for stoke color, opacity, width [\#450](https://github.com/gisaia/ARLAS-wui-builder/issues/450)
- Data table previsualisation doesn't have a fixed size \(no scrolling for large tables\) [\#434](https://github.com/gisaia/ARLAS-wui-builder/issues/434) [[ANALYTICS](https://github.com/gisaia/ARLAS-wui-builder/labels/ANALYTICS)]
- widgets layouts is not applied when view it in ARLAS-wui [\#367](https://github.com/gisaia/ARLAS-wui-builder/issues/367) [[WIDGET](https://github.com/gisaia/ARLAS-wui-builder/labels/WIDGET)]

## [v14.3.1](https://github.com/gisaia/ARLAS-wui-builder/tree/v14.3.1) (2021-02-03)

**Fixed bugs:**

- Color picker is badly positioned if the page is scrolled [\#444](https://github.com/gisaia/ARLAS-wui-builder/issues/444) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]

## [v14.3.0](https://github.com/gisaia/ARLAS-wui-builder/tree/v14.3.0) (2021-02-01)

**New stuff:**

- Activate CSV export for widgets [\#428](https://github.com/gisaia/ARLAS-wui-builder/issues/428) [[WIDGET](https://github.com/gisaia/ARLAS-wui-builder/labels/WIDGET)]

**Fixed bugs:**

- Allow 'localhost' in Tagger urls [\#439](https://github.com/gisaia/ARLAS-wui-builder/issues/439)
- Columns & Details layouts don't have the same size [\#435](https://github.com/gisaia/ARLAS-wui-builder/issues/435) [[ANALYTICS](https://github.com/gisaia/ARLAS-wui-builder/labels/ANALYTICS)]
- Editing a dashboard get stuck in "Landing page" [\#432](https://github.com/gisaia/ARLAS-wui-builder/issues/432)

## [v14.2.3](https://github.com/gisaia/ARLAS-wui-builder/tree/v14.2.3) (2021-01-25)

**Fixed bugs:**

- Interpolation of negative values to color palette is not working [\#425](https://github.com/gisaia/ARLAS-wui-builder/issues/425) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]
- Interpolation of color to values between 0 - 1 is not working [\#407](https://github.com/gisaia/ARLAS-wui-builder/issues/407)

## [v14.2.2](https://github.com/gisaia/ARLAS-wui-builder/tree/v14.2.2) (2021-01-19)

## [v14.2.1](https://github.com/gisaia/ARLAS-wui-builder/tree/v14.2.1) (2021-01-18)

## [v14.2.0](https://github.com/gisaia/ARLAS-wui-builder/tree/v14.2.0) (2021-01-18)

**New stuff:**

- Add the possibility to interpolate the opacity to the value of a given field [\#398](https://github.com/gisaia/ARLAS-wui-builder/issues/398) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]
- Enhance Geomtery type according to the chosen geometry [\#396](https://github.com/gisaia/ARLAS-wui-builder/issues/396) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]
- Add a dedicated page for collection description [\#329](https://github.com/gisaia/ARLAS-wui-builder/issues/329)
- Manage basemap url in map configuration [\#308](https://github.com/gisaia/ARLAS-wui-builder/issues/308) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]

**Miscellaneous:**

- Add the possibility to configure the circle stroke [\#343](https://github.com/gisaia/ARLAS-wui-builder/issues/343) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]

## [v14.1.2](https://github.com/gisaia/ARLAS-wui-builder/tree/v14.1.2) (2020-12-21)

**Fixed bugs:**

- Static links environment variable not declared in start.sh [\#411](https://github.com/gisaia/ARLAS-wui-builder/issues/411)

## [v14.1.1](https://github.com/gisaia/ARLAS-wui-builder/tree/v14.1.1) (2020-12-18)

**New stuff:**

- Disable the grid aspect [\#395](https://github.com/gisaia/ARLAS-wui-builder/issues/395) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]
- Adapt default values of look & feel [\#393](https://github.com/gisaia/ARLAS-wui-builder/issues/393) [[LOOK AND FEEL](https://github.com/gisaia/ARLAS-wui-builder/labels/LOOK%20AND%20FEEL)]
- Lines : make default Width to fix with a given value [\#392](https://github.com/gisaia/ARLAS-wui-builder/issues/392) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]
- Add the possibility to activate coordinates on the map [\#390](https://github.com/gisaia/ARLAS-wui-builder/issues/390) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]
- Change the order of layers inside visualisation sets [\#361](https://github.com/gisaia/ARLAS-wui-builder/issues/361) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]
- Change the order of visualisation sets [\#360](https://github.com/gisaia/ARLAS-wui-builder/issues/360) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]
- Choose circle size smaller than 5 [\#349](https://github.com/gisaia/ARLAS-wui-builder/issues/349)
- Traduction / Description [\#318](https://github.com/gisaia/ARLAS-wui-builder/issues/318)
- Show error message in popup when something went wrong [\#288](https://github.com/gisaia/ARLAS-wui-builder/issues/288)

**Fixed bugs:**

- Fix the minimum radius value [\#397](https://github.com/gisaia/ARLAS-wui-builder/issues/397) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]
- DATA TABLE : Width of the tabs Data/render is not adapted \(too small\) \(resultlist\) [\#334](https://github.com/gisaia/ARLAS-wui-builder/issues/334)

## [v14.1.0](https://github.com/gisaia/ARLAS-wui-builder/tree/v14.1.0) (2020-12-07)

**New stuff:**

- Edit tab's title directly [\#381](https://github.com/gisaia/ARLAS-wui-builder/issues/381) [[ANALYTICS](https://github.com/gisaia/ARLAS-wui-builder/labels/ANALYTICS)]
- Make layers and visualisation sets lists optional [\#379](https://github.com/gisaia/ARLAS-wui-builder/issues/379) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]
- \[HISTOGRAM\] Set number of buckets at 50 [\#369](https://github.com/gisaia/ARLAS-wui-builder/issues/369) [[ANALYTICS](https://github.com/gisaia/ARLAS-wui-builder/labels/ANALYTICS)]
- \[DONUT\] set donut size to 10 by default [\#366](https://github.com/gisaia/ARLAS-wui-builder/issues/366) [[ANALYTICS](https://github.com/gisaia/ARLAS-wui-builder/labels/ANALYTICS)]
- \[LAYER\]: switch "visibility" and "style" steps order [\#364](https://github.com/gisaia/ARLAS-wui-builder/issues/364) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]
- \[LAYER\]: Hide collection step as we have always one [\#363](https://github.com/gisaia/ARLAS-wui-builder/issues/363) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]
- Enhance the default 'look and feel' elements [\#359](https://github.com/gisaia/ARLAS-wui-builder/issues/359) [[LOOK AND FEEL](https://github.com/gisaia/ARLAS-wui-builder/labels/LOOK%20AND%20FEEL)]
- Set default search placeholder [\#358](https://github.com/gisaia/ARLAS-wui-builder/issues/358) [[SEARCH](https://github.com/gisaia/ARLAS-wui-builder/labels/SEARCH)]
- Enhance default configuration of the timeline [\#356](https://github.com/gisaia/ARLAS-wui-builder/issues/356) [[TIMELINE](https://github.com/gisaia/ARLAS-wui-builder/labels/TIMELINE)]
- Add a spinner after loading the collections list [\#355](https://github.com/gisaia/ARLAS-wui-builder/issues/355)
- Add missing english description [\#335](https://github.com/gisaia/ARLAS-wui-builder/issues/335)
- Manage colors globally [\#213](https://github.com/gisaia/ARLAS-wui-builder/issues/213)

**Fixed bugs:**

- Don't reset writers/readers access on dashboard update [\#385](https://github.com/gisaia/ARLAS-wui-builder/issues/385)
- \[DONUT\] removing a field doesn't work [\#368](https://github.com/gisaia/ARLAS-wui-builder/issues/368) [[ANALYTICS](https://github.com/gisaia/ARLAS-wui-builder/labels/ANALYTICS)]
- \[HEATMAP\] the opacity of heatmap layers doesn't work [\#365](https://github.com/gisaia/ARLAS-wui-builder/issues/365) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]
- "Ajouter une couche de données" and "Ajouter un espace de visualisation" text is not wrapped inside the button [\#362](https://github.com/gisaia/ARLAS-wui-builder/issues/362)
- Minimal zoom for cluster & Network analytics  [\#357](https://github.com/gisaia/ARLAS-wui-builder/issues/357) [[MAP](https://github.com/gisaia/ARLAS-wui-builder/labels/MAP)]
- Interpolation of width & radius to a field doesn't work [\#354](https://github.com/gisaia/ARLAS-wui-builder/issues/354)
- Renaming a map layer causes crash [\#350](https://github.com/gisaia/ARLAS-wui-builder/issues/350)
- MAP : add filter to a map layer [\#347](https://github.com/gisaia/ARLAS-wui-builder/issues/347)

## [v14.0.1](https://github.com/gisaia/ARLAS-wui-builder/tree/v14.0.1) (2020-11-13)

**Fixed bugs:**

- Fix Look and feel attributes format [\#340](https://github.com/gisaia/ARLAS-wui-builder/issues/340)

## [v14.0.0](https://github.com/gisaia/ARLAS-wui-builder/tree/v14.0.0) (2020-11-09)

**New stuff:**

- Disable fields in dropdown lists when fields are not indexed [\#326](https://github.com/gisaia/ARLAS-wui-builder/issues/326)
- Manage arlas wui name in builder [\#317](https://github.com/gisaia/ARLAS-wui-builder/issues/317)

**Fixed bugs:**

- Fix width of dropdown list to see the whole field path [\#327](https://github.com/gisaia/ARLAS-wui-builder/issues/327)
- Deal with arlas taggable field [\#219](https://github.com/gisaia/ARLAS-wui-builder/issues/219)

## [v0.0.5](https://github.com/gisaia/ARLAS-wui-builder/tree/v0.0.5) (2020-07-24)

**New stuff:**

- Add a route to load a configuration from persistence [\#233](https://github.com/gisaia/ARLAS-wui-builder/issues/233)

**Fixed bugs:**

- Persisted configuration has 'arlasWui' attribute instead of 'arlas-wui' [\#227](https://github.com/gisaia/ARLAS-wui-builder/issues/227)
- Configuration stored in persistence should not contain 'extraConfigs' attribute [\#226](https://github.com/gisaia/ARLAS-wui-builder/issues/226)

## [v0.0.4](https://github.com/gisaia/ARLAS-wui-builder/tree/v0.0.4) (2020-06-29)

**New stuff:**

- Add layer preview in map config [\#79](https://github.com/gisaia/ARLAS-wui-builder/issues/79)
- Add global map preview [\#215](https://github.com/gisaia/ARLAS-wui-builder/pull/215) ([mbarbet](https://github.com/mbarbet))

**Fixed bugs:**

- Translation are not take into account in sub modules [\#222](https://github.com/gisaia/ARLAS-wui-builder/issues/222)
- Extra config part is missing in config.json [\#218](https://github.com/gisaia/ARLAS-wui-builder/issues/218)
- Map contributor name is missing in configuration [\#217](https://github.com/gisaia/ARLAS-wui-builder/issues/217)

## [v0.0.3](https://github.com/gisaia/ARLAS-wui-builder/tree/v0.0.3) (2020-06-19)

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

**New stuff:**

- Create TIMELINE config page [\#6](https://github.com/gisaia/ARLAS-wui-builder/issues/6)
- Create SEARCH config page [\#5](https://github.com/gisaia/ARLAS-wui-builder/issues/5)

## [0.0.0](https://github.com/gisaia/ARLAS-wui-builder/tree/0.0.0) (2020-03-19)

**New stuff:**

- Add translation  [\#29](https://github.com/gisaia/ARLAS-wui-builder/issues/29)
- Theme application [\#7](https://github.com/gisaia/ARLAS-wui-builder/issues/7)
- Create MAP config page [\#4](https://github.com/gisaia/ARLAS-wui-builder/issues/4)
- Landing page [\#3](https://github.com/gisaia/ARLAS-wui-builder/issues/3)
- Manage default values  [\#2](https://github.com/gisaia/ARLAS-wui-builder/issues/2)
- Create navigation menu [\#1](https://github.com/gisaia/ARLAS-wui-builder/issues/1)



\* *This Change Log was automatically generated by [github_changelog_generator](https://github.com/skywinder/Github-Changelog-Generator)*