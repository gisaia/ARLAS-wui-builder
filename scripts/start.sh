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

### Array of basemaps
if [ -z "${ARLAS_BASEMAPS}" ]; then
  ARLAS_BASEMAPS="[]"
  export ARLAS_BASEMAPS
  echo "No basemap is defined"
else
  echo ${ARLAS_BASEMAPS} "is used for 'basemaps' in settings.yaml file"
fi
envsubst '$ARLAS_BASEMAPS' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml


### URL to ARLAS-wui
if [ -z "${ARLAS_WUI_URL}" ]; then
  ARLAS_WUI_URL="https://arlas.stack/wui"
  export ARLAS_WUI_URL
  echo "The default ARLAS-wui url '${ARLAS_WUI_URL}' is used"
else
  echo ${ARLAS_WUI_URL} "is used for 'arlas_wui_builder' in settings.yaml file"
fi
envsubst '$ARLAS_WUI_URL' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### URL to ARLAS-persistence
if [ -z "${ARLAS_PERSISTENCE_URL}" ]; then
  ARLAS_PERSISTENCE_URL="http://localhost:19997/arlas_persistence_server"
  export ARLAS_PERSISTENCE_URL
  echo "The default ARLAS-persistence url '${ARLAS_PERSISTENCE_URL}' is used"
else
  echo ${ARLAS_PERSISTENCE_URL} "is used for 'persistence.url' in settings.yaml file"
fi
envsubst '$ARLAS_PERSISTENCE_URL' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### URL to ARLAS-permissions
if [ -z "${ARLAS_PERMISSIONS_URL}" ]; then
  ARLAS_PERMISSIONS_URL="'http://localhost:19998/arlas_permissions_server'"
  export ARLAS_PERMISSIONS_URL
  echo "The default ARLAS-permissions url '${ARLAS_PERMISSIONS_URL}' is used"
else
  echo ${ARLAS_PERMISSIONS_URL} "is used for 'permission.url' in settings.yaml file"
fi
envsubst '$ARLAS_PERMISSIONS_URL' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### URL to ARLAS-server
if [ -z "${ARLAS_SERVER_URL}" ]; then
  ARLAS_SERVER_URL="http://demo.arlas.io/arlas"
  export ARLAS_SERVER_URL
  echo "The default ARLAS-server url '${ARLAS_SERVER_URL}' is used"
else
  echo ${ARLAS_SERVER_URL} "is used for 'global.serverUrl' in default.json file"
fi
envsubst '$ARLAS_SERVER_URL' < /usr/share/nginx/html/default.json > /usr/share/nginx/html/default.json.tmp
mv /usr/share/nginx/html/default.json.tmp /usr/share/nginx/html/default.json


# Set histograms max buckets
if [ -z "${ARLAS_HISTOGRAMS_MAX_BUCKETS}" ]; then
  ARLAS_HISTOGRAMS_MAX_BUCKETS=200
  export ARLAS_HISTOGRAMS_MAX_BUCKETS
  echo "No ARLAS_HISTOGRAMS_MAX_BUCKETS is specified. Defaults to 200"
else
  echo ${ARLAS_HISTOGRAMS_MAX_BUCKETS}  "is used as histograms maximum number of buckets "
fi
envsubst '$ARLAS_HISTOGRAMS_MAX_BUCKETS' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

# Set histograms max buckets at CSV export
if [ -z "${ARLAS_EXPORT_HISTOGRAMS_NB_BUCKETS}" ]; then
  ARLAS_EXPORT_HISTOGRAMS_NB_BUCKETS=1000
  export ARLAS_EXPORT_HISTOGRAMS_NB_BUCKETS
  echo "No ARLAS_EXPORT_HISTOGRAMS_NB_BUCKETS is specified. Defaults to 1000"
else
  echo ${ARLAS_EXPORT_HISTOGRAMS_NB_BUCKETS}  "is used as histograms maximum nuber of buckets at CSV export"
fi
envsubst '$ARLAS_EXPORT_HISTOGRAMS_NB_BUCKETS' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml


## AUTHENTICATION
### ARLAS_USE_AUTHENT
if [ -z "${ARLAS_USE_AUTHENT}" ]; then
  ARLAS_USE_AUTHENT=false
  export ARLAS_USE_AUTHENT
  echo "No Authentication variable is set"
else
  echo ${ARLAS_USE_AUTHENT} "is used for 'authentication.use_authent'. Default value is 'false'"
fi
envsubst '$ARLAS_USE_AUTHENT' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_USE_AUTHENT
if [ -z "${ARLAS_AUTHENT_FORCE_CONNECT}" ]; then
  ARLAS_AUTHENT_FORCE_CONNECT=false
  export ARLAS_AUTHENT_FORCE_CONNECT
  echo "No Authentication force_connect variable is set"
else
  echo ${ARLAS_AUTHENT_FORCE_CONNECT} "is used for 'authentication.force_connect'. Default value is 'false'"
fi
envsubst '$ARLAS_AUTHENT_FORCE_CONNECT' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_USE_DISCOVERY
if [ -z "${ARLAS_AUTHENT_USE_DISCOVERY}" ]; then
  ARLAS_AUTHENT_USE_DISCOVERY=false
  export ARLAS_AUTHENT_USE_DISCOVERY
  echo "No Authentication discovery variable is set"
else
  echo ${ARLAS_AUTHENT_USE_DISCOVERY} "is used for 'authentication.use_discovery'. Default value is 'false'"
fi
envsubst '$ARLAS_AUTHENT_USE_DISCOVERY' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_ISSUER
if [ -z "${ARLAS_AUTHENT_ISSUER}" ]; then
  ARLAS_AUTHENT_ISSUER=NOT_CONFIGURED
  export ARLAS_AUTHENT_ISSUER
  echo "No Authentication issuer variable is set"
else
  echo ${ARLAS_AUTHENT_ISSUER} "is used for 'authentication.issuer'"
fi
envsubst '$ARLAS_AUTHENT_ISSUER' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_CLIENT_ID
if [ -z "${ARLAS_AUTHENT_CLIENT_ID}" ]; then
  ARLAS_AUTHENT_CLIENT_ID=NOT_CONFIGURED
  export ARLAS_AUTHENT_CLIENT_ID
  echo "No Authentication client_id variable is set"
else
  echo ${ARLAS_AUTHENT_CLIENT_ID} "is used for 'authentication.client_id'"
fi
envsubst '$ARLAS_AUTHENT_CLIENT_ID' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_REDIRECT_URI
if [ -z "${ARLAS_AUTHENT_REDIRECT_URI}" ]; then
  ARLAS_AUTHENT_REDIRECT_URI=NOT_CONFIGURED
  export ARLAS_AUTHENT_REDIRECT_URI
  echo "No Authentication redirect_uri variable is set"
else
  echo ${ARLAS_AUTHENT_REDIRECT_URI} "is used for 'authentication.redirect_uri'"
fi
envsubst '$ARLAS_AUTHENT_REDIRECT_URI' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_SILENT_REFRESH_REDIRECT_URI
if [ -z "${ARLAS_AUTHENT_SILENT_REFRESH_REDIRECT_URI}" ]; then
  ARLAS_AUTHENT_SILENT_REFRESH_REDIRECT_URI=NOT_CONFIGURED
  export ARLAS_AUTHENT_SILENT_REFRESH_REDIRECT_URI
  echo "No Authentication silent_refresh_redirect_uri variable is set"
else
  echo ${ARLAS_AUTHENT_SILENT_REFRESH_REDIRECT_URI} "is used for 'authentication.silent_refresh_redirect_uri'"
fi
envsubst '$ARLAS_AUTHENT_SILENT_REFRESH_REDIRECT_URI' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_SCOPE
if [ -z "${ARLAS_AUTHENT_SCOPE}" ]; then
  ARLAS_AUTHENT_SCOPE="NOT_CONFIGURED"
  export ARLAS_AUTHENT_SCOPE
  echo "No Authentication scope variable is set"
else
  echo ${ARLAS_AUTHENT_SCOPE} "is used for 'authentication.scope'"
fi
envsubst '$ARLAS_AUTHENT_SCOPE' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_TOKEN_ENDPOINT
if [ -z "${ARLAS_AUTHENT_TOKEN_ENDPOINT}" ]; then
  ARLAS_AUTHENT_TOKEN_ENDPOINT="NOT_CONFIGURED"
  export ARLAS_AUTHENT_TOKEN_ENDPOINT
  echo "No Authentication token_endpoint variable is set"
else
  echo ${ARLAS_AUTHENT_TOKEN_ENDPOINT} "is used for 'authentication.token_endpoint'"
fi
envsubst '$ARLAS_AUTHENT_TOKEN_ENDPOINT' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_USERINFO_ENDPOINT
if [ -z "${ARLAS_AUTHENT_USERINFO_ENDPOINT}" ]; then
  ARLAS_AUTHENT_USERINFO_ENDPOINT="NOT_CONFIGURED"
  export ARLAS_AUTHENT_USERINFO_ENDPOINT
  echo "No Authentication userinfo_endpoint variable is set"
else
  echo ${ARLAS_AUTHENT_USERINFO_ENDPOINT} "is used for 'authentication.userinfo_endpoint'"
fi
envsubst '$ARLAS_AUTHENT_USERINFO_ENDPOINT' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_JWKS_ENDPOINT
if [ -z "${ARLAS_AUTHENT_JWKS_ENDPOINT}" ]; then
  ARLAS_AUTHENT_JWKS_ENDPOINT="NOT_CONFIGURED"
  export ARLAS_AUTHENT_JWKS_ENDPOINT
  echo "No Authentication jwks_endpoint variable is set"
else
  echo ${ARLAS_AUTHENT_JWKS_ENDPOINT} "is used for 'authentication.jwks_endpoint'"
fi
envsubst '$ARLAS_AUTHENT_JWKS_ENDPOINT' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_LOGIN_URL
if [ -z "${ARLAS_AUTHENT_LOGIN_URL}" ]; then
  ARLAS_AUTHENT_LOGIN_URL="NOT_CONFIGURED"
  export ARLAS_AUTHENT_LOGIN_URL
  echo "No Authentication login_url variable is set"
else
  echo ${ARLAS_AUTHENT_LOGIN_URL} "is used for 'authentication.login_url'"
fi
envsubst '$ARLAS_AUTHENT_LOGIN_URL' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_LOGOUT_URL
if [ -z "${ARLAS_AUTHENT_LOGOUT_URL}" ]; then
  ARLAS_AUTHENT_LOGOUT_URL="NOT_CONFIGURED"
  export ARLAS_AUTHENT_LOGOUT_URL
  echo "No Authentication logout_url variable is set"
else
  echo ${ARLAS_AUTHENT_LOGOUT_URL} "is used for 'authentication.logout_url'"
fi
envsubst '$ARLAS_AUTHENT_LOGOUT_URL' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_SHOW_DEBUG
if [ -z "${ARLAS_AUTHENT_SHOW_DEBUG}" ]; then
  ARLAS_AUTHENT_SHOW_DEBUG=false
  export ARLAS_AUTHENT_SHOW_DEBUG
  echo "No Authentication show_debug_information variable is set. Default value is 'false'"
else
  echo ${ARLAS_AUTHENT_SHOW_DEBUG} "is used for 'authentication.show_debug_information'"
fi
envsubst '$ARLAS_AUTHENT_SHOW_DEBUG' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_REQUIRE_HTTPS
if [ -z "${ARLAS_AUTHENT_REQUIRE_HTTPS}" ]; then
  ARLAS_AUTHENT_REQUIRE_HTTPS=true
  export ARLAS_AUTHENT_REQUIRE_HTTPS
  echo "No Authentication require_https variable is set. Default value is 'true'"
else
  echo ${ARLAS_AUTHENT_REQUIRE_HTTPS} "is used for 'authentication.require_https'"
fi
envsubst '$ARLAS_AUTHENT_REQUIRE_HTTPS' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_RESPONSE_TYPE
if [ -z "${ARLAS_AUTHENT_RESPONSE_TYPE}" ]; then
  ARLAS_AUTHENT_RESPONSE_TYPE="NOT_CONFIGURED"
  export ARLAS_AUTHENT_RESPONSE_TYPE
  echo "No Authentication response_type variable is set."
else
  echo ${ARLAS_AUTHENT_RESPONSE_TYPE} "is used for 'authentication.response_type'"
fi
envsubst '$ARLAS_AUTHENT_RESPONSE_TYPE' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_SILENT_REFRESH_TIMEOUT
if [ -z "${ARLAS_AUTHENT_SILENT_REFRESH_TIMEOUT}" ]; then
  ARLAS_AUTHENT_SILENT_REFRESH_TIMEOUT=5000
  export ARLAS_AUTHENT_SILENT_REFRESH_TIMEOUT
  echo "No Authentication silent_refresh_timeout variable is set. Default value is 5000."
else
  echo ${ARLAS_AUTHENT_SILENT_REFRESH_TIMEOUT} "is used for 'authentication.silent_refresh_timeout'"
fi
envsubst '$ARLAS_AUTHENT_SILENT_REFRESH_TIMEOUT' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_TIMEOUT_FACTOR
if [ -z "${ARLAS_AUTHENT_TIMEOUT_FACTOR}" ]; then
  ARLAS_AUTHENT_TIMEOUT_FACTOR=0.75
  export ARLAS_AUTHENT_TIMEOUT_FACTOR
  echo "No Authentication timeout_factor variable is set. Default value is 0.75"
else
  echo ${ARLAS_AUTHENT_TIMEOUT_FACTOR} "is used for 'authentication.timeout_factor'"
fi
envsubst '$ARLAS_AUTHENT_TIMEOUT_FACTOR' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_ENABLE_SESSION_CHECKS
if [ -z "${ARLAS_AUTHENT_ENABLE_SESSION_CHECKS}" ]; then
  ARLAS_AUTHENT_ENABLE_SESSION_CHECKS=true
  export ARLAS_AUTHENT_ENABLE_SESSION_CHECKS
  echo "No Authentication session_checks_enabled variable is set. Default value is 'true'"
else
  echo ${ARLAS_AUTHENT_ENABLE_SESSION_CHECKS} "is used for 'authentication.session_checks_enabled'"
fi
envsubst '$ARLAS_AUTHENT_ENABLE_SESSION_CHECKS' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_CLEAR_HASH
if [ -z "${ARLAS_AUTHENT_CLEAR_HASH}" ]; then
  ARLAS_AUTHENT_CLEAR_HASH=false
  export ARLAS_AUTHENT_CLEAR_HASH
  echo "No Authentication clear_hash_after_login variable is set. Default value is 'false'"
else
  echo ${ARLAS_AUTHENT_CLEAR_HASH} "is used for 'authentication.clear_hash_after_login'"
fi
envsubst '$ARLAS_AUTHENT_CLEAR_HASH' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_STORAGE
if [ -z "${ARLAS_AUTHENT_STORAGE}" ]; then
  ARLAS_AUTHENT_STORAGE=localstorage
  export ARLAS_AUTHENT_STORAGE
  echo "No Authentication storage variable is set. Default value is 'localstorage'"
else
  echo ${ARLAS_AUTHENT_STORAGE} "is used for 'authentication.storage'"
fi
envsubst '$ARLAS_AUTHENT_STORAGE' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_DISABLE_AT_HASH_CHECK
if [ -z "${ARLAS_AUTHENT_DISABLE_AT_HASH_CHECK}" ]; then
  ARLAS_AUTHENT_DISABLE_AT_HASH_CHECK=false
  export ARLAS_AUTHENT_DISABLE_AT_HASH_CHECK
  echo "No Authentication disable_at_hash_check variable is set. Default value is 'false'"
else
  echo ${ARLAS_AUTHENT_DISABLE_AT_HASH_CHECK} "is used for 'authentication.disable_at_hash_check'"
fi
envsubst '$ARLAS_AUTHENT_DISABLE_AT_HASH_CHECK' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_DUMMY_CLIENT_SECRET
if [ -z "${ARLAS_AUTHENT_DUMMY_CLIENT_SECRET}" ]; then
  ARLAS_AUTHENT_DUMMY_CLIENT_SECRET=NOT_CONFIGURED
  export ARLAS_AUTHENT_DUMMY_CLIENT_SECRET
  echo "No Authentication dummy_client_secret variable is set. Default value is NOT_CONFIGURED"
else
  echo ${ARLAS_AUTHENT_DUMMY_CLIENT_SECRET} "is used for 'authentication.dummy_client_secret'"
fi
envsubst '$ARLAS_AUTHENT_DUMMY_CLIENT_SECRET' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_CUSTOM_QUERY_PARAMS
if [ -z "${ARLAS_AUTHENT_CUSTOM_QUERY_PARAMS}" ]; then
  ARLAS_AUTHENT_CUSTOM_QUERY_PARAMS="[]"
  export ARLAS_AUTHENT_CUSTOM_QUERY_PARAMS
  echo "None Authentication custom query params is defined"
else
  echo ${ARLAS_AUTHENT_CUSTOM_QUERY_PARAMS} "is used for 'authentication.custom_query_params' in settings.yaml file"
fi
envsubst '$ARLAS_AUTHENT_CUSTOM_QUERY_PARAMS' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_MODE
if [ -z "${ARLAS_AUTHENT_MODE}" ]; then
  ARLAS_AUTHENT_MODE='iam'
  export ARLAS_AUTHENT_MODE
  echo "Default auth.mod: 'iam' "
else
  echo ${ARLAS_AUTHENT_MODE} "is used for 'authentication.auth_mode'. Default value is 'iam'"
fi
envsubst '$ARLAS_AUTHENT_MODE' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### THRESHOLD
if [ -z "${ARLAS_AUTHENT_THRESHOLD}" ]; then
  ARLAS_AUTHENT_THRESHOLD=60000
  export ARLAS_AUTHENT_THRESHOLD
  echo "Default threshold: 60000"
else
  echo ${ARLAS_AUTHENT_THRESHOLD} "is used for 'authentication.threshold'. Default value is '60000'"
fi
envsubst '$ARLAS_AUTHENT_THRESHOLD' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_IAM_SERVER_URL
if [ -z "${ARLAS_IAM_SERVER_URL}" ]; then
  ARLAS_IAM_SERVER_URL="http://localhost:9997"
  export ARLAS_IAM_SERVER_URL
  echo "Default url : http://localhost:9997"
else
  echo ${ARLAS_IAM_SERVER_URL} "is used for 'authentication.url'."
fi
envsubst '$ARLAS_IAM_SERVER_URL' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### ARLAS_AUTHENT_SIGN_UP_ENABLED
if [ -z "${ARLAS_AUTHENT_SIGN_UP_ENABLED}" ]; then
  ARLAS_AUTHENT_SIGN_UP_ENABLED=false
  export ARLAS_AUTHENT_SIGN_UP_ENABLED
  echo "No Authentication sign_up_enabled variable is set. Default value is 'false'"
else
  echo ${ARLAS_AUTHENT_SIGN_UP_ENABLED} "is used for 'authentication.sign_up_enabled'"
fi
envsubst '$ARLAS_AUTHENT_SIGN_UP_ENABLED' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### Array of statics links
if [ -z "${ARLAS_STATIC_LINKS}" ]; then
  ARLAS_STATIC_LINKS="[]"
  export ARLAS_STATIC_LINKS
  echo "None static link is defined"
else
  echo ${ARLAS_STATIC_LINKS} "is used for 'links' in settings.yaml file"
fi
envsubst '$ARLAS_STATIC_LINKS' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### Array of schemas json
if [ -z "${ARLAS_EXTERNAL_NODE_PAGE}" ]; then
  ARLAS_EXTERNAL_NODE_PAGE=false
  export ARLAS_EXTERNAL_NODE_PAGE
  echo "None external node page are defined"
else
  echo ${ARLAS_EXTERNAL_NODE_PAGE} "is used for 'external_node_page' in settings.yaml file"
fi
envsubst '$ARLAS_EXTERNAL_NODE_PAGE' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

### Array of schemas json
if [ -z "${ARLAS_EXTERNAL_NODE_SCHEMAS}" ]; then
  ARLAS_EXTERNAL_NODE_SCHEMAS="[]"
  export ARLAS_EXTERNAL_NODE_SCHEMAS
  echo "None external node schemas are defined"
else
  echo ${ARLAS_EXTERNAL_NODE_SCHEMAS} "is used for 'external_node_schemas' in settings.yaml file"
fi
envsubst '$ARLAS_EXTERNAL_NODE_SCHEMAS' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml



### Boolean
if [ -z "${ARLAS_USE_TIME_FILTER}" ]; then
  ARLAS_USE_TIME_FILTER=false
  export ARLAS_USE_TIME_FILTER
  echo "No time filter are used"
else
  echo ${ARLAS_USE_TIME_FILTER} "is used for 'use_time_filter' in settings.yaml file"
fi
envsubst '$ARLAS_USE_TIME_FILTER' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

# Enable advanced feature like h3 aggregation
if [ -z "${ARLAS_ENABLE_ADVANCED_FEATURES}" ]; then
  ARLAS_ENABLE_ADVANCED_FEATURES=false
  export ARLAS_ENABLE_ADVANCED_FEATURES
  echo "advanced feature are not allowed"
else
  echo ${ARLAS_ENABLE_ADVANCED_FEATURES} "is used for 'enable_advanced_features' in settings.yaml file"
fi
envsubst 'ARLAS_ENABLE_ADVANCED_FEATURES' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

# Allow applying an geohash/geotile aggregation on a geoshape field
if [ -z "${ARLAS_GEOSHAPE_AGG}" ]; then
  ARLAS_GEOSHAPE_AGG=false
  export ARLAS_GEOSHAPE_AGG
  echo "geohash/geotile aggregation on a geoshape field are not allowed"
else
  echo ${ARLAS_ENABLE_H3ARLAS_GEOSHAPE_AGG} "is used for 'enable_geoshape_agg' in settings.yaml file"
fi
envsubst 'ARLAS_GEOSHAPE_AGG' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

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

# Set Tab title name
if [ -z "${ARLAS_TAB_NAME}" ]; then
  ARLAS_TAB_NAME="ARLAS-wui-builder"
  export ARLAS_TAB_NAME
  echo "ARLAS-wui-builder is used as tab name for the app"
else
  echo ${ARLAS_TAB_NAME}  "is used as tab name "
fi
envsubst '$ARLAS_TAB_NAME' < /usr/share/nginx/html/settings.yaml > /usr/share/nginx/html/settings.yaml.tmp
mv /usr/share/nginx/html/settings.yaml.tmp /usr/share/nginx/html/settings.yaml

envsubst '$ARLAS_BUILDER_BASE_HREF' < /usr/share/nginx/html/index.html > /usr/share/nginx/html/index.html.tmp
mv /usr/share/nginx/html/index.html.tmp /usr/share/nginx/html/index.html

envsubst '$ARLAS_BUILDER_APP_PATH' < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf.tmp
mv /etc/nginx/conf.d/default.conf.tmp /etc/nginx/conf.d/default.conf



nginx -g "daemon off;"
