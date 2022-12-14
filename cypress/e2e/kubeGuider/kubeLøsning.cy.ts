import { defineConfig } from "cypress";
/*
### Løsing av kuber/guide:
  Som bruker av nettsiden
  Ønsker jeg å finne en guide til å løse kube
  Slik at jeg kan lære å løse kube
### Scenario:
  Gitt at jeg er inne på nettsiden
  Når jeg går til guider-siden
  Så ser jeg en liste over guider jeg kan bruke til å lære meg å løse Rubiks kube
*/

describe('KubeGuider', () => {
  context('Desktopsjekk', () => {
    beforeEach(( ) => {
      cy.viewport(1920,1080);
    });
    it('gitt at jeg er inne på nettsiden', () => {
      cy.intercept({
        method: 'GET',
        url: '',
      }).as('loadingCheck');
      cy.visit('http://localhost:3000/Guider');
      cy.wait('@loadingCheck').then((interception) => {
        assert.isNotNull(interception.response?.body, 'Page has been loaded')
      })
    })
    it('ønsker jeg å finne en guide for å løse en kube', () => {
      cy.get('.guideContainer').should('be.visible');
    })
    it('slik at jeg kan lære å løse en kube', () => {
      cy.intercept({
        method: 'GET',
        url: 'http://localhost:3000/static/media/3x3-Begynnermetode.5e5f1c604166b4666939.pdf',
      }).as('downloaded')
      cy.get('.norskGuide > button')
        .should('have.class', 'PDFButton')
        .click()
        .wait('@downloaded')
        .then((interception) => {
          assert.isNotNull(interception.response?.body, 'File downloaded')
        });
      cy.get('.engelskGuide > a')
        .invoke('attr', 'href')
        .then(href => {
          cy.request('href')
            .its('status')
            .should('eq', 200);
        })
    })
  })
  context('mobilSjekk', () => {
    beforeEach(( ) => {
      cy.viewport('iphone-6');
    });
    it('gitt at jeg er inne på nettsiden', () => {
      cy.intercept({
        method: 'GET',
        url: '',
      }).as('loadingCheck');
      cy.visit('http://localhost:3000/Guider');
      cy.wait('@loadingCheck').then((interception) => {
        assert.isNotNull(interception.response?.body, 'Page has been loaded')
      })
    })
    it('ønsker jeg å finne en guide for å løse en kube', () => {
      cy.get('.guideContainer').should('be.visible');
    })
    it('slik at jeg kan lære å løse en kube', () => {
      cy.intercept({
        method: 'GET',
        url: 'http://localhost:3000/static/media/3x3-Begynnermetode.5e5f1c604166b4666939.pdf',
      }).as('downloaded')
      cy.get('.norskGuide > button')
        .should('have.class', 'PDFButton')
        .click()
        .wait('@downloaded')
        .then((interception) => {
          assert.isNotNull(interception.response?.body, 'File downloaded')
        })
      cy.get('.engelskGuide > a')
        .invoke('attr', 'href')
        .then(href => {
          cy.request('href')
            .its('status')
            .should('eq', 200);
        })
    })
  })
})

export {};