/// <reference types="Cypress" />

context('Aliasing', () => {
    beforeEach(() => {
        cy.visit('http://localhost:4200', {
            onBeforeLoad: (win) => {
                win.sessionStorage.clear()
            }
        });
    })

    it('login complete', () => {

        cy.server();

        cy.route('POST', '**/api/auth/login').as('login');

        cy.get('[name="usuario"] input').type('hola').should('have.value', '');

        cy.get('[name="usuario"] input').type('30000001').should('have.value', '30000001');

        cy.get('[name="password"] input[type="password"]').type('anypasswordfornow').should('have.value', 'anypasswordfornow');

        cy.get('plex-button').click();


        cy.wait('@login').then((xhr) => {
            // we can now access the low level xhr
            // that contains the request body,
            // response body, status, etc
            expect(xhr.status).to.be.eq(200)

        })

        cy.get('.page-title').should('have.text', 'Seleccione una organización');
    })

    it('login failed', () => {

        cy.server();

        cy.route('POST', '**/api/auth/login').as('login');

        cy.get('[name="usuario"] input').type('10000001').should('have.value', '10000001');

        cy.get('[name="password"] input[type="password"]').type('anypasswordfornow').should('have.value', 'anypasswordfornow');

        cy.get('plex-button').click();


        cy.wait('@login').then((xhr) => {
            // we can now access the low level xhr
            // that contains the request body,
            // response body, status, etc
            expect(xhr.status).to.be.eq(403)

        });



    });
})
