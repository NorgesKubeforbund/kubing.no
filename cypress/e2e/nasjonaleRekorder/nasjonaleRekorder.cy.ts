/*
### Nasjonale rekorder:
  Som bruker av nettsiden 
  Ønsker jeg å se hva norgesrekordene er 
  Slik at jeg kan oppdatere meg på norgesrekordene
### Scenario:
  Gitt at jeg er inne på nettsiden
  Når jeg går til norske rekorder-siden
  Så ser jeg en liste over hvem som har norgesrekordene og hva de er på
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
      cy.visit('http://localhost:3000/Rekorder')
      cy.wait('@loadingCheck').then((interception) => {
        assert.isNotNull(interception.response?.body, 'Rekorder has loaded')
      })
    })
    it('ønsker jeg å kunne se hva offisielle rekorder', () => {
      cy.get('.NRTable').should('exist');
    })
    it('Og jeg vil se de uofisielle rekordene', () => {
      cy.get('div .tab').find('button h3')
        .then(($el) => {
          cy.get('.uoffisielleRekorder').click();
          cy.get('.NRTable').should('exist');
        })
    })
    it('Og jeg vil se de uofisielle rekordene', () => {
      cy.get('div .tab').find('button h3')
        .then(($el) => {
          cy.get('.nonWcaRekorder').click();
          cy.get('.NRTable').should('exist');
        })
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
      cy.visit('http://localhost:3000/Rekorder')
      cy.wait('@loadingCheck').then((interception) => {
        assert.isNotNull(interception.response?.body, 'Rekorder has loaded')
      })
    })
    it('ønsker jeg å kunne se hva offisielle rekorder', () => {
      cy.get('.NRTable').should('exist');
    })
    it('Og jeg vil se de uofisielle rekordene', () => {
      cy.get('div .tab').find('button h3')
        .then(($el) => {
          cy.get('.uoffisielleRekorder').click();
          cy.get('.NRTable').should('exist');
        })
    })
    it('Og jeg vil se de uofisielle rekordene', () => {
      cy.get('div .tab').find('button h3')
        .then(($el) => {
          cy.get('.nonWcaRekorder').click();
          cy.get('.NRTable').should('exist');
        })
    })
  })
})

export {};