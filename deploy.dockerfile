FROM node:16

# Install nginx
RUN apt-get update \
  && apt-get install -y nginx --no-install-recommends \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN npm install -g cross-env

# We copy the code from the docker-compose-yml
CMD mkdir /leedex-ui
WORKDIR /leedex-ui

COPY . .
RUN yarn install --frozen-lockfile
RUN yarn run build

RUN cp -r build/dist/* /var/www/

EXPOSE 80

## Copying default configuration
RUN cp conf/nginx.conf /etc/nginx/nginx.conf
RUN chmod a+x conf/serve.sh

## Entry point
ENTRYPOINT ["conf/serve.sh"]
