/*
### Informasjon om NKF-styremedlem:
  Som bruker av nettsiden
  Ønsker jeg å se hvem som sitter i styret til NKF
  Slik at jeg vet hvem de er
### Scenario:
  Gitt at jeg er inne på nettsiden
  Når jeg går til om oss-siden
  Så kan jeg se hvem som sitter i styret
*/

describe('nasjonaleRekorder', () => {
  context('desktopSjekk', () => {
    beforeEach(() => {
      cy.viewport(1920,1080);
    })
    it('gitt at jeg er inne på nettsiden', () => {
      cy.intercept({
        method: 'GET',
        url: '',
      }).as('loadingCheck');
      cy.visit('http://localhost:3000/OmOss')
      cy.wait('@loadingCheck').then((interception) => {
        assert.isNotNull(interception.response?.body, 'OmOss has loaded')
      })
    })
    it('ønsker jeg å se hvem som er i styret', () => {
      cy.get('h2').should('contain', 'Styret');
      cy.get('.brreg')
        .get('.styreTable')
        .get('tbody').should('be.visible');
    })
  })
  context('mobilsjekk', () => {
    beforeEach(() => {
      cy.viewport('iphone-6');
    })
    it('gitt at jeg er inne på nettsiden', () => {
      cy.intercept({
        method: 'GET',
        url: '',
      }).as('loadingCheck');
      cy.visit('http://localhost:3000/OmOss')
      cy.wait('@loadingCheck').then((interception) => {
        assert.isNotNull(interception.response?.body, 'OmOss has loaded')
      })
    })
    it('ønsker jeg å se hvem som er i styret', () => {
      cy.get('h2').should('contain', 'Styret');
      cy.get('.brreg')
        .get('.styreTable')
        .get('tbody').should('be.visible');
    })
  })
})

export {};