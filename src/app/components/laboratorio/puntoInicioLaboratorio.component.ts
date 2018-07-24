import {
    Component,
    OnInit,
    HostBinding,
    NgModule,
    ViewContainerRef,
    ViewChild
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule
} from '@angular/forms';
// import {
//     ProtocoloService
// } from './../../services/laboratorio/protocolo.service';
import {
        PrestacionesService
    } from './../../modules/rup/services/prestaciones.service';
// import {
//     Router
// } from '@angular/router';
import {
    Auth
} from '@andes/auth';
import {
    Plex
} from '@andes/plex';


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
    public fechaDesde: any;
    public fechaHasta: any;
    public parametros = [];

    constructor(public plex: Plex, private formBuilder: FormBuilder, 
        // public servicioProtocolo: ProtocoloService,
        public servicioPrestaciones: PrestacionesService,
        public auth: Auth) { }

    ngOnInit() {
    }

    refreshSelection(value, tipo) {
        this.parametros['tipoPrestacionSolicititud'] = '15220000';
        if (tipo === 'fechaDesde') {
            let fechaDesde = moment(this.fechaDesde).startOf('day');
            if (fechaDesde.isValid()) {
                this.parametros['fechaDesde'] = fechaDesde.isValid() ? fechaDesde.toDate() : moment().format();
                this.parametros['organizacion'] = this.auth.organizacion._id;
            }
        }
        if (tipo === 'fechaHasta') {
            let fechaHasta = moment(this.fechaHasta).endOf('day');
            if (fechaHasta.isValid()) {
                this.parametros['fechaHasta'] = fechaHasta.isValid() ? fechaHasta.toDate() : moment().format();
                this.parametros['organizacion'] = this.auth.organizacion._id;
            }
        }

        this.getProtocolos(this.parametros);
    };

    getProtocolos(params: any) {
        // this.servicioProtocolo.get(params).subscribe(protocolos => {
        this.servicioPrestaciones.get(params).subscribe(protocolos => {
            protocolos.forEach( (protocolo: any) => {
                console.log(protocolo.solicitud);
                protocolo.numero = protocolo.solicitud.registros.find((reg) => {
                    console.log(reg);
                    return reg.nombre == "numeroProtocolo";
                });
            });
           
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
        // Si se presionó el boton suspender, no se muestran otras agendas hasta que se confirme o cancele la acción.
        
            if (protocolo && protocolo.id) {
                // this.serviceAgenda.getById(agenda.id).subscribe(ag => {
                    this.protocolo = protocolo;
                    this.showListarProtocolos = false;
                    this.showProtocoloDetalle = true;
            // }
        }
    }

    loadSectores (e) {
        return {};
    }

    loadAreasValidacion (e) {
        return {};
    }

    loadEfectores (e) {
        return {};
    }
}
