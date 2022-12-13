/*
### Introduksjon til kubing:
  Som bruker av nettsiden
  Ønsker jeg å finne informasjon om kubing
  Slik at jeg blir introdusert til miljøet
### Scenario:
  Gitt at jeg er inne på nettsiden
  Når jeg åpner hjemmesiden
  Så blir eg introdusert til miljøet
*/

describe('Hjemmesideinfosjekk', () => {
  context('Desktopsjekk', () => {
    beforeEach(() => {
      cy.viewport(1920, 1080);
    });
    it('Gitt at jeg er inne på nettsiden', () => {
      cy.intercept({
        method: 'GET',
        url: 'https://sheets.googleapis.com/**/*',
      }).as('loadingCheck')
      cy.visit('http://localhost:3000');
      cy.wait('@loadingCheck').then((interception) => {
        assert.isNotNull(interception.response?.body, 'Home has loaded')
      })
    });
    it('Ønsker jeg å bli ønsket velkommen', () => {
      cy.get('.Intro .MainHeader').should('be.visible');
    });
    it('Og jeg vil bli introdusert til hva kubing er for noe', () => {
      cy.get('.HomeElements .Main').each(($el, index, $list) => {
        cy.wrap($el)
          .find('.Element')
          .should('be.visible');
      })
    });
  });
  context('Mobilecheck', () => {
    beforeEach(() => {
      cy.viewport('iphone-6');
    });
    it('Gitt at jeg er inne på nettsiden', () => {
      cy.wait(500);
      cy.intercept({
        method: 'GET',
        url: 'https://sheets.googleapis.com/**/*',
      }).as('loadingCheck')
      cy.visit('http://localhost:3000');
      cy.wait('@loadingCheck').then((interception) => {
        assert.isNotNull(interception.response?.body, 'Home has loaded')
      })
    });
    it('Ønsker jeg å bli ønsket velkommen', () => {
      cy.get('.Intro .MainHeader').should('be.visible');
    });
    it('Og jeg vil bli introdusert til hva kubing er for noe', () => {
      cy.get('.HomeElements .Main').each(($el, index, $list) => {
        cy.wrap($el)
          .find('.Element')
          .should('be.visible');
      })
    })
  })
});

export {};