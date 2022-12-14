/*
### Kontaktskjema:
  Som bruker av nettsiden
  Ønsker jeg å ta kontakt med NKF
  Slik at jeg kan få svar på spørsmålet mitt
### Scenario:
  Gitt at jeg er inne på nettsiden
  Når jeg klikker meg inn på ‘om oss’ siden
    Og finner kontakt oss-linken
  Så kan jeg fylle ut et kontaktskjema med min henvendelse
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
    it('ønsker jeg å kunne å kunne kontakte NKF', () => {
      cy.get('.ContactForm').should('be.visible');
    })
    it('slik at jeg får sendt et spørsmål til NKF', () => {
      cy.get('#name')
        .type('CyTest')
        .get('#email')
        .type('toreorheim@gmail.com')
        .get('#message')
        .type('Dette er en cypress test')
        .get('.ContactForm button')
        .should('contain', 'Send Mail')
        .click();
      cy.get('.Main p').should('contain', 'Epost er levert')
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
    it('ønsker jeg å kunne å kunne kontakte NKF', () => {
      cy.get('.ContactForm').should('be.visible');
    })
    it('slik at jeg får sendt et spørsmål til NKF', () => {
      cy.get('#name')
        .type('CyTest')
        .get('#email')
        .type('toreorheim@gmail.com')
        .get('#message')
        .type('Dette er en cypress test')
        .get('.ContactForm button')
        .should('contain', 'Send Mail')
        .click();
      cy.get('.Main p').should('contain', 'Epost er levert')
    })
  })
})

export {};