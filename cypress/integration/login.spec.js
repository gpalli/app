/// <reference types="Cypress" />

context('Aliasing', () => {
    beforeEach(() => {
        cy.visit('http://localhost:4200',  {
            onBeforeLoad: (win) => {
              win.sessionStorage.clear()
            }
        });
    })
  
    it('type', () => {

        cy.get('[name="usuario"] input').type('hola').should('have.value', '');

        cy.get('[name="usuario"] input').type('34934522').should('have.value', '34934522');

        cy.get('[name="password"] input[type="password"]').type('anypasswordfornow').should('have.value', 'anypasswordfornow');


        cy.server()
        cy.route('*api/auth/login*').as('login')

        cy.get('plex-button').click();


        cy.wait('@login').then((xhr) => {
            // we can now access the low level xhr
            // that contains the request body,
            // response body, status, etc
            expect(xhr).to.be(200);

          })

        cy.get('.page-title').should('have.text', 'Seleccione una organización');


  
    })
  })
  