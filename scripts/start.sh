#!/bin/sh

fetchI18nENContent(){
  echo "Download the en.json file from \"${ARLAS_WUI_I18N_EN_URL}\" ..."
  curl ${ARLAS_WUI_I18N_EN_URL} -o "/usr/share/nginx/html/assets/i18n/en.json" && echo "'EN language' file downloaded with success." || (echo "Failed to download the 'EN language' file."; exit 1)
}

if [ -z "${ARLAS_WUI_I18N_EN_URL}" ]; then
  echo "The default 'EN language' file is used"
else
  fetchI18nENContent;
fi

fetchI18nFRContent(){
  echo "Download the fr.json file from \"${ARLAS_WUI_I18N_FR_URL}\" ..."
  curl ${ARLAS_WUI_I18N_FR_URL} -o "/usr/share/nginx/html/assets/i18n/fr.json" && echo "'FR language' file downloaded with success." || (echo "Failed to download the 'FR language' file."; exit 1)
}

if [ -z "${ARLAS_WUI_I18N_FR_URL}" ]; then
  echo "The default 'FR language' file is used"
else
  fetchI18nFRContent;
fi

if [ -z "${ARLAS_PERSISTENCE_URL}" ]; then
  ARLAS_PERSISTENCE_URL="http://localhost:19997/arlas_persistence_server"
  export ARLAS_PERSISTENCE_URL
  echo "The default ARLAS-persistence url '${ARLAS_PERSISTENCE_URL}' is used"
else
  echo ${ARLAS_PERSISTENCE_URL} "is used for 'arlas.persistence-server.url'"
fi


envsubst '$ARLAS_PERSISTENCE_URL' < /usr/share/nginx/html/env.js > /usr/share/nginx/html/env.js.tmp
mv /usr/share/nginx/html/env.js.tmp /usr/share/nginx/html/env.js

nginx -g "daemon off;"
