# Open data sources for ARLAS ingestion

Free spatio-temporal datasets that can be loaded with `arlas_cli` to test the generator on new data shapes.
Links checked on 2026-10-22.

`arlas_cli indices data` expects **NDJSON** (one JSON document per line), so each source needs a small
conversion step (`jq` or Python) before ingestion.

| # | Dataset | Geometry | Time | Volume | Status |
|---|---|---|---|---|---|
| 1 | USGS earthquakes | Point | epoch ms | ~10k / month | ✅ reachable, prepared |
| 2 | NASA FIRMS active fires | Point | date + time | ~100k+ / week | ✅ reachable |
| 3 | IBTrACS tropical cyclones (NOAA) | Points per storm → lines | 3-hourly since 1842 | ~700k points | ✅ reachable |
| 4 | GBIF species occurrences | Point | event date | unlimited (API, paged) | ✅ reachable |
| 5 | DVF property sales (France) | Point | sale date | millions (one file per département) | ✅ reachable |
| 6 | Citi Bike / Divvy trips | Start + end points (or line) | start / end time | ~3M / month | ✅ reachable |
| 7 | OpenSky Network flights | Point (sampled) | epoch s | user-defined | ✅ reachable, rate-limited anonymously |
| 8 | NASA EONET natural events | Point **and** polygon | dates | a few thousand | ✅ reachable |
| 9 | Vélib' Métropole (GBFS) | Point | live status | ~1,500 stations | ❌ no answer on 2026-10-22 |

## 1. USGS earthquakes

- URL: https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson
- Other feeds: `all_hour`, `all_day`, `all_week`, `significant_month`, `4.5_month`… under the same path.
- Historical / bulk: FDSN API https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=…&endtime=…
- Format: GeoJSON FeatureCollection, Point geometry `[lon, lat, depth_km]`.
- Fields: `mag`, `magType`, `place`, `time`, `updated`, `felt`, `cdi`, `mmi`, `alert`, `status`, `tsunami`,
  `sig`, `net`, `sources`, `types` (comma lists), `nst`, `dmin`, `rms`, `gap`, `type`, `title`, `url`.
- License: public domain (US Government).
- Interest: numbers for histograms (magnitude, depth, significance), categories (type, network, alert),
  already GeoJSON → easiest to ingest.

## 2. NASA FIRMS active fires

- URL (MODIS, last 7 days, global): https://firms.modaps.eosdis.nasa.gov/data/active_fire/modis-c6.1/csv/MODIS_C6_1_Global_7d.csv
- Other products: VIIRS S-NPP / NOAA-20 under `https://firms.modaps.eosdis.nasa.gov/data/active_fire/`;
  24h / 48h / 7d windows; archive via https://firms.modaps.eosdis.nasa.gov/download/ (free account).
- Format: CSV with `latitude`, `longitude`, `acq_date`, `acq_time`, `brightness`, `frp`, `confidence`,
  `daynight`, `satellite`, `instrument`.
- License: open (NASA data policy).
- Interest: dense points → heatmap / clusters; fire intensity (FRP) and confidence.

## 3. IBTrACS tropical cyclones (NOAA NCEI)

- URL: https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r01/access/csv/
- Files: `ibtracs.ALL.list.v04r01.csv`, per basin (`NA`, `EP`, `WP`, …), `last3years`, `since1980`.
- Format: CSV, one row per storm position (every 3 h), with `SID`, `NAME`, `BASIN`, `ISO_TIME`, `LAT`, `LON`,
  `WMO_WIND`, `WMO_PRES`, `USA_SSHS` (category), `DIST2LAND`, `STORM_SPEED`, `STORM_DIR`.
- License: public domain (NOAA).
- Interest: track data like `courses` but long-lived; positions can be aggregated per `SID` into a
  LineString to test track/trail configurations.

## 4. GBIF species occurrences

- API: https://api.gbif.org/v1/occurrence/search?hasCoordinate=true&limit=300&offset=…
  (paged, max 100k results per query; filter by `country`, `taxonKey`, `year`, `datasetKey`…)
- Bulk: https://www.gbif.org/occurrence/download (free account, Darwin Core archive; returns 403 to
  scripts, open it in a browser).
- Fields: `decimalLatitude`, `decimalLongitude`, `eventDate`, `kingdom`, `phylum`, `class`, `order`,
  `family`, `genus`, `species`, `country`, `basisOfRecord`, `datasetName`, `coordinateUncertaintyInMeters`.
- License: per dataset, CC0 / CC-BY / CC-BY-NC.
- Interest: many keyword fields (taxonomy hierarchy) → term lists, search.

## 5. DVF — Demandes de valeurs foncières (France)

- URL: https://files.data.gouv.fr/geo-dvf/latest/csv/ (per year, per département, geolocated)
- Format: CSV with `date_mutation`, `nature_mutation`, `valeur_fonciere`, `type_local`,
  `surface_reelle_bati`, `nombre_pieces_principales`, `surface_terrain`, `nom_commune`, `code_departement`,
  `latitude`, `longitude`.
- License: Licence Ouverte / Etalab 2.0.
- Interest: price and surface metrics, property types, large volume.

## 6. Citi Bike (NYC) / Divvy (Chicago) trips

- Citi Bike: https://s3.amazonaws.com/tripdata/ (monthly zip files)
- Divvy: https://divvy-tripdata.s3.amazonaws.com/ (monthly zip files)
- Format: CSV with `ride_id`, `rideable_type`, `started_at`, `ended_at`, `start_station_name`,
  `end_station_name`, `start_lat`, `start_lng`, `end_lat`, `end_lng`, `member_casual`.
- License: operator data license (free use with attribution).
- Interest: start/end times (like `courses`), origin/destination, member vs casual.

## 7. OpenSky Network flights

- API (live state vectors): https://opensky-network.org/api/states/all?lamin=…&lomin=…&lamax=…&lomax=…
- Historical: Impala DB / weekly datasets at https://opensky-network.org/datasets/ (research access).
- Fields (array per aircraft): `icao24`, `callsign`, `origin_country`, `time_position`, `longitude`,
  `latitude`, `baro_altitude`, `on_ground`, `velocity`, `true_track`, `vertical_rate`, `geo_altitude`.
- License: non-commercial / research use.
- Notes: anonymous access is rate-limited; building tracks needs repeated polling.

## 8. NASA EONET natural events

- API: https://eonet.gsfc.nasa.gov/api/v3/events (also `?status=all&limit=…`, `/categories`)
- GeoJSON variant: https://eonet.gsfc.nasa.gov/api/v3/events/geojson
- Fields: `id`, `title`, `categories` (wildfires, severe storms, volcanoes, sea ice…), `sources`,
  `geometry` (list of dated Points or Polygons), `closed`.
- License: public domain (NASA).
- Interest: mixed geometry types (points and polygons) → edge case for map layer rules.

## 9. Vélib' Métropole (GBFS)

- URL: https://gbfs.velib-metropole.fr/gbfs.json (station information + live status)
- Status: did not answer on 2026-10-22; retry later.
- License: Licence Ouverte / Etalab.
