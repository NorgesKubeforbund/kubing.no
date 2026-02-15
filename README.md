# Norges Kubeforbund's website
This code runs at [kubing.no](https://kubing.no).

## Run the website locally
This guide is in the works and will be updated in the future.
The following is a step by step guide to run the website locally.
Here is the list of necessary dependencies, make sure to have all installed:
* git
* npm

### Install packages using npm
Run `npm install` to install the relevant packages.

### Run the server locally
You can use `npm run dev` to run the app in developer mode locally.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Building and running
For building and running in production:
```bash
npm run build
npm start
```
Before deploying to production this should be run successfully:
```bash
npm run lint
npm run build
```
