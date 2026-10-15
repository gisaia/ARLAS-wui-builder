# Croisement : Analyse spatiale générique × Capacités ARLAS

Ce document croise les connaissances **génériques** d'analyse spatiale, temporelle et statistique (`SPATIAL_RECIEPE.md`, Analyses 1 à 48) avec ce que la plateforme ARLAS permet aujourd'hui : Server, WUI, Builder, Tagger, Subscriptions, AIAS, services OGC et tuiles.

**Principe** : la connaissance générique reste dans `SPATIAL_RECIEPE.md` et elle est **toujours conservée**, même quand ARLAS ne sait pas (encore) la mettre en œuvre. L'agent raisonne d'abord en géomaticien (quelle est la bonne analyse ?), puis en intégrateur ARLAS (comment la réaliser, l'approcher, ou quel pré-traitement demander ?). Ce document ne redéfinit pas les analyses : il renvoie à leur numéro dans la recette.

**Périmètre des données** : les agents (générateur `AGENT_PROMPT.md` et critique `CRITIC_PROMPT.md`) ne travaillent qu'avec les champs **déjà présents** dans la collection. Les colonnes « pré-traitement » et les usages qui supposent de nouvelles données (ingestion, champ calculé, boucle externe U11) sont une connaissance de référence pour l'équipe data : les agents ne les recommandent pas. Ils signalent seulement qu'une analyse est « non réalisable avec les données disponibles ».

### Légende des statuts

| Statut | Signification | Comportement attendu de l'agent |
|---|---|---|
| ✅ **Natif** | Réalisable dans `config.json` / `config.map.json` **et** reconnu par le Builder (survit au round-trip import/export) | Configurer |
| 🟡 **Partiel** | Approximation possible au runtime ; ou réalisable si un champ pré-calculé existe ; ou **config manuelle** (clé présente dans les schémas mais non gérée par le Builder, au risque d'être perdue au round-trip) ; ou réalisable par un service ARLAS hors configuration du tableau de bord (API, Tagger, Subscriptions, tuiles) | Configurer l'approximation **et** expliquer sa limite |
| 🔴 **Non disponible** | Ni configurable ni approchable aujourd'hui | Expliquer l'analyse générique, signaler qu'elle n'est pas réalisable avec les données disponibles et configurer la meilleure analyse réalisable ; ne pas proposer de nouvelles données |

---

## 1. Socle de capacités ARLAS (référence)

### 1.1 Tableau de bord (configuration WUI / Builder)

| Brique | Capacités | Clés de configuration |
|---|---|---|
| Requête géographique | Filtrer par relation topologique avec une géométrie | `geo_query_field`, `geo_query_op` : `Intersects`, `Within`, `Notwithin`, `Notintersects` |
| Dessin utilisateur | Emprise ou polygone servant de filtre géographique | `mapgl.input.drawButtonEnabled`, `drawPolygonVerticesLimit` |
| Emprise de la vue | Filtrage par la fenêtre de carte | `window_extent_geometry` (`centroid_path`, `geometry_path`) |
| Mode **Features** (`feature-`) | Entités brutes | `returned_geometry`, `render_mode` (`window`, `wide`), `maxfeatures`, `include_fields` |
| Mode **Cluster** (`cluster-`) | Géo-agrégation sur grille régulière ; grille ou heatmap | `aggType` (`h3`, `tile`), `granularity` (`Coarse` → `Finest`), `aggregated_geometry` (`cell`, `cell_center`, `centroid`, `bbox`, `geohash`…), `raw_geometry` + `sort` (géométrie du premier document de la cellule selon un tri sur des champs séparés par des virgules, `-` pour décroissant), `minfeatures` ; `fetched_hits` (valeurs de documents de la cellule utilisées pour les **étiquettes**) |
| Mode **Network Analytics** (`feature-metric-`) | Agrégation des événements par émetteur ou par géométrie partagée (station, arrêt, tronçon) | `geometry_id`, `raw_geometry`, `network_fetching_level` |
| Métriques de cellule / entité | Schéma : `count`, `sum`, `avg`, `min`, `max`, `cardinality`. **Builder** : la couleur interpolée sur une métrique ne propose que `avg`, `sum`, `min`, `max` (champs numériques **ou date**) ; `cardinality` n'est pas proposée pour le style (config manuelle) | `metrics[].metric`, `metrics[].field` |
| Normalisation | Min–max **sur la vue courante** | suffixe `:normalized` |
| Filtres de couche | Sous-ensemble attributaire par couche | `filters` (`IN`, `NOT_IN`, `EQUAL`, `NOT_EQUAL`, `RANGE`, `OUT_RANGE`, `IS`) |
| Styles MapLibre | `circle`, `line`, `fill` (avec option d'extrusion 3D), `heatmap`, `circle-heatmap`, `symbol` | réimportables par le Builder : littéral, `get`, `match`, `interpolate` linéaire (sur un champ, `zoom` ou `heatmap-density`) |
| Couches de contexte | Sources externes (raster, vecteur, GeoJSON) en fond | `mapgl.input.mapSources` |
| Relief | MNT raster en 3D | `mapgl.input.terrain` |
| Multi-échelle | Bascule entre agrégé et détaillé selon le zoom ou le volume (tutoriel AIS : seuil de 10 000) | `minzoom`/`maxzoom`, `minfeatures`/`maxfeatures` |
| Jeux de visualisation | Groupes de couches activables (démo OpenAQ : un jeu par polluant) | `visualisations_sets` |
| Timeline | Histogramme de dates, sélection de période, détail zoomable ; raccourcis relatifs (`Last 7 days`, `This month so far`…) **en config manuelle** (`timeShortcuts` est dans le schéma mais n'est pas géré par le Builder) | `histogram` (`timeline`), `detailedhistogram`, `timeShortcuts`, `additionalCollections` |
| Analytique | Répartitions, distributions, croisements (catégorie × temps), indicateurs | `tree` → `donut` (plusieurs niveaux en anneaux) / `powerbars` (un niveau) ; `histogram` ; `swimlane` (catégorie × temps) ; `metric` (Builder : `count`, `avg`, `cardinality`, `max`, `min`, `sum` ; `spanning` présent dans le schéma seulement, config manuelle) ; `metricstable` |
| Recherche | Plein texte, autocomplétion, expressions régulières | `search` (`search_field`, `autocomplete_field`) |
| Table de résultats | Colonnes **triables**, détails, vignettes, quicklooks, survol qui met l'entité en évidence sur la carte, « Zoom to » | `resultlist` (`columns[].sort`, `fieldsConfiguration.urlThumbnailTemplate`, `urlImageTemplates`) |
| Collaboration | Toute sélection (carte, widget, timeline) filtre tous les autres | bus de contributeurs (natif) |
| Multi-collections | Couches de plusieurs collections sur une carte : le Builder crée **un contributeur `map` par collection** et suffixe le nom de chaque source par sa collection | `layers_sources[].source` = `<source>-<collection>` ; `additionalCollections` sur la timeline |
| Export et partage (fonction du tableau de bord) | Export **GeoJSON** de ce que montre la carte (modes Features et Cluster) vers QGIS ; **signets** de jeux de filtres | natif dans le tableau de bord, sans configuration |

### 1.2 Services ARLAS hors configuration du tableau de bord

| Service | Capacités utiles à l'analyse | Points d'entrée |
|---|---|---|
| API Exploration | Agrégations `datehistogram`, `histogram`, `term`, `geohash`, `geotile` (`h3` est présent dans les schémas et le Builder mais absent de la page API consultée) ; `collect_fct` : `avg`, `sum`, `min`, `max`, `cardinality`, **`geobbox`, `geocentroid`** ; `fetch_hits` (meilleurs documents par case) ; `raw_geometries` triées ; `_compute` avec **`spanning`** ; filtres `like` (regex), `range` sur `$timestamp`, **date math** (`now-7d`, `/d`) ; tri **`geodistance:lat lon`** ; `_suggest` | `/arlas/explore/{collection}/_aggregate`, `_geoaggregate`, `_compute`, `_search`, `_geosearch` |
| Contrôle d'accès | Restreindre les documents (ex. par territoire) et les champs visibles | en-têtes `partition-filter`, `column-filter` |
| **Tagger** | Ajouter ou retirer une étiquette aux documents d'une requête, avec **propagation** à tous les documents qui partagent une valeur (ex. même identifiant d'objet) ; rejeu de l'historique | `_tag`, `_untag`, `_tagreplay` ; champ déclaré dans `taggable_fields` |
| **Subscriptions** | Notifier quand un nouveau document correspond à un filtre et à un déclencheur géographique (zone d'intérêt) | gestionnaire de souscriptions + matcher Kafka |
| **Tile service** | Mosaïque PNG des images des documents correspondant à un filtre : ordre d'empilement par `sort`, arrêt à un taux de `coverage` | `/arlas/explore/{collection}/_tile/{z}/{x}/{y}.png` |
| OGC | WFS 2.0 (`GetFeature` avec bbox et filtre) et CSW 3.0 (catalogue des collections) pour les clients SIG | `/arlas/ogc/wfs/{collection}`, `/arlas/ogc/csw/` |
| **AIAS** | Catalogue STAC (AIRS), ingestion et téléchargement d'archives en asynchrone (APROC), accès protégé aux fichiers (AGATE), enrichissement | `/processes/ingest`, `/processes/download` ; `ARLAS_DOWNLOAD_PROCESS_*`, `ARLAS_ENRICH_PROCESS_*` côté WUI |

---

## 2. Patterns de transformation (`SPATIAL_RECIEPE.md` §1)

| Pattern générique | Statut | Mise en œuvre / approximation ARLAS | Pré-traitement recommandé sinon |
|---|---|---|---|
| **A. Normalisation par la surface** | 🟡 | Natif **sur grille d'aire égale** : sur une cellule H3, `count` ou `sum` *est* une densité (U2). Sur polygones arbitraires : champ densité existant. | Aire en projection équivalente et ratio, à l'ingestion |
| **A'. Normalisation par une population exposée** | 🟡 | Champ taux existant → choroplèthe ; sinon stock et dénominateur côte à côte dans `metricstable` | Jointure du dénominateur et calcul du taux |
| **B. Point-in-polygon** | 🟡 | ✅ sur grille H3 ; ✅ par zone pré-attribuée (`tree` / `feature-metric-` sur l'identifiant de zone) ; ✅ comptage dans une zone dessinée (`metric` count) | Spatial join à l'ingestion (exemple : rattachement de chaque bâtiment à sa commune dans le tutoriel *Buildings Solar Potential*) |
| **C. Voisinage (buffers, isochrones)** | 🟡 / 🔴 | Zone dessinée ; plus proche voisin par tri `geodistance` (U14) ; isochrones 🔴 | Buffers / isochrones indexés en `geo_shape` |

## 3. Recettes cartographiques (`SPATIAL_RECIEPE.md` §2)

| Recette générique | Statut | Mise en œuvre ARLAS | Limite / écart à signaler |
|---|---|---|---|
| Matrice Bertin (taille / valeur / teinte) | ✅ | `circle-radius`, `line-width` ; `interpolate` ; `match` | Texture (`fill-pattern`) non gérée par le Builder |
| R1 Choroplèthe | ✅ / 🟡 | `fill` + `interpolate` (features) ou `<champ>_avg_` / `count` sur cellule H3 | Pas de `step` réimportable : classes encodées en arrêts d'`interpolate` aux bornes. `:normalized` dépend de la vue : pour comparer des périodes ou des zones, utiliser des valeurs brutes avec des arrêts fixes. |
| R2 Symboles proportionnels | ✅ / 🟡 | `circle` sur `feature-` ou `cluster-` (`sum`, `count`) | Pas de `sqrt` : approcher par plusieurs arrêts d'`interpolate` ; sur polygones, champ centroïde requis |
| R3 Carte de flux O-D | 🟡 | `line` + `line-width` interpolé si les géométries O-D existent ; flux agrégés via `feature-metric-` ; départs et arrivées en deux couches (U1) | Arcs, flèches, animation : 🔴 |

---

## 4. Analyses spatiales (`SPATIAL_RECIEPE.md` Analyses 1–18)

| # | Analyse générique | Statut | Mise en œuvre / approximation ARLAS | Pré-traitement ou boucle externe sinon |
|---|---|---|---|---|
| 1 | Hotspots (Gi*) | 🔴 calcul / ✅ rendu | Exploration : cellules H3 sur `count` (concentrations sans test de significativité, à dire explicitement). Rendu divergent si `z_score` indexé. | Gi* sur grille H3 (PySAL) via U11 |
| 2 | Allocation multicritère | 🟡 | **Overlay booléen natif** par le bus : plage sur `histogram`, catégories sur `powerbars`, zone dessinée, `filters` de couche. Contraintes affichées en `mapSources` (sans filtrage). | Score d'aptitude pondéré par cellule |
| 3 | Centrographie | 🟡 | Centroïde par cellule (`aggregated_geometry: centroid`) ; centroïde ou emprise par catégorie via `collect_fct geocentroid/geobbox` de l'API (`term` + `geocentroid`) | Distance standard, ellipse |
| 4 | Configuration du semis (Clark-Evans, Ripley) | 🔴 | Lecture visuelle multi-échelle (`granularity`) | Calcul et restitution en `metric` |
| 5 | Moran / LISA | 🔴 calcul / ✅ rendu | `match` sur la classe LISA indexée | PySAL / GeoDa via U11 |
| 6 | KDE | 🟡 | `heatmap` / `circle-heatmap` (noyau en pixels écran) ; densité mesurable par `count` H3 | KDE en unités terrain |
| 7 | Interpolation | 🟡 | Moyenne par cellule H3 (`<champ>_avg_`), sans estimation hors mesures | Grille interpolée indexée ou raster en `mapSources` |
| 8 | Aires d'influence | 🟡 / 🔴 | Plus proche site par tri `geodistance` (U14) | Voronoï / Huff indexés |
| 9 | Réseau et accessibilité | 🟡 | Métriques par tronçon ou émetteur (`feature-metric-`, U6) | Routage (OSRM, pgRouting), isochrones indexées |
| 10 | Classification / régionalisation | 🔴 calcul / ✅ rendu | `match` + `donut`/`powerbars` sur l'étiquette indexée ou posée par le Tagger (U8). La grille `cluster-` n'est pas un clustering. | DBSCAN / SKATER via U11 |
| 11 | GWR | 🔴 calcul / ✅ rendu | Coefficients indexés en palette divergente ; exploration bivariée par sélection croisée | GWR via U11 |
| 12 | Spécialisation / co-localisation (QL) | 🟡 | Deux couches H3 (`count` total et `count` filtré sur la catégorie) comparées visuellement ; `tree` à deux niveaux zone → catégorie en `donut` à anneaux (si un identifiant de zone est indexé) | QL par zone indexé |
| 13 | Richesse / diversité | 🟡 | Richesse globale ou filtrée : `metric` `cardinality` ✅ ; carte de richesse par cellule (`cardinality` par cellule H3) en config manuelle (U5) | Shannon, Simpson |
| 14 | Petits effectifs | 🟡 | `minfeatures`, filtre sur `count`, `count` affiché en étiquette (`symbol`) | Lissage bayésien |
| 15 | MAUP | ✅ (exploration) | Varier `granularity`, `aggType` | — |
| 16 | Terrain / visibilité | 🟡 | Relief (`terrain`) | Pente, viewshed |
| 17 | Requêtes topologiques | ✅ | `geo_query_op` + dessin ; « à moins de *d* » approché par une zone dessinée | — |
| 18 | Localisation optimale | 🔴 | Préparation par l'exploration (Analyse 2) | p-médian, MCLP |

## 5. Analyses temporelles (Analyses 19–27)

| # | Analyse générique | Statut | Mise en œuvre / approximation ARLAS | Pré-traitement sinon |
|---|---|---|---|---|
| 19 | Pas d'agrégation et calendrier | ✅ | `datehistogram` (`interval` ou `numberOfBuckets`), `useUtc`, `detailedTimeline` | — |
| 20 | Tendance / saisonnalité | 🔴 | Lecture visuelle de la timeline | Décomposition STL, pente par zone indexée |
| 21 | Cycles (jour × heure) | 🟡 | Avec des champs `hour` / `weekday` indexés : `histogram` sur l'heure, `powerbars` sur le jour, filtrage croisé | Champs calendaires à l'ingestion ; matrice jour × heure : 🔴 |
| 22 | Moyennes mobiles, cumuls | 🔴 | — | Séries lissées ou cumulées indexées |
| 23 | Comparaison de périodes | 🟡 | Signets d'une période à l'autre (U12) ; sélection de périodes sur la timeline ; **arrêts de couleur fixes** (pas `:normalized`) pour garder la même échelle | Variation indexée (palette divergente) |
| 24 | Fenêtres glissantes relatives | 🟡 | `timeShortcuts` de la timeline (`Last 7 days`, `This month so far`…) en config manuelle ; date math `now-7d` dans l'API ; à défaut, sélection manuelle de la période sur la timeline | — |
| 25 | Ruptures / anomalies temporelles | 🔴 calcul / 🟡 repérage | Pics visibles sur la timeline et le `swimlane` | z-score saisonnier, CUSUM |
| 26 | Récence, ancienneté, étendue | 🟡 | `metric` `min` / `max` sur la date ✅ (global, filtré) ; `spanning` en config manuelle ; dernier document par cellule via `raw_geometry` triée sur `-date` ✅ (U3) ; carte de récence `max(date)` par cellule ✅ (U4) | Ancienneté (`now − dernière date`) indexée |
| 27 | Durées, survie, revisite | 🟡 | `histogram` sur un champ durée (ex. `track.duration_s`), `metric avg` | Kaplan-Meier, intervalles de revisite |

## 6. Analyses spatio-temporelles et mobilité (Analyses 28–34)

| # | Analyse générique | Statut | Mise en œuvre / approximation ARLAS | Pré-traitement sinon |
|---|---|---|---|---|
| 28 | Segmentation des trajectoires | 🟡 | Affichage natif des parcours et fragments pré-segmentés (démos AIS Courses / AIS Flow, produites avec ARLAS PROC ML) | Détection stops / moves |
| 29 | Matrice O-D | 🟡 | Deux couches cluster sur les champs de départ et d'arrivée (U1) ; `tree` à deux niveaux origine → destination rendu en `donut` à anneaux (si des champs de zone d'origine et de destination sont indexés) | Matrice indexée, géométries O-D |
| 30 | Cube espace-temps / hotspots émergents | 🔴 | Lecture période par période (timeline + signets) | Emerging hotspots via U11 |
| 31 | Diffusion / front | 🟡 | `min(date)` par cellule (U4) = date de première apparition | Vitesse du front |
| 32 | Co-présence / rencontres | 🔴 | — | Jointure spatio-temporelle |
| 33 | Passage par une zone (événement → entité) | 🟡 | **Tagger avec propagation** sur l'identifiant d'objet (U8), puis filtrage sur le tag. Le filtre géographique seul ne retient que les observations dans la zone. | — |
| 34 | Géorepérage / alertes | 🟡 | **Subscriptions** (service, hors `config.json`) (U9) | — |

## 7. Catalogues d'imagerie et qualité d'acquisition (Analyses 35–39)

| # | Analyse générique | Statut | Mise en œuvre / approximation ARLAS | Pré-traitement sinon |
|---|---|---|---|---|
| 35 | Couverture nuageuse | ✅ / 🟡 | U17 : `histogram` du % de nuages, couche filtrée `RANGE`, H3 `avg` / `min` | % de nuages *sur la zone d'intérêt* (et non sur la scène) |
| 36 | Revisite utile | 🟡 | `count` H3 sur une couche filtrée sous le seuil ; timeline et `swimlane` capteur × temps | Intervalles entre images exploitables, plus longue lacune |
| 37 | Meilleure image / mosaïque | ✅ / 🟡 | Table triée par nuages croissants (`columns[].sort`) ✅ ; `raw_geometry` de cluster triée sur `cloud_cover,-date` ✅ ; **tile service** `sort` + `coverage` 🟡 (U10) | Mosaïque radiométriquement harmonisée |
| 38 | Couverture spatiale du catalogue | 🟡 | `count` d'emprises par cellule (selon le support de l'agrégation de `geo_shape`, sinon sur le centroïde) | Union des emprises, taux de couverture, zones blanches |
| 39 | Autres métadonnées d'acquisition | ✅ | `histogram` (incidence, élévation solaire, résolution) ; `powerbars` (capteur, niveau) ; H3 `min`/`max` | — |

## 8. Statistiques appliquées (Analyses 40–48)

| # | Analyse générique | Statut | Mise en œuvre / approximation ARLAS | Pré-traitement sinon |
|---|---|---|---|---|
| 40 | Tendance centrale robuste | 🟡 | `histogram` de distribution ; `metric` `avg`, `min`, `max` | Médiane, percentiles, IQR (absents des métriques ARLAS) |
| 41 | Transformations (log…) | 🟡 | Arrêts d'`interpolate` en progression géométrique (lecture logarithmique de la couleur) | Champ `log_x` indexé |
| 42 | Corrélation | 🟡 | Sélection d'une plage d'une variable et lecture de la distribution d'une autre ; carte bivariée (R2 + R1) | Coefficients, nuage de points |
| 43 | Concentration / Pareto | 🟡 | `powerbars` triés décroissants (top-N) | Gini, HHI, part cumulée |
| 44 | Contingence | 🟡 | `swimlane` (catégorie × temps) ; `tree` à deux niveaux catégorie × catégorie rendu en `donut` à anneaux | Khi², résidus |
| 45 | Écart à la normale | 🟡 | Queues de l'`histogram` sélectionnables ; `filters` `OUT_RANGE` | z-score indexé |
| 46 | Seuils et percentiles | ✅ | Arrêts d'`interpolate` fixes aux seuils métier ; sélection d'intervalle sur `histogram` | Percentiles calculés par le profiler |
| 47 | Échantillonnage / biais | 🟡 | Couche de l'effort d'observation en parallèle (autre collection, U13) | Normalisation par l'effort |
| 48 | Richesse contre volume | 🟡 | Chiffres globaux ✅ : `metric` `cardinality` et `count` ; cartes : `count` par cellule H3 ✅, `cardinality` par cellule en config manuelle (U5) | Ratio événements / entité |

---

## 9. Usages ARLAS avancés

Usages tirés des démos, des tutoriels et de la documentation ARLAS. L'agent les consulte avant de conclure qu'une analyse est 🔴. Seuls les usages qui fonctionnent avec les champs existants sont proposés par les agents ; ceux qui supposent de nouvelles données ou un traitement externe (U8 Tagger, qui écrit un champ ; U10, qui exige un modèle d'URL de tuiles dans la collection ; U11, export puis ré-import) restent une information de référence.

| Code | Usage | Configuration ARLAS | Source | Statut |
|---|---|---|---|---|
| **U1** | Origines et destinations | Deux couches `cluster-` sur deux champs géographiques (départ, arrivée), même grille, teintes distinctes, dans deux jeux de visualisation | Démo AIS Courses (*Departures*, *Arrivals*) | ✅ |
| **U2** | Taux d'occupation du sol | `cluster-` H3, métrique `sum` sur le champ surface (`area`), `fill` séquentiel : densité légitime car les cellules ont une aire égale | Inspiré de la démo OSM Buildings (couche *Built area* ; configuration non consultée) ; champ `area` du tutoriel *Buildings Solar Potential* | ✅ |
| **U3** | Dernier état connu | `raw_geometry` de cluster triée sur `-date` (géométrie du document le plus récent par cellule) ✅ ; table triée par date ✅ ; dans l'API, `fetch_hits` triés renvoient les derniers documents par cellule (dans la WUI, `fetched_hits` ne sert qu'aux étiquettes) 🟡 | Builder (`clusterSort`), API Exploration | ✅ / 🟡 |
| **U4** | Carte de récence ou de première apparition | Métrique `max` (ou `min`) d'un champ date par cellule, couleur interpolée avec des arrêts exprimés en epoch (millisecondes) ; étendue globale via `metric` `min` / `max` (ou `spanning` en config manuelle) | Builder : couleur interpolée sur métrique acceptant les champs date (`toNumericOrDateOptionsObs`) | ✅ |
| **U5** | Richesse contre volume | Couche H3 `count` ✅ et couche H3 `cardinality` de l'identifiant (ex. nombre de navires ou d'oiseaux distincts) en config manuelle, côte à côte ; chiffres globaux par `metric` `cardinality` et `count` ✅ | Schéma `metrics[].metric: cardinality` ; Builder (couleur limitée à `avg`/`sum`/`min`/`max`) | 🟡 |
| **U6** | Intensité par fragment ou tronçon | `line` sur fragments avec `line-color` sur la vitesse ; ou `feature-metric-` avec `avg` de vitesse par tronçon | Démo AIS Flow (*Speed*) | ✅ |
| **U7** | Réseau de capteurs multi-variables | Mode Network Analytics par station ; un `visualisations_sets` par variable (polluant), un seul actif à la fois | Inspiré de la démo OpenAQ (PM10, bascule entre polluants ; mécanisme de bascule non documenté) ; mode Network Analytics de la doc des tableaux de bord (exemple PM2.5 par station) | ✅ |
| **U8** | Annotation collaborative et propagation | Tagger : étiqueter la sélection courante (ex. « suspect », « classe A ») ; propagation sur l'identifiant d'objet pour étendre l'étiquette à toute la trajectoire ; puis `match` / `powerbars` sur le champ tag | ARLAS-tagger (`_tag`, `propagation`) | 🟡 (service hors `config.json`) |
| **U9** | Veille de zone | Souscription : zone d'intérêt + filtre ; notification à l'ingestion d'un document correspondant | ARLAS-Subscriptions (exemple Flickr / tour Eiffel) | 🟡 (service) |
| **U10** | Mosaïque d'images | Tile service PNG : `sort` (nuages croissants ou date décroissante), `coverage`, filtre passé dans la requête | ARLAS tile service | 🟡 : la collection doit déclarer un modèle d'URL de tuiles ; l'intégration au tableau de bord n'est pas documentée, et `mapSources` déclare des sources statiques (« basemaps ») **non synchronisées avec les filtres** ARLAS. Usage sûr : client SIG ou URL figée sur un filtre |
| **U11** | Boucle d'analyse externe | Export GeoJSON de la carte ou WFS `GetFeature` → QGIS / PySAL (Gi*, LISA, GWR, DBSCAN, KDE…) → ré-ingestion du résultat (ARLAS CLI) → rendu ARLAS | Dashboard (export GeoJSON → QGIS), OGC WFS, ARLAS CLI | 🟡 : rend réalisables les analyses 🔴 |
| **U12** | Comparaison de scénarios ou de périodes | Signets de jeux de filtres (période, zone, catégories) rechargés successivement ; échelles de couleur fixes | Dashboard (bookmarks) | ✅ |
| **U13** | Croisement multi-collections | `additionalCollections` sur la timeline ; couches de plusieurs collections sur la même carte (un contributeur `map` par collection, sources suffixées par la collection) ; filtre géographique commun | Schéma `histogram` (`additionalCollections`), Builder (`config-export-helper.ts`) | ✅ |
| **U14** | Plus proche voisin | Tri `geodistance:lat lon` des résultats | API Exploration (non exposé dans le Builder) | 🟡 |
| **U15** | Cloisonnement territorial | `partition-filter` par rôle (chaque utilisateur ne voit que son territoire) | API, ARLAS IAM | 🟡 (sécurité, hors `config.json`) |
| **U16** | Inspection visuelle d'objets ou d'images | Table de résultats colorée par type, vignettes, quicklooks multiples, survol de ligne qui met l'entité en évidence, « Zoom to » | Tutoriel EO Objects | ✅ |
| **U17** | Couverture nuageuse d'un catalogue d'images | Voir ci-dessous | ARLAS-EO, AIAS / STAC | ✅ / 🟡 |

### U17 — Analyse de couverture nuageuse (Analyses 35–39)

Champ typique : `eo:cloud_cover` en STAC ; le nom réel dépend de l'index.

1. **Distribution et seuil interactif** : `histogram` numérique du % de nuages (`dataType: "numeric"`, intervalle de 5 %). Sélectionner 0–20 filtre toute la carte, la timeline et les widgets.
2. **Couche « images exploitables »** : emprises `fill` d'une source `feature-` avec `filters` `RANGE` 0–20, à côté d'une couche « toutes les images » (`line` gris).
3. **Nébulosité moyenne** : `cluster-` H3, `avg` du % de nuages, `fill` séquentiel blanc → gris foncé. C'est un ratio : moyenne, jamais somme.
4. **Meilleure image possible** : même grille, métrique `min` du % de nuages ; `raw_geometry` triée sur `cloud_cover,-date` pour afficher l'emprise de la meilleure image par cellule.
5. **Revisite utile** : `count` H3 sur la source filtrée sous le seuil : nombre d'acquisitions exploitables par zone.
6. **Saisonnalité et cadence** : timeline + `swimlane` capteur × temps ; signets « été » / « hiver » pour comparer (U12).
7. **Choix et récupération** : table triée par nuages croissants puis date, vignettes et quicklooks (U16) ; mosaïque « la moins nuageuse » via le tile service (U10) ; téléchargement des images retenues via AIAS / APROC.
8. **🔴 à signaler** : % de nuages sur la zone d'intérêt (et non sur la scène), intervalle entre deux images exploitables, plus longue lacune, taux de couverture de la zone → pré-traitement ou U11.

---

## 10. Synthèse : question utilisateur → analyse → réponse ARLAS

| Question type | Analyse(s) | Statut | Réponse ARLAS proposée par l'agent |
|---|---|---|---|
| « Où se concentrent les événements ? » | 6, 1 | 🟡 | `heatmap` / `circle-heatmap` + H3 `count` pour mesurer |
| « Ces concentrations sont-elles significatives ? » | 1, 5 | 🔴 | H3 exploratoire **+** Gi* via U11, rendu divergent |
| « Quelle zone est la plus touchée ? » | Pattern B, A' | 🟡 | `powerbars` par identifiant de zone ou H3 ; recommander taux / densité |
| « Combien d'éléments dans ce secteur ? » | 17 | ✅ | Dessin + `metric` count |
| « Quelle est la valeur moyenne ici ? » | 7 | 🟡 | H3 `avg` + `histogram` |
| « Comment cela évolue-t-il ? » | 19, 20 | ✅ / 🔴 | Timeline + `swimlane` + carte synchronisée |
| « Quoi de neuf depuis 7 jours ? » | 24, 26 | 🟡 / ✅ | Sélection des 7 derniers jours sur la timeline (raccourci `timeShortcuts` en config manuelle) + carte de récence (U4) |
| « Combien d'espèces / de navires différents ? » | 13, 48 | ✅ / 🟡 | Chiffre global : `metric` `cardinality` ✅ ; carte par cellule : `cardinality` H3 en config manuelle (U5) |
| « Par où passent-ils ? » | 28, 9 | ✅ / 🟡 | `line` features + `feature-metric-` par segment |
| « D'où partent-ils, où vont-ils ? » | 29 | 🟡 | Couches départs / arrivées (U1) + `tree` origine → destination |
| « Qui est passé par là ? » | 33 | 🟡 | Tagger avec propagation (U8) |
| « Prévenez-moi si… » | 34 | 🟡 | Subscriptions (U9) |
| « Où installer… ? » | 2, 18 | 🟡 / 🔴 | Overlay booléen par widgets + score d'aptitude recommandé |
| « Qui est accessible en 15 min ? » | 9 | 🔴 | Zone dessinée + isochrones via pré-traitement |
| « Est-ce anormal ? » | 25, 45 | 🟡 | `histogram` + sélection des extrêmes ; z-score recommandé |
| « Pourquoi ici ? » | 11, 42 | 🔴 | Exploration bivariée croisée ; GWR via U11 |
| « Où et quand ai-je des images sans nuages ? » | 35, 36 | ✅ / 🟡 | U17 étapes 1, 3, 5, 6 |
| « Quelle est la meilleure image sur ma zone ? » | 37 | ✅ / 🟡 | U17 étapes 4 et 7 |
| « Quelle est la dernière image / position ? » | 26, 37 | ✅ | `raw_geometry` triée sur `-date` (U3), table triée par date |

---

## 11. Pistes d'évolution d'ARLAS (🔴 → ✅)

1. **Expressions MapLibre étendues dans le Builder** (`step`, `sqrt`, `case`, arithmétique) → classes discrètes, symboles proportionnels exacts, choroplèthe bivariée.
2. **Ratio de deux métriques par cellule** et division par l'aire de la cellule → densités, taux et quotients de localisation natifs (Patterns A, A', Analyse 12).
3. **Agrégation sur polygones de référence** (jointure spatiale à la volée) → Pattern B générique.
4. **Percentiles et médiane** comme métriques (`collect_fct`) → Analyses 40, 46.
5. **Agrégation imbriquée jour × heure** (`term` ou `histogram` sur un champ calendaire dérivé de la date) → Analyse 21.
6. **Comparaison N / N-1 native** sur la timeline (période de référence superposée) → Analyse 23.
7. **Cumul et moyenne mobile** sur les histogrammes → Analyse 22.
8. **Filtre par distance** (`geo_distance`) et tri par distance exposés dans le Builder → Pattern C, Analyse 8.
9. **Statistiques de voisinage sur grille H3** (anneaux `k-ring` : Gi*, LISA, lissage) → Analyses 1, 5, 14.
10. **Tagger et Subscriptions pilotés depuis le tableau de bord** (étiqueter la sélection, s'abonner à la vue courante) → Analyses 33, 34.
11. **Service de routage** (isochrones comme géométries de filtre) → Analyse 9.
12. **Exposer dans le Builder** les clés déjà présentes dans les schémas : `timeShortcuts`, métrique `spanning`, couleur interpolée sur `cardinality` → Analyses 13, 24, 26, 48.

---

## Annexe : sources consultées

- https://www.arlas.io/ et https://www.arlas.io/arlas-demo-io : démos Flickr, AIS Courses, AIS Flow, OSM Buildings, Bird Tracking, Open AQ
- https://docs.arlas.io/static_docs/arlas_dashboards/ : modes Features / Cluster / Network Analytics, filtres, export GeoJSON, signets
- https://docs.arlas.io/static_docs/concepts/, https://docs.arlas.io/static_docs/building_dashboard/
- Tutoriels : https://docs.arlas.io/external_docs/arlas_playground/ (AIS, Buildings Solar Potential, EO Objects)
- API : https://docs.arlas.io/external_docs/ARLAS-server/arlas-api-exploration/, https://docs.arlas.io/external_docs/ARLAS-server/arlas-tile-service/, https://docs.arlas.io/external_docs/ARLAS-server/arlas-ogc/
- Services : https://docs.arlas.io/external_docs/ARLAS-tagger/arlas-api-tagging/, https://docs.arlas.io/external_docs/ARLAS-subscriptions/subscriptions/, https://docs.arlas.io/external_docs/aias/aias/, https://docs.arlas.io/external_docs/ARLAS-wui/arlas-wui-configuration/
- Code et schémas locaux : `generative-ui/schemas/*.schema.json`, `src/app/services/main-form-manager/config-export-helper.ts`, `config-map-export-helper.ts`, `src/app/modules/map-config/services/map-import/map-import.service.ts`
