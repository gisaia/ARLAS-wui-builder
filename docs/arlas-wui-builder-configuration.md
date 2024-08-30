# Configuring ARLAS-wui-builder running environment

## ARLAS-wui-builder settings file

ARLAS-wui-builder is configured with a yaml settings file that you can customize.

### Configure ARLAS-wui-builder as a docker container

#### With environment variables

`ARLAS-wui-builder` can run as a docker container. A rich set of properties of the settings file can be overriden by passing environment variables to the container:

```
docker run -ti -d \
   --name arlas-wui-builder \
   gisaia/arlas-wui-builder:latest
```

All supported environment variables are listed below.

### With file/URL based configuration

Instead of overriding some properties of the settings file, it is possible to start the `arlas-wui-builder` container with a given settings file.

#### File

The `arlas-wui-builder` container can start with a mounted settings file thanks to docker volume mapping. For instance, if the current directory of the host contains a `settings.yaml` file, the container can be started as follow:

```
docker run -ti -d \
   --name arlas-wui-builder \
   -v `pwd`/settings.yaml:/usr/share/nginx/html/settings.yaml \
   gisaia/arlas-wui-builder:latest
```
#### URL
The `arlas-wui-builder` container can start with a settings file that is downloaded before starting up. The settings file must be available through an URL accessible from within the container. The URL is specified with an environment variable:

| Environment variable | Description |
| -------------------- | ----------- |
|ARLAS_SETTINGS_URL | URL of the ARLAS-wui-builder settings file to be downloaded by the container before starting |

For instance, if the current directory of the host contains a `settings.yaml` file, the container can be started as follow:

```
docker run -ti -d \
   --name arlas-wui-builder \
   -e ARLAS_SETTINGS_URL="http://somemachine/settings.yaml" \
   gisaia/arlas-wui-builder:latest
```
### arlas-wui-builder settings properties

If you don't mount a `settings.yaml` file to the container, nor serve it with `ARLAS_SETTINGS_URL` variable, you can set a bunch of environement variables in the default `settings.yaml` embarked with the application.

#### Variables that are specific to ARLAS-wui-builder

|Environment variable| settings.yaml variable|Default|Description|
|--------------------|---------------------------|-------|-----------|
|ARLAS_TAB_NAME   | tab_name| ARLAS-wui-builder | Title of the tab |
|ARLAS_EXTERNAL_NODE_PAGE   | external_node_page| false | Whether or not to allow a user add a node of json configuration in their dashboards. This node is 'external' to arlas schema. |
|ARLAS_EXTERNAL_NODE_SCHEMAS| external_node_schemas | [ ] | List of objects having 2 attributes. - 'name': name of the schema. - 'url' : path to a json file containing the schema. |
| ARLAS_HISTOGRAMS_MAX_BUCKETS | histogram.max_buckets | 200 | The user will be able to configure a number of buclets between 0 and `histogram.max_buckets` |
| ARLAS_EXPORT_HISTOGRAMS_NB_BUCKETS | histogram.export_nb_buckets | 1000 | The export to csv feature will download `histogram.export_nb_buckets` buckets for histograms. |
| ARLAS_USE_TIME_FILTER | use_time_filter | false | If true, the analytics and map previews will fetch only the last 7 days of the chosen-collection data. |
| ARLAS_BASEMAPS | basemaps | [] | List of basemaps that the users can embark within their dashbaords. View the [`basemap` structure](#)|
| ARLAS_ENABLE_H3 | enable_h3 | false | If true, allows the user to configure cluster layers agregated by h3 cell |

## ARLAS-wui-builder assets

ARLAS-wui-builder comes with several assets:

- Translation files stored in `assets/i18n/`

### Translation files

`ARLAS-wui-builder` comes with a list of translatable keys.

Translations are edited in i18n files embarked with the application container in `/usr/share/nginx/html/assets/i18n/` folder. It could be overriden by a:

#### File

The `arlas-wui-builder` container can start with a mounted i18n file thanks to docker volume mapping. For instance, if the current directory of the host contains a `fr.json` file, the container can be started as follow:

```
docker run -ti -d \
   --name arlas-wui-builder \
   -v `pwd`/fr.json:/usr/share/nginx/html/assets/i18n/fr.json \
   gisaia/arlas-wui-builder:latest
```

#### URL

Two environment variables are available to set a url to English and French translation files.

| Name                            | Description                          |
| ------------------------------- | -----------------------------------  |
| ARLAS_WUI_I18N_EN_URL	          | Url to English file to translate `arlas-wui-builder` labels and tooltips. |
| ARLAS_WUI_I18N_FR_URL	          | Url to French file to translate `arlas-wui-builder` labels and tooltips. |

For instance, if the current directory of the host contains a `en.json` file, the container can be started as follow:

```
docker run -ti -d \
   --name arlas-wui-builder \
   -e ARLAS_WUI_I18N_EN_URL="http://somemachine/en.json" \
   gisaia/arlas-wui-builder:latest
```

## Configuring basemaps

`ARLAS-wui-builder` proposes a set of basemaps that the users can embark within their dashbaords.

This set of basemaps is configurabale with `ARLAS_BASEMAPS` variable. ([Checkout other variables](#configuring-arlas-wui-builder-running-environment)).

`ARLAS_BASEMAPS` is a list of objects respecting the following schema :

```json
    {
        "name": "name-of-the-basemap",
        "url": "URL to a Mapbox-style-specification file describing the basemap",
        "image": "An image path to preview the basemap",
        "type": "mapbox | protomap"
    }
```


- The `"url"` attribute refers to a [Mapbox-style-specification file](https://docs.mapbox.com/help/glossary/style/) and is mandatory.
- The `"image"` attribute is optional.
- The `"type"` attribute is optional. Default to 'mapbox'.

### Notes for `Protomaps` basemaps

With ARLAS it is possible to visualise a [Protomaps](https://protomaps.com/) basemap.

In order to make it available in the builder, please follow these instructions :

- Declare a basemap object in `ARLAS_BASEMAPS` as decribed above.
- The [Style](https://docs.mapbox.com/help/glossary/style/) object has `"sources"` attribute where the reference to a Protomaps basemap is defined. Please respect the following instructions
    - The name of the source **must be**: `arlas_protomaps_source`
    - The source object should be as following
    ```json
    {
        "type": "pmtiles-type",
        "tiles": ["pmtiles://https://PATH-TO-PMTILES.pmtiles/{z}/{x}/{y}"]
    }

    ```


    To sum up, the "sources" attribute of [Style](https://docs.mapbox.com/help/glossary/style/) object should be something like :
    ```json
    {
        "sources": {
            "arlas_protomaps_source": {
                "type": "pmtiles-type",
                "tiles": ["pmtiles://https://PATH-TO-PMTILES.pmtiles/{z}/{x}/{y}"]
            }
        }

    }

    ```

