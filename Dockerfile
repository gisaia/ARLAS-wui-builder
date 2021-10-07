FROM nginx:1.13.3-alpine

RUN apk add --update bash jq netcat-openbsd curl && rm -rf /var/cache/apk/*

## Copy our default nginx config
COPY nginx/default.conf /etc/nginx/conf.d/

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

## From 'builder' stage copy over the artifacts in dist folder to default nginx public folder
COPY ./dist/ARLAS-wui-builder /usr/share/nginx/html
COPY ./scripts/start.sh /usr/share/nginx/

HEALTHCHECK CMD curl --fail http://localhost:80/ || exit 1

CMD /usr/share/nginx/start.sh
