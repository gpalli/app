<<<<<<< HEAD
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { AgendaService } from '../../../../services/turnos/agenda.service';
import { EspacioFisicoService } from './../../../../services/turnos/espacio-fisico.service';
import { ProfesionalService } from './../../../../services/profesional.service';
import { Router } from '@angular/router';

@Component({
    selector: 'panel-agenda',
    templateUrl: 'panel-agenda.html'
})

export class PanelAgendaComponent implements OnInit {

    showEditarAgenda: Boolean = false;

    private _editarAgendaPanel: any;
    @Input('editaAgendaPanel')
    set editaAgendaPanel(value: any) {
        this._editarAgendaPanel = value;
        this.modelo = value;
    }
    get editaAgendaPanel(): any {
        return this._editarAgendaPanel;
    }

    @Output() editarAgendaEmit = new EventEmitter<IAgenda>();
    @Output() showVistaTurnos = new EventEmitter<Boolean>();
    @Output() actualizarEstadoEmit = new EventEmitter<boolean>();

    showEditarAgendaPanel: Boolean = true;

    public modelo: any = {};

    public alertas: any[] = [];

    constructor(public plex: Plex, public serviceAgenda: AgendaService, public servicioProfesional: ProfesionalService,
        public servicioEspacioFisico: EspacioFisicoService, public router: Router, public auth: Auth) {
    }

    ngOnInit() {
        // console.log('this.editaAgendaPanel: ', this.editaAgendaPanel);
        console.log('this.modelo: ', this.modelo);
    }

    guardarAgenda(agenda: IAgenda) {

        if (this.alertas.length === 0) {
            // Quitar cuando esté solucionado inconveniente de plex-select
            let profesional = this.modelo.profesionales.map((prof) => {
                delete prof.$order;
                return prof;
            });
            let espacioFisico = this.modelo.espacioFisico;
            delete espacioFisico.$order;

            let patch = {
                'op': 'editarAgenda',
                'profesional': profesional,
                'espacioFisico': espacioFisico
            };

            this.serviceAgenda.patch(agenda.id, patch).subscribe(resultado => {
                this.modelo = resultado;
                this.showEditarAgenda = false;
                this.plex.toast('success', 'Información', 'La agenda se guardó correctamente ');
                this.actualizarEstadoEmit.emit(true);
            });
        }
    }


    cancelar() {
        this.showEditarAgendaPanel = false;
        this.showVistaTurnos.emit(true);
    }


    loadProfesionales(event) {
        let listaProfesionales = [];
        if (event.query) {
            let query = {
                nombreCompleto: event.query
            };
            this.servicioProfesional.get(query).subscribe(resultado => {
                if (this.modelo.profesionales) {
                    listaProfesionales = (resultado) ? this.modelo.profesionales.concat(resultado) : this.modelo.profesionales;
                } else {
                    listaProfesionales = resultado;
                }
                event.callback(listaProfesionales);
            });
        } else {
            event.callback(this.modelo.profesionales || []);
        }
    }

    loadEspacios(event) {
        this.servicioEspacioFisico.get({ organizacion: this.auth.organizacion._id }).subscribe(event.callback);
    }

    /**
     * Valida que no se solapen Profesionales y/o Espacios físicos
     */
    validarSolapamientos(tipo) {
        this.alertas = [];

        // Inicio y Fin de Agenda
        let iniAgenda, finAgenda;

        if (tipo === 'profesionales') {

            // Loop profesionales
            if (this.modelo.profesionales) {
                this.modelo.profesionales.forEach((profesional, index) => {
                    this.serviceAgenda.get({ 'idProfesional': profesional.id, 'rango': true, 'desde': this.modelo.horaInicio, 'hasta': this.modelo.horaFin }).
                        subscribe(agendas => {

                            // Hay problemas de solapamiento?
                            let agendasConSolapamiento = agendas.filter(agenda => {
                                return agenda.id !== this.modelo.id || !this.modelo.id; // Ignorar agenda actual
                            });

                            // Si encontramos una agenda que coincida con la búsqueda...
                            if (agendasConSolapamiento.length > 0) {
                                this.alertas = [... this.alertas, 'El profesional ' + profesional.nombre + ' ' + profesional.apellido + ' está asignado a otra agenda en ese horario'];
                            }
                        });
                });
            }
        } else if (tipo === 'espacioFisico') {

            // Loop Espacios Físicos
            this.serviceAgenda.get({ 'idProfesional': this.modelo.espacioFisico.id, 'rango': true, 'desde': this.modelo.horaInicio, 'hasta': this.modelo.horaFin }).
                subscribe(agendas => {

                    // Hay problemas de solapamiento?
                    let agendasConSolapamiento = agendas.filter(agenda => {
                        return agenda.id !== this.modelo.id || !this.modelo.id; // Ignorar agenda actual
                    });

                    // Si encontramos una agenda que coincida con la búsqueda...
                    if (agendasConSolapamiento.length > 0) {
                        this.alertas = [... this.alertas, 'El ' + this.modelo.espacioFisico.nombre + ' está asignado a otra agenda en ese horario'];
                    }
                });
        }
    }
}
=======
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { AgendaService } from '../../../../services/turnos/agenda.service';
import { EspacioFisicoService } from './../../../../services/turnos/espacio-fisico.service';
import { ProfesionalService } from './../../../../services/profesional.service';
import { Router } from '@angular/router';

@Component({
    selector: 'panel-agenda',
    templateUrl: 'panel-agenda.html'
})

export class PanelAgendaComponent implements OnInit {

    showEditarAgenda: Boolean = false;

    private _editarAgendaPanel: any;
    @Input('editaAgendaPanel')
    set editaAgendaPanel(value: any) {
        this._editarAgendaPanel = value;
        this.modelo = value;
    }
    get editaAgendaPanel(): any {
        return this._editarAgendaPanel;
    }

    @Output() editarAgendaEmit = new EventEmitter<IAgenda>();
    @Output() showVistaTurnos = new EventEmitter<Boolean>();
    @Output() actualizarEstadoEmit = new EventEmitter<boolean>();

    showEditarAgendaPanel: Boolean = true;

    public modelo: any = {};

    public alertas: any[] = [];

    constructor(public plex: Plex, public serviceAgenda: AgendaService, public servicioProfesional: ProfesionalService,
        public servicioEspacioFisico: EspacioFisicoService, public router: Router, public auth: Auth) {
    }

    ngOnInit() {
        // console.log('this.editaAgendaPanel: ', this.editaAgendaPanel);
        console.log('this.modelo: ', this.modelo);
    }

    guardarAgenda(agenda: IAgenda) {

        if (this.alertas.length === 0) {
            // Quitar cuando esté solucionado inconveniente de plex-select
            let profesional = this.modelo.profesionales.map((prof) => {
                delete prof.$order;
                return prof;
            });
            let espacioFisico = this.modelo.espacioFisico;
            delete espacioFisico.$order;

            let patch = {
                'op': 'editarAgenda',
                'profesional': profesional,
                'espacioFisico': espacioFisico
            };

            this.serviceAgenda.patch(agenda.id, patch).subscribe(resultado => {
                this.modelo = resultado;
                this.showEditarAgenda = false;
                this.plex.toast('success', 'Información', 'La agenda se guardó correctamente ');
                this.actualizarEstadoEmit.emit(true);
            });
        }
    }


    cancelar() {
        this.showEditarAgendaPanel = false;
        this.showVistaTurnos.emit(true);
    }


    loadProfesionales(event) {
        let listaProfesionales = [];
        if (event.query) {
            let query = {
                nombreCompleto: event.query
            };
            this.servicioProfesional.get(query).subscribe(resultado => {
                if (this.modelo.profesionales) {
                    listaProfesionales = (resultado) ? this.modelo.profesionales.concat(resultado) : this.modelo.profesionales;
                } else {
                    listaProfesionales = resultado;
                }
                event.callback(listaProfesionales);
            });
        } else {
            event.callback(this.modelo.profesionales || []);
        }
    }

    loadEspacios(event) {
        this.servicioEspacioFisico.get({ organizacion: this.auth.organizacion._id }).subscribe(event.callback);
    }

    /**
     * Valida que no se solapen Profesionales y/o Espacios físicos
     */
    validarSolapamientos(tipo) {
        this.alertas = [];

        // Inicio y Fin de Agenda
        let iniAgenda, finAgenda;

        if (tipo === 'profesionales') {

            // Loop profesionales
            if (this.modelo.profesionales) {
                this.modelo.profesionales.forEach((profesional, index) => {
                    this.serviceAgenda.get({ 'idProfesional': profesional.id, 'rango': true, 'desde': this.modelo.horaInicio, 'hasta': this.modelo.horaFin }).
                        subscribe(agendas => {

                            // Hay problemas de solapamiento?
                            let agendasConSolapamiento = agendas.filter(agenda => {
                                return agenda.id !== this.modelo.id || !this.modelo.id; // Ignorar agenda actual
                            });

                            // Si encontramos una agenda que coincida con la búsqueda...
                            if (agendasConSolapamiento.length > 0) {
                                this.alertas = [... this.alertas, 'El profesional ' + profesional.nombre + ' ' + profesional.apellido + ' está asignado a otra agenda en ese horario'];
                            }
                        });
                });
            }
        } else if (tipo === 'espacioFisico') {

            // Loop Espacios Físicos
            this.serviceAgenda.get({ 'idProfesional': this.modelo.espacioFisico.id, 'rango': true, 'desde': this.modelo.horaInicio, 'hasta': this.modelo.horaFin }).
                subscribe(agendas => {

                    // Hay problemas de solapamiento?
                    let agendasConSolapamiento = agendas.filter(agenda => {
                        return agenda.id !== this.modelo.id || !this.modelo.id; // Ignorar agenda actual
                    });

                    // Si encontramos una agenda que coincida con la búsqueda...
                    if (agendasConSolapamiento.length > 0) {
                        this.alertas = [... this.alertas, 'El ' + this.modelo.espacioFisico.nombre + ' está asignado a otra agenda en ese horario'];
                    }
                });
        }
    }
}
>>>>>>> 919a4ba3c12bb0784c7931bfcbb1a7dd33ceb4df
