///<reference types="cypress" />
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

describe('size/scaling', () => {
  context('1920p desktop', () => {
    beforeEach(() => {
      cy.viewport(1920, 1080);
    });
    it('Gitt at jeg er inne på nettsiden', () => {
      cy.intercept({
        method: 'GET',
        url: 'https://sheets.googleapis.com/**/*',
      }).as('loadingCheck')
      cy.visit('http://localhost:3000');
      cy.wait('@loadingCheck').then((interception) => {
        assert.isNotNull(interception.response?.body, 'Home has loaded')
      })
    });
    it('Og jeg kan se navigasjonsbaren', () => {
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
    it('Ønsker jeg å klikke på navigasjonsbaren', () => {
      cy.get('.NavBar').contains('Hjem').click();
    });
    
    it('Slik at eg blir jeg tatt til siden jeg valgte', () => {
      cy.url().should('eq', 'http://localhost:3000/')
    });
  });

  context('mobile layout', () => {
    beforeEach(() => {
      cy.viewport('iphone-6');
    });
    it('Gitt at jeg er inne på nettsiden', () => {
      // required for firefox-browser
      Cypress.on('uncaught:exception', (err, runnable) => {
        // returning false here prevents Cypress from
        // failing the test
        return false
      })
      cy.intercept({
        method: 'GET',
        url: 'https://sheets.googleapis.com/**/*',
      }).as('loadedCheck')
      cy.visit('http://localhost:3000');
      cy.wait('@loadedCheck').then((interception) => {
        assert.isNotNull(interception.response?.body, 'Home has loaded')
      })
    });
    it('Og jeg kan se navigasjonsbaren', () => {
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
    })
    it('Ønsker jeg å klikke på navigasjonsbaren', () => {
      cy.get('.NavBarResponsive').contains('Hjem').click();
    });
    
    it('Slik at eg blir jeg tatt til siden jeg valgte', () => {
      cy.url().should('eq', 'http://localhost:3000/')
    });
  });
});

describe('Navigation', () => {
  context('Desktop from home to all pages', () => {
    beforeEach(() => {
      cy.viewport(1920, 1080);
    });
    it('Gitt at jeg er inne på nettsiden', () => {
      cy.visit('http://localhost:3000');
      cy.get('.NavBar > button').contains('Hjem').should('have.class', 'MenuLinks active');
    });

    // WIP
    it.skip('Do each one', () => {
      // required for firefox-browser
      Cypress.on('uncaught:exception', (err, runnable) => {
        // returning false here prevents Cypress from
        // failing the test
        return false
      })
      cy.get('.NavBar').each(($el, index, $list) => {
        cy.wrap($el).find('button')
          .invoke('attr', 'id')
          .then(id => {
            cy.get('button')
              .contains(`${id}`)
              .click();
            if(id == 'Hjem') {
              cy.intercept({
                method: 'GET',
                url: 'https://sheets.googleapis.com/**/*',
              }).as('loadingCheck')
              cy.url().should('equal', 'http://localhost:3000/')
              cy.wait('@loadingCheck').then((interception) => {
                assert.isNotNull(interception.response?.body, 'Home has loaded')
              })
            } else {
              cy.url().should('equal', 'http://localhost:3000/' + id)
            }
          })
      })
    });
    
    it('Ønsker jeg å gå til konkurransesiden', () => {
      cy.get('.NavBar').contains('Konkurranser').click();
      cy.url().should('eq', 'http://localhost:3000/Konkurranser');
      cy.get('.NavBar > button').contains('Konkurranser').should('have.class', 'MenuLinks active');
    });
    it('Og til Butikker siden', () => {
      cy.get('.NavBar').contains('Butikker').click();
      cy.url().should('eq', 'http://localhost:3000/Butikker');
      cy.get('.NavBar > button').contains('Butikker').should('have.class', 'MenuLinks active');
    });
    it('Og til Om oss siden', () => {
      cy.get('.NavBar').contains('Om Oss').click();
      cy.url().should('eq', 'http://localhost:3000/OmOss')
      cy.get('.NavBar > button').contains('Om Oss').should('have.class', 'MenuLinks active');
    });
    it('Og til Linker siden', () => {
      cy.get('.NavBar').contains('Linker').click();
      cy.url().should('eq', 'http://localhost:3000/Linker');
      cy.get('.NavBar > button').contains('Linker').should('have.class', 'MenuLinks active');
    });
    it('Og til Norske Rekorder', () => {
      cy.get('.NavBar').contains('Norske Rekorder').click();
      cy.url().should('eq', 'http://localhost:3000/Rekorder');
      cy.get('.NavBar > button').contains('Rekorder').should('have.class', 'MenuLinks active');
    });
    it('Og til siden Lokale arrangementer', () => {
      cy.get('.NavBar').contains('Lokale Arrangement').click();
      cy.url().should('eq', 'http://localhost:3000/LokaleArrangement');
      cy.get('.NavBar > button').contains('Lokale Arrangement').should('have.class', 'MenuLinks active');
    });
    it('Så tilbake til hjem', () => {
      cy.get('.NavBar').contains('Hjem').click();
      cy.url().should('eq', 'http://localhost:3000/');
      cy.get('.NavBar > button').contains('Hjem').should('have.class', 'MenuLinks active');
    });
  });

  context('Mobile from home to all pages', () => {
    beforeEach(() => {
      cy.viewport('iphone-6');
    });
    it('Gitt at jeg er inne på nettsiden', () => {
      cy.visit('http://localhost:3000');
      cy.get('.NavBar > button').contains('Hjem').should('have.class', 'MenuLinks active');
    });
    it('Ønsker jeg å gå til konkurransesiden', () => {
      cy.get('.DropDown').click();
      cy.get('.NavBarResponsive').contains('Konkurranser').click();
      cy.url().should('eq', 'http://localhost:3000/Konkurranser');
      cy.get('.NavBar > button').contains('Konkurranser').should('have.class', 'MenuLinks active');
      
    });
    it('Og til Butikker siden', () => {
      cy.get('.DropDown').click();
      cy.get('.NavBarResponsive').contains('Butikker').click();
      cy.url().should('eq', 'http://localhost:3000/Butikker');
      cy.get('.NavBar > button').contains('Butikker').should('have.class', 'MenuLinks active');
    });
    it('Og til Om oss siden', () => {
      cy.get('.DropDown').click();
      cy.get('.NavBarResponsive').contains('Om Oss').click();
      cy.url().should('eq', 'http://localhost:3000/OmOss')
    });
    it('Og til Linker siden', () => {
      cy.get('.DropDown').click();
      cy.get('.NavBarResponsive').contains('Linker').click();
      cy.url().should('eq', 'http://localhost:3000/Linker');
    });
    it('Og til Norske Rekorder', () => {
      cy.get('.DropDown').click();
      cy.get('.NavBarResponsive').contains('Norske Rekorder').click();
      cy.url().should('eq', 'http://localhost:3000/Rekorder');
    });
    it('Og til siden Lokale arrangementer', () => {
      cy.get('.DropDown').click();
      cy.get('.NavBarResponsive').contains('Lokale Arrangement').click();
      cy.url().should('eq', 'http://localhost:3000/LokaleArrangement');
    });
    it('Så tilbake til hjem', () => {
      cy.get('.DropDown').click();
      cy.get('.NavBarResponsive').contains('Hjem').click();
      cy.url().should('eq', 'http://localhost:3000/');
      cy.get('.NavBar > button').contains('Hjem').should('have.class', 'MenuLinks active');
    });
  });
});

export {};