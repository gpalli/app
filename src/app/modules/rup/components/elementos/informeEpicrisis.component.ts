import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-InformeEpicrisisComponent',
    templateUrl: 'informeEpicrisis.html',
    styleUrls: ['informeEpicrisis.scss'],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component

})

export class InformeEpicrisisComponent extends RUPComponent implements OnInit {

    public accordionActive = 0;
    public unidadesOrganizativas = [];
    public desplegarTodo = false;
    public mensajeAccionAccordion = 'Desplegar';

    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = {
                unidadOrganizativa: null
            };
        }

        this.servicioOrganizacion.getById(this.auth.organizacion.id).subscribe(organizacion => {
            this.unidadesOrganizativas = organizacion.unidadesOrganizativas;
        });
    }

    accordionSeleccionado(i) {
        this.accordionActive = i;
    }

    desplegarAccordions() {
        this.desplegarTodo = !this.desplegarTodo;
        this.mensajeAccionAccordion = this.desplegarTodo ? 'Colapsar' : 'Desplegar';
        this.accordionActive = -1;
    }

    VerArbolRelaciones() {
        this.prestacionesService.setShowArbolRelaciones(true);
    }
}
