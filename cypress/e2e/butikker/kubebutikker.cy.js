/// <reference types="cypress" />
/*
### Kubebutikk-informasjon:
  Som bruker av nettsiden
  Ønsker jeg å finne hvor jeg kan kjøpe kuber
  Slik at jeg kan kjøpe kuber
### Scenario:
  Gitt at jeg er inne på nettsiden
  Når jeg går til kjøpe kuber-siden
  Så finner jeg linker til butikker hvor jeg kan kjøpe kuber
*/

describe('Butikkdata', () => {
  context('Desktopsjekk', () => {
    beforeEach(() => {
      cy.viewport(1920, 1080);
    });
    it('Gitt at jeg er inne på nettsiden', () => {
      cy.visit('http://localhost:3000/Butikker');
    });
    it('Ønsker jeg å se hvor jeg kan kjøpe kuber', () => {
      cy.get('H1').contains('Butikker');
      cy.get('H2 a').contains('Cuboss');
      cy.get('p a').contains('Cuboss');
    });
    it('Og jeg kan besøke nettbutikkene', () => {
      //hent alle p element, lagre kvart p element som $el i $liste
      cy.get('p').each(($el, index, $list) => {
        //for kvart $el finn a-element
        cy.wrap($el).find('a')
          //hent ut href-atributt frå $el
          .invoke('attr', 'href')
          //deretter bruk href til å sjekke om man kan besøke sida
          .then(href => {
            cy.request('href')
              .its('status')
              .should('eq', 200);
          })
      })
    });
  });

  context('Mobilsjekk', () => {
    beforeEach(() => {
      cy.viewport('iphone-6');
    });
    it('Gitt at jeg er inne på nettsiden', () => {
      cy.visit('http://localhost:3000/Butikker');
    });
    it('Ønsker jeg å se hvor jeg kan kjøpe kuber', () => {
      cy.get('H1').contains('Butikker');
      cy.get('H2 a').contains('Cuboss');
      cy.get('p a').contains('Cuboss');
    });
    it('Og jeg kan besøke nettbutikkene', () => {
      //hent alle p element, lagre kvart p element som $el i $liste
      cy.get('p').each(($el, index, $list) => {
        //for kvart $el finn a-element
        cy.wrap($el).find('a')
          //hent ut href-atributt frå $el
          .invoke('attr', 'href')
          //deretter bruk href til å sjekke om man kan besøke sida
          .then(href => {
            cy.request('href')
              .its('status')
              .should('eq', 200);
          });
      })
    });
  });
});

export {};
