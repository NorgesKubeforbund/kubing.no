/*
### Informasjon om konkurranser:
  Som bruker av nettsiden
  Ønsker jeg å se når de neste konkurransene er
  Slik at jeg kan se hvilke konkurranser jeg kan delta inn
### Scenario: Kommede konkurranser
  Gitt at jeg er inne på nettstedet
  Når jeg går til konkurranser-siden
  Så ser jeg en liste over kommende konkurranser
*/
  
describe('KonkurranseData', () => {
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
  })
  context('Desktopsjekk', () => {
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
  })
})
