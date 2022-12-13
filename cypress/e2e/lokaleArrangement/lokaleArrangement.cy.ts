/*
### Lokale arrangement:
  Som bruker av nettsiden
  Ønsker jeg å se om det er lokale hendelser i nærheten av meg
  Slik at jeg kan møte andre som er interessert i kubing
### Scenario:
  Gitt at jeg er inne på nettsiden
  Når jeg trykker på lokale arrangement-siden
  Så finner jeg informasjon om det er noen lokale arrangement i nærheten av meg
    Og informasjon om når disse lokale arrangementene foregår.
*/

describe('Desktopsjekk', () => {
  context.skip('Som bruker av nettstedet', () => {
    beforeEach(() => {
      cy.viewport(1920, 1080);
    });
    it('Som bruker av nettsiden', () => {
      cy.intercept({
        method: 'GET',
        url: 'https://sheets.googleapis.com/**/*',
      }).as('loadingCheck')
      cy.visit('http://localhost:3000/LokaleArrangement');
      cy.wait('@loadingCheck').then((interception) => {
        assert.isNotNull(interception.response?.body, 'Page has loaded')
      })
      
    });
    it('Ønsker jeg å se om det er lokale hendelser i nærheten av meg', () => {
      cy.get('H1').contains('Lokale Arrangement');
      cy.get('H2 a').contains('Oslo-viken');
    });
    it('Slik at jeg kan møte andre som er interessert i kubing', () => {
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

  context.skip('Mobilsjekk', () => {
    beforeEach(() => {
      cy.viewport('iphone-6');
    });
    it('Som bruker av nettsiden', () => {
      cy.visit('http://localhost:3000/LokaleArrangement');
    });
    it('Ønsker jeg å se om det er lokale hendelser i nærheten av meg', () => {
      cy.get('H1').contains('Lokale Arrangement');
      cy.get('H2 a').contains('Oslo-viken');
    });
    it('Slik at jeg kan møte andre som er interessert i kubing', () => {
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
});

export {}