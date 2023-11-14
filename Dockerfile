### STAGE 1: Build ###
FROM activepieces/ap-base:7 AS build

# Set up backend
WORKDIR /usr/src/app
COPY . .

ARG NPM_GITHUB_TOKEN
ARG NPM_TOKEN

# explicitly set tokens from NPM repositories
RUN cat .npmrc >> $HOME/.npmrc
RUN echo //npm.pkg.github.com/:_authToken=$NPM_GITHUB_TOKEN >> $HOME/.npmrc
RUN echo //registry.npmjs.org/:_authToken=$NPM_TOKEN >> $HOME/.npmrc
RUN cat $HOME/.npmrc
RUN apt update && apt install -y cmake libopenblas-dev patchelf

# Install backend dependencies and build the projects
COPY .npmrc package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx nx run-many --target=build --projects=backend,ui-core --skip-nx-cache

# Install backend production dependencies
RUN cd dist/packages/backend && npm install --production --force

### STAGE 2: Run ###
FROM activepieces/ap-base:7 AS run

ARG AP_CACHE_PATH=/usr/src/cache
ARG AP_PACKAGE_ARCHIVE_PATH=/usr/src/packages

# Set default environment to "standard" if not specified
ARG ENVIRONMENT=standard

# Set up backend
WORKDIR /usr/src/app

# Install Nginx and gettext for envsubst
RUN apt-get update && apt-get install -y nginx gettext

# Copy Nginx configuration template
COPY packages/ui/core/nginx.${ENVIRONMENT}.conf /etc/nginx/nginx.conf

COPY --from=build /usr/src/app/LICENSE .

# Copy Output files to appropriate directory from build stage
COPY --from=build /usr/src/app/dist dist

# Copy Output files to appropriate directory from build stage
COPY --from=build /usr/src/app/packages packages

# Copy frontend files to Nginx document root directory from build stage
COPY --from=build /usr/src/app/dist/packages/ui/core/ /usr/share/nginx/html/

VOLUME ${AP_CACHE_PATH}
VOLUME ${AP_PACKAGE_ARCHIVE_PATH}


# Set up entrypoint script
COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]

EXPOSE 80
