# Norges Kubeforbund's website
This code runs at [kubing.no](https://kubing.no).

## Run the website locally
This guide is in the works and will be updated in the future.
The following is a step by step guide to run the website locally.
Here is the list of necessary dependencies, make sure to have all installed:
* git
* npm
* Docker

### Install packages using npm
Run `npm install` to install the relevant packages.

### Run the server locally
You can use `npm run dev` to run the app in developer mode locally.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Run database locally
You can use `docker compose up` to start the database locally.

## Building and running
For building and running in production:
```bash
docker compose -f compose.production.yaml up
```
Before deploying to production this should be run successfully:
```bash
npm run lint
npm run build
```

## .env file
```
REACT_APP_NORSKEREKORDERWCA_KEY={url}
REACT_APP_NORSKEREKORDERNONWCA_KEY={url}
WCA_OAUTH_CLIENT_ID={clientId}
WCA_OAUTH_SECRET={secret}
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres # Use more secure password for production
POSTGRES_DB=postgres
POSTGRES_HOST=localhost # Use "db" for docker
POSTGRES_PORT=5432
JWT_SECRET={secret} # openssl rand -base64 32
TOKEN_ENCRYPTION_SECRET={secret} # openssl rand -base64 32
```
