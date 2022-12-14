/*
### Løsing av kuber/guide:
  Som bruker av nettsiden
  Ønsker jeg å finne en guide til å løse kube
  Slik at jeg kan lære å løse kube
### Scenario:
  Gitt at jeg er inne på nettsiden
  Når jeg går til guider-siden
  Så ser jeg en liste over guider jeg kan bruke til å lære meg å løse Rubiks kube
*/

describe.skip('KubeGuider', () => {
  context('Desktopsjekk', () => {
    beforeEach(( ) => {
      cy.viewport(1920,1080);
    });
    it('gitt at jeg er inne på nettsiden', () => {
      cy.intercept({
        method: 'GET',
        url: '',
      }).as('loadingCheck');
      cy.visit('http://localhost:3000/Guider');
      cy.wait('@loadingCheck').then((interception) => {
        assert.isNotNull(interception.response?.body, 'Page has been loaded')
      })
    })
    it('ønsker jeg å se', () => {
      cy.get('something');
    })
    it('slik at jeg kan lære å løse en kube', () => {
      cy.get('what you need');
    })
  })
})

export {};