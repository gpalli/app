

/// <reference types="Cypress" />

context('Aliasing', () => {
    let token
    before(() => {
        cy.login('34934522', 'asd').then(t => {
            token = t;
        })
    })

    beforeEach(() => {
        cy.visit('http://localhost:4200/mpi', {
            onBeforeLoad: (win) => {
                win.sessionStorage.setItem('jwt', token);
            }
        });
    })

    it('login complete', () => {
        cy.get('plex-text input[type=text]').first().type('botta').should('have.value', 'botta');

        cy.get('table').find('tbody').find('tr').first().find('td').eq(0).find('span').should('have.text', 'Temporal').should('have.class','badge-warning');

        cy.get('table').find('tbody').find('tr').first().find('td').eq(1).find('span').should('have.text', '34934522');
    })

    it('Mock api', () => {
        cy.server();
        cy.route('**/api/core/mpi/pacientes**', [
            { "documento":"34934522", "estado":"temporal","nombre":"MARIANO","apellido":"BOTTA", "sexo":"masculino", "genero":"masculino", "fechaNacimiento":"2018-05-01T10:41:52.686Z",   "claveBlocking":["VTMRN","VT","MRN","133696","133"],   "edadReal":{"unidad":"Días","valor":8},"edad":0,"nombreCompleto":"MARIANO BOTTA","id":"5aec38faca43621f0823c85e"},
            { "documento":"30000000", "estado":"validado","nombre":"MARIANO ANDES","apellido":"BOTTA", "sexo":"masculino", "genero":"masculino", "fechaNacimiento":"2018-05-01T10:41:52.686Z",   "claveBlocking":["VTMRN","VT","MRN","133696","133"],   "edadReal":{"unidad":"Días","valor":8},"edad":0,"nombreCompleto":"MARIANO BOTTA","id":"5aec38faca43621f0823c85e"}
        ]).as('elastic');
        cy.get('plex-text input[type=text]').first().type('botta').should('have.value', 'botta');
        cy.wait('@elastic');

        cy.get('table').find('tbody').find('tr').should('have.length', 2);

    });
  
    

})
