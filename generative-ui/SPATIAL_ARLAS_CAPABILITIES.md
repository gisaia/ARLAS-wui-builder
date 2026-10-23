# Pondération ARLAS de l'analyse spatiale générique

`SPATIAL_RECIEPE.md` dit **quelle est la bonne analyse**, indépendamment de l'outil. Ce document dit **ce qu'ARLAS permet d'en faire** : il pondère l'analyse idéale par les capacités réelles de la plateforme, pour que l'agent choisisse l'analyse la plus juste **parmi celles qu'ARLAS peut réaliser**, et dise honnêtement ce qui est perdu.

Il est générique, comme la recette : aucun nom de champ, aucune collection, aucun domaine. Les champs sont désignés par leur **rôle** (`<date>`, `<clé d'entité>`, `<mesure STOCK>`, `<dimension>`, `<origine>`, `<destination>`, `<géométrie principale>`…), au sens de l'étape 1 d'`AGENT_PROMPT.md`. Les numéros (Analyses 1–62, Recettes R1–R6, Règles G1–G8, Patterns A–C) renvoient à `SPATIAL_RECIEPE.md`, qui n'est pas répété ici.

---

## 0. Comment pondérer

Pour chaque question de l'utilisateur :

1. **Analyse idéale** : choisis-la dans `SPATIAL_RECIEPE.md`, comme si l'outil n'avait pas de limite.
2. **Précondition** : trouve sa ligne ici (ou, à défaut, la question la plus proche de l'index §13) et vérifie, avec les rôles du profil, que la précondition est remplie. Si elle ne l'est pas, l'analyse est **non réalisable avec les données disponibles**, quel que soit son statut.
3. **Statut** : applique la conduite de la légende ci-dessous.
4. **Repli** : si l'analyse est 🟡, ⚠️, 🔧 ou 🔴, choisis le repli indiqué dans la ligne (ou l'analyse réalisable la plus proche) et vérifie que ce repli ne trompe pas : une approximation acceptable répond à la même question avec moins de précision ; une approximation trompeuse répond à une autre question en ayant l'air de répondre à la première. Dans le doute, préfère une analyse plus simple mais juste.
5. **Limite** : une limite qui change la lecture d'un élément (échelle relative D2, classes écrasées D11, concentration non testée D14, top N D12…) va **dans le tableau de bord**, là où l'utilisateur la lit : titre du widget, titre du groupe ou nom du jeu de visualisation. Le message final de l'agent reprend toutes les limites, mais l'utilisateur du tableau de bord ne le voit pas. Jamais de proposition de nouvelles données ni de traitement externe.
6. **Dégradations transversales** : vérifie la section 1 ; elles s'appliquent à toutes les analyses.

### Légende des statuts

| Statut | Signification | Conduite de l'agent |
|---|---|---|
| ✅ **Natif** | Configurable dans `config.json` / `config.map.json` et conservé par le Builder (round-trip import / export) | Configurer |
| 🟡 **Approché** | Une configuration native répond à la question avec une perte (de précision, de périmètre, d'échelle) | Configurer l'approximation **et** écrire la limite |
| ⚠️ **Hors Builder** | Clé présente dans les schémas mais non gérée par le Builder : perdue au premier enregistrement ou refusée par `genui:check` | Ne pas configurer ; mentionner comme limite ; configurer le repli |
| 🔧 **Service** | Réalisable par un service ARLAS hors tableau de bord (API, Tagger, Subscriptions, tuiles, OGC) | Ne pas configurer ; mentionner dans le rapport si utile |
| 🔴 **Non disponible** | Ni configurable ni approchable dans ARLAS | Expliquer l'analyse idéale, dire « non réalisable dans ARLAS » (limite de l'outil, à distinguer de « non réalisable avec les données disponibles », précondition non remplie) et configurer le repli |

Une ligne à statut mixte (« ✅ / 🟡 », « 🔴 calcul / 🟡 repli ») donne le statut de chaque élément dans sa colonne « Mise en œuvre » : la conduite s'applique élément par élément. « 🔴 calcul / 🟡 repli » : l'analyse idéale n'existe pas dans ARLAS, le repli indiqué est configurable avec sa limite.

**Périmètre des données** : seuls les champs déjà présents dans la collection sont utilisables. Une colonne « Limite » explique *pourquoi* ARLAS ne va pas plus loin ; elle n'est jamais une recommandation d'ingestion, de champ calculé ou de traitement externe.

---

## 1. Dégradations transversales (à appliquer à toute analyse)

Ces limites d'ARLAS reviennent dans de nombreuses analyses. Chacune dit ce que l'agent perd et comment ajuster son jugement.

| # | Limite ARLAS | Conséquence sur le jugement | Repli |
|---|---|---|---|
| D1 | Pas de médiane ni de percentile dans les métriques | Une moyenne sur une distribution asymétrique (moyenne > 2 × médiane du profil) trompe | `histogram` de la distribution à côté du `metric` ; titre « moyenne » explicite ; pour un stock, `sum` plutôt que `avg`. La médiane du profil est figée : elle peut figurer dans le message final, jamais dans un titre (elle devient fausse dès qu'un filtre s'applique) |
| D2 | `:normalized` est calculé **sur la vue courante** | Les couleurs ne se comparent pas d'une vue, d'une période ou d'une zone à l'autre | Dès qu'une comparaison entre zones ou périodes est demandée, arrêts fixes sur la valeur brute : `["get", "count"]` pour un comptage de maille, `["get", "<champ>_<métrique>_"]` pour une métrique, arrêts tirés de la plage du profil ; sinon, « relative à la vue » dans le nom du jeu |
| D3 | Sur une valeur normalisée, le Builder recalcule des arrêts équidistants (MAP-5) | Pas de rayon ∝ √v ni d'échelle non linéaire sur un comptage normalisé | Rayon linéaire, signalé ; sur un champ brut, arrêts en progression quadratique ou géométrique |
| D4 | Expressions réimportables : littéral, `get`, `match`, `interpolate` linéaire (pas de `step`, `case`, `sqrt`, arithmétique) | Pas de classes discrètes au sens strict | Classes encodées par des arrêts d'`interpolate` aux bornes |
| D5 | `*-sort-key` non conservé (MAP-6) | Ordre de dessin des objets non maîtrisé | Couches séparées et opacité ; signaler |
| D6 | `function` d'un `metric` agit sur les agrégats **de la sélection**, jamais par document ni par cellule | Taux, part ou ratio disponibles en global seulement | Ratio global de sommes ; par terme, stock et dénominateur côte à côte dans `metricstable` |
| D7 | Pas de champ dérivé : aucune valeur calculée par document | Toute analyse qui suppose un indice, un écart ou une classe par document exige que ce champ existe | Analyse sur les champs existants ; limite écrite |
| D8 | Couleur interpolée sur une métrique de cellule : `avg`, `sum`, `min`, `max` dans le Builder ; `cardinality` ⚠️ | Pas de carte du nombre d'entités distinctes par cellule | Chiffre global `cardinality` + carte `count` |
| D9 | Grille `tile` / `geohash` : aire de maille variable avec la latitude | Comptages biaisés dès que le rapport d'aire des mailles sur l'emprise dépasse 1,3 (G6, contrôle G6-1) | `aggType: h3` (aire quasi égale) |
| D10 | Heatmap : noyau en pixels écran, pas en unités terrain | La « densité » dépend du zoom | Comptage par maille H3 pour mesurer ; heatmap pour l'aperçu seulement |
| D11 | Histogramme : pas de bornes, pas entier, pas d'échelle logarithmique | Distribution très asymétrique écrasée dans les premières classes | Pas adapté au cœur de la distribution, limite écrite ; arrêts géométriques pour la couleur |
| D12 | Agrégation de termes : top N (`size`) ; swimlane lisible jusqu'à 10 couloirs | Modalités rares invisibles ; des ex æquo au seuil rendent le contenu du top N arbitraire | N = nombre de modalités s'il est ≤ 10 (swimlane) ou ≤ 50 (powerbars), sinon 10 / 50 ; « top N » dans le titre ; `search` pour retrouver les autres |
| D13 | Aucune statistique circulaire | Moyenne d'angles fausse | `histogram` 0–360 et palette circulaire, jamais `avg` |
| D14 | Aucune statistique spatiale inférentielle (autocorrélation, significativité, voisinage) | Une concentration visible n'est pas un « hotspot » démontré, ni une zone « anormale » | Grille de comptage nommée « exploratoire » |
| D15 | La timeline place chaque document à **une** date | Un document qui a un début et une fin (séjour, parcours, acquisition longue) est réduit à un instant | Timeline sur la date principale ; limite écrite si les durées sont longues devant le pas de la timeline |
| D16 | Une métrique de maille compte des **documents**, pas des entités ; une agrégation porte sur un `geo_point` (`agg_geo_field`) | Une entité répétée pèse plusieurs fois ; un grand polygone n'est compté que dans la maille de son point | Dire « documents » (passages, images) et non « entités » ; distincts globalement par `cardinality` (D8) |
| D17 | Les filtres de couche sont ignorés sur une couche `cluster-` (le Builder les désactive, MAP-9) | Pas de grille sur un sous-ensemble fixe | Sous-ensemble par la sélection (widget, timeline) qui filtre la grille ; ou couche `feature-` filtrée |
| D18 | Pas de mesure de la nullité d'un champ numérique (ni `missing` ni `value_count` en métrique) | La part de valeurs manquantes d'une mesure ne s'affiche pas | « hors valeurs manquantes » dans les titres ; pour une dimension, la modalité « inconnue » reste visible |

---

## 2. Briques de configuration ARLAS

Vocabulaire des capacités, avec leur statut dans le Builder. Les autres sections s'y réfèrent.

### 2.1 Tableau de bord (configuration WUI / Builder)

| Brique | Capacité | Clés | Statut |
|---|---|---|---|
| Requête géographique | Filtrer par relation topologique avec une géométrie | `geo_query_field`, `geo_query_op` : `Intersects`, `Within`, `Notwithin`, `Notintersects` | ✅ |
| Dessin utilisateur | Emprise ou polygone servant de filtre | `mapgl.input.drawButtonEnabled`, `drawPolygonVerticesLimit` | ✅ |
| Emprise de la vue | Filtrage par la fenêtre de carte | `window_extent_geometry` (`centroid_path`, `geometry_path`) | ✅ |
| Mode Features (`feature-`) | Objets individuels | `returned_geometry`, `render_mode` (`window` : défilement des objets de la vue, sans `maxfeatures` ; `wide` : jusqu'à `maxfeatures`) (MAP-7), `include_fields` | ✅ |
| Mode Cluster (`cluster-`) | Géo-agrégation d'un `geo_point` sur grille ; grille ou heatmap | `aggType` (`h3`, `tile`), `granularity` (`Coarse` → `Finest`, taille de maille relative au zoom : ne pas annoncer de taille en km), `aggregated_geometry` (`cell`, `cell_center`, `centroid`, `bbox`, `geohash`…), `raw_geometry` + `sort` (géométrie du premier document de la cellule selon un tri, `-` pour décroissant), `minfeatures`, `fetched_hits` (valeurs pour les étiquettes) | ✅ |
| Mode Network Analytics (`feature-metric-`) | Agrégation par émetteur ou géométrie partagée (station, arrêt, tronçon) | `geometry_id`, `raw_geometry`, `network_fetching_level` | ✅ |
| Métriques de cellule | `count`, `sum`, `avg`, `min`, `max` (champ numérique ou date) ; `cardinality` | `metrics[].metric`, `metrics[].field` | ✅ ; `cardinality` en style ⚠️ (D8) |
| Normalisation | Min–max sur la vue (D2) ; par entité avec `normalization_fields` | suffixe `:normalized` | ✅ |
| Filtres de couche | Sous-ensemble attributaire par couche | `filters` (`IN`, `NOT_IN`, `EQUAL`, `NOT_EQUAL`, `RANGE`, `OUT_RANGE`, `IS`) | ✅ sur `feature-` ; ⚠️ sur `cluster-` (D17) |
| Survol et sélection | Mise en évidence d'un objet | copies `arlas-hover-` / `arlas-select-` des couches `feature-` de type `line` ou `circle` ; pour un `fill`, de son contour `arlas-fill_stroke-` (déclaré par `metadata.stroke`) ; aucune pour `cluster-` et `feature-metric-` (MAP-8) | ✅ |
| Couleurs partagées | Même couleur par modalité sur la carte, dans les widgets et la liste ; un même gris pour plusieurs modalités regroupées | `colorGenerator.keysToColors` | ✅ |
| Styles | `circle`, `line`, `fill` (extrusion 3D possible), `heatmap`, `circle-heatmap`, `symbol` | expressions réimportables (D4) | ✅ |
| Couches de contexte | Sources externes statiques (raster, vecteur, GeoJSON), non filtrées par ARLAS | `mapgl.input.mapSources` | ✅ |
| Relief | MNT raster en 3D | `mapgl.input.terrain` | ✅ |
| Multi-échelle | Bascule agrégé / détaillé selon le zoom ou le volume | `minzoom`/`maxzoom`, `minfeatures`/`maxfeatures` | ✅ |
| Jeux de visualisation | Groupes de couches activables | `visualisations_sets` | ✅ |
| Timeline | Histogramme de dates, sélection de période, détail zoomable | `histogram` (timeline), `detailedhistogram`, `additionalCollections` | ✅ |
| Raccourcis temporels relatifs | « 7 derniers jours », « ce mois-ci » | `timeShortcuts` | ⚠️ |
| Répartitions | Une ou plusieurs dimensions | `tree` → `donut` (anneaux) / `powerbars` | ✅ |
| Distributions | Mesure ou date en classes | `histogram` (`interval` entier ou `numberOfBuckets`), `chartType` `bars` / `area` / `curve`, `isOneDimension: false` | ✅ |
| Bande d'intensité 1D | Classes en bande colorée, valeurs divisées par la plus grande classe (pas d'effectifs, pas d'axe Y) | `chartType: oneDimension` + `isOneDimension: true` | ⚠️ (absent du Builder) |
| Croisement dimension × temps | Matrice de comptages | `swimlane` (D12) | ✅ |
| Indicateurs | `count`, `sum`, `avg`, `min`, `max`, `cardinality` combinés par `function` sur `m[0]…m[n]` (D6) | `metric` | ✅ ; `spanning` ⚠️ |
| Tableau de métriques | Une ligne par modalité, plusieurs métriques | `metricstable` | ✅ |
| Recherche | Plein texte, autocomplétion | `search` (`search_field`, `autocomplete_field`) | ✅ |
| Liste de résultats | Colonnes triables, détails, vignettes, quicklooks, survol lié à la carte, « Zoom to » | `resultlist` (`columns[].sort`, `fieldsConfiguration.urlThumbnailTemplate`, `urlImageTemplates`) | ✅ |
| Filtrage croisé | Toute sélection (carte, widget, timeline) filtre les autres | bus de contributeurs | ✅ natif |
| Multi-collections | Un contributeur `map` par collection, sources suffixées par la collection | `layers_sources[].source` = `<source>-<collection>` | ✅ |
| Export et signets | Export GeoJSON de la carte ; signets de jeux de filtres | natif, sans configuration | ✅ (usage) |

### 2.2 Services ARLAS hors tableau de bord (🔧)

| Service | Capacité | Ce que l'agent en fait |
|---|---|---|
| API Exploration | Agrégations `datehistogram`, `histogram`, `term`, `geohash`, `geotile` ; `collect_fct` dont `geobbox`, `geocentroid` ; `fetch_hits` ; `_compute` avec `spanning` ; date math (`now-7d`) ; tri `geodistance` | Construire le profil ; mentionner une capacité, jamais la configurer |
| Contrôle d'accès | `partition-filter`, `column-filter` | Mentionner si la question porte sur des droits |
| Tagger | Étiqueter les documents d'une requête, propagation sur une valeur partagée | Hors périmètre : écrit un champ |
| Subscriptions | Notification sur nouveau document correspondant à un filtre et une zone | Mentionner pour une question d'alerte |
| Tile service | Mosaïque PNG triée, arrêt à un taux de couverture | Mentionner ; exige un modèle d'URL de tuiles dans la collection |
| OGC | WFS, CSW pour les clients SIG | Mentionner pour un usage SIG externe |
| AIAS | Catalogue STAC, téléchargement asynchrone | Mentionner pour la récupération d'images |

---

## 3. Patterns de transformation (`SPATIAL_RECIEPE.md` §1)

| Pattern | Précondition (rôles) | Statut | Mise en œuvre ARLAS | Limite à signaler |
|---|---|---|---|---|
| A. Normalisation par la surface | Géométrie agrégeable en grille | ✅ sur grille H3 | `count` ou `sum` par maille H3 : une maille d'aire égale rend le comptage comparable à une densité (U2) | Densité par maille, pas par unité administrative ; sur polygones arbitraires 🔴 sauf mesure de densité existante |
| A'. Normalisation par une population exposée | `<mesure STOCK>` + `<dénominateur STOCK>`, ou ratio existant | 🟡 | Taux global de la sélection : `function` Σ / Σ ✅ ; par modalité : les deux sommes côte à côte dans `metricstable` ; ratio existant en choroplèthe | Taux par maille ou par modalité non calculé (D6) |
| B. Point-in-polygon | Géométrie ponctuelle ; ou `<dimension de zone>` | ✅ / 🟡 | Comptage par maille H3 ; répartition par la dimension de zone (`powerbars`, `donut`) ; comptage dans une zone dessinée (`metric`) | Pas de jointure à des polygones de référence non indexés |
| C. Voisinage | Géométrie | 🟡 / 🔴 | Zone dessinée ; plus proche voisin 🔧 (tri `geodistance`, U14) | Tampons de distance exacts et isochrones 🔴 |

## 4. Recettes cartographiques (`SPATIAL_RECIEPE.md` §2)

| Recette | Précondition (rôles) | Statut | Mise en œuvre ARLAS | Limite à signaler |
|---|---|---|---|---|
| Matrice de Bertin | — | ✅ | taille (`circle-radius`, `line-width`), valeur (`interpolate`), teinte (`match`) | Texture (`fill-pattern`) ⚠️ |
| R1 Choroplèthe | Polygone + `<mesure RATIO>` ; ou grille H3 | ✅ / 🟡 | `fill` + `interpolate` (features) ou `<champ>_avg_` / `count` par maille | Classes approchées (D4) ; comparaison entre vues impossible sur `:normalized` (D2) |
| R2 Symboles proportionnels | Point (ou centroïde) + `<mesure STOCK>` ou comptage | ✅ / 🟡 | `circle` sur `feature-` ou `cluster-` (`sum`, `count`) ; arrêts quadratiques sur un champ brut | Sur un comptage normalisé, rayon linéaire (D3) ; sur polygone sans centroïde 🔴 |
| R3 Flux origine-destination | `<origine>` + `<destination>` (géométries ou dimensions) | 🟡 | `line` + `line-width` si une géométrie de liaison existe ; `feature-metric-` ; deux couches origine / destination (U1) ; densité de passages (U18) | Arcs, flèches, animation 🔴 |
| R4 Multi-échelle | Géométrie | ✅ | `cluster-` à petite échelle, `feature-` à grande échelle (`minzoom`, `minfeatures`) ; `render_mode: window` | Ordre de dessin (D5) |
| R5 Chronologie d'une entité | `<clé d'entité>` + `<date>` + géométrie | ✅ | `normalization_fields` `{on: <date>, per: <clé d'entité>}` puis `line-width` ou `line-color` en `interpolate` sur `<date>:normalized:<clé d'entité>` ; une couleur par document (`colors_from_fields`) | L'échelle dépend des documents chargés dans la vue |
| R6 Carte composite d'un objet | Plusieurs géométries (principale, origine, destination, arrêts, précision) | ✅ | Une couche `feature-` par géométrie, détails bornés par `minzoom`, regroupés en `visualisations_sets` ; teintes reprises dans les widgets | Ordre de dessin (D5) |
| G8 Incertitude de position | `<géométrie de précision>` | ✅ / 🔴 | `fill` très transparent avec contour sous l'objet | Sans géométrie de précision 🔴 |

---

## 5. Analyses spatiales (Analyses 1–18)

| # | Analyse | Précondition (rôles) | Statut | Mise en œuvre / repli ARLAS | Limite à signaler |
|---|---|---|---|---|---|
| 1 | Hotspots, zones anormalement denses (Gi*) | Géométrie | 🔴 calcul / 🟡 repli | Comptage par maille H3 nommé « exploratoire », arrêts fixes si l'on compare des zones (D2) ; rendu divergent si un score est déjà indexé | Concentrations sans test de significativité (D14) ; documents et non entités (D16) |
| 2 | Allocation multicritère | Plusieurs mesures ou dimensions | 🟡 | Overlay booléen par le filtrage croisé : plages sur `histogram`, modalités sur `powerbars`, zone dessinée, `filters` de couche ; contraintes en `mapSources` (non filtrantes) | Pas de score pondéré |
| 3 | Centrographie | Géométrie | 🟡 | Centroïde par maille (`aggregated_geometry: centroid`) ; centroïde par modalité 🔧 (`geocentroid`) | Distance standard, ellipse 🔴 |
| 4 | Configuration du semis | Points | 🔴 | Lecture visuelle multi-échelle (`granularity`) | Pas d'indice (D14) |
| 5 | Autocorrélation (Moran, LISA) | Géométrie + mesure | 🔴 calcul / ✅ rendu | `match` sur une classe déjà indexée | Sans classe indexée 🔴 (D14) |
| 6 | Densité par noyau | Points | 🟡 | `heatmap` / `circle-heatmap` pour l'aperçu ; comptage H3 pour mesurer | Noyau en pixels (D10) |
| 7 | Interpolation | Points + `<mesure RATIO>` | 🟡 | Moyenne par maille H3 (`<champ>_avg_`) | Aucune estimation hors des mesures |
| 8 | Aires d'influence | Points | 🟡 / 🔴 | Plus proche site 🔧 (U14) | Voronoï, modèles gravitaires 🔴 |
| 9 | Réseau et accessibilité | Lignes ou `<identifiant de tronçon>` | 🟡 | Métriques par tronçon ou émetteur (`feature-metric-`, U6) | Routage, isochrones 🔴 |
| 10 | Classification / régionalisation | `<dimension de classe>` existante | 🔴 calcul / ✅ rendu | `match` + `donut` / `powerbars` sur la classe existante | La grille `cluster-` n'est pas un clustering |
| 11 | Régression géographiquement pondérée | Coefficients existants | 🔴 calcul / ✅ rendu | Palette divergente sur les coefficients ; sinon exploration bivariée par sélection croisée | Pas de modèle |
| 12 | Spécialisation / co-localisation | Géométrie + `<dimension>` | 🟡 | Grille H3 `count` lue avant et après sélection de la modalité (D17) ; `tree` zone → modalité si une dimension de zone existe | Quotient de localisation non calculé (D6) |
| 13 | Richesse / diversité | `<dimension>` ou `<clé d'entité>` | 🟡 | `metric` `cardinality` global ✅ ; carte de richesse par maille ⚠️ (D8) | Indices de diversité 🔴 |
| 14 | Petits effectifs | Géométrie | 🟡 | `minfeatures`, comptage affiché en étiquette (`symbol`) | Pas de lissage |
| 15 | Problème d'agrégation (MAUP) | Géométrie | ✅ | Varier `granularity` et `aggType` | — |
| 16 | Terrain / visibilité | — | 🟡 | Relief (`terrain`) | Pente, visibilité 🔴 |
| 17 | Requêtes topologiques | Géométrie | ✅ | `geo_query_op` + dessin | « À moins de d » approché par une zone dessinée |
| 18 | Localisation optimale | — | 🔴 | Préparer par l'overlay booléen (Analyse 2) | Pas d'optimisation |

## 6. Analyses temporelles (Analyses 19–27)

| # | Analyse | Précondition (rôles) | Statut | Mise en œuvre / repli ARLAS | Limite à signaler |
|---|---|---|---|---|---|
| 19 | Pas d'agrégation et calendrier | `<date>` | ✅ | `datehistogram` (`interval` ou `numberOfBuckets`), `useUtc`, timeline détaillée | Pas en mois : intervalles inégaux, à dire ; documents à durée (D15) |
| 20 | Tendance / saisonnalité | `<date>` | 🔴 calcul / 🟡 repli | Lecture visuelle de la timeline | Pas de décomposition |
| 21 | Cycles (jour × heure) | `<heure>` / `<jour>` existants | 🟡 | `histogram` sur l'heure, `powerbars` sur le jour, filtrage croisé | Sans ces champs 🔴 ; matrice jour × heure 🔴 |
| 22 | Moyennes mobiles, cumuls | `<date>` | 🔴 | — | Pas de lissage ni de cumul |
| 23 | Comparaison de périodes | `<date>` | 🟡 | Signets d'une période à l'autre (U12) ; arrêts de couleur fixes (D2) | Pas de superposition N / N-1 |
| 24 | Fenêtres glissantes relatives | `<date>` | 🟡 | Sélection de la période sur la timeline ; raccourcis relatifs ⚠️ | — |
| 25 | Ruptures / anomalies | `<date>` | 🔴 calcul / 🟡 repérage | Pics visibles sur la timeline et le `swimlane` | Pas de détection |
| 26 | Récence, ancienneté, étendue | `<date>` | ✅ / 🟡 | `metric` `min` / `max` de la date ✅ ; dernier document par maille par `raw_geometry` triée sur `-<date>` (U3) ✅ ; récence par maille `max(<date>)` (U4) ✅ ; `spanning` ⚠️ | Ancienneté relative à aujourd'hui non calculée |
| 27 | Durées, survie, revisite | `<durée>` | 🟡 | `histogram` de la durée ; `metric` `sum` (total) ; `avg` seulement si la distribution est peu asymétrique (D1) | Survie et intervalles de revisite 🔴 |

## 7. Analyses spatio-temporelles et mobilité (Analyses 28–34)

| # | Analyse | Précondition (rôles) | Statut | Mise en œuvre / repli ARLAS | Limite à signaler |
|---|---|---|---|---|---|
| 28 | Segmentation des trajectoires | Lignes déjà segmentées | 🟡 | Affichage des segments existants | Détection d'arrêts et de déplacements 🔴 |
| 29 | Matrice origine-destination | `<origine>` + `<destination>` | 🟡 | Deux `powerbars` origine et destination filtrées l'une par l'autre (lecture ligne par ligne) ✅ ; `metricstable` par origine (`count`, `cardinality` de la `<clé d'entité>`) ✅ ; `tree` origine → destination en `donut` à anneaux (≤ 7 modalités) ; couches origine / destination (U1) | Pas de matrice croisée complète ; liaisons internes mêlées aux autres |
| 30 | Cube espace-temps | Géométrie + `<date>` | 🔴 | Lecture période par période (timeline + signets) | — |
| 31 | Diffusion / front | Géométrie + `<date>` | 🟡 | `min(<date>)` par maille (U4) = première apparition | Vitesse du front 🔴 |
| 32 | Co-présence / rencontres | Géométrie + `<date>` + `<clé d'entité>` | 🔴 | — | Pas de jointure spatio-temporelle |
| 33 | Passage par une zone (événement → entité) | `<clé d'entité>` | 🟡 / 🔧 | Filtre géographique : observations dans la zone seulement ; extension à l'entité par le Tagger 🔧 (hors périmètre) | Les autres observations de l'entité ne sont pas retenues |
| 34 | Géorepérage / alertes | Géométrie | 🔧 | Subscriptions (U9) | Hors tableau de bord |

## 8. Catalogues d'imagerie et qualité d'acquisition (Analyses 35–39)

| # | Analyse | Précondition (rôles) | Statut | Mise en œuvre / repli ARLAS | Limite à signaler |
|---|---|---|---|---|---|
| 35 | Couverture nuageuse | `<couverture nuageuse>` | ✅ / 🟡 | U17 : `histogram`, couche filtrée `RANGE`, `avg` / `min` par maille H3 | Valeur par scène, pas sur la zone d'intérêt |
| 36 | Revisite utile | `<couverture nuageuse>` + `<date>` | 🟡 | Sélection 0–seuil sur l'`histogram` de la couverture nuageuse, qui filtre la grille H3 `count`, la timeline et le `swimlane` `<capteur>` × temps (D17) | Scènes adjacentes d'un même passage comptées plusieurs fois (D16) ; intervalles entre images exploitables 🔴 |
| 37 | Meilleure image / mosaïque | `<couverture nuageuse>` | ✅ / 🟡 | Liste triée par nuages croissants ✅ ; `min` de la couverture nuageuse par maille ✅ (la valeur, pas l'image) ; `raw_geometry` de maille triée sur nuages puis `-<date>` (U3, clé hors gabarit, à valider par le round-trip) ; mosaïque 🔧 (U10) | Mosaïque harmonisée 🔴 |
| 38 | Couverture spatiale du catalogue | Emprises (polygones) + leur centroïde | 🟡 | `count` d'emprises par maille, agrégé sur le centroïde (D16) ; emprises en `line` à grande échelle ; si une `<clé de tuile de référence>` existe : `cardinality` = nombre de tuiles couvertes ✅ | Un grand polygone compte dans une seule maille ; union des emprises, taux de couverture, zones blanches 🔴 |
| 39 | Autres métadonnées d'acquisition | Mesures et dimensions d'acquisition | ✅ | `histogram` (angles, résolution), `powerbars` (capteur, niveau), `min` / `max` par maille | — |

## 9. Statistiques appliquées (Analyses 40–48)

| # | Analyse | Précondition (rôles) | Statut | Mise en œuvre / repli ARLAS | Limite à signaler |
|---|---|---|---|---|---|
| 40 | Tendance centrale robuste | Mesure | 🟡 | `histogram` + `metric` `avg`, `min`, `max` ; ratio de sommes par `function` | Médiane, IQR 🔴 (D1) |
| 41 | Transformations (log…) | Mesure | 🟡 | Arrêts de couleur en progression géométrique | Histogramme linéaire seulement (D11) |
| 42 | Corrélation | Deux mesures | 🟡 | Sélection d'une plage d'une mesure, lecture de la distribution de l'autre ; carte bivariée (R1 + R2) | Pas de coefficient ni de nuage de points |
| 43 | Concentration / Pareto | `<dimension>` | 🟡 | `powerbars` triés décroissants (top N) | Gini, part cumulée 🔴 |
| 44 | Contingence | Deux dimensions | 🟡 | `swimlane` (dimension × temps) ; `tree` à deux niveaux en `donut` à anneaux | Test d'indépendance 🔴 |
| 45 | Écart à la normale | Mesure | 🟡 | Queues de l'`histogram` sélectionnables ; `filters` `OUT_RANGE` | Score standardisé 🔴 |
| 46 | Seuils et percentiles | Mesure | ✅ | Arrêts de couleur fixes aux seuils (quantiles du profil) ; sélection d'intervalle | — |
| 47 | Échantillonnage / biais | Couche de l'effort d'observation (autre collection) | 🟡 | Couches côte à côte (U13) | Pas de normalisation par l'effort |
| 48 | Richesse contre volume | `<clé d'entité>` | 🟡 | `metric` `cardinality` et `count`, ratio événements / entité par `function` (U19) ✅ ; carte `count` H3 ✅ ; `cardinality` par maille ⚠️ (D8) | Ratio par maille 🔴 (D6) |

## 10. Mobilité, qualité des données, mise en page (Analyses 49–52, Règles G6–G7)

| # | Analyse ou règle | Précondition (rôles) | Statut | Mise en œuvre / repli ARLAS | Limite à signaler |
|---|---|---|---|---|---|
| 49 | Densité de passages (corridors) | `geo_point` multivalué échantillonné le long des géométries | ✅ / 🟡 | U18 : comptage par maille H3 = nombre de documents qui traversent la maille ✅ ; sans ce champ : lignes très transparentes (lecture visuelle) 🟡 | Compte des documents, pas des entités (D16) ; si le `geo_point` est déjà quantifié (géohash), une maille plus fine que sa précision crée des artefacts ; comptage normalisé linéaire (D3) |
| 50 | Forme des trajectoires | `<indice de forme>` existant | ✅ / 🔴 | `histogram`, couleur `interpolate`, `avg` par modalité dans `metricstable` ; boucles lisibles par le filtrage croisé origine / destination | Sans indice 🔴 (D7) |
| 51 | Régularité de desserte | `<origine>` + `<destination>` + `<clé d'entité>` | 🟡 | U19 : ratio documents / entité, origine × destination filtrées, `swimlane` origine × temps, `metricstable` par origine | Intervalle entre départs 🔴 |
| 52 | Complétude et qualité | — | ✅ / 🟡 | Dimension : modalité « inconnue » visible dans `powerbars` et la liste, part par sélection + `metric` ✅ ; mesure : part de manquants non affichable (D18) ; période couverte par la timeline ✅ ; précision de position (G8) | Les valeurs nulles n'apparaissent pas comme une modalité |
| G6 | Projection et mesures | Géométrie | 🟡 | `aggType: h3` (aire quasi égale) | Surfaces et distances : champs existants seulement (D9) |
| G7 | Habillage de la carte | — | 🟡 | Légende native, échelle `displayScale` ; source et période dans les titres et noms de jeux | Pas de bloc « source » dédié |

## 11. Mobilité avancée (Analyses 53–62)

| # | Analyse | Précondition (rôles) | Statut | Mise en œuvre / repli ARLAS | Limite à signaler |
|---|---|---|---|---|---|
| 53 | Statistiques directionnelles | `<mesure CIRCULAR>` | 🟡 | `histogram` 0–360 ; palette circulaire (même couleur à 0 et 360) ; sélection d'un secteur | Rose, direction moyenne, variance circulaire 🔴 (D13) |
| 54 | Régimes d'une mesure de mouvement | `<mesure RATIO>` + `<dimension>` | ✅ / 🟡 | `histogram` croisé par le filtrage avec la dimension ✅ ; géométries colorées par la mesure ✅ ; `avg` par maille H3 ✅ ; `metricstable` `avg` par modalité ✅ ; profils par sélection croisée de plusieurs mesures 🟡 | Moyenne par document non pondérée ; classification 🔴 |
| 55 | Arrêts hors pôles | `<position des arrêts>` | 🟡 | Couches `feature-` sur les positions et tracés d'arrêt ; densité par `cluster-` si la position est un `geo_point` | Arrêts comptés par document si le champ est multivalué |
| 56 | Temps d'escale et budget-temps | `<durées d'arrêt>` | ✅ / 🟡 | `histogram` des durées ✅ ; `metricstable` par `<lieu>` avec `avg` ✅ ; part du temps en mouvement globale par `function` sur des sommes de durées 🟡 | Moyennes tirées par les longues durées (D1) |
| 57 | Cadence et zones d'ombre | `<classe de cadence>` ou `<nombre de positions>` + `<durée>` | ✅ / 🟡 | Répartition par classe de cadence ✅ ; positions par heure globales par `function` ✅ ; carte de cadence par classe filtrée 🟡 | Lacunes de signal 🔴 |
| 58 | Plausibilité cinématique | Mesures redondantes (deux sources d'une même grandeur, ou distance + durée) | 🟡 | Grandeur dérivée globale par `function` comparée à la moyenne mesurée ; deux `histogram` côte à côte ; bornes par `filters` `OUT_RANGE` | Écart par document 🔴 (D7) |
| 59 | Variable d'état | `<variable d'état>` + `<dimension>` | 🟡 | `histogram` par modalité ; sélection d'une plage puis répartition origine / destination | État relatif au maximum de l'entité 🔴 |
| 60 | Flux pondérés par la taille | `<taille>` + `<origine>` / `<destination>` | 🟡 | `metricstable` (`count`, `sum` de la taille) ; symboles proportionnels à la somme par maille | La taille n'est pas la charge |
| 61 | Réseau de lieux | `<origine>` + `<destination>` | 🟡 | Origine et destination filtrées l'une par l'autre ; degré d'un lieu = `cardinality` des destinations par origine (`metricstable`) ; symboles proportionnels origine / destination | Graphe, centralité, communautés 🔴 |
| 62 | Chaînage des documents d'une entité | `<clé d'entité>` + `<date>` | 🟡 | R5 ; liste filtrée sur une entité et triée par date ; lieux distincts par entité (`metricstable` par `<clé d'entité>`, `cardinality` de la destination) | Détection de circuits 🔴 |

---

## 12. Usages ARLAS éprouvés

À consulter avant de conclure qu'une analyse est 🔴 : ces combinaisons de briques répondent à des questions que les briques seules ne couvrent pas. Seuls ceux dont la précondition est remplie par la collection sont utilisables.

| Code | Usage | Précondition (rôles) | Configuration ARLAS | Statut |
|---|---|---|---|---|
| U1 | Origines et destinations | `<origine>` + `<destination>` géographiques | Deux couches `cluster-` sur les deux géométries, même grille, teintes distinctes, deux jeux de visualisation | ✅ |
| U2 | Taux d'occupation du sol | Polygones + `<surface>` | `cluster-` H3, `sum` de la surface, `fill` séquentiel : densité légitime car mailles d'aire égale | ✅ |
| U3 | Dernier état connu | Géométrie + `<date>` | `raw_geometry` de maille triée sur `-<date>` (clé hors gabarit, à valider par le round-trip) ; liste triée par date | ✅ |
| U4 | Récence ou première apparition | Géométrie + `<date>` | `max` (ou `min`) de la date par maille, lu par `["get", "<champ>_max_"]`, couleur interpolée avec des arrêts en epoch (millisecondes) tirés de la plage du profil ; étendue globale par `metric` `min` / `max` | ✅ |
| U5 | Richesse contre volume par maille | `<clé d'entité>` | Couche H3 `count` ✅ à côté d'une couche H3 `cardinality` ⚠️ (D8) ; chiffres globaux `cardinality` et `count` ✅ | 🟡 |
| U6 | Intensité par tronçon | Lignes segmentées + mesure, ou `<identifiant de tronçon>` | `line-color` sur la mesure ; ou `feature-metric-` avec `avg` par tronçon | ✅ |
| U7 | Réseau de capteurs multi-variables | `<identifiant de station>` + plusieurs mesures | Network Analytics par station ; un `visualisations_set` par variable, un seul actif | ✅ |
| U8 | Annotation et propagation | `<clé d'entité>` | Tagger 🔧 : écrit un champ, hors périmètre des agents | 🔧 |
| U9 | Veille de zone | Géométrie | Subscriptions 🔧 | 🔧 |
| U10 | Mosaïque d'images | Modèle d'URL de tuiles dans la collection | Tile service 🔧 ; `mapSources` est statique et non filtré | 🔧 |
| U11 | Boucle d'analyse externe | — | Export, traitement externe, ré-ingestion : hors périmètre des agents | 🔴 pour l'agent |
| U12 | Comparaison de périodes ou de scénarios | — | Signets de jeux de filtres ; échelles de couleur fixes (D2) | ✅ |
| U13 | Croisement multi-collections | Une autre collection | `additionalCollections` sur la timeline ; un contributeur `map` par collection | ✅ |
| U14 | Plus proche voisin | Géométrie | Tri `geodistance` de l'API 🔧 (non exposé dans le Builder) | 🔧 |
| U15 | Cloisonnement territorial | — | `partition-filter` 🔧 | 🔧 |
| U16 | Inspection visuelle d'objets | `<vignette>` / `<quicklook>` | Liste avec vignettes, quicklooks, survol lié à la carte, « Zoom to » | ✅ |
| U17 | Qualité d'un catalogue d'images | `<couverture nuageuse>` + emprises + `<date>` | Voir ci-dessous | ✅ / 🟡 |
| U18 | Densité de passages | `geo_point` multivalué échantillonné le long des géométries | `cluster-` sur ce champ, `aggType: h3` (D9), `aggregated_geometry: cell`, `fill` séquentiel sur `count_:normalized` (exploration de la vue) ou `count` à arrêts fixes (comparaison, D2) ; compte des documents (D16) | ✅ |
| U19 | Demande fragmentée | `<origine>` + `<destination>` + `<clé d'entité>` | `metric` `function` `m[1] > 0 ? m[0] / m[1] : 0` sur `count` et `cardinality` de la clé d'entité ; origine et destination filtrées l'une par l'autre ; `metricstable` par origine ; `swimlane` origine × temps | ✅ |

### U17 — Qualité d'un catalogue d'images (Analyses 35–39)

1. **Distribution et seuil** : `histogram` de `<couverture nuageuse>` (pas de 5 %) ; sélectionner 0–20 filtre la carte, la timeline et les widgets.
2. **Images exploitables** : couche `fill` d'une source `feature-` avec `filters` `RANGE` 0–20 et un contour (`metadata.stroke`, MAP-8), à côté d'une couche « toutes les images » en `line` neutre ; les deux couches ont des sources distinctes (`render_mode` ou géométrie différents).
3. **Nébulosité moyenne** : `cluster-` H3, `avg` de la couverture nuageuse, dégradé séquentiel. C'est un ratio : moyenne, jamais somme.
4. **Meilleure image par maille** : `min` de la couverture nuageuse (la valeur) ; l'emprise de cette image par `raw_geometry` triée sur la couverture nuageuse puis `-<date>` (U3).
5. **Revisite utile** : sélection 0–20 sur l'histogramme de l'étape 1, qui filtre la grille H3 `count` (D17) ; dire que des scènes adjacentes d'un même passage comptent plusieurs fois (D16).
6. **Cadence** : timeline et `swimlane` `<capteur>` × temps ; signets de saisons (U12).
7. **Choix** : liste triée par nuages croissants puis date, vignettes et quicklooks (U16).
8. **Limites** : nuages sur la scène et non sur la zone d'intérêt ; intervalle entre images exploitables, plus longue lacune et taux de couverture 🔴.

---

## 13. Index : question → analyse → réponse ARLAS

Point d'entrée rapide. Les réponses supposent la précondition remplie ; sinon, « non réalisable avec les données disponibles » et repli.

| Question type | Analyse(s) | Statut | Réponse ARLAS |
|---|---|---|---|
| Où se concentrent les documents ? | 6, 1 | 🟡 | Comptage par maille H3 pour mesurer ; heatmap pour l'aperçu (D10) |
| Ces concentrations sont-elles significatives ? Quelles zones sont anormalement fréquentées ? | 1, 5 (12, 48) | 🔴 calcul / 🟡 repli | Grille H3 « exploratoire », arrêts fixes pour comparer des zones (D2), distincts en global (D8), limite écrite (D14, D16) |
| Quelle zone est la plus touchée ? | B, A' | 🟡 | `powerbars` par dimension de zone ou maille H3 ; un taux seulement s'il existe ou en global (D6) |
| Combien de documents dans ce secteur ? | 17 | ✅ | Zone dessinée + `metric` |
| Quelle est la valeur moyenne ici ? | 7 | 🟡 | `avg` par maille H3 + `histogram` |
| Comment cela évolue-t-il ? | 19, 20 | ✅ / 🔴 | Timeline, `swimlane`, carte synchronisée ; tendance lue, non calculée |
| Quoi de neuf récemment ? | 24, 26 | 🟡 / ✅ | Sélection de période sur la timeline ; carte de récence (U4) |
| Combien d'entités distinctes ? | 13, 48 | ✅ / 🟡 | `metric` `cardinality` ; par maille ⚠️ (U5) |
| Par où passent-ils ? | 28, 49 | ✅ / 🟡 | Lignes `feature-` ; densité de passages (U18) si le champ existe |
| D'où partent-ils, où vont-ils ? | 29 | 🟡 | Couches origine / destination (U1) + origine et destination filtrées l'une par l'autre |
| Quelle entité est passée par ici ? | 33 | 🟡 | Filtre géographique (observations seulement) ; liste des entités par clé |
| Prévenez-moi si… | 34 | 🔧 | Subscriptions, hors tableau de bord |
| Où installer… ? | 2, 18 | 🟡 / 🔴 | Overlay booléen par les widgets |
| Qui est accessible en un temps donné ? | 9 | 🔴 | Zone dessinée, limite écrite |
| Cette valeur ou cette période est-elle anormale ? | 25, 45 | 🟡 | `histogram` + sélection des extrêmes ; pics de la timeline |
| Pourquoi ici ? | 11, 42 | 🔴 | Exploration bivariée par sélection croisée |
| Où et quand ai-je des images exploitables ? | 35, 36 | ✅ / 🟡 | U17 étapes 1, 3, 5, 6 |
| Quelle est la meilleure image sur ma zone ? | 37 | ✅ / 🟡 | U17 étapes 4 et 7 |
| Quel est le dernier état connu ? | 26, 37 | ✅ | U3, liste triée par date |
| Quelle liaison renforcer ? | 29, 49, 51, 48 | 🟡 | U18 + U1 + U19 |
| Les trajets sont-ils directs ? | 50 | ✅ / 🔴 | Indice de forme s'il existe |
| Les données sont-elles fiables ? | 52, 47, 14 | ✅ / 🟡 | Part des inconnus, période couverte, effectifs affichés |

---

## Annexe (référence, non utilisée pour la génération)

### Pistes d'évolution d'ARLAS

Ce qui ferait passer des analyses de 🔴 / 🟡 à ✅ : expressions étendues dans le Builder (`step`, `sqrt`, `case`, arithmétique) ; ratio de deux métriques par maille et division par l'aire ; agrégation sur polygones de référence ; médiane et percentiles ; agrégation jour × heure ; comparaison N / N-1 sur la timeline ; cumuls et moyennes mobiles ; filtre et tri par distance dans le Builder ; statistiques de voisinage sur grille H3 ; Tagger et Subscriptions pilotés depuis le tableau de bord ; routage ; exposition dans le Builder de `timeShortcuts`, `spanning` et de la couleur sur `cardinality` ; conservation des arrêts non équidistants et des `*-sort-key` ; agrégation sur une paire de champs (`multi_terms`) ; grille d'aire égale par défaut.

### Sources consultées

- https://www.arlas.io/ et https://www.arlas.io/arlas-demo-io (démos publiques)
- https://docs.arlas.io/static_docs/arlas_dashboards/, https://docs.arlas.io/static_docs/concepts/, https://docs.arlas.io/static_docs/building_dashboard/
- Tutoriels : https://docs.arlas.io/external_docs/arlas_playground/
- API et services : https://docs.arlas.io/external_docs/ARLAS-server/arlas-api-exploration/, https://docs.arlas.io/external_docs/ARLAS-server/arlas-tile-service/, https://docs.arlas.io/external_docs/ARLAS-server/arlas-ogc/, https://docs.arlas.io/external_docs/ARLAS-tagger/arlas-api-tagging/, https://docs.arlas.io/external_docs/ARLAS-subscriptions/subscriptions/, https://docs.arlas.io/external_docs/aias/aias/, https://docs.arlas.io/external_docs/ARLAS-wui/arlas-wui-configuration/
- Code et schémas du Builder : `generative-ui/schemas/`, `config-export-helper.ts`, `config-map-export-helper.ts`, `map-import.service.ts`
