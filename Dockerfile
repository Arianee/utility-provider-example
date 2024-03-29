FROM nginx:1.24.0-alpine

COPY ./build /usr/share/nginx/html/
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./nginx/app.conf /etc/nginx/conf.d/app.conf
