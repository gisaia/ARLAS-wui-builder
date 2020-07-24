#!/bin/sh

# Licensed to Gisaïa under one or more contributor
# license agreements. See the NOTICE.txt file distributed with
# this work for additional information regarding copyright
# ownership. Gisaïa licenses this file to you under
# the Apache License, Version 2.0 (the "License"); you may
# not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

fetchConfiguration(){
  echo "Download the BUILDER configuration file from \"${ARLAS_BUILDER_CONFIGURATION_URL}\" ..."
  curl ${ARLAS_BUILDER_CONFIGURATION_URL} -o /usr/share/nginx/html/config.json && echo "Configuration file downloaded with success." || (echo "Failed to download the configuration file."; exit 1)
}

if [ -z "${ARLAS_BUILDER_CONFIGURATION_URL}" ]; then
  echo "The default builder container configuration file is used"
else
  fetchConfiguration;
fi

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

# Set App base path
if [ -z "${ARLAS_BUILDER_APP_PATH}" ]; then
  ARLAS_BUILDER_APP_PATH=""
  export ARLAS_BUILDER_APP_PATH
  echo "No specific path for the app"
else
  echo ${ARLAS_BUILDER_APP_PATH}  "is used as app base path "
fi

# Set App base href
if [ -z "${ARLAS_BUILDER_BASE_HREF}" ]; then
  ARLAS_BUILDER_BASE_HREF=""
  export ARLAS_BUILDER_BASE_HREF
  echo "No specific base href for the app"
else
  echo ${ARLAS_BUILDER_BASE_HREF}  "is used as app base href "
fi

envsubst '$ARLAS_BUILDER_BASE_HREF' < /usr/share/nginx/html/index.html > /usr/share/nginx/html/index.html.tmp
mv /usr/share/nginx/html/index.html.tmp /usr/share/nginx/html/index.html

envsubst '$ARLAS_BUILDER_APP_PATH' < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf.tmp
mv /etc/nginx/conf.d/default.conf.tmp /etc/nginx/conf.d/default.conf


envsubst '$ARLAS_PERSISTENCE_URL' < /usr/share/nginx/html/env.js > /usr/share/nginx/html/env.js.tmp
mv /usr/share/nginx/html/env.js.tmp /usr/share/nginx/html/env.js

nginx -g "daemon off;"
