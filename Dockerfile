### STAGE 1: Build ###

# We label our stage as 'builder'
FROM node:18.20.5 AS builder

COPY package.json package-lock.json ./
COPY ./patches/ ./patches/

## Storing node modules on a separate layer will prevent unnecessary npm installs at each build
RUN npm i --ignore-scripts && npm run postinstall && mkdir /ng-app && cp -R ./node_modules ./ng-app

COPY ./scripts/start.sh ./ng-app

WORKDIR /ng-app

COPY . .

## Build the angular app in production mode and store the artifacts in dist folder
RUN npm run build

### STAGE 2: Setup ###

FROM nginx:1.29-alpine3.22-slim

RUN apk update && apk upgrade && apk add --no-cache bash curl jq netcat-openbsd && rm -rf /var/cache/apk/*

## Copy our default nginx config
COPY nginx/default.conf /etc/nginx/conf.d/
COPY nginx/nginx.conf /etc/nginx/nginx.conf

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

## From 'builder' stage copy over the artifacts in dist folder to default nginx public folder
COPY --from=builder /ng-app/dist/ARLAS-wui-builder /usr/share/nginx/html
COPY --from=builder /ng-app/start.sh /usr/share/nginx/

## Fix permissions for template filling at container startup
## Nginx user must be able to set variables in these files
RUN touch /usr/share/nginx/html/settings.yaml.tmp && \
    touch /etc/nginx/conf.d/default.conf.tmp && \
    touch /usr/share/nginx/html/index.html.tmp &&  \
    touch /usr/share/nginx/html/default.json.tmp && \
    chmod 666 /usr/share/nginx/html/settings.yaml.tmp \
        /usr/share/nginx/html/settings.yaml \
        /etc/nginx/conf.d/default.conf.tmp \
        /etc/nginx/conf.d/default.conf \
        /usr/share/nginx/html/index.html.tmp \
        /usr/share/nginx/html/index.html \
        /usr/share/nginx/html/default.json.tmp \
        /usr/share/nginx/html/default.json \
        /usr/share/nginx/html/assets/i18n/en.json \
        /usr/share/nginx/html/assets/i18n/fr.json

USER nginx

HEALTHCHECK CMD curl --fail http://localhost:8080/ || exit 1

CMD ["/usr/share/nginx/start.sh"]
