FROM nginx
COPY dist/ARLAS-wui-builder /usr/share/nginx/html
EXPOSE 80
