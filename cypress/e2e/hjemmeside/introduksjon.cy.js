/// <reference types="cypress" />
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
      cy.visit('http://localhost:3000');
    });
    it('Ønsker jeg å bli ønsket velkommen', () => {
      cy.get('H2').contains('Velkommen');
    });
    it('Og jeg vil bli introdusert til hva kubing er for noe', () => {
      cy.get('H2').contains('Hva er \'speedcubing\'?');
    });
  });
  context('Mobilecheck', () => {
    beforeEach(() => {
      cy.viewport('iphone-6');
    });
    it('Gitt at jeg er inne på nettsiden', () => {
      cy.visit('http://localhost:3000');
    });
    it('Ønsker jeg å bli ønsket velkommen', () => {
      cy.get('H2').contains('Velkommen');
    });
    it('Og jeg vil bli introdusert til hva kubing er for noe', () => {
      cy.get('H2').contains('Hva er \'speedcubing\'?');
    });
  });
});