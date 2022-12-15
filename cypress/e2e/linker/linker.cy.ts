/*
### Relaterte ressurser:
  Som bruker av nettsiden
  Ønsker jeg å sjekke relaterte ressurser
  Slik at jeg kan utforske disse
### Scenario:
  Gitt at jeg er inne på nettsiden
  Når jeg klikker meg inn på ‘eksterne ressurser’
  Så får jeg en oversikt over eksterne ressurser som tar meg til riktige nettsider.
*/

describe('Linkersjekk', () => {
  context('Desktopsjekk', () => {
    beforeEach(() => {
      cy.viewport(1920, 1080);
    });
    it('Gitt at jeg er inne på nettsiden', () => {
      cy.visit('http://localhost:3000/Linker');
    });
    it('Ønsker å sjekke relaterte ressurser', () => {
      cy.get('H1').contains('Linker');
      cy.get('h2 a').contains('WCA');
      cy.get('p a').contains('WCA');
    });
    it('Slik at jeg kan utforske desse', () => {
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
      });
    });
  });
  context('Mobilsjekk', () => {
    beforeEach(() => {
      cy.viewport('iphone-6');
    });
    it('Gitt at jeg er inne på nettsiden', () => {
      cy.visit('http://localhost:3000/Linker');
    });
    it('Ønsker å sjekke relaterte ressurser', () => {
      cy.get('H1').contains('Linker');
      cy.get('h2 a').contains('WCA');
      cy.get('p a').contains('WCA');
    });
    it('Slik at jeg kan utforske desse', () => {
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
              .should('eq', 200)
          });
      });
    });
  });
});


export {}