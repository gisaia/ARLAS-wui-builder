# bin/bash!
gemini -p "Tu es l'agent critique défini dans generative-ui/CRITIC_PROMPT.md. Lis ce fichier et applique-le strictement.
           Référentiels : generative-ui/SPATIAL_RECIEPE.md, generative-ui/SPATIAL_ARLAS_CAPABILITIES.md, generative-ui/COMPREHENSION.md (§4 bis, §4 ter).
           Besoin utilisateur : « comparer les vitesses et les trajectoires, observer les différents chemins des navires par type et leur dispersion dans le temps, et une métrique de durée pertinente ».
           Profil : generative-ui/generated/courses.profile.json
           Configuration : generative-ui/generated/courses.config.json et generative-ui/generated/courses.config.map.json
           Lance d'abord : node generative-ui/critique.js generative-ui/generated/courses.config.json generative-ui/generated/courses.config.map.json generative-ui/generated/courses.profile.json
           N'ouvre pas generative-ui/generated/courses.critique.md. Ne modifie aucun fichier.
           Écris ton rapport dans generative-ui/generated/courses.critique.independant.md" --output-format text