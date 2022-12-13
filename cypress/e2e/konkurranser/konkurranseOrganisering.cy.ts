/*
### Organisering egen konkurranse:
  Som potensiell organisator 
  Ønsker jeg å finne informasjon om hvordan en organiserer konkurranser
  Slik at jeg kan organisere min egen konkurranse
### Scenario:
  Gitt at jeg er inne på nettsiden
  Når jeg går til konkurranser-siden
    Og trykker på linken som spør om jeg ønsker å organisere en konkurranse
  Så får jeg ressurser til hvordan en skal organisere en konkurranse
    Og kontaktinformasjon til delegatene jeg kan snakke med om dette
*/

describe('KonkurranseOrganisering', () => {
  context('Desktopsjekk', () => {
    beforeEach(() => {
      cy.viewport(1920,1080);
    });
    it('gitt at jeg er inne på nettsiden', () => {
      cy.intercept({
        method: 'GET',
        url: 'https://www.worldcubeassociation.org/**/*',
      }).as('loadingCheck')
      cy.visit('http://localhost:3000/konkurranser');
      cy.wait('@loadingCheck').then((interception) => {
        assert.isNotNull(interception.response?.body, 'Page has loaded')
      })
    })
    it('vil jeg finne ut hvordan jeg kan arrangere en konkurranse', () => {
      cy.get('.arrangere button').click();
    })
    it('så skal jeg se informasjon om hvordan jeg kan arrangere konkurranser', () => {
      cy.get('.modalContent').each(($el, index, $lists) => {
        cy.get('.modalContent div').wrap($el)
          .find('p').should('be.visible')
        cy.get('.modalContent div').wrap($el)
          .find('a').should('be.visible')
      })
    })
    it('og jeg kan utforske videre', () => {
      cy.get('.modalContent')
        .get('.modalContent a')
        .invoke('attr', 'href')
        .then(href => {
          cy.request('href')
            .its('status')
            .should('eq', 200);
        })
    })
    it('og jeg kan dra tilbake til konkurranse-siden', () => {
      cy.get('.modalContainer').should('exist');
      cy.get('.modalContainer button').should('be.visible')
      cy.get('.modalCloseButton').click();
      cy.get('.modalContainer').should('not.exist');
    })
  })
  context('Mobilsjekk', () => {
    beforeEach(() => {
      cy.viewport('iphone-6');
    });
    it('gitt at jeg er inne på nettsiden', () => {
      cy.intercept({
        method: 'GET',
        url: 'https://www.worldcubeassociation.org/**/*',
      }).as('loadingCheck')
      cy.visit('http://localhost:3000/konkurranser');
      cy.wait('@loadingCheck').then((interception) => {
        assert.isNotNull(interception.response?.body, 'Page has loaded')
      })
    })
    it('vil jeg finne ut hvordan jeg kan arrangere en konkurranse', () => {
      cy.get('.arrangere button').click();
    })
    it('så skal jeg se informasjon om hvordan jeg kan arrangere konkurranser', () => {
      cy.get('.modalContent').each(($el, index, $lists) => {
        cy.get('.modalContent div').wrap($el)
          .find('p').should('be.visible')
        cy.get('.modalContent div').wrap($el)
          .find('a').should('be.visible')
      })
    })
    it('og jeg kan utforske videre', () => {
      cy.get('.modalContent')
        .get('.modalContent a')
        .invoke('attr', 'href')
        .then(href => {
          cy.request('href')
            .its('status')
            .should('eq', 200);
        })
    })
    it('og jeg kan dra tilbake til konkurranse-siden', () => {
      cy.get('.modalContainer').should('exist');
      cy.get('.modalContainer button').should('be.visible')
      cy.get('.modalCloseButton').click();
      cy.get('.modalContainer').should('not.exist');
    })
  })
})
export {};