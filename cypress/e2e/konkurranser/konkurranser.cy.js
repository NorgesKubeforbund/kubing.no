import { Given, When, Then, And } from "cypress-cucumber-preprocessor/steps";

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
  
Given(/^at jeg er inne på nettsiden$/, () => {
  cy.visit('http://localhost:3000');
});

When(/^jeg klikker meg inn på konkurranser-siden$/, () => {

});

Then(/^så ser jeg en liste over kommende konkurranser$/, () => {
  
});