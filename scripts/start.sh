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

set -o errexit -o pipefail

# Set the default value for an environment variable if not already set
set_default_env_variable() {
  VARIABLE_NAME=$1
  VARIABLE_VALUE=$2
  CURRENT_VALUE=$(eval "echo \$$VARIABLE_NAME")
  if [ -z "$CURRENT_VALUE" ]; then
    eval "$VARIABLE_NAME=\"$VARIABLE_VALUE\""
    export "$VARIABLE_NAME"
    echo "Set $VARIABLE_NAME to '$(eval "echo \$$VARIABLE_NAME")'."
  else
    echo "$VARIABLE_NAME is already set to '$CURRENT_VALUE', not overriding."
  fi
}

fetchSettings(){
  echo "Download the BUILDER settings file from \"${ARLAS_SETTINGS_URL}\" ..."
  curl ${ARLAS_SETTINGS_URL} -o /usr/share/nginx/html/settings.yaml && echo "settings.yaml file downloaded with success." || (echo "Failed to download the settings.yaml file."; exit 1)
}

### URL to BUILDER SETTINGS
if [ -z "${ARLAS_SETTINGS_URL}" ]; then
  echo "The default BUILDER container settings.yaml file is used"
else
  fetchSettings;
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

# Initialize environment variables using set_default_env_variable
set_default_env_variable ARLAS_BASEMAPS "[]"
set_default_env_variable ARLAS_WUI_URL "https://arlas.stack/wui"
set_default_env_variable ARLAS_PERSISTENCE_URL "http://localhost:19997/arlas_persistence_server"
set_default_env_variable ARLAS_PERMISSIONS_URL "http://localhost:19998/arlas_permissions_server"
set_default_env_variable ARLAS_SERVER_URL "http://demo.arlas.io/arlas"

set_default_env_variable ARLAS_HISTOGRAMS_MAX_BUCKETS "200"
set_default_env_variable ARLAS_EXPORT_HISTOGRAMS_NB_BUCKETS "1000"

set_default_env_variable ARLAS_USE_AUTHENT "false"
set_default_env_variable ARLAS_AUTHENT_FORCE_CONNECT "false"
set_default_env_variable ARLAS_AUTHENT_USE_DISCOVERY "false"
set_default_env_variable ARLAS_AUTHENT_ISSUER "NOT_CONFIGURED"
set_default_env_variable ARLAS_AUTHENT_CLIENT_ID "NOT_CONFIGURED"
set_default_env_variable ARLAS_AUTHENT_REDIRECT_URI "NOT_CONFIGURED"
set_default_env_variable ARLAS_AUTHENT_SILENT_REFRESH_REDIRECT_URI "NOT_CONFIGURED"
set_default_env_variable ARLAS_AUTHENT_SCOPE "NOT_CONFIGURED"
set_default_env_variable ARLAS_AUTHENT_TOKEN_ENDPOINT "NOT_CONFIGURED"
set_default_env_variable ARLAS_AUTHENT_USERINFO_ENDPOINT "NOT_CONFIGURED"
set_default_env_variable ARLAS_AUTHENT_JWKS_ENDPOINT "NOT_CONFIGURED"
set_default_env_variable ARLAS_AUTHENT_LOGIN_URL "NOT_CONFIGURED"
set_default_env_variable ARLAS_AUTHENT_LOGOUT_URL "NOT_CONFIGURED"
set_default_env_variable ARLAS_AUTHENT_SHOW_DEBUG "false"
set_default_env_variable ARLAS_AUTHENT_REQUIRE_HTTPS "true"
set_default_env_variable ARLAS_AUTHENT_RESPONSE_TYPE "NOT_CONFIGURED"
set_default_env_variable ARLAS_AUTHENT_SILENT_REFRESH_TIMEOUT "5000"
set_default_env_variable ARLAS_AUTHENT_TIMEOUT_FACTOR "0.75"
set_default_env_variable ARLAS_AUTHENT_ENABLE_SESSION_CHECKS "true"
set_default_env_variable ARLAS_AUTHENT_CLEAR_HASH "false"
set_default_env_variable ARLAS_AUTHENT_STORAGE "localstorage"
set_default_env_variable ARLAS_AUTHENT_DISABLE_AT_HASH_CHECK "false"
set_default_env_variable ARLAS_AUTHENT_DUMMY_CLIENT_SECRET "NOT_CONFIGURED"
set_default_env_variable ARLAS_AUTHENT_CUSTOM_QUERY_PARAMS "[]"
set_default_env_variable ARLAS_AUTHENT_MODE "iam"
set_default_env_variable ARLAS_AUTHENT_THRESHOLD "60000"
set_default_env_variable ARLAS_IAM_SERVER_URL "http://localhost:9997"
set_default_env_variable ARLAS_AUTHENT_SIGN_UP_ENABLED "false"

set_default_env_variable ARLAS_STATIC_LINKS "[]"
set_default_env_variable ARLAS_EXTERNAL_NODE_PAGE "false"
set_default_env_variable ARLAS_EXTERNAL_NODE_SCHEMAS "[]"
set_default_env_variable ARLAS_USE_TIME_FILTER "false"
set_default_env_variable ARLAS_ENABLE_ADVANCED_FEATURES "false"
set_default_env_variable ARLAS_BUILDER_APP_PATH ""
set_default_env_variable ARLAS_BUILDER_BASE_HREF ""
set_default_env_variable ARLAS_TAB_NAME "ARLAS-wui-builder"
set_default_env_variable ARLAS_TERRAIN "{}"

# All variables that need to be substituted in settings.yaml
SETTINGS_VARS="ARLAS_BASEMAPS
  ARLAS_WUI_URL
  ARLAS_PERSISTENCE_URL
  ARLAS_PERMISSIONS_URL
  ARLAS_HISTOGRAMS_MAX_BUCKETS
  ARLAS_EXPORT_HISTOGRAMS_NB_BUCKETS
  ARLAS_USE_AUTHENT
  ARLAS_AUTHENT_FORCE_CONNECT
  ARLAS_AUTHENT_USE_DISCOVERY
  ARLAS_AUTHENT_ISSUER
  ARLAS_AUTHENT_CLIENT_ID
  ARLAS_AUTHENT_REDIRECT_URI
  ARLAS_AUTHENT_SILENT_REFRESH_REDIRECT_URI
  ARLAS_AUTHENT_SCOPE
  ARLAS_AUTHENT_TOKEN_ENDPOINT
  ARLAS_AUTHENT_USERINFO_ENDPOINT
  ARLAS_AUTHENT_JWKS_ENDPOINT
  ARLAS_AUTHENT_LOGIN_URL
  ARLAS_AUTHENT_LOGOUT_URL
  ARLAS_AUTHENT_SHOW_DEBUG
  ARLAS_AUTHENT_REQUIRE_HTTPS
  ARLAS_AUTHENT_RESPONSE_TYPE
  ARLAS_AUTHENT_SILENT_REFRESH_TIMEOUT
  ARLAS_AUTHENT_TIMEOUT_FACTOR
  ARLAS_AUTHENT_ENABLE_SESSION_CHECKS
  ARLAS_AUTHENT_CLEAR_HASH
  ARLAS_AUTHENT_STORAGE
  ARLAS_AUTHENT_DISABLE_AT_HASH_CHECK
  ARLAS_AUTHENT_DUMMY_CLIENT_SECRET
  ARLAS_AUTHENT_CUSTOM_QUERY_PARAMS
  ARLAS_AUTHENT_MODE
  ARLAS_AUTHENT_THRESHOLD
  ARLAS_IAM_SERVER_URL
  ARLAS_AUTHENT_SIGN_UP_ENABLED
  ARLAS_STATIC_LINKS
  ARLAS_EXTERNAL_NODE_PAGE
  ARLAS_EXTERNAL_NODE_SCHEMAS
  ARLAS_USE_TIME_FILTER
  ARLAS_ENABLE_ADVANCED_FEATURES
  ARLAS_TAB_NAME
  ARLAS_TERRAIN"

SETTINGS_SUBST=$(printf '$%s ' $SETTINGS_VARS)
envsubst "$SETTINGS_SUBST" < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
truncate -s 0 /usr/share/nginx/html/settings.yaml
cat /usr/share/nginx/html/settings.yaml.tmp >> /usr/share/nginx/html/settings.yaml

# Variables to substitute in index.html
INDEX_VARS="ARLAS_BUILDER_BASE_HREF"

INDEX_SUBST=$(printf '$%s ' $INDEX_VARS)
envsubst "$INDEX_SUBST" < /usr/share/nginx/html/index.html > /usr/share/nginx/html/index.html.tmp
cat /usr/share/nginx/html/index.html.tmp > /usr/share/nginx/html/index.html

# Variables to substitute in nginx default.conf
NGINX_VARS="ARLAS_BUILDER_APP_PATH"

NGINX_SUBST=$(printf '$%s ' $NGINX_VARS)
envsubst "$NGINX_SUBST" < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf.tmp
cat /etc/nginx/conf.d/default.conf.tmp > /etc/nginx/conf.d/default.conf

# Variables to substitute in default.json
DEFAULT_VARS="ARLAS_SERVER_URL"

DEFAULT_SUBST=$(printf '$%s ' $DEFAULT_VARS)
envsubst "$DEFAULT_SUBST" < /usr/share/nginx/html/default.json > /usr/share/nginx/html/default.json.tmp
cat /usr/share/nginx/html/default.json.tmp > /usr/share/nginx/html/default.json

nginx -g "daemon off;"
