import { defineConfig } from "cypress";

import fs from 'fs';

module.exports = defineConfig({
  chromeWebSecurity: true,
  projectId: '9a3n5g',
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        countDlFiles(folderName) {
          return new Promise((resolve, reject) => {
            fs.readdir(folderName, (err, files) => {
              if (err) {
                return reject(err)
              }
              resolve(files.length)
            })
          })
        },
      })
    }
  }
});
