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
      cy.viewport(1228, 720);
    });
    it('Gitt at jeg er inne på nettsiden', () => {
      cy.intercept({
        method: 'GET',
        url: 'https://sheets.googleapis.com/**/*',
      }).as('loadingCheck')
      cy.visit('http://localhost:3000/butikker');
      cy.wait('@loadingCheck').then((interception) => {
        assert.isNotNull(interception.response?.body, 'Butikk has loaded')
      })
    });
    it('Ønsker jeg å se hvor jeg kan kjøpe kuber', () => {
      cy.get('.Element').each(($el, index, $list) => {
        cy.wrap($el)
          .find('h2 a')
          .then(($title) => {
            const storeName:string = $title.text();
            cy.wrap($el)
              .get('p a').should('contain', storeName);
          });
      });
    });
    it('Og jeg kan besøke nettbutikkene', () => {
      cy.get('.butikkDetails').each(($el, index, $list) => {
        cy.wrap($el).find('a')
          .invoke('attr', 'href')
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
      cy.get('.Element').each(($el, index, $list) => {
        cy.wrap($el)
          .find('h2 a')
          .then(($title) => {
            const storeName:string = $title.text();
            cy.wrap($el)
              .get('p a').should('contain', storeName);
          });
      });
    });

    it('Og jeg kan besøke nettbutikkene', () => {
      //hent alle p element, lagre kvart p element som $el i $liste
      cy.get('.butikkDetails').each(($el, index, $list) => {
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
