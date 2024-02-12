## Norges Kuberforbunds website
This code runs at [kubing.no](https://kubing.no).

## Run the website locally
This guide is in the works and will be updated in the future. We are also working to avoid you having to force install with npm.
The following is a step by step guide to run the website locally.
Here is the list of necessary dependencies, make sure to have all installed:
* git
* npm

### Create .env file
Create an empty .env file in the root of the project.
Add the following to this file: `REACT_APP_<KEYNAME>=<APIKEY>`
The `KEYNAME` and `APIKEY` is currently not publicly available, but we are working to get this secure and working.

### Install packages using npm
Currently your are required to force install packages via npm by using the `-f` flag, we will try to fix this at some point.
Run `npm install -f` to install the relevant packages, and ignore the long list of warnings.

### Run the server locally
You can use `npm start` to run the app in developer mode locally.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

To run cypress tests run `npm test`.
