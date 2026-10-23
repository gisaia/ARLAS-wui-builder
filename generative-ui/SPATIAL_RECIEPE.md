
1. Les Patterns de Transformation (Feature Engineering Spatial)

Avant de cartographier, l'IA doit savoir croiser les variables pour créer des indicateurs géographiques pertinents.

Pattern A : La Normalisation par la Surface (La Densité)

• Données en entrée : Une couche de polygones contenant une variable de décompte absolu (ex: Population) + la géométrie de la zone.
• Transformation requise : Calculer l'aire (\(m^{2}\) ou \(km^{2}\)) de chaque polygone et diviser la variable par cette surface.
• Exemple concret : Population / Superficie (km²) = Densité de population au mètre carré ou kilomètre carré.
• Règle d'or : Évite l'effet visuel trompeur où les grands polygones vides semblent "peser" plus lourd que les petits polygones densément peuplés.

Pattern B : L'Intersection & L'Agrégation (Point-in-Polygon)

• Données en entrée : Une couche de points (ex: Appels d'urgence) + une couche de polygones (ex: Quartiers / Iris).
• Transformation requise : Jointure spatiale (Spatial Join) pour compter le nombre de points tombant à l'intérieur de chaque polygone.
• Exemple concret : Nombre de pannes réseau par secteur de maintenance pour identifier le secteur le plus défaillant.

Pattern C : L'Indice de Voisinage (Buffers & Isochrones)

• Données en entrée : Un point d'intérêt (ex: Magasin) + un réseau ou une distance euclidienne.
• Transformation requise : Générer une zone tampon (Buffer) ou un polygone d'accessibilité en temps de trajet (Isochrone).
• Exemple concret : Nombre d'habitants situés à moins de 15 minutes à pied d'une nouvelle station de métro.

🎨 2. Le Catalogue des Recettes Cartographiques (Sémiologie Graphique)

Une fois la donnée transformée, l'IA doit choisir l'implantation graphique absolue selon les lois de Jacques Bertin (sémiologie graphique).
👉 MATRICE DE DÉCISION RAPIDE POUR L'IA :
• Donnée Quantitative Absolue (Stocks, Totaux) ──> Symboles Proportionnels (Taille)
• Donnée Quantitative Relative (Ratios, Taux)  ──> Carte Choroplèthe (Valeur/Couleur)
• Donnée Qualitative (Catégories, Types)       ──> Couleurs Distinctes (Teinte)

Recette 1 : La Carte Choroplèthe (Aplats de couleur)

• Usage : Visualiser des données relatives, des taux ou des densités sur des maillages administratifs ou des grilles régulières (ex: H3, pixels).
• Règles de discrétisation (Découpage en classes) :
• Distribution homogène/symétrique : Méthode des intervalles égaux.
• Distribution asymétrique/biaisée : Méthode des quantiles (effectifs égaux dans chaque classe) pour maximiser le contraste.
• Distribution hautement dispersée : Méthode des seuils naturels (Jenks) pour regrouper les valeurs similaires.
• Design visuel : Palette séquentielle (dégradé d'une seule couleur) de 5 à 7 classes maximum.

Recette 2 : Les Symboles Proportionnels (Cercles gradués)

• Usage : Visualiser des données absolues (ex: nombre total d'habitants, volume de CO2 émis, chiffre d'affaires).
• Règles de construction : Le volume ou la surface du symbole doit être strictement proportionnel à la valeur (le rayon du cercle varie selon la racine carrée de la donnée).
• Design visuel : Cercles avec une couleur de fond semi-transparente (opacité 0.5 - 0.7) et une bordure nette pour rester lisibles lorsqu'ils se chevauchent.

Recette 3 : La Carte de Flux (Lignes de désir / O-D)

• Usage : Visualiser des mouvements, des trajectoires ou des connexions entre une Origine et une Destination (ex: trajets domicile-travail, lignes aériennes, flux de marchandises).
• Règles de construction : Utiliser des arcs ou des lignes. L'épaisseur de la ligne représente l'intensité du flux, la couleur ou une animation (flèche/point mobile) indique le sens du flux.

🧠 3. Les Analyses Spatiales Avancées (Modèles Prédictifs & Statisiques)

Si l'utilisateur demande une analyse poussée ("Pourquoi ?", "Où installer ?", "Est-ce anormal ?"), l'IA doit proposer ces patterns algorithmiques :

Analyse 1 : L'Analyse d'Autocorrélation (Hotspot Analysis)

• Algorithme : Indice Gi* de Getis-Ord.
• Objectif : Déterminer si les regroupements de valeurs fortes ou faibles sont le fruit du hasard ou s'ils sont statistiquement significatifs.
• Rendu UI : Les zones en rouge vif indiquent des Hotspots (valeurs fortes entourées de valeurs fortes), les zones en bleu indiquent des Coldspots.

Analyse 2 : L'Analyse d'Allocation (Aide à la décision)

• Algorithme : Analyse multicritère (Overlay spatial).
• Objectif : Trouver le meilleur emplacement pour une infrastructure en croisant plusieurs contraintes.
• Exemple de prompt utilisateur : "Où installer notre futur entrepôt ?"
• Logique IA : Croiser la couche des prix du terrain (Choroplèthe bas) + la couche de proximité des autoroutes (Buffer proche) + la zone hors inondation (Masque spatial).

🛠️ Instruction pour l'intégration dans l'infrastructure (Generative UI)

Lorsqu'un dataset est soumis à l'IA :
1. Elle doit lire le type géométrique (Point, LineString, Polygon).
2. Elle doit analyser la nature statistique des colonnes (Nombre absolu vs Ratio/Taux).
3. Elle doit appliquer la recette correspondante en bloquant l'accès aux visualisations interdites (ex: interdire le format Choroplèthe sur un décompte de population brut).

🗺️ 4. Analyses Spatiales Complémentaires (Statistique spatiale générique)

Chaque fiche décrit l'analyse indépendamment de tout outil : objectif, méthode, données en entrée, rendu attendu et pièges.

Analyse 3 : Les Statistiques Descriptives du Semis (Centrographie)

• Objectif : Résumer la position et la dispersion d'un ensemble d'objets, et suivre leur dérive (par période, par catégorie).
• Méthode : Centre moyen (moyenne des coordonnées), centre médian (minimise la somme des distances), centre moyen pondéré (par une valeur), distance standard (rayon de dispersion), ellipse de déviation standard (orientation et allongement).
• Entrée : Semis de points (ou centroïdes), éventuellement pondérés.
• Rendu : Point du centre + cercle de distance standard ou ellipse ; une ellipse par période ou par catégorie pour comparer ; trajectoire des centres successifs.
• Pièges : Calculer en projection métrique (pas en degrés) ; le centre moyen est sensible aux valeurs extrêmes (préférer le centre médian).

Analyse 4 : La Configuration du Semis (Agrégé, Aléatoire ou Régulier ?)

• Objectif : Tester si des objets sont concentrés, dispersés au hasard ou répartis régulièrement, et à quelle échelle.
• Méthode : Indice du plus proche voisin de Clark-Evans (R < 1 agrégé, R ≈ 1 aléatoire, R > 1 régulier) ; fonctions K et L de Ripley (structure à plusieurs distances) ; comparaison à une enveloppe de simulations aléatoires.
• Entrée : Semis de points + zone d'étude délimitée.
• Rendu : Valeur de l'indice avec son interprétation ; courbe L(d) – d avec enveloppe de confiance.
• Pièges : Effet de bord (correction nécessaire) ; le résultat dépend de la zone d'étude choisie ; une concentration peut simplement refléter la répartition de la population sous-jacente (hétérogénéité de premier ordre).

Analyse 5 : L'Autocorrélation Globale et Locale (Moran, LISA)

• Objectif : Mesurer si les valeurs voisines se ressemblent (I de Moran global) puis localiser les regroupements et les valeurs atypiques (LISA).
• Méthode : Définir une matrice de voisinage (contiguïté, k plus proches voisins, distance seuil), calculer I de Moran et sa significativité par permutations ; LISA classe chaque unité en Haut-Haut, Bas-Bas, Haut-Bas, Bas-Haut ou non significatif. Corriger les tests multiples (FDR).
• Entrée : Unités spatiales (polygones ou grille) portant une variable relative.
• Rendu : Diagramme de Moran (valeur × moyenne des voisins) ; carte LISA à 4 couleurs (rouge HH, bleu BB, rose HB, bleu clair BH) + gris pour non significatif.
• Pièges : Le choix de la matrice de voisinage change le résultat ; ne pas appliquer à des stocks bruts (normaliser d'abord, Pattern A).

Analyse 6 : L'Estimation de Densité par Noyau (KDE)

• Objectif : Produire une surface continue d'intensité d'événements (événements par km²).
• Méthode : Placer un noyau (gaussien, quartique) de rayon h (bande passante) sur chaque point et sommer. Choix de h : règle de Silverman, validation croisée, ou distance métier (zone de chalandise, portée d'un phénomène).
• Entrée : Semis de points (éventuellement pondérés par un stock).
• Rendu : Surface en dégradé séquentiel, éventuellement isolignes de densité.
• Pièges : La bande passante conditionne entièrement la forme (h petit = bruit, h grand = lissage excessif) ; densité d'événements ≠ risque (normaliser par la population exposée pour obtenir un taux).

Analyse 7 : L'Interpolation Spatiale (Surfaces Continues)

• Objectif : Estimer une variable continue (température, pollution, altitude) en tout point à partir de mesures ponctuelles.
• Méthode : IDW (pondération par l'inverse de la distance) ; krigeage (modélise l'autocorrélation par un variogramme et fournit une variance d'estimation) ; TIN ; splines. Validation croisée pour comparer les méthodes.
• Entrée : Points de mesure d'une variable continue (ratio, intensité).
• Rendu : Surface séquentielle ou isolignes (isoplèthes) ; carte d'incertitude associée (variance de krigeage).
• Pièges : Ne jamais interpoler un stock ou une variable catégorielle ; extrapolation hors de l'enveloppe des mesures non fiable ; densité de capteurs hétérogène.

Analyse 8 : Les Aires d'Influence (Voronoï, Gravitaire)

• Objectif : Délimiter la zone desservie ou dominée par chaque site.
• Méthode : Polygones de Voronoï / Thiessen (chaque lieu rattaché au site le plus proche) ; modèle gravitaire de Huff (probabilité de fréquentation ∝ attractivité / distance^β) ; aires pondérées par la capacité.
• Entrée : Sites (points) + éventuellement attractivité et population.
• Rendu : Polygones en teintes qualitatives (un site = une couleur) ou probabilités en dégradé séquentiel.
• Pièges : La distance euclidienne ignore le réseau et les barrières (rivières, relief) ; préférer les temps de trajet quand ils existent.

Analyse 9 : L'Analyse de Réseau et l'Accessibilité

• Objectif : Mesurer les distances réelles, l'accessibilité aux services et le rôle des tronçons dans un réseau.
• Méthode : Plus court chemin (Dijkstra, A*), isochrones et isodistances, matrices origine-destination de temps de trajet, centralité d'intermédiarité (tronçons critiques), indice d'accessibilité à deux étapes (2SFCA : offre rapportée à la demande dans un temps de trajet donné).
• Entrée : Graphe (tronçons avec coût : longueur, temps, pente) + origines + destinations.
• Rendu : Isochrones en classes de temps (5/10/15/30 min) en palette mono-teinte ; épaisseur des tronçons ∝ intensité ou centralité ; carte d'indice d'accessibilité séquentielle.
• Pièges : Qualité topologique du graphe (connexités, sens uniques) ; le coût dépend du mode de transport et de l'heure.

Analyse 10 : La Classification et la Régionalisation Spatiales

• Objectif : Regrouper des objets proches et semblables pour faire émerger des zones homogènes ou des grappes.
• Méthode : DBSCAN / HDBSCAN (grappes de densité, bruit écarté) ; k-means sur coordonnées et attributs ; régionalisation sous contrainte de contiguïté (SKATER, max-p, AZP).
• Entrée : Points ou unités spatiales + attributs normalisés.
• Rendu : Couleur qualitative par grappe ou région (≤ 7 teintes, sinon contours) ; points de bruit en gris.
• Pièges : Paramètres (rayon, nombre de classes) arbitraires à justifier ; un pavage régulier n'est pas une classification.

Analyse 11 : La Régression Géographiquement Pondérée (GWR)

• Objectif : Expliquer une variable par d'autres en laissant la relation varier dans l'espace ("pourquoi ici ?").
• Méthode : Régression globale (MCO) puis test d'autocorrélation des résidus ; GWR / MGWR (coefficients locaux estimés dans un voisinage glissant) ; modèles spatiaux autorégressifs (SAR, SEM) si les résidus sont autocorrélés.
• Entrée : Unités spatiales avec une variable expliquée et des variables explicatives relatives.
• Rendu : Une carte par coefficient local (palette divergente centrée sur 0) ; carte du R² local ; carte des résidus (divergente).
• Pièges : Colinéarité locale ; corrélation ≠ causalité ; bande passante à justifier.

Analyse 12 : La Spécialisation et la Co-localisation

• Objectif : Savoir si une catégorie est sur-représentée localement, ou si deux catégories se trouvent ensemble plus que par hasard.
• Méthode : Quotient de localisation QL = (part locale de la catégorie) / (part globale) ; QL > 1 = spécialisation. Quotient de co-localisation (CLQ) entre deux types de points ; tableau de contingence catégorie × zone.
• Entrée : Objets catégorisés + unités spatiales (ou voisinage).
• Rendu : Carte divergente centrée sur QL = 1 (sous-représentation en bleu, sur-représentation en rouge).
• Pièges : Instable pour les petits effectifs (voir Analyse 14).

Analyse 13 : La Richesse et la Diversité Spatiales

• Objectif : Distinguer le volume d'activité de la variété (nombre d'espèces, de navires, de capteurs, de types différents).
• Méthode : Richesse = nombre de modalités distinctes par zone ; diversité de Shannon H = −Σ pᵢ ln pᵢ ; indice de Simpson ; équitabilité (H / ln S) ; mode dominant par zone.
• Entrée : Objets portant un identifiant ou une catégorie + unités spatiales.
• Rendu : Carte séquentielle de la richesse ou de la diversité ; carte qualitative du type dominant (avec intensité de dominance en valeur).
• Pièges : La richesse augmente mécaniquement avec l'effort d'observation (raréfaction nécessaire pour comparer des zones inégalement échantillonnées).

Analyse 14 : Les Petits Effectifs et l'Incertitude

• Objectif : Éviter de surinterpréter des taux ou des moyennes calculés sur très peu d'observations.
• Méthode : Seuil d'effectif minimal ; intervalles de confiance ; lissage bayésien empirique (rapprocher les taux instables de la moyenne régionale) ; lissage spatial par les voisins.
• Entrée : Taux ou moyennes + effectif (dénominateur) par unité.
• Rendu : Masquer ou griser les unités sous le seuil ; transparence ou hachures proportionnelles à l'incertitude ; afficher l'effectif dans l'infobulle.
• Pièges : Les valeurs extrêmes d'une carte de taux se trouvent presque toujours dans les plus petites unités.

Analyse 15 : Le Problème des Unités Spatiales Modifiables (MAUP)

• Objectif : Vérifier qu'un résultat ne dépend pas du découpage choisi.
• Méthode : Effet d'échelle (refaire l'analyse à plusieurs résolutions de grille) ; effet de zonage (comparer découpages administratifs, grille régulière, grille hexagonale) ; préférer des mailles d'aire égale pour les comptages.
• Rendu : Mêmes cartes à 2 ou 3 résolutions côte à côte ou par changement d'échelle.
• Pièges : Erreur écologique (ce qui est vrai pour une zone ne l'est pas pour les individus qui la composent).

Analyse 16 : L'Analyse de Terrain et de Visibilité

• Objectif : Dériver des informations du relief.
• Méthode : Pente, exposition, ombrage, rugosité ; bassins versants et écoulement ; intervisibilité (viewshed) depuis un ou plusieurs points.
• Entrée : Modèle numérique de terrain (raster).
• Rendu : Ombrage en fond ; pente en classes séquentielles ; exposition en palette circulaire ; zones visibles en aplat.
• Pièges : La résolution du MNT conditionne les pentes calculées.

Analyse 17 : Les Requêtes et Relations Topologiques

• Objectif : Sélectionner des objets selon leur relation spatiale à une géométrie de référence.
• Méthode : Prédicats topologiques (intersecte, contient, est contenu dans, disjoint, touche, recouvre) ; sélection par distance (à moins de d) ; sélection par emprise.
• Entrée : Objets + géométrie de référence (zone dessinée, polygone administratif, emprise de la vue).
• Rendu : Objets sélectionnés mis en évidence ; compteur des objets retenus ; zone de référence en contour.
• Pièges : Orientation des polygones et géométries invalides ; « intersecte » retient tout objet qui touche la zone, « contenu dans » seulement les objets entièrement inclus : l'écart est fort pour les lignes longues et les grands polygones (une trajectoire qui traverse la zone l'intersecte sans y être contenue).

Analyse 18 : La Localisation Optimale (Localisation-Allocation)

• Objectif : Choisir les meilleurs emplacements pour un ensemble d'équipements.
• Méthode : p-médian (minimiser la distance totale pondérée par la demande), couverture maximale (MCLP : maximiser la demande couverte dans un rayon ou un temps), p-centre (minimiser la plus grande distance), avec ou sans contraintes de capacité.
• Entrée : Sites candidats + points de demande pondérés + matrice de distances ou de temps.
• Rendu : Sites retenus en symboles ; lignes d'allocation demande → site ; demande non couverte mise en évidence.
• Pièges : Sensible à l'agrégation de la demande et au choix de la métrique de distance.

⏱️ 5. Analyses Temporelles (Génériques)

Analyse 19 : Le Choix du Pas d'Agrégation et du Calendrier

• Objectif : Rendre lisible une série temporelle.
• Méthode : Viser 50 à 100 intervalles sur la période affichée ; aligner sur des unités calendaires (heure, jour, semaine ISO, mois) ; préciser le fuseau horaire (UTC ou local) ; éviter les intervalles de durée inégale (mois de 28 à 31 jours) pour comparer des comptages, ou normaliser par la durée.
• Rendu : Histogramme ou courbe chronologique ; un intervalle de détail zoomable.
• Pièges : Un pas trop fin crée du bruit, un pas trop large masque les cycles ; la dernière période est souvent incomplète.

Analyse 20 : Tendance, Saisonnalité et Résidu (Décomposition)

• Objectif : Séparer l'évolution de fond, les cycles réguliers et l'irrégulier.
• Méthode : Décomposition additive ou multiplicative (STL, moyennes mobiles centrées) ; désaisonnalisation ; régression de tendance (pente, test de Mann-Kendall).
• Rendu : Trois courbes superposées ou empilées (tendance, saisonnalité, résidu) ; carte de la pente de tendance par zone (palette divergente centrée sur 0).
• Pièges : Il faut au moins deux cycles complets pour estimer une saisonnalité.

Analyse 21 : Les Cycles et les Rythmes

• Objectif : Mettre en évidence les rythmes journaliers, hebdomadaires ou annuels.
• Méthode : Matrice jour de la semaine × heure ; heatmap calendrier (jours × semaines) ; profils moyens (jour type, semaine type) ; comparaison semaine / week-end.
• Rendu : Matrice colorée en dégradé séquentiel ; une ligne par catégorie (couloirs) pour comparer les rythmes de plusieurs groupes.
• Pièges : Les jours fériés et changements d'heure faussent les profils.

Analyse 22 : Moyennes Mobiles et Cumuls

• Objectif : Lisser le bruit et suivre la progression vers un total.
• Méthode : Moyenne mobile (7 jours, 30 jours) ; somme cumulée ; cumul depuis le début d'année ; taux de croissance.
• Rendu : Courbe lissée au-dessus des barres brutes ; courbe cumulée.
• Pièges : Une moyenne mobile non centrée décale le signal dans le temps.

Analyse 23 : La Comparaison de Périodes

• Objectif : Mesurer un changement (avant/après un événement, année N vs N-1).
• Méthode : Différence absolue, variation relative ((t2 − t1) / t1), indice base 100, glissement annuel (même période l'année précédente pour neutraliser la saisonnalité) ; différence de cartes entre deux périodes.
• Rendu : Palette divergente centrée sur 0 (ou 100) ; cartes « avant » et « après » côte à côte avec la même échelle de couleurs.
• Pièges : Comparer des périodes de durées égales et de même position saisonnière ; échelles de couleurs identiques obligatoires.

Analyse 24 : Les Fenêtres Glissantes Relatives

• Objectif : Suivre l'actualité (« les 7 derniers jours », « le mois en cours ») sans redéfinir les dates.
• Méthode : Bornes relatives à l'instant présent (maintenant − 7 jours, début du mois), arrondies à l'unité calendaire.
• Rendu : Tableau de bord de veille, carte de l'activité récente.
• Pièges : Retard d'ingestion des données (la dernière journée est sous-estimée).

Analyse 25 : La Détection de Ruptures et d'Anomalies Temporelles

• Objectif : Repérer un changement brusque de niveau ou une valeur anormale.
• Méthode : Écart à la normale saisonnière (z-score par rapport au même créneau des années précédentes) ; détection de points de rupture (CUSUM, PELT, Pettitt) ; seuils statistiques (moyenne ± 3 écarts-types, ou percentile 99).
• Rendu : Série avec bande de normalité et points anormaux mis en évidence ; carte des zones en anomalie (palette divergente).
• Pièges : Les changements de mode de collecte créent de fausses ruptures.

Analyse 26 : Récence, Ancienneté et Étendue Temporelle

• Objectif : Savoir depuis quand une zone ou une entité est observée et quand elle l'a été pour la dernière fois.
• Méthode : Première et dernière date par zone ou entité ; étendue (dernière − première) ; ancienneté de la dernière observation (maintenant − dernière date).
• Rendu : Carte de récence en dégradé séquentiel avec foncé = plus récent ; carte d'ancienneté (délai depuis la dernière observation) avec foncé = plus ancien ; zones « muettes » depuis plus de N jours mises en évidence. La convention est rappelée dans la légende.
• Pièges : Une date dernière ancienne peut signifier une absence de capteur, pas une absence de phénomène.

Analyse 27 : Durées, Survie et Fréquence de Revisite

• Objectif : Analyser des durées (séjour, panne, trajet) et la régularité des passages.
• Méthode : Distribution des durées (médiane, percentiles) ; courbe de survie de Kaplan-Meier (probabilité que la durée dépasse t, avec données censurées) ; intervalle entre deux passages successifs (revisite) ; plus long intervalle sans observation.
• Rendu : Histogramme des durées en échelle logarithmique si très asymétrique ; courbe de survie ; carte de l'intervalle moyen de revisite.
• Pièges : Les durées en cours (non terminées) doivent être traitées comme censurées.

🧭 6. Analyses Spatio-Temporelles et Mobilité

Analyse 28 : La Segmentation des Trajectoires

• Objectif : Transformer une suite de positions en déplacements et en arrêts interprétables.
• Méthode : Détection des arrêts (vitesse < seuil pendant une durée minimale, ou rayon de stationnement) ; segmentation en déplacements (moves) ; calcul de la vitesse, du cap, de la sinuosité, du temps de séjour par zone ; reconstruction des parcours entre deux arrêts.
• Entrée : Positions horodatées par identifiant d'objet mobile.
• Rendu : Lignes de trajectoire (couleur = catégorie ou vitesse) ; points d'arrêt en symboles proportionnels à la durée de séjour.
• Pièges : Positions bruitées et lacunaires ; échantillonnage irrégulier.

Analyse 29 : La Matrice Origine-Destination

• Objectif : Quantifier les échanges entre lieux.
• Méthode : Dériver origine et destination de chaque parcours, agréger par paire de zones ; flux net (A→B − B→A) et flux brut ; pôles émetteurs et récepteurs (sommes en ligne et en colonne).
• Rendu : Carte de flux (Recette 3) avec seuil des flux mineurs ; cartes séparées des origines et des destinations ; diagramme en cordes ou matrice colorée.
• Pièges : La taille des zones d'agrégation conditionne la matrice (MAUP) ; filtrer les flux internes.

Analyse 30 : Le Cube Espace-Temps et les Hotspots Émergents

• Objectif : Suivre l'évolution des concentrations dans le temps (nouveaux, persistants, intensifiés, en déclin, sporadiques).
• Méthode : Agréger les événements par cellule et par période (cube), puis Gi* par tranche et test de tendance (Mann-Kendall) par cellule.
• Rendu : Carte qualitative des catégories de hotspots émergents ; animation ou petites cartes multiples par période.
• Pièges : Le choix du pas temporel et de la taille de cellule change les catégories.

Analyse 31 : La Diffusion et les Fronts de Propagation

• Objectif : Décrire comment un phénomène se propage (épidémie, invasion, incendie).
• Méthode : Date de première apparition par zone ; vitesse du front (distance / délai) ; diffusion par contiguïté ou hiérarchique (sauts entre grands centres).
• Rendu : Carte séquentielle de la date de première apparition (isochrones de propagation).
• Pièges : Date de détection ≠ date d'apparition.

Analyse 32 : La Co-présence et les Rencontres

• Objectif : Détecter des objets mobiles proches au même moment (rencontres, transbordements, contacts).
• Méthode : Jointure spatio-temporelle (distance < d et écart temporel < t) ; durée de la rencontre ; réseau des rencontres.
• Rendu : Points de rencontre sur la carte ; liste des paires ; graphe des contacts.
• Pièges : Coût combinatoire élevé ; sensible à la fréquence d'échantillonnage.

Analyse 33 : Le Passage par une Zone (de l'Événement à l'Entité)

• Objectif : Retrouver toutes les entités (navires, animaux, véhicules) dont au moins une observation est tombée dans une zone, puis analyser l'ensemble de leurs observations.
• Méthode : Sélection spatiale des observations, collecte des identifiants distincts, puis sélection de toutes les observations portant ces identifiants.
• Rendu : Trajectoires complètes des entités concernées ; répartition de leurs catégories.
• Pièges : Confondre « observations dans la zone » et « entités passées par la zone » (sélections différentes).

Analyse 34 : La Surveillance de Zone et les Alertes (Géorepérage)

• Objectif : Être averti quand un nouvel événement satisfait des conditions spatiales et attributaires.
• Méthode : Zone d'intérêt + filtre attributaire + règle de déclenchement (entrée, sortie, présence, dépassement de seuil) ; regroupement des alertes pour éviter la surcharge.
• Rendu : Carte des zones surveillées ; journal des alertes ; compteur d'alertes par zone.
• Pièges : Faux positifs liés au bruit de position ; fréquence d'alerte à limiter.

🛰️ 7. Analyses de Catalogues d'Imagerie et de Qualité d'Acquisition

Analyse 35 : La Couverture Nuageuse

• Objectif : Évaluer la part du catalogue exploitable et où et quand on peut espérer des images claires.
• Méthode : Distribution du pourcentage de nuages par image ; part d'images sous un seuil d'exploitabilité (ex. ≤ 20 %) ; couverture nuageuse moyenne et minimale par zone ; saisonnalité de la nébulosité (moyenne mensuelle par zone) ; repérage des zones chroniquement couvertes.
• Entrée : Emprises d'images (polygones) + date d'acquisition + pourcentage de nuages (+ capteur).
• Rendu : Histogramme du pourcentage de nuages avec seuil interactif ; carte séquentielle de la nébulosité moyenne (c'est un ratio : moyenne, jamais somme) ; carte du minimum (meilleure image possible par zone) ; matrice mois × zone pour la saisonnalité.
• Pièges : Le pourcentage de nuages est global à la scène, pas à la zone d'intérêt (une image à 30 % peut être claire sur la zone, et inversement) ; ombres de nuages et brume souvent mal détectées.

Analyse 36 : La Revisite Utile

• Objectif : Savoir à quelle fréquence on dispose d'images réellement exploitables sur une zone.
• Méthode : Nombre d'acquisitions sous le seuil de nuages par zone et par période ; intervalle moyen entre deux images exploitables ; plus longue période sans image exploitable ; comparaison entre capteurs.
• Rendu : Carte du nombre d'acquisitions exploitables (stock par maille d'aire égale) ; calendrier capteur × temps ; histogramme des intervalles de revisite.
• Pièges : Les scènes adjacentes ou recouvrantes d'un même passage comptent plusieurs fois une même acquisition sur une zone : dédoublonner par date et orbite (ou capteur) avant de compter la revisite.

Analyse 37 : La Meilleure Image Disponible et la Mosaïque

• Objectif : Choisir pour chaque zone l'image la plus adaptée et composer une vue continue.
• Méthode : Tri multicritère ordonné (nuages croissants, puis date décroissante, puis résolution ou angle d'incidence) ; empilement des images jusqu'à couverture complète de la zone ; mosaïque « la plus récente » ou « la moins nuageuse ».
• Rendu : Mosaïque d'aperçus ; carte des dates de l'image retenue par zone ; liste ordonnée des candidates avec vignettes.
• Pièges : Raccords radiométriques entre images de dates différentes ; une mosaïque mélange des dates (à indiquer).

Analyse 38 : La Couverture Spatiale d'un Catalogue

• Objectif : Mesurer quelle part de la zone d'intérêt est couverte et repérer les zones blanches.
• Méthode : Union des emprises intersectée avec la zone d'intérêt ; taux de couverture ; nombre de recouvrements par maille ; zones jamais couvertes.
• Rendu : Carte du nombre de recouvrements (séquentiel) ; zones blanches en contraste.
• Pièges : Projeter avant de calculer les surfaces.

Analyse 39 : Les Autres Métadonnées d'Acquisition

• Objectif : Qualifier un catalogue selon tout critère de qualité.
• Méthode : Même démarche que la couverture nuageuse appliquée à l'angle d'incidence, l'élévation solaire, la résolution, le capteur ou la plateforme, le niveau de traitement : distribution, part sous un seuil, moyenne et meilleure valeur par zone.
• Rendu : Histogrammes à seuil interactif ; répartition par capteur ; cartes de la meilleure valeur par zone.
• Pièges : Les critères se contredisent (image récente mais nuageuse) : expliciter l'ordre de priorité.

📊 8. Statistiques Appliquées aux Données Spatiales

Analyse 40 : Tendance Centrale et Dispersion Robustes

• Objectif : Résumer une distribution sans être trompé par les valeurs extrêmes.
• Méthode : Médiane et écart interquartile (IQR) plutôt que moyenne et écart-type pour les distributions asymétriques ; percentiles (5, 25, 50, 75, 95) ; coefficient de variation pour comparer des dispersions.
• Rendu : Histogramme avec médiane et quartiles repérés ; boîtes à moustaches par catégorie.
• Pièges : La moyenne d'un ratio n'est pas le ratio des sommes (moyenne des taux ≠ taux global).

Analyse 41 : Les Transformations de Variables

• Objectif : Rendre lisible une distribution très asymétrique.
• Méthode : Logarithme (valeurs strictement positives), racine carrée (comptages), rangs ou percentiles, standardisation (z-score) pour comparer des variables d'unités différentes.
• Rendu : Histogramme en échelle logarithmique ; légende exprimée dans l'unité d'origine.
• Pièges : Toujours indiquer la transformation dans la légende.

Analyse 42 : La Corrélation entre Variables

• Objectif : Mesurer l'association entre deux variables.
• Méthode : Pearson (relation linéaire), Spearman (relation monotone, robuste) ; nuage de points ; matrice de corrélation ; en spatial, vérifier l'autocorrélation (corrélation gonflée par la proximité).
• Rendu : Nuage de points ; carte bivariée (Recette 2 combinée à la Recette 1) ; sélection d'une plage d'une variable pour observer la distribution de l'autre.
• Pièges : Corrélation ≠ causalité ; corrélation écologique (Analyse 15).

Analyse 43 : La Concentration et les Inégalités

• Objectif : Mesurer si un total est réparti équitablement ou concentré sur quelques entités ou zones.
• Méthode : Courbe de Lorenz, indice de Gini (0 = égalité, 1 = concentration totale) ; indice de Herfindahl-Hirschman (HHI) ; loi de Pareto (part du total portée par les 20 % premiers) ; top-N et part cumulée.
• Rendu : Barres triées décroissantes avec courbe de part cumulée ; courbe de Lorenz ; valeur de l'indice.
• Pièges : Le résultat dépend de la population d'entités considérée (filtres actifs).

Analyse 44 : Les Tableaux de Contingence

• Objectif : Étudier l'association entre deux variables catégorielles (type × zone, type × période).
• Méthode : Tableau croisé des effectifs ; pourcentages en ligne et en colonne ; test du Khi² ; résidus standardisés (cases sur ou sous-représentées).
• Rendu : Matrice colorée (divergente sur les résidus) ; barres empilées à 100 % ; couloirs catégorie × temps.
• Pièges : Effectifs théoriques trop faibles (< 5) invalident le Khi².

Analyse 45 : L'Écart à la Normale et les Valeurs Extrêmes

• Objectif : Repérer les valeurs anormales d'une variable.
• Méthode : z-score ((x − moyenne) / écart-type) ; règle de l'IQR (au-delà de Q3 + 1,5 × IQR) ; percentiles extrêmes (p1, p99) ; écart à la valeur des voisins (outlier spatial, voir LISA Haut-Bas).
• Rendu : Histogramme avec queues mises en évidence ; carte divergente des z-scores ; liste des valeurs extrêmes.
• Pièges : Une valeur extrême peut être une erreur de mesure ou le signal recherché : vérifier avant d'écarter.

Analyse 46 : Les Seuils et la Classification par Percentiles

• Objectif : Définir des classes interprétables (faible, moyen, fort, critique).
• Méthode : Seuils réglementaires ou métier en priorité ; sinon percentiles (quartiles, déciles) ; seuils de rupture (Jenks).
• Rendu : Classes ordonnées en palette séquentielle ; seuils affichés sur l'histogramme.
• Pièges : Des seuils calculés sur l'échantillon changent à chaque filtrage ; préférer des seuils fixes pour comparer dans le temps.

Analyse 47 : L'Échantillonnage et les Biais d'Observation

• Objectif : Ne pas confondre la répartition du phénomène et la répartition de l'effort d'observation.
• Méthode : Rapporter les observations à l'effort (nombre d'observateurs, de capteurs, de passages) ; comparer à une couche de référence (population, trafic) ; raréfaction pour comparer des richesses.
• Exemple : Des photos géolocalisées reflètent surtout la fréquentation touristique, pas l'intérêt intrinsèque d'un lieu.
• Rendu : Carte du phénomène normalisé par l'effort, accompagnée de la carte de l'effort.
• Pièges : Biais de sélection non mesurable : le signaler explicitement.

Analyse 48 : Richesse contre Volume

• Objectif : Distinguer « beaucoup d'événements » de « beaucoup d'entités différentes ».
• Méthode : Comparer le nombre d'événements et le nombre d'entités distinctes par zone ; ratio événements / entité (intensité d'usage, fidélité).
• Rendu : Deux cartes séquentielles côte à côte avec la même maille ; carte bivariée volume × richesse.
• Pièges : Un comptage d'entités distinctes ne s'additionne pas entre zones (une entité peut être présente dans plusieurs zones).

🖌️ 9. Règles Génériques de Sémiologie des Couleurs et des Graphiques

Ces règles s'appliquent à toute carte et à tout graphique, quel que soit l'outil.

Règle G1 : Variable Visuelle et Niveau de Mesure (Bertin)

• Quantitatif absolu (stock) → taille (surface du symbole, épaisseur de la ligne).
• Quantitatif relatif (ratio, taux, densité) et ordinal → valeur (dégradé clair → foncé d'une même teinte).
• Nominal → teinte (couleurs distinctes, sans ordre apparent).
• Divergent (écart à une référence) → deux teintes opposées autour d'une couleur neutre placée exactement sur la référence.
• Une variable = une variable visuelle principale ; au plus deux variables par symbole (taille + couleur).

Règle G2 : Palettes de Couleurs

• Séquentielle : luminance strictement monotone (clair = faible, foncé = fort sur fond clair).
• L'arc-en-ciel (luminance non monotone) est proscrit pour une variable ordonnée : il crée de faux paliers et il est illisible pour les daltoniens.
• Qualitative : au plus 7 teintes de luminance proche ; au-delà, regrouper les modalités mineures en « Autre », en gris neutre.
• Privilégier des palettes testées pour les daltoniens (ex. Okabe-Ito pour le qualitatif, viridis ou ColorBrewer pour le séquentiel).
• Les arrêts ou bornes de classes doivent se situer dans la plage réelle des données et suivre leur distribution (Recette 1).

Règle G3 : Cohérence et Hiérarchie Visuelles

• Une même catégorie garde la même couleur sur la carte, dans les graphiques, dans les tableaux et dans la légende.
• Deux couches affichées ensemble ne doivent pas utiliser des couleurs proches pour des significations différentes.
• Au plus deux couches thématiques visibles simultanément ; la couche thématique domine le fond de carte.
• Les états de survol et de sélection restent lisibles (épaisseur ou contraste accrus, sans changer la signification de la couleur).

Règle G4 : Choix du Type de Graphique

• Diagramme circulaire (camembert, anneau) : uniquement pour montrer les parts d'un tout, avec au plus 7 parts.
• Diagramme en barres : comparer des modalités (8 à 50, ou un top N assumé), triées par valeur décroissante sauf ordre naturel.
• Histogramme : distribution d'une variable quantitative, avec 10 à 50 classes sur la plage utile.
• Chronogramme (barres ou courbe dans le temps) : évolution d'un effectif ou d'une mesure, avec 50 à 100 intervalles (Analyse 19).
• Couloirs (catégorie × temps) : comparer les rythmes de quelques catégories, au plus 10 couloirs.
• Indicateur chiffré : une valeur synthétique, avec son nom, son unité et une précision adaptée à la grandeur.
• Tableau de métriques : comparer plusieurs indicateurs par catégorie, dans des unités lisibles.

Règle G5 : Lisibilité des Graphiques et des Indicateurs

• Chaque graphique et chaque indicateur porte un titre visible qui dit ce qui est mesuré, et sur quelle population.
• Le titre est court et évocateur (environ 55 caractères) : la variable, l'agrégation et le périmètre d'abord, les détails dans la légende ou l'infobulle.
• Les unités sont affichées et converties dans une grandeur lisible (heures plutôt que secondes, kilomètres plutôt que mètres).
• Une troncature (top N, période partielle, seuil d'effectif) est indiquée dans le titre ou la légende.
• Un même indicateur n'est pas présenté deux fois sans apport ; deux définitions concurrentes d'une même grandeur sont à éviter.

🧩 10. Compléments : Mobilité, Qualité des Données et Mise en Page

Recette 4 : La Carte de Localisation et la Généralisation Multi-échelle

• Usage : Montrer où se trouvent des objets (semis de points, lignes) sans analyse quantitative, ou comme couche de détail sous une analyse agrégée.
• Règles de construction : Au-delà de quelques milliers d'objets, la superposition masque la densité réelle : agréger à petite échelle (grille, cercles de comptage) et ne montrer les objets un à un qu'à grande échelle ; fixer le seuil de bascule sur le nombre d'objets affichés ou sur le niveau de zoom ; symboles petits, semi-transparents, avec un liseré clair.
• Design visuel : Une teinte neutre si aucune variable n'est portée ; la couleur ou la taille ne sont ajoutées que si elles servent une variable (Recettes 1 et 2).
• Pièges : Un semis non agrégé suggère une densité fausse (points empilés au même endroit) ; l'ordre de dessin change ce qui est visible.

Analyse 49 : La Densité de Trajectoires (Corridors)

• Objectif : Faire apparaître les axes de passage (routes, corridors, couloirs migratoires) à partir de trajectoires.
• Méthode : Découper l'espace en mailles et compter, par maille, le nombre d'objets mobiles distincts (ou de parcours distincts) qui la traversent ; variante pondérée par la durée de présence ou la longueur parcourue dans la maille.
• Entrée : Trajectoires (lignes) ou positions échantillonnées le long des trajectoires, avec un identifiant de parcours ou d'objet.
• Rendu : Grille en dégradé séquentiel (clair = peu fréquenté, foncé ou vif = corridor) ; éventuellement les trajectoires en fond très transparentes.
• Pièges : Compter des positions plutôt que des parcours surpondère les objets lents ou échantillonnés plus souvent ; une maille trop grande fusionne des corridors voisins, trop petite les fragmente (Analyse 15).

Analyse 50 : Les Indicateurs de Forme des Trajectoires

• Objectif : Qualifier un déplacement : direct, avec détour, en boucle ou erratique.
• Méthode : Rectitude = distance à vol d'oiseau entre origine et destination / distance parcourue (1 = direct, proche de 0 = boucle) ; indice de détour (inverse) ; boucle si origine = destination ; sinuosité locale (variation du cap) ; part du temps à l'arrêt.
• Entrée : Trajectoires avec origine, destination et longueur parcourue (ou positions horodatées).
• Rendu : Histogramme de la rectitude ; trajectoires colorées en dégradé séquentiel sur la rectitude ; comparaison par catégorie d'objet.
• Pièges : Une boucle (pêche, croisière, patrouille) n'est pas un trajet inefficace : séparer les parcours dont l'origine est la destination avant d'interpréter les détours.

Analyse 51 : La Régularité de Desserte et la Demande non Desservie

• Objectif : Distinguer une liaison déjà assurée par un service régulier d'une demande dispersée qui justifierait d'ouvrir une ligne.
• Méthode : Par paire origine-destination : nombre de parcours, nombre de véhicules ou d'opérateurs distincts, ratio parcours / véhicule (très supérieur à 1 = navette régulière ; proche de 1 avec plusieurs véhicules = demande fragmentée), fréquence et intervalle entre départs, persistance dans le temps, durée et rectitude des trajets (Analyse 50).
• Entrée : Parcours avec origine, destination, date de départ et identifiant de véhicule.
• Rendu : Matrice ou barres origine → destination ; indicateur parcours / véhicule ; couloirs origine × temps pour lire la régularité ; carte des corridors (Analyse 49) et des pôles (Analyse 29).
• Pièges : Une fenêtre d'observation courte ne montre ni les rythmes hebdomadaires ni les saisons (Analyse 20) ; la demande observée est celle des trajets réalisés, pas celle des voyageurs ou des marchandises transportés ; les liaisons internes (origine = destination) sont à lire à part.

Analyse 52 : La Complétude et la Qualité des Données

• Objectif : Mesurer ce que les données ne disent pas avant d'en tirer des conclusions.
• Méthode : Part des valeurs manquantes ou « inconnues » par variable, et leur répartition dans l'espace, dans le temps et par catégorie ; étendue et continuité temporelles de l'échantillon ; précision de position ; doublons ; valeurs hors domaine.
• Entrée : Toute collection.
• Rendu : La modalité « inconnue » est montrée comme une catégorie à part (en gris), jamais retirée silencieusement ; indicateur de la part manquante ; période couverte rappelée dans les titres.
• Pièges : Des valeurs manquantes concentrées sur une zone ou une période biaisent toute comparaison ; exclure les inconnues change les dénominateurs des taux.

Règle G6 : Projection et Mesures

• Les surfaces se calculent dans une projection équivalente, les distances sur l'ellipsoïde (géodésiques).
• En Mercator, l'aire apparente est multipliée par 1/cos²(latitude) : une grille de tuiles ou de géocodes n'a pas une aire constante au sol, et un comptage par maille est biaisé en faveur des hautes latitudes.
• Pour comparer des densités entre zones éloignées en latitude, utiliser des mailles d'aire (quasi) égale, comme une grille hexagonale, ou rapporter le comptage à l'aire réelle de la maille.

Règle G7 : Habillage de la Carte

• Légende explicite : variable, unité, agrégation, classes ou arrêts, transformation éventuelle (Analyse 41).
• Échelle graphique ; source et date des données ; période couverte par la sélection.
• Les catégories « Autre » et « Inconnu » sont nommées comme telles et ne se confondent pas avec une vraie modalité.

🚢 11. Compléments : Mobilité Avancée et Incertitude de Position

Recette 5 : La Trajectoire Chronologique d'une Entité

• Usage : Lire l'ordre dans lequel une même entité (navire, véhicule, animal) a réalisé ses parcours successifs, sans recourir à une animation.
• Règles de construction : La couleur ou l'épaisseur varie avec le temps, normalisée entité par entité (du plus ancien au plus récent de chaque entité, et non de l'ensemble) ; une palette séquentielle à luminance monotone (clair = ancien, foncé = récent) ; une couleur distincte par parcours n'est utile que pour quelques entités à la fois.
• Design visuel : Rappeler dans la légende que l'échelle est relative à chaque entité ; mettre en évidence le dernier parcours connu.
• Pièges : Une normalisation globale écrase les entités peu actives ; comparer deux entités sur une échelle relative ne dit rien de leurs dates absolues.

Recette 6 : La Carte Composite d'un Parcours (Multi-géométries)

• Usage : Représenter un parcours composé de plusieurs géométries : ligne du trajet, points de départ et d'arrivée, arrêts intermédiaires, zones d'arrêt, positions brutes.
• Règles de construction : Hiérarchie visuelle explicite (ligne du trajet dominante, extrémités ensuite, détails en dernier) ; codes stables pour les extrémités (une teinte pour le départ, une teinte opposée pour l'arrivée, conservées dans toute l'interface, Règle G3) ; les détails (positions brutes, zones d'arrêt) n'apparaissent qu'à grande échelle (Recette 4).
• Design visuel : Extrémités en petits symboles pleins ; arrêts en symboles proportionnels à la durée (Recette 2) ; zones en contour léger (Règle G8).
• Pièges : Trop de couches simultanées brouillent la lecture (au plus deux couches thématiques, Règle G3) ; un point d'extrémité agrégé à petite échelle ne correspond plus à un lieu précis.

Règle G8 : Représenter l'Incertitude de Position

• Une position estimée (lieu d'arrêt, position reconstruite, géocodage approximatif) se montre par sa zone d'incertitude (polygone, cercle ou ellipse de précision) plutôt que par un point qui paraît exact.
• Zone en remplissage très transparent avec un contour léger, sous le symbole du point ; la taille de la zone dit la précision, elle ne porte pas d'autre variable.
• Indiquer dans la légende ce que représente la zone (enveloppe des positions, rayon de précision, intervalle de confiance).
• Une mesure de distance ou une sélection spatiale sur une position incertaine hérite de cette incertitude (un point proche d'une limite peut être d'un côté ou de l'autre).

Analyse 53 : Les Statistiques Directionnelles (Caps et Orientations)

• Objectif : Décrire les directions de déplacement ou les orientations d'objets (cap, sens de circulation, orientation de linéaires).
• Méthode : Statistique circulaire : direction moyenne (moyenne des vecteurs unitaires), longueur du vecteur résultant et variance circulaire (concentration autour de la moyenne), test de Rayleigh (uniformité) ; rose des directions par secteurs (8, 16 ou 36) ; séparation des deux sens d'un même corridor (directions opposées de 180°).
• Entrée : Angles (0–360°) par observation ou par parcours, éventuellement pondérés.
• Rendu : Rose des directions ; histogramme sur 0–360° (lecture circulaire : 0° et 360° sont voisins) ; trajectoires ou mailles colorées en palette circulaire ; carte de la direction dominante par maille.
• Pièges : La moyenne arithmétique d'angles est fausse (la moyenne de 350° et 10° vaut 0°, pas 180°) ; un cap mesuré à l'arrêt ou à très faible vitesse n'a pas de sens ; distinguer cap (orientation de l'objet) et route (direction du déplacement).

Analyse 54 : Les Régimes de Vitesse et les Profils Comportementaux

• Objectif : Caractériser comment les objets se déplacent et en déduire des comportements (transit, activité lente, errance, attente).
• Méthode : Distribution des vitesses par catégorie d'objet ; classes de vitesse métier (arrêt, manœuvre, activité lente, croisière) ; vitesse moyenne par maille (moyenne, jamais somme) ; combinaison vitesse × rectitude (Analyse 50) × durée pour distinguer les profils ; écart entre la catégorie déclarée de l'objet et le comportement observé.
• Entrée : Parcours avec vitesse (moyenne ou instantanée), rectitude, durée et catégorie.
• Rendu : Histogrammes de vitesse par catégorie (mêmes classes pour comparer) ; trajectoires colorées par classe de vitesse en palette séquentielle ; carte de vitesse moyenne par maille ; tableau catégorie × profil.
• Pièges : Une vitesse moyenne de parcours masque les phases d'arrêt ; les classes doivent être fixées par le métier (elles diffèrent selon le type d'objet) ; un comportement atypique peut être une erreur de catégorie autant qu'une activité inhabituelle.

Analyse 55 : Les Arrêts hors Pôles (Stationnement en Route)

• Objectif : Repérer les arrêts qui ne se produisent pas aux lieux d'origine ou de destination (attente, mouillage, stationnement prolongé, activité sur place).
• Méthode : Séparer les arrêts aux extrémités des parcours (lieux nommés) des arrêts intermédiaires ; densité des arrêts intermédiaires par maille ; durée des arrêts (distribution, cumul par maille) ; proximité des pôles (attente avant accès) ou isolement.
• Entrée : Arrêts intermédiaires (positions ou zones) avec durée, rattachés à un parcours et à une entité.
• Rendu : Carte de densité des arrêts intermédiaires (grille séquentielle) ; symboles proportionnels à la durée ; distribution des durées ; répartition par catégorie d'objet.
• Pièges : Un arrêt intermédiaire proche d'un pôle est souvent une attente d'accès, pas une activité distincte ; le seuil de détection d'arrêt (vitesse, durée minimale) conditionne le nombre d'arrêts (Analyse 28).

Analyse 56 : Le Temps d'Escale et le Budget-Temps d'Activité

• Objectif : Mesurer combien de temps les objets passent aux lieux d'escale et comment se répartit leur temps entre déplacement et arrêt.
• Méthode : Durée d'arrêt avant le départ et après l'arrivée, par lieu et par catégorie (médiane, percentiles, Analyse 40) ; budget-temps par entité = part du temps en déplacement, à l'arrêt en route, à quai ; temps de rotation (arrivée → départ suivant au même lieu).
• Entrée : Parcours avec durée, durées d'arrêt aux extrémités, lieux nommés, identifiant d'entité.
• Rendu : Barres des lieux classés par durée médiane d'escale ; histogrammes des durées d'escale ; barres empilées à 100 % du budget-temps par catégorie ; carte des lieux en symboles proportionnels au temps cumulé d'escale.
• Pièges : Les escales en cours en fin de période sont censurées (Analyse 27) ; la moyenne est tirée par quelques escales très longues (désarmement, réparation) ; un temps cumulé élevé peut refléter le nombre d'escales plutôt que leur durée.

Analyse 57 : La Cadence d'Échantillonnage et les Zones d'Ombre

• Objectif : Mesurer la densité et la régularité des observations d'objets mobiles, et repérer les zones ou périodes où le signal se perd.
• Méthode : Nombre de positions par unité de distance et par unité de temps, par parcours ; classes de cadence d'émission ; répartition spatiale des cadences (par maille) ; lacunes = intervalles anormalement longs entre deux positions ; comparaison par catégorie d'objet ou de source.
• Entrée : Parcours avec nombre de positions, durée, distance, et éventuellement une classe de cadence.
• Rendu : Histogramme de la cadence ; carte de la cadence moyenne par maille (séquentielle) ; zones d'ombre en contraste ; part des parcours par classe de cadence.
• Pièges : Une absence de signal n'est pas une absence d'objet (couverture des récepteurs, coupure volontaire) ; une cadence faible dégrade toutes les mesures dérivées (vitesse, forme, arrêts) ; la cadence dépend souvent de la vitesse et du type d'émetteur.

Analyse 58 : La Plausibilité Cinématique des Trajectoires

• Objectif : Écarter ou signaler les parcours dont les mesures sont physiquement incohérentes avant de les analyser.
• Méthode : Vitesse dérivée (distance / durée) comparée à la vitesse mesurée ; comparaison de deux sources de mesure d'une même grandeur ; contrôles de bornes (distance à vol d'oiseau ≤ distance parcourue, rectitude entre 0 et 1, durée strictement positive, vitesse sous le maximum physique de la catégorie) ; sauts de position impossibles.
• Entrée : Parcours avec distance parcourue, distance à vol d'oiseau, durée, une ou plusieurs vitesses.
• Rendu : Indicateur de la part de parcours incohérents ; histogramme de l'écart entre vitesse dérivée et vitesse mesurée ; liste des parcours hors bornes ; carte de leur localisation (une concentration spatiale signale un problème de source).
• Pièges : Un écart modéré entre deux vitesses est normal (vitesse moyenne contre instantanée, courant, arrêts) ; un parcours très court amplifie les erreurs relatives ; ne pas supprimer silencieusement les parcours douteux (Analyse 52).

Analyse 59 : La Variable d'État de l'Objet (Chargé ou à Vide)

• Objectif : Utiliser une mesure de l'état de l'objet pendant le parcours (tirant d'eau, charge, taux d'occupation) pour qualifier les flux.
• Méthode : Rapporter la mesure à la valeur maximale observée pour la même entité (état relatif, comparable entre entités de tailles différentes) ; classes d'état (vide, partiel, plein) ; comparaison de l'état par sens de liaison (aller chargé, retour à vide) ; pôles de chargement et de déchargement.
• Entrée : Parcours avec une mesure d'état, une origine, une destination et un identifiant d'entité.
• Rendu : Flux origine-destination colorés par état ; barres des origines et destinations par classe d'état ; histogramme de l'état relatif par catégorie.
• Pièges : Une mesure déclarée manuellement peut ne pas être mise à jour ; l'état relatif exige assez de parcours par entité ; une valeur absolue compare mal des objets de tailles différentes.

Analyse 60 : Les Flux Pondérés par la Taille ou la Capacité

• Objectif : Distinguer le nombre de passages de la capacité réellement transitée (quelques grands objets contre beaucoup de petits).
• Méthode : Pondérer les comptages (origine-destination, corridors, lieux) par une taille ou une capacité de l'objet ; comparer classement par nombre et classement par capacité ; distribution des tailles par liaison ou par lieu.
• Entrée : Parcours avec une taille ou une capacité de l'objet, origine, destination.
• Rendu : Deux classements côte à côte (nombre et capacité) ; symboles proportionnels à la capacité cumulée (Recette 2) ; histogramme des tailles par catégorie.
• Pièges : La taille n'est qu'un indicateur de capacité, pas du chargement réel (Analyse 59) ; les tailles manquantes faussent les sommes (part à signaler, Analyse 52).

Analyse 61 : Le Réseau de Lieux (Graphe des Liaisons)

• Objectif : Décrire la structure d'un système de lieux reliés par des déplacements : pôles, relais, lieux isolés, sous-réseaux.
• Méthode : Graphe dont les nœuds sont les lieux et les arêtes les liaisons origine-destination pondérées (Analyse 29) ; degré (nombre de lieux reliés), force (somme des flux), centralité d'intermédiarité, organisation en étoile (hub and spoke) ou maillée ; détection de communautés de lieux ; asymétrie des liaisons.
• Entrée : Parcours avec un lieu d'origine et un lieu de destination nommés.
• Rendu : Carte des lieux en symboles proportionnels au degré ou à la force, liaisons en lignes d'épaisseur proportionnelle ; barres des lieux classés par nombre de lieux reliés ; couleur qualitative par communauté.
• Pièges : Diffère de l'analyse de réseau d'infrastructure (Analyse 9) : ici les arêtes sont des liaisons observées, pas des tronçons ; le graphe dépend de la définition des lieux (MAUP, Analyse 15) ; les liaisons internes (origine = destination) sont à exclure ou à lire à part.

Analyse 62 : Le Chaînage des Parcours d'une Entité (Circuits et Tournées)

• Objectif : Reconstituer l'enchaînement des lieux visités par une même entité pour repérer ses circuits, son point d'attache et ses tournées répétées.
• Méthode : Ordonner les parcours de chaque entité par date de départ ; suite des lieux visités ; nombre de lieux distincts par entité ; lieu le plus fréquent (point d'attache) et fréquence de retour ; détection de circuits répétés (même suite de lieux) ; continuité (la destination d'un parcours est l'origine du suivant).
• Entrée : Parcours avec identifiant d'entité, date de départ, lieu d'origine et lieu de destination.
• Rendu : Trajectoire chronologique de l'entité (Recette 5) ; frise des lieux visités dans le temps ; histogramme du nombre de lieux distincts par entité ; barres des points d'attache.
• Pièges : Des parcours manquants rompent la continuité (destination ≠ origine suivante) : la signaler plutôt que la combler ; une fenêtre d'observation courte tronque les circuits longs.
