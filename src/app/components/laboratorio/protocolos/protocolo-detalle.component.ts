import {
    Input,
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
import {
    ProtocoloService
} from './../../../services/laboratorio/protocolo.service';
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
    selector: 'protocolo-detalle',
    templateUrl: 'protocolo-detalle.html'
})

export class ProtocoloDetalleComponent

 implements OnInit {

    @HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente

    public mostrarMasOpciones = false;
    public protocolos: any = [];
    public protocolo: any = {};
    public fechaDesde: any;
    public fechaHasta: any;
    public parametros = [];

    @Input('cargarProtocolo')
    set cargarProtocolo(value: any) {
        if (value) {
            this.protocolo = value;
        }
    }

    get cargarProtocolo() {
        return this.protocolo;
    }

    constructor(public plex: Plex, private formBuilder: FormBuilder, 
        public servicioProtocolo: ProtocoloService,
        public auth: Auth) { }

    ngOnInit() {
    }

    refreshSelection(value, tipo) {
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
        console.log('getProtocolos')
        this.servicioProtocolo.get(params).subscribe(protocolos => {
            // this.servicioPrestaciones.get(params).subscribe(protocolos => {
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
}
