# Norges Kubeforbund's website
This code runs at [kubing.no](https://kubing.no).

## Run the website locally
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
RESEND_API_KEY={secret}
RESEND_DOMAIN={domain}
CRON_SECRET={secret} # openssl rand -base64 32
APP_URL=http://localhost:3000 # https://kubing.no for production
VIPPS_CLIENT_ID={clientId}
VIPPS_CLIENT_SECRET={secret}
VIPPS_SUBSCRIPTION_KEY={Ocp-Apim-Subscription-Key}
VIPPS_MSN={Merchant-Serial-Number}
VIPPS_URL=https://apitest.vipps.no # https://api.vipps.no for production
VIPPS_REF={unique reference}
VIPPS_WEBHOOK_SECRET={secret} # Follow instructions below
```

### Setting up the Vipps webhook
The webhook requires a public HTTPS URL and Python installed.
The script below works on Linux and macOS. If you're on Windows, you're on your own (or use WSL).

Before you begin, add `APP_URL` and all Vipps environment variables except `VIPPS_WEBHOOK_SECRET` to your `.env` file.

Then run the following from the project root. It registers the webhook and appends `VIPPS_WEBHOOK_SECRET` to your `.env`:

```bash
cd webhook
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..
python3 webhook/add_webhook.py
deactivate
rm -r webhook/.venv
```

If you need to delete a webhook, run this the same way:

```bash
cd webhook
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..
python3 webhook/delete_webhook.py
deactivate
rm -r webhook/.venv
```

## Database migration
When running the database for the first time, no migration is needed
and the schema will be automatically created.

If there are any new migration files created in the `schema` directory,
the migrations need to be applied in the correct order based on their file names.

Note: Migrating the database is really only important for production. For staging
and local developement, you might as well just delete the docker volume for the database.
