### STAGE 1: Build ###

# We label our stage as 'builder'
FROM node:12.7-alpine as builder

COPY package.json package-lock.json ./

## Storing node modules on a separate layer will prevent unnecessary npm installs at each build
RUN export NODE_OPTIONS=--max_old_space_size=6144 && npm install && mkdir /ng-app && cp -R ./node_modules ./ng-app

COPY ./scripts/start.sh ./ng-app

WORKDIR /ng-app

COPY . .

## Build the angular app in production mode and store the artifacts in dist folder
RUN export NODE_OPTIONS=--max_old_space_size=6144 && $(npm bin)/ng build --prod --aot --base-href='$ARLAS_BUILDER_BASE_HREF/'

### STAGE 2: Setup ###

FROM nginx:1.13.3-alpine

RUN apk add --update bash jq netcat-openbsd curl && rm -rf /var/cache/apk/*

## Copy our default nginx config
COPY nginx/default.conf /etc/nginx/conf.d/

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

## From 'builder' stage copy over the artifacts in dist folder to default nginx public folder
COPY --from=builder /ng-app/dist/ARLAS-wui-builder /usr/share/nginx/html
COPY --from=builder /ng-app/start.sh /usr/share/nginx/

HEALTHCHECK CMD curl --fail http://localhost:80/ || exit 1

CMD /usr/share/nginx/start.sh
