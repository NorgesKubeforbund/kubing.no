
/*
### Informasjon om konkurranser:
  Som bruker av nettsiden
  Ønsker jeg å bruke navigasjonsbaren
  Slik at jeg kan se navigere på domenet
### Scenario: Kommede konkurranser
  Gitt at jeg er inne på nettsiden
  Når jeg klikker på navigasjonsbaren
  Så ser så blir jeg tatt til siden jeg valgte
*/

describe('Navigasjonstesting', () => {
  context('1920p desktop', () => {
    beforeEach(() => {
      cy.viewport(1920, 1080);
    });
    it('at jeg er inne på nettsiden', () => {
      cy.visit('http://localhost:3000');
      cy.get('.NavBar > button').should(($buttons) => {
        expect($buttons).to.have.length(8);
        expect($buttons.eq(0)).to.contain('Hjem');
        expect($buttons.eq(1)).to.contain('Konkurranser');
        expect($buttons.eq(2)).to.contain('Butikker');
        expect($buttons.eq(3)).to.contain('Guider');
        expect($buttons.eq(4)).to.contain('Om Oss');
        expect($buttons.eq(5)).to.contain('Linker');
        expect($buttons.eq(6)).to.contain('Norske Rekorder');
        expect($buttons.eq(7)).to.contain('Lokale Arrangement');
      });
      cy.get('.NavBar > button').first().should('have.class', 'MenuLinks active')
    });
    
    it('jeg klikker på navigasjonsbaren', () => {
      cy.get('.NavBar').contains('Hjem').click();
    });
    
    it('så blir jeg tatt til siden jeg valgte', () => {
      cy.url().should('eq', 'http://localhost:3000/')
    });
  });

  context('mobile layout', () => {
    beforeEach(() => {
      cy.viewport('iphone-6');
    });
    it('at jeg er inne på nettsiden', () => {
      cy.visit('http://localhost:3000');
      cy.get('.DropDown').click()
      cy.get('.NavBarResponsive > button').should(($buttons) => {
        expect($buttons).to.have.length(8);
        expect($buttons.eq(0)).to.contain('Hjem');
        expect($buttons.eq(1)).to.contain('Konkurranser');
        expect($buttons.eq(2)).to.contain('Butikker');
        expect($buttons.eq(3)).to.contain('Guider');
        expect($buttons.eq(4)).to.contain('Om Oss');
        expect($buttons.eq(5)).to.contain('Linker');
        expect($buttons.eq(6)).to.contain('Norske Rekorder');
        expect($buttons.eq(7)).to.contain('Lokale Arrangement');
      });
      cy.get('.NavBarResponsive > button').first().should('have.class', 'MenuLinks active')
    });
    
    it('jeg klikker på navigasjonsbaren', () => {
      cy.get('.NavBarResponsive').contains('Hjem').click();
    });
    
    it('så blir jeg tatt til siden jeg valgte', () => {
      cy.url().should('eq', 'http://localhost:3000/')
    });
  });
});
