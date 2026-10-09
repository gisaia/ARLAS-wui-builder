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
| `arlas.web.contributors[type=resultlist].fieldsConfiguration` | `object` | `{ idFieldName, titleFieldName, tooltipFieldName, icon, urlImageTemplate, urlThumbnailTemplate, useColorService }` | Propriétés requises manquantes | Configuration des champs de la grille/liste de résultats. |
| `arlas.web.contributors[type=resultlist].columns` | `array<object>` | Définition des colonnes du tableau | Tableau vide | Colonnes affichées en mode table détaillée. |
| `arlas.web.components.mapgl` | `object` | Configuration de la carte MapLibre | `null` | Paramétrage du composant cartographique principal. |
| `arlas.web.components.mapgl.input.defaultBasemapStyle` | `object` | `{ name: string, styleFile: string\|object }` | Style invalide | Fond de carte par défaut (URL vers style vectoriel ou raster). |
| `arlas.web.components.timeline` | `object` | `{ contributorId: string, input: object, dateFormat: string }` | `contributorId` orphelin | Composant de navigation temporelle. |
| `arlas.web.components.detailedTimeline` | `object` | `{ contributorId: string, input: object, dateFormat: string }` | `contributorId` orphelin | Composant de timeline de détail zoomable. |
| `arlas.web.components.resultlists` | `array<object>` | Liste des composants table de résultats | Liste vide | Affichage des données attributaires sous forme de grille/cartes. |
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
6. **Proscription des Clés Dépréciées** :
   - Le type `chipssearch` est obsolète et remplacé par `search`.
   - La propriété `zoom_to_data` dans `options` est obsolète et remplacée par `zoom_to_strategy` (`"centroid"` ou `"bbox"`).

---

## 5. Guide du Validateur et des Schémas Autonomes

Le dossier `generative-ui/` contient une suite de validation complète et autonome :
- **`generative-ui/schemas/`** : L'ensemble des 20 métamodèles JSON Schema draft-06 nécessaires à la validation complète de l'application et de ses widgets.
- **`generative-ui/validate.js`** : Script exécutable Node.js implémentant la validation stricte RFC 8259, la compilation Ajv conforme à `ArlasStartupService.validateConfiguration`, la validation unitaire des contributeurs et le contrôle d'intégrité référentielle.

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

