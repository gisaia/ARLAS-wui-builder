# Guide de Compréhension de la Configuration ARLAS WUI

---

## 1. Introduction & Vue d'Ensemble

Ce document constitue la référence architecturale complète pour la modélisation, la génération et la validation des configurations de tableaux de bord **ARLAS WUI**.

Dans l'écosystème ARLAS, une application d'exploration visuelle et analytique repose sur deux fichiers de configuration complémentaires et découplés :
1. **`config.json`** : Configuration applicative globale (serveurs de données, contributeurs analytiques, bus de collaboration, composants graphiques, raccourcis de filtres, thèmes et options).
2. **`config.map.json`** : Spécification cartographique vectorielle basée sur le standard **MapLibre / Mapbox GL Style Specification**, enrichie des métadonnées de requêtage et de sélection ARLAS.

Ce découplage est orchestré dynamiquement au démarrage de l'application via le mécanisme modulaire **`extraConfigs`**.

---

## 2. Architecture et Cycle de Vie

### 2.1 Le Mécanisme de Découplage `extraConfigs`

Dans `config.json`, la configuration du composant cartographique (`arlas.web.components.mapgl.input.mapLayers`) déclare des tableaux vides pour `layers` et `externalEventLayers` :

```json
"mapLayers": {
  "layers": [],
  "events": { ... },
  "externalEventLayers": []
}
```

Le nœud racine `extraConfigs` spécifie à l'injecteur ARLAS Startup de remplacer ces tableaux par le contenu réel de `config.map.json` :

```json
"extraConfigs": [
  {
    "configPath": "config.map.json",
    "replacedAttribute": "arlas.web.components.mapgl.input.mapLayers.layers",
    "replacer": "layers"
  },
  {
    "configPath": "config.map.json",
    "replacedAttribute": "arlas.web.components.mapgl.input.mapLayers.externalEventLayers",
    "replacer": "external-event-layers"
  }
]
```

### 2.2 Hiérarchie des Métamodèles JSON Schema (Draft-06)

Le moteur de validation ARLAS compile l'arborescence des schémas officiels suivante :
- **`arlasconfig.schema.json`** : Métamodèle racine validant l'ensemble de l'application.
- **`rootContributorConf.schema.json`** : Schéma pivot pour les contributeurs, assurant l'unicité de `identifier`, le type, le nom et les modèles d'agrégation.
- **Schémas de contributeurs spécialisés** :
  - `mapContributorConf.schema.json`
  - `searchContributorConf.schema.json` (remplace `chipssearchContributorConf.schema.json`)
  - `histogramContributorConf.schema.json`
  - `detailedHistogramContributorConf.schema.json`
  - `swimlaneContributorConf.schema.json`
  - `treeContributorConf.schema.json`
  - `resultlistContributorConf.schema.json`
  - `computeContributorConf.schema.json` (alias metric)
  - `metricsTableContributorConf.schema.json`
  - `analyticsContributorConf.schema.json`
- **Schémas des composants graphiques (inputs)** :
  - `arlas-map.schema.json`
  - `histogram.schema.json`
  - `swimlane.schema.json`
  - `powerbars.schema.json`
  - `donut.schema.json`
  - `metric.schema.json`
  - `metrics-table.schema.json`
  - `resultlist.schema.json` (entrée du composant liste de résultats, voir §4 ter)

---

## 3. Tableau de Compréhension Structuré des Champs

| Clé / Chemin | Type | Valeurs autorisées | Valeurs interdites / Restrictions | Description & Rôle |
|---|---|---|---|---|
| `arlas` | `object` | Objet JSON | `null`, clé absente | Racine obligatoire de la configuration ARLAS. |
| `arlas.server.url` | `string` | URL HTTP/S valide ou variable `${ARLAS_SERVER_URL}` | Chaîne vide | Point d'entrée de l'API REST ARLAS Server. |
| `arlas.server.collection.name` | `string` | Nom de la collection par défaut (ex: `"demo_eo"`) | Chaîne vide | Collection principale interrogée par l'application. |
| `arlas.server.max_age_cache` | `integer` | Entier $\ge 0$ (ex: `3600`) | Flottants, nombres négatifs | Durée en secondes du cache HTTP client. |
| `arlas.web.contributors` | `array<object>` | Liste des contributeurs | Doublons d'`identifier` | Liste des opérateurs assurant la collaboration entre filtres et données. |
| `arlas.web.contributors[].identifier` | `string` | Chaîne unique non vide | Doublon dans la liste | Identifiant unique de bus du contributeur. |
| `arlas.web.contributors[].type` | `enum` | `"map"`, `"search"`, `"histogram"`, `"detailedhistogram"`, `"tree"`, `"swimlane"`, `"resultlist"`, `"metric"`, `"metricstable"` | `"chipssearch"` (déprécié) | Typologie de contributeur. |
| `arlas.web.contributors[].name` | `string` | Libellé utilisateur | Chaîne vide | Nom affiché dans l'interface et les infobulles. |
| `arlas.web.contributors[].collection` | `string` | Nom d'une collection valide | Collection inexistante | Collection Elasticsearch/OpenSearch ciblée. |
| `arlas.web.contributors[type=map].layers_sources` | `array<object>` | Descripteurs de sources cartographiques | Tableau vide si carte active | Définition des requêtes spatiales vers le serveur. |
| `arlas.web.contributors[type=map].layers_sources[].render_mode` | `enum` | `"window"`, `"wide"` | Présent sur un cluster | Mode de rendu des entités (fenêtré sur l'emprise courante ou étendu). |
| `arlas.web.contributors[type=map].layers_sources[].returned_geometry` | `string` | Nom du champ géométrique (point/forme) | Présent sur un cluster | Champ géométrique de l'entité retournée par le serveur. |
| `arlas.web.contributors[type=map].layers_sources[].agg_geo_field` | `string` | Champ géométrique | Présent en mode features | Champ supportant le maillage de geo-agrégation. |
| `arlas.web.contributors[type=map].layers_sources[].aggType` | `enum` | `"tile"`, `"h3"` | Autres valeurs | Algorithme de pavage spatial (tuiles standards ou cellules hexagonales H3). |
| `arlas.web.contributors[type=map].layers_sources[].granularity` | `enum` | `"Coarse"`, `"Medium"`, `"Fine"`, `"Finest"` | Présent en mode features | Densité et échelle du partitionnement spatial. |
| `arlas.web.contributors[type=map].layers_sources[].aggregated_geometry` | `enum` | `"bbox"`, `"centroid"`, `"cell"`, `"cell_center"`, `"geohash"`, `"geohash_center"` | Présent en mode features | Géométrie synthétique calculée pour représenter la cellule agrégée. |
| `arlas.web.contributors[type=search].search_field` | `string` | Champ texte indexé | Champ inexistant | Champ cible de la recherche plein texte. |
| `arlas.web.contributors[type=histogram].isOneDimension` | `boolean` | `true`, `false` | Non-booléen | Définit si l'histogramme est 1D (compte) ou 2D (métrique agrégée). |
| `arlas.web.contributors[type=histogram].aggregationmodels` | `array<object>` | Modèles d'agrégation temporelle/numérique | Tableau vide | Définit les intervalles, buckets et métriques de l'histogramme. |
| `arlas.web.contributors[type=detailedhistogram].annexedContributorId` | `string` | `identifier` d'un contributeur `histogram` existant | Id absent ou d'un autre type | Identifiant de l'histogramme parent (timeline principale). |
| `arlas.web.contributors[type=swimlane].swimlanes` | `array<object>` | Modèles de couloirs temporels | Tableau vide | Configuration des séries temporelles empilées. |
| `arlas.web.contributors[type=tree].aggregationmodels` | `array<object>` | Modèles de terme hiérarchiques | Tableau vide | Niveaux d'arborescence (ex: Plateforme -> Capteur). |
| `arlas.web.contributors[type=resultlist].fieldsConfiguration` | `object` | `{ idFieldName, titleFieldNames[1], tooltipFieldNames[1], iconColorFieldName, useHttpQuicklooks, useHttpThumbnails, displayQuicklookOnMap, urlThumbnailTemplate, urlImageTemplates[], detailsTitleTemplate }` | `idFieldName` différent de l'`id_path` de la collection ; plus d'un élément dans `titleFieldNames` / `tooltipFieldNames` (seul le premier est conservé) | Configuration des champs de la liste, de la grille et des quicklooks (R6, §4 ter). |
| `arlas.web.contributors[type=resultlist].columns` | `array<object>` | `{ columnName, fieldName, dataType, process, useColorService, sort: "asc"\|"desc"\|"" }` (au moins 1) | Tableau vide (aucune vue liste) ; `process` refusé par `validProcess` | Colonnes de la vue liste (R1–R3, §4 ter). |
| `arlas.web.contributors[type=resultlist].options` | — | — | **Interdit** : jamais exporté par le Builder sur le contributeur | Les options d'affichage vont dans `components.resultlists[].input.options` (R9). |
| `arlas.web.components.mapgl` | `object` | Configuration de la carte MapLibre | `null` | Paramétrage du composant cartographique principal. |
| `arlas.web.components.mapgl.input.defaultBasemapStyle` | `object` | `{ name: string, styleFile: string\|object }` | Style invalide | Fond de carte par défaut (URL vers style vectoriel ou raster). |
| `arlas.web.components.timeline` | `object` | `{ contributorId: string, input: object, dateFormat: string }` | `contributorId` orphelin | Composant de navigation temporelle. |
| `arlas.web.components.detailedTimeline` | `object` | `{ contributorId: string, input: object, dateFormat: string }` | `contributorId` orphelin | Composant de timeline de détail zoomable. |
| `arlas.web.components.resultlists` | `array<object>` | `{ componentType: "resultlist", contributorId, uuid, usage, input }`, `input` validé par `resultlist.schema.json` | `input.id` ≠ `contributorId` ; `hasListView` ou `defaultMode` absents | Table de données principale : liste, grille ou cartes (C1–C11, §4 ter). |
| `arlas.web.analytics` | `array<object>` | Groupes de widgets analytics | Groupe vide | Panneau latéral contenant les graphiques, camemberts et tables. |
| `arlas.web.analytics[].groupId` | `string` | Chaîne unique par groupe | Doublon | Identifiant de groupe pour l'agencement en ligne. |
| `arlas.web.analytics[].components[].contributorId` | `string` | `identifier` d'un contributeur existant | Référence inexistante | Clé de liaison bidirectionnelle vers le contributeur de données. |
| `arlas.web.analytics[].components[].componentType` | `enum` | `"histogram"`, `"powerbars"`, `"swimlane"`, `"resultlist"`, `"donut"`, `"metric"`, `"metricstable"` | Valeur inconnue | Type visuel de rendu du widget. |
| `arlas.web.options.zoom_to_strategy` | `enum` | `"centroid"`, `"bbox"` | `"zoom_to_data"` (déprécié) | Stratégie de recadrage cartographique automatique lors des sélections. |
| `arlas.web.options.drag_items` | `boolean` | `true`, `false` | Non-booléen | Autorise le glisser-déposer / réorganisation des widgets analytics. |
| `extraConfigs` | `array<object>` | Paires `{ configPath, replacedAttribute, replacer }` | Chemins inexistants | Règles de substitution externe pour charger `config.map.json`. |
| `config.map.json -> layers` | `array<object>` | Couches de style vectoriel MapLibre | Types non conformes MapLibre | Style graphique des entités et agrégations spatiales. |
| `config.map.json -> layers[].id` | `string` | Format `arlas_id:*`, `arlas-select-*`, `arlas-hover-*`, `arlas-fill_stroke-*`, `scrollable_*` | Doublon d'id de couche | Identifiant unique de couche vectorielle. |
| `config.map.json -> layers[].source` | `string` | Doit correspondre à une source déclarée dans `map.layers_sources` | Source inexistante | Source de tuiles ou GeoJSON alimentée par ARLAS. |
| `config.map.json -> external-event-layers` | `array<object>` | Objets `{ id: string, on: "hover" \| "select" }` | `id` absent de `layers` | Couches cibles pour les effets de survol et de sélection graphique. |

---

## 4. Règles d'Interdiction et Invariants Stricts

1. **Unicité des Identifiants (`uniqueItemProperties: ["identifier"]`)** :
   Chaque contributeur dans `arlas.web.contributors` doit avoir un `identifier` rigoureusement unique. Deux contributeurs ne peuvent jamais partager le même identifiant.
2. **Intégrité Référentielle des Composants Analytics** :
   Chaque élément de `arlas.web.analytics[].components[].contributorId` **DOIT** correspondre à un `identifier` existant dans `arlas.web.contributors`. Aucun widget ne peut être orphelin.
3. **Hiérarchie Obligatoire de la Timeline Détaillée** :
   Le contributeur `detailedhistogram` doit définir un `annexedContributorId` pointant impérativement vers un contributeur existant de type `histogram` (la timeline principale).
4. **Exclusion Mutuelle Cartographique** :
   - Les propriétés `returned_geometry` et `render_mode` sont réservées exclusivement aux couches de type `features`.
   - Les propriétés `agg_geo_field`, `aggType`, `granularity`, `aggregated_geometry` et `minfeatures` sont réservées exclusivement aux couches de type `cluster`.
5. **Couplage Cartographique et Événements Externes** :
   - Chaque source de données déclarée dans `arlas.web.contributors[type=map].layers_sources` doit posséder au moins une couche correspondante dans `config.map.json.layers`.
   - Tout identifiant déclaré dans `config.map.json.external-event-layers[].id` doit obligatoirement être présent dans `config.map.json.layers`.
6. **Invariants Anti-Crash & Préfixes de Couches Cartographiques** :
   - **Préfixe des identifiants (`id`)** : Chaque couche cartographique DOIT impérativement débuter par `arlas_id:<Nom>:<cle_unique>` pour éviter le déclenchement intempestif de migrations legacy dans le builder.
   - **Préfixe des sources (`source`)** : Chaque source déclarée dans `layers_sources` et `config.map.json.layers` DOIT obligatoirement débuter par `feature-`, `cluster-` ou `feature-metric-`. Le moteur Angular s'appuie sur ce préfixe pour déduire le formulaire de style (`LayerMode`).
   - **Objets d'initialisation de la carte** : `initCenter` (ex: `[-4, 48]`), `initZoom`, `visualisations_sets: []` et `basemapStyles: []` sont obligatoires dans `mapgl.input` pour éviter des `TypeError: Cannot read properties of undefined (reading '1')` ou `(reading 'forEach')`.
   - **Recherche & Affichage** : `arlas-wui.web.app.components.chipssearch` (`{ name, icon }`) est requis pour initialiser la barre de recherche. Pour les listes de résultats, `input.options` (complet) est requis sur le **composant**, jamais sur le contributeur (voir §4 ter).
7. **Proscription des Clés Dépréciées** :
   - Le type `chipssearch` dans les contributeurs est obsolète et remplacé par `search`.
   - La propriété `zoom_to_data` dans `options` est obsolète et remplacée par `zoom_to_strategy` (`"centroid"` ou `"bbox"`).
8. **Invariants Swimlane & Résolution d'Identifiant Canonique (`dataType`)** :
   - Pour tout widget analytique de type `swimlane` ou `histogram`, le champ `"dataType": "time"` (ou `"numeric"`) est **obligatoire** dans l'objet `input`.
   - L'omission de `dataType` conduit le Builder à classifier la donnée en `numeric`, ce qui fausse le calcul interne de l'identifiant canonique (`-numeric-` au lieu de `-time-`) et provoque l'exception `Given contributorId [...] does not match any registered contributor`.
   - Chaque couloir dans `swimlane.swimlanes` doit déclarer `xAxisField`, `termField`, `jsonpath: "$.count"` et `useUtc: true`.
9. **Invariants Rendu SVG & Dimensions de Graphe (`chartWidth`, `barWeight`)** :
   - Tout composant `histogram` ou `swimlane` dans `analytics` doit impérativement déclarer `"chartWidth": 445` (ou 217 si itemPerLine=2), `"chartHeight": 120` et `"barWeight": 0.8`.
   - L'omission de `chartWidth` ou `barWeight` conduit le moteur D3 (`AbstractSwimlane.js` / `AbstractHistogram.js`) à évaluer `+this.histogramParams.chartWidth` en `NaN`, rendant les échelles temporelles et les largeurs de bandes invalides et provoquant l'erreur SVG console `Error: <rect> attribute width: Expected length, "NaN"`.
10. **Dimensions Obligatoires pour Tous les Types de Widgets Analytics** :
   - **`powerbars`** : `"chartWidth": 445` (ou `217` si `itemPerLine=2`).
   - **`donut`** : `"diameter": 170` (ou `180`) et `"containerWidth": 223` (ou `260`).
   - **`resultlist`** : `tableWidth` 445 / 217 / 143 selon `itemPerLine`, `input.id` = `contributorId`, `hasListView`, `defaultMode` et `options` complet (voir §4 ter).
   - **`metric`** : `"id"` non vide, avec mise en forme optionnelle (`valuePrecision`, `afterValue`).



---

## 4 bis. Structure du Panneau Analytics et de la Timeline

Sources : `AnalyticsBoardComponent`, `WidgetComponent` et `AnalyticsService.initializeGroups` (`arlas-wui-toolkit`) ; `ConfigExportHelper.getTimelineComponent` et l'export de `options.tabs` (Builder).

### Onglets
- Un onglet est défini par le champ `tab` des groupes et décrit dans `arlas.web.options.tabs[] { name, icon, showIcon, showName }` (exporté par le Builder).
- Si `options.tabs` est **absent**, la WUI passe en mode de rétrocompatibilité : chaque onglet reçoit l'icône `short_text`, sans nom affiché (onglets indiscernables).
- Si `options.tabs` est **présent**, un onglet utilisé par un groupe mais **absent de la liste est masqué**.
- Règle : déclarer chaque valeur de `group.tab` dans `options.tabs`, avec une icône distincte et `showIcon: true`, `showName: true`.

### Groupes et titres
Le panneau affiche, pour chaque groupe, un panneau dépliant dont l'en-tête est `group.icon` + `group.title`. **Le champ `title` d'un composant n'est jamais affiché.** Le titre visible de chaque widget vient de :

| Widget | Titre affiché |
|---|---|
| `histogram`, `swimlane` | `input.chartTitle` |
| `powerbars` | `input.powerbarTitle` |
| `donut` | nom du contributeur (`name`) |
| `metric`, `metricstable`, `resultlist` | **aucun** : seul `group.title` les nomme |

Règle : **un indicateur `metric` (ou une `metricstable`, ou une `resultlist`) par groupe**, avec un `group.title` qui le nomme. Si plusieurs indicateurs doivent cohabiter, leur libellé passe par `input.beforeValue` / `input.afterValue`. Entrée `metric` exportée par le Builder : `customizedCssClass`, `shortValue`, `valuePrecision`, `chartWidth` (445, 217 ou 143), `beforeValue` / `afterValue` facultatifs (le schéma local exige aussi `id`, à mettre égal à `contributorId`).

### Timeline (`components.timeline` / `components.detailedTimeline`)
L'export du Builder fournit toujours le bloc complet ci-dessous. Sans `dataType: "time"`, `barWeight` ou `chartHeight`, la timeline s'affiche **sans barres** (axe numérique, largeurs ou hauteurs à `NaN`).

```json
"timeline": {
  "contributorId": "timeline", "componentType": "histogram", "uuid": "timeline_uuid",
  "input": {
    "id": "histogram-timeline", "dataType": "time", "chartType": "bars", "chartTitle": "Timeline",
    "chartHeight": 128, "chartWidth": null, "barWeight": 0.8,
    "customizedCssClass": "arlas-timeline", "isHistogramSelectable": true, "multiselectable": true,
    "brushHandlesHeightWeight": 0.8, "topOffsetRemoveInterval": 10,
    "ticksDateFormat": "%d/%m/%Y %H:%M", "valuesDateFormat": "%d/%m/%Y %H:%M",
    "xTicks": 9, "yTicks": 2, "xLabels": 9, "yLabels": 2, "xUnit": "", "yUnit": "", "chartXLabel": "", "shortYLabels": false,
    "xAxisPosition": "bottom", "descriptionPosition": "top", "yAxisStartsFromZero": true,
    "showXTicks": true, "showYTicks": true, "showXLabels": true, "showYLabels": true,
    "showHorizontalLines": false, "isSmoothedCurve": true
  }
}
```

Pour `detailedTimeline` : `id: "histogram-detailed-timeline"`, `customizedCssClass: "arlas-detailed-timeline"`, `chartHeight: 60`, `xTicks`/`xLabels` à 5, `xAxisPosition: "top"`, `descriptionPosition: "bottom"`, `multiselectable: false`, sans `topOffsetRemoveInterval`. Côté contributeurs : la timeline accepte `interval` **ou** `numberOfBuckets` ; la timeline détaillée n'utilise que `numberOfBuckets` (le Builder n'exporte jamais d'`interval` pour elle).

---

## 4 ter. Liste de Résultats (data table) : règles extraites du code du Builder

Sources :
- export : `ConfigExportHelper.getResultListContributors`, `getAnalyticsComponent`, `getContributorId` dans `src/app/services/main-form-manager/config-export-helper.ts` ;
- import : `ResultListImportService` et `ResultListInputsFeeder` / `AnalyticsResultListInputsFeeder` dans `src/app/utils/resultListInputsFeeder.ts` ;
- formulaires : `ResultlistFormBuilderService` ;
- exécution : `ResultListContributor` et `validProcess` (`arlas-web-contributors`).

Schémas : `resultlistContributorConf.schema.json` (contributeur officiel), `resultlist.schema.json` (entrée du composant, nouveau), `resultlist-contributor-rules.schema.json` et `resultlist-rules.schema.json` (règles du Builder). Les règles qui croisent plusieurs objets (C1, C2, C6, C11) sont contrôlées par `validate.js`, section 4.bis et section 5.

### Deux emplacements possibles (C11)

| Emplacement | Rôle | Import par le Builder |
|---|---|---|
| `arlas.web.components.resultlists[]` | **Table de données principale** du tableau de bord | Complet (`ResultListImportService`) : titre, icône, `showName`, vue grille, tri des colonnes, détails, cartes, quicklooks |
| `arlas.web.analytics[].components[]` (`componentType: "resultlist"`) | Petite table dans un onglet d'analytics | Réduit (`AnalyticsResultListInputsFeeder`) : ni vue grille, ni icônes, ni **tri des colonnes** |

La table principale se déclare dans `components.resultlists`. Une table dans un onglet d'analytics est techniquement rendue par la WUI, mais **à éviter quand elle reprend les documents de la liste principale** : la requête et l'affichage sont doublés, pour une version appauvrie (ni grille, ni icônes, ni tri). Si elle est vraiment nécessaire, elle utilise un contributeur distinct (sinon l'identifiant canonique est en double à l'export). `critique.js` signale ce cas (DUP-2).

### Contributeur `type: "resultlist"`

| # | Règle |
|---|---|
| R1 | `columns` : au moins 1 colonne. Sans colonne, `hasListView` est faux et la table ne s'affiche pas. |
| R2 | Colonne : `columnName` et `fieldName` requis ; `dataType` = unité affichée (facultatif) ; `useColorService` booléen ; `sort` ∈ `"asc"`, `"desc"`, `""`. |
| R3 | `process` (colonnes, détails, cartes, titre, infobulle) : expression JS sur la variable `result`, < 250 caractères, sans `document`, `window`, `eval`, `localStorage`, `this` ni `function`/`Function`. Seuls `Math`, `Date`, `Number`, les méthodes `String` / `Array` et l'arithmétique sont autorisés. Exemple : `"Math.round(result / 360) / 10"`. |
| R4 | `search_size` : entre 50 et 500, pas de 10 dans le Builder. À l'import, une valeur < 50 est remontée à 50. Défaut à l'exécution : 100. |
| R5 | `max_pages` (défaut 3 à l'exécution) **n'est pas exporté** par le Builder : il est perdu après un round-trip. |
| R6 | `fieldsConfiguration` : `idFieldName` = `id_path` de la collection (rempli automatiquement depuis `_describe`) ; `titleFieldNames` / `tooltipFieldNames` : **un seul élément** conservé ; `iconColorFieldName` ; `useHttpQuicklooks`, `useHttpThumbnails` (défaut `false`) ; `displayQuicklookOnMap { enabled, boundsFieldName }` ; `urlThumbnailTemplate`, `detailsTitleTemplate` facultatifs ; `urlImageTemplates[] { url, description, filter?: { field, values[] } }` (l'ancien `urlImageTemplate` est converti à l'import). |
| R7 | `details[] { name, order, fields[] { label, path, process } }` : au moins 1 champ par section ; `order` est renuméroté (index + 1) à l'export ; champs de type numérique, date ou texte. |
| R8 | `cardViewProperties[] { fieldName, lineNumber, prettyName, icon, dataType, process, isTitle, sort }`, regroupés par `lineNumber`. Le mode carte n'existe que si ce tableau est non vide. |
| R9 | `includeMetadata: []` toujours exporté. **Aucune clé `options` sur le contributeur.** |
| R10 | Le Builder réexporte l'identifiant canonique `<collection>-<idFieldName>-<searchSize>-<colonne1>-…-<détail1>-…` (exemple réel : `courses-track.id-100-dedzd-`). Un identifiant libre fonctionne, mais il change après un passage dans le Builder. |

### Composant (entrée `input`)

| # | Règle |
|---|---|
| C1 | `input.id` = `contributorId` (le Builder exporte `id: contributorId`). |
| C2 | Les trois indicateurs de vue sont **obligatoires** (booléens, `false` si la vue n'est pas utilisée) : `hasListView` = le contributeur a des colonnes ; `hasCardView` = `cardViewProperties` non vide ; `hasGridView` = vue grille activée (prérequis ci-dessous). |
| C3 | `defaultMode` ∈ `"list"`, `"grid"`, `"card"` (formats anciens `0`/`1`/`2` et coquille `defautMode` encore lus). `grid` exige `hasGridView`, `card` exige des cartes ; sinon le Builder force `list`. |
| C4 | `tableWidth` = 445 (1 widget par ligne), 217 (2) ou 143 (3), soit `ceil(445 / n) − 6`. Les valeurs 211 et 137 (ancien calcul `− 12`) sont encore reconnues. Dans `analytics`, cette valeur sert à retrouver `itemPerLine` à l'import. |
| C5 | `options` complet : `showActionsOnhover: "true"`, `showDetailIconName: "keyboard_arrow_down"`, `hideDetailIconName: "keyboard_arrow_up"`, `icon` (défaut `short_text`), `showName` et `showIcon` (défaut `true`). |
| C6 | `input.searchSize` = `search_size` du contributeur. |
| C7 | `displayFilters`, `isGeoSortActived`, `isExportEnabled` (export CSV) : booléens ; `cellBackgroundStyle` ∈ `filled`, `outlined`, utile seulement si une colonne a `useColorService: true`. |
| C8 | `visualisationsList[] { name, description, default, dataGroups[] { name, protocol, visualisationUrl, filters } }`, `visualisationLink`, `downloadLink` : facultatifs. |
| C9 | Transmis tels quels par le Builder (non éditables) : `globalActionsList`, `nLastLines`, `detailedGridHeight`, `nbGridColumns`, `isBodyHidden`, `isAutoGeoSortActived`, `selectedItemsEvent`, `consultedItemEvent`, `actionOnItemEvent`, `globalActionEvent`. |
| C10 | `usage` ∈ `"analytics"`, `"shortcuts"`, `"both"` ; `uuid` libre. |

### Activer la vue grille ou la vue carte

Les trois vues se combinent : l'utilisateur bascule entre celles dont l'indicateur vaut `true`, et `defaultMode` choisit celle affichée au démarrage. Une vue non utilisée garde son indicateur à `false`.

| Vue | Indicateur (composant) | Propriétés à renseigner (contributeur) | `defaultMode` |
|---|---|---|---|
| Liste (table) | `hasListView: true` | `columns[]` (au moins 1) | `"list"` |
| Grille (tuiles) | `hasGridView: true` | `fieldsConfiguration.titleFieldNames[0]` (titre de la tuile), `tooltipFieldNames[0]` (infobulle), `iconColorFieldName` (couleur), **`urlThumbnailTemplate`** (image de la tuile, sinon tuiles sans image) ; facultatif : `urlImageTemplates[]` (quicklooks plein écran), `useHttpThumbnails` / `useHttpQuicklooks` | `"grid"` |
| Cartes | `hasCardView: true` | `cardViewProperties[]` non vide : `{ fieldName, prettyName, lineNumber }` obligatoires ; `icon`, `dataType` (unité), `process`, `isTitle`, `sort` facultatifs. Chaque `lineNumber` distinct forme une ligne de la carte | `"card"` |

Exemple côté contributeur (vue grille et vue carte) :

```json
"fieldsConfiguration": {
  "idFieldName": "object_id",
  "titleFieldNames": [{ "fieldPath": "type_id", "process": "" }],
  "tooltipFieldNames": [{ "fieldPath": "object_id", "process": "" }],
  "iconColorFieldName": "type_id",
  "urlThumbnailTemplate": "https://storage.example.org/thumbnails/{object_id}.jpg",
  "urlImageTemplates": [{ "url": "https://storage.example.org/images/{image_number}.jpg", "description": "Image source" }],
  "useHttpQuicklooks": false, "useHttpThumbnails": false,
  "displayQuicklookOnMap": { "enabled": false, "boundsFieldName": "" }
},
"cardViewProperties": [
  { "fieldName": "object.name", "prettyName": "Navire", "lineNumber": 0, "icon": "directions_boat", "dataType": "", "process": "", "isTitle": true, "sort": "" },
  { "fieldName": "track.dynamics.gps.speed_nd", "prettyName": "Vitesse", "lineNumber": 1, "icon": "speed", "dataType": "nd", "process": "Math.round(result * 10) / 10", "isTitle": false, "sort": "" }
]
```

Côté composant : `"hasListView": true, "hasGridView": true, "hasCardView": true, "defaultMode": "grid"`.

### Gabarit minimal conforme (format d'export du Builder)

```json
{
  "componentType": "resultlist",
  "contributorId": "resultlist_courses",
  "uuid": "resultlist_courses_uuid",
  "usage": "analytics",
  "input": {
    "id": "resultlist_courses",
    "tableWidth": 445, "searchSize": 50,
    "hasListView": true, "hasCardView": false, "hasGridView": false, "defaultMode": "list",
    "displayFilters": false, "isGeoSortActived": false, "isExportEnabled": false, "useColorService": true,
    "nLastLines": 3, "detailedGridHeight": 300, "nbGridColumns": 3, "isBodyHidden": false,
    "globalActionsList": [], "visualisationsList": [], "downloadLink": "",
    "options": {
      "showActionsOnhover": "true", "showDetailIconName": "keyboard_arrow_down",
      "hideDetailIconName": "keyboard_arrow_up", "icon": "table_chart",
      "showName": true, "showIcon": true
    }
  }
}
```

---

## 5. Guide du Validateur et des Schémas Autonomes

Le dossier `generative-ui/` contient une suite de validation complète et autonome :
- **`generative-ui/schemas/`** : Les 21 métamodèles JSON Schema draft-06 officiels (validation de l'application et de ses widgets, dont `resultlist.schema.json`) et 20 schémas `*-rules.schema.json` (règles du Builder, utilisés par `scripts/config-rules-applier.ts`).
- **`generative-ui/validate.js`** : Script exécutable Node.js implémentant la validation stricte RFC 8259, la compilation Ajv conforme à `ArlasStartupService.validateConfiguration`, la validation unitaire des contributeurs et le contrôle d'intégrité référentielle.

### Critique analytique (`generative-ui/critique.js`)

`validate.js` vérifie la **conformité technique** (schémas, références, invariants du Builder). `critique.js` vérifie la **cohérence analytique** à partir du profil de la collection (exemple : `generated/courses.profile.json`, qui donne pour chaque champ sa nature, sa cardinalité, son unité et ses statistiques). Le code de sortie vaut 1 s'il reste au moins une ERREUR.

| Code | Sévérité | Contrôle |
|---|---|---|
| AGG-1 | Alerte | `interval` et `numberOfBuckets` définis ensemble (le Builder ne garde que `numberOfBuckets`) |
| AGG-2 / AGG-3 | Alerte | Nombre de classes d'un histogramme (10–50) ou de barres d'une timeline (50–100) inadapté à la plage des données |
| AGG-4 | Conseil | Agrégation `term` ou swimlane limitée à un top N inférieur à la cardinalité |
| SEM-11 | Erreur | `sum` d'un ratio |
| SEM-12 | Alerte | `avg` d'un stock très asymétrique (moyenne > 2 × médiane) |
| SEM-10 | Erreur | Donut sur plus de 7 modalités |
| SEM-01 / SEM-05 / SEM-06 / SEM-07 / SEM-15 | Erreur / alerte | Aplat sur un stock brut, plus de 7 couleurs qualitatives, dégradé sur un nominal, palette non monotone, plus de 2 couches thématiques visibles |
| MAP-1 / MAP-2 / MAP-3 | Erreur / alerte | Arrêts non croissants, arrêts hors de la plage réelle du champ, couche absente de tout jeu de visualisation |
| COL-1 / COL-2 / COL-3 | Alerte | Couleurs indiscernables (ΔE CIE76) entre couches visibles ensemble ou dans un même `match`, couleur différente entre la carte et `colorGenerator.keysToColors` |
| UNIT-1 / UNIT-2 | Alerte / conseil | Valeur en unité brute (`_s`, `_m`) dans un tableau de métriques, unité affichée différente de celle du profil |
| MET-1 / MET-2 | Erreur / conseil | `m[i]` inexistant dans une `function`, division par une métrique potentiellement nulle |
| FLD-1 / FLD-2 | Alerte / erreur | Champ absent du profil, champ toujours nul |
| DUP-1 | Alerte | Même widget présent dans plusieurs groupes |
| COV-1 | Conseil | Champ pertinent du profil exploité par aucune analyse |
| TITLE-1 | Alerte | Une variable affichée (ou le comptage des documents) n'est pas nommée dans le titre visible du widget |
| TITLE-2 | Alerte | Le titre du groupe annonce une variable qu'aucun widget du groupe n'affiche |
| TITLE-3 / TITLE-4 | Alerte | Agrégation annoncée mais non calculée, ou calculée mais non annoncée (moyenne, maximum, minimum, total, distincts), pour les indicateurs simples et les tableaux de métriques |
| TITLE-5 | Alerte | Top N inférieur à la cardinalité sans mention dans le titre |
| TITLE-6 | Alerte | Couche d'un jeu de visualisation dont la variable ou la géométrie n'est nommée ni par le jeu ni par la couche |
| TITLE-7 | Alerte | Titre visible de plus de 60 caractères (cible ≈ 55 : court et évocateur) |
| DUP-2 | Alerte | Deux listes de résultats sur la même collection dont les colonnes de l'une sont incluses dans l'autre |

Les règles TITLE s'appuient sur les **libellés** du profil : pour chaque champ, `labels` liste les mots du langage courant qui le désignent (ex. `track.dynamics.gps.speed_nd` → « vitesse » ; `object.ship_type` → « type de navire », « type »), et `documentLabels` nomme les documents (« parcours »). Le titre visible est celui que la WUI rend : `group.title` plus `input.chartTitle` (histogramme, swimlane), `input.powerbarTitle` (powerbars) ou le nom du contributeur (donut). Le sens d'un titre (sur-promesse, ambiguïté) reste à juger par la relecture (`CRITIC_PROMPT.md`).

```bash
node generative-ui/critique.js generative-ui/generated/courses.config.json generative-ui/generated/courses.config.map.json generative-ui/generated/courses.profile.json
```

La critique automatique est complétée par une critique raisonnée de l'agent (couverture des besoins, justesse statistique, lisibilité, cohérence visuelle, limites) : voir la Phase 5 de `AGENT_PROMPT.md`.

### Relecture indépendante (`generative-ui/CRITIC_PROMPT.md`)

Prompt système d'un agent critique distinct du générateur. À partir du besoin de l'utilisateur, du profil, de la configuration et de la sortie de `critique.js`, il :
- dresse l'inventaire des analyses ;
- note cinq axes de 0 à 4 : pertinence de l'analyse spatiale (25 %), sémiologie graphique (20 %), justesse statistique (25 %), pertinence des graphiques (15 %), analyse temporelle (15 %) ;
- classe chaque constat (CRITIQUE, MAJEUR, MINEUR, SUGGESTION), avec son chemin JSON et sa référence dans `SPATIAL_RECIEPE.md` (Patterns, Recettes, Analyses 1–48, Règles G1–G5) ;
- distingue défaut de conception, limite ARLAS et choix discutable ;
- rend un verdict (ACCEPTÉ / À CORRIGER / REFUSÉ) avec un bloc JSON exploitable automatiquement.

### Exécution du script de validation :

```bash
# Valider les fichiers par défaut de generative-ui/
node generative-ui/validate.js

# Valider des fichiers spécifiques
node generative-ui/validate.js path/to/config.json path/to/config.map.json
```

---

## 6. Prompt Système pour Agent Autonome (`generative-ui/AGENT_PROMPT.md`)

Le fichier [`AGENT_PROMPT.md`](./AGENT_PROMPT.md) fournit le Master Prompt complet permettant à un LLM ou agent autonome de concevoir de bout en bout des visualisations complètes à partir d'une requête utilisateur et d'un schéma d'index Elasticsearch/OpenSearch.

