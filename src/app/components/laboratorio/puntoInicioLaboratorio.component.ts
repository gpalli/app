import { PrestacionesService } from './../../modules/rup/services/prestaciones.service';
import { Component, OnInit, HostBinding, NgModule, ViewContainerRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import * as enumerados from './../../utils/enumerados';
import { OrganizacionService } from '../../services/organizacion.service';


@Component({
    selector: 'gestor-protocolos',
    templateUrl: 'puntoInicioLaboratorio.html',
    styleUrls: ['./laboratorio.scss']
})

export class PuntoInicioLaboratorioComponent

    implements OnInit {

    public showListarProtocolos = true;
    public showProtocoloDetalle = false;
    public protocolos: any = [];
    public protocolo: any = {};
    public fechaDesde: any = new Date();
    public fechaHasta: any = new Date();
    public prioridad: any;
    public parametros = [];
    public origenEnum: any;
    public prioridadesEnum;
    public laboratorioInternoEnum: any;
    public dniPaciente: any;
    public modo = {
        control: false,
        carga: false,
        validacion: false
    };
    public busqueda = {
        fechaDesde: new Date(),
        fechaHasta: new Date(),
        dniPaciente: null,
        nombrePaciente: null,
        apellidoPaciente: null,
        origen: null,
        numProtocoloDesde: null,
        numProtocoloHasta: null
    };

    constructor(public plex: Plex, private formBuilder: FormBuilder,
        public servicioPrestaciones: PrestacionesService,
        public auth: Auth,
        private servicioOrganizacion: OrganizacionService,
    ) { }

    ngOnInit() {
        this.prioridadesEnum = enumerados.getPrioridadesLab();
        this.origenEnum = enumerados.getOrigenLab();
        this.laboratorioInternoEnum = enumerados.getLaboratorioInterno();
        this.refreshSelection();
    }

    // funciones
    refreshSelection(value?, tipo?) {
        let fechaDesde = moment(this.busqueda.fechaDesde).startOf('day');
        if (fechaDesde.isValid()) {
            this.parametros['fechaDesde'] = fechaDesde.isValid() ? fechaDesde.toDate() : moment().format();
        }

        let fechaHasta = moment(this.busqueda.fechaHasta).endOf('day');
        if (fechaHasta.isValid()) {
            this.parametros['fechaHasta'] = fechaHasta.isValid() ? fechaHasta.toDate() : moment().format();
        }
        this.parametros['tipoPrestacionSolicititud'] = '15220000';
        this.parametros['organizacion'] = this.auth.organizacion._id;
        if (tipo === 'fechaDesde') {
            let fechaDesde = moment(this.busqueda.fechaDesde).startOf('day');
            if (fechaDesde.isValid()) {
                this.parametros['fechaDesde'] = fechaDesde.isValid() ? fechaDesde.toDate() : moment().format();
            }
        }
        if (tipo === 'fechaHasta') {
            let fechaHasta = moment(this.busqueda.fechaHasta).endOf('day');
            if (fechaHasta.isValid()) {
                this.parametros['fechaHasta'] = fechaHasta.isValid() ? fechaHasta.toDate() : moment().format();
            }
        }
        if (tipo === 'dniPaciente') {
            this.parametros['pacienteDocumento'] = this.busqueda.dniPaciente;
        }
        if (tipo === 'nombrePaciente') {
            this.parametros['nombrePaciente'] = this.busqueda.nombrePaciente;
        }
        if (tipo === 'apellidoPaciente') {
            this.parametros['apellidoPaciente'] = this.busqueda.apellidoPaciente;
        }
        if (tipo === 'origen') {
            if (this.busqueda.origen.id === 'todos') {
                this.busqueda.origen.id = null;
            }
            this.parametros['origen'] = this.busqueda.origen.id;

        }
        if (tipo === 'numProtocoloDesde') {
            this.parametros['numProtocoloDesde'] = this.busqueda.numProtocoloDesde;
        }
        if (tipo === 'numProtocoloHasta') {
            this.parametros['numProtocoloHasta'] = this.busqueda.numProtocoloHasta;
        }
        console.log(this.parametros);
        this.getProtocolos(this.parametros);
    };

    // refreshSelection(value?, tipo?) {
    //     this.parametros['tipoPrestacionSolicititud'] = '15220000';
    //     this.parametros['organizacion'] = this.auth.organizacion._id;
    //     if (tipo === 'fechaDesde') {
    //         let fechaDesde = moment(this.busqueda.fechaDesde).startOf('day');
    //         if (fechaDesde.isValid()) {
    //             this.parametros['fechaDesde'] = fechaDesde.isValid() ? fechaDesde.toDate() : moment().format();
    //         }
    //     }
    //     if (tipo === 'fechaHasta') {
    //         let fechaHasta = moment(this.busqueda.fechaHasta).endOf('day');
    //         if (fechaHasta.isValid()) {
    //             this.parametros['fechaHasta'] = fechaHasta.isValid() ? fechaHasta.toDate() : moment().format();
    //         }
    //     }
    //     if (tipo === 'dniPaciente') {
    //         this.parametros['pacienteDocumento'] = this.dniPaciente;
    //     }
    //     if (tipo === 'dniPaciente') {
    //         this.parametros['pacienteDocumento'] = this.dniPaciente;
    //     }

    //     this.getProtocolos(this.parametros);
    // };

    getNumeroProtocolo(registros) {
        let registro: any = registros.find((reg) => {
            return reg.nombre === 'numeroProtocolo';
        });
        return registro.valor;
    }

    getProtocolos(params: any) {
        this.servicioPrestaciones.get(params).subscribe(protocolos => {
            this.protocolos = protocolos;
        }, err => {
            if (err) {
                console.log(err);
            }
        });


    }

    estaSeleccionado(protocolo) {
        return false;
    }

    verProtocolo(protocolo, multiple, e) {
        // Si se presionó el boton suspender, no se muestran otros protocolos hasta que se confirme o cancele la acción.

        if (protocolo && protocolo.id) {
            // this.serviceAgenda.getById(agenda.id).subscribe(ag => {
            this.protocolo = protocolo;
            this.showListarProtocolos = false;
            this.showProtocoloDetalle = true;
            // }
        }
    }

    volverLista() {
        this.protocolo = null;
        this.showListarProtocolos = true;
        this.showProtocoloDetalle = false;
    }

    loadServicios($event) {
        this.servicioOrganizacion.getById(this.auth.organizacion.id).subscribe((organizacion: any) => {
            console.log(organizacion);
            let servicioEnum = organizacion.unidadesOrganizativas;
            $event.callback(servicioEnum);
        });

    }

    loadOrganizacion(event) {
        if (event.query) {
            let query = {
                nombre: event.query
            };
            this.servicioOrganizacion.get(query).subscribe(event.callback);
        } else {
            event.callback([]);
        }


    }

    loadPrioridad(event) {
        console.log(enumerados.getPrioridadesLab());
        event.callback(enumerados.getPrioridadesLab());
        return enumerados.getPrioridadesLab();
    }


    // Hardcodeo
    protocols = [
        {
            id: '716852',
            fecha: '11/07/2018',
            origen: 'ambulatorio',
            servicio: 'clinica',
            usuario: 'lmonteverde',
            solicitante: 'wmolini',
            fechaRegistro: '05/07/2018',
        },
        {
            id: '516846',
            fecha: '17/07/2018',
            origen: 'ambulatorio',
            servicio: 'clinica',
            usuario: 'lmonteverde',
            solicitante: 'wmolini',
            fechaRegistro: '09/07/2018',
        },
        {
            id: '354879',
            fecha: '13/07/2018',
            origen: 'guardia',
            servicio: 'clinica',
            usuario: 'lmonteverde',
            solicitante: 'wmolini',
            fechaRegistro: '11/07/2018',
        }
    ];

}



