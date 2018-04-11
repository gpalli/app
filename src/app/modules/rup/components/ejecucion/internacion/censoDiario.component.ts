import { Component, OnInit, Output, Input, EventEmitter, HostBinding } from '@angular/core';
import { CamasService } from '../../../../../services/camas.service';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Router, ActivatedRoute } from '@angular/router';
import { InternacionService } from '../../../services/internacion.service';
import { OrganizacionService } from '../../../../../services/organizacion.service';
import * as moment from 'moment';
import { forEach } from '@angular/router/src/utils/collection';
import { DocumentosService } from '../../../../../services/documentos.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Slug } from 'ng2-slugify';
import { saveAs } from 'file-saver';

@Component({
    templateUrl: 'censoDiario.html'
})

export class CensoDiarioComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;


    public organizacion;
    public fecha = new Date();
    public organizacionSeleccionada;
    public listadoCenso = [];
    public ingresoEgreso = {};

    public snomedEgreso = {
        conceptId: '58000006',
        term: 'alta del paciente',
        fsn: 'alta del paciente (procedimiento)',
        semanticTag: 'procedimiento'
    };

    // Usa el keymap 'default'
    private slug = new Slug('default');

    constructor(private router: Router, private route: ActivatedRoute,
        private plex: Plex, public auth: Auth,
        public camasService: CamasService,
        private organizacionService: OrganizacionService,
        private servicioInternacion: InternacionService,
        private servicioDocumentos: DocumentosService,
        private sanitizer: DomSanitizer) { }

    ngOnInit() {

        this.organizacionService.getById(this.auth.organizacion.id).subscribe(organizacion => {
            this.organizacion = organizacion;
        });
    }

    generarCenso() {
        let params = {
            fecha: moment(this.fecha).endOf('day'),
            unidad: this.organizacionSeleccionada.conceptId
        };
        this.servicioInternacion.getInfoCenso(params).subscribe((respuesta: any) => {
            console.log(respuesta);
            this.listadoCenso = respuesta;
            // this.completarResumenDiario();
        });
    }

    reseteaBusqueda() {
        this.listadoCenso = [];
    }






    descargarCenso() {
        setTimeout(() => {

            let content = '';
            // let headerPrestacion: any = document.getElementById('pageHeader').cloneNode(true);
            // let datosSolicitud: any = document.getElementById('datosSolicitud').cloneNode(true);

            /**
             * Cada logo va a quedar generado como base64 desde la API:
             *
             * <img src="data:image/png;base64,..." class="logoAndes">
             * <img src="data:image/png;base64,..." class="logotipoAndes">
             * <img src="data:image/png;base64,..." class="logoPDP">
             *
             */
            let tabla = document.getElementById('tabla');

            // const header =
            content += tabla.innerHTML;

            console.log(content);
            // content += header;
            // content += `
            // <div class="paciente">
            //     <b>Paciente:</b> ${this.paciente.apellido}, ${this.paciente.nombre} - 
            //     ${this.paciente.documento} - ${moment(this.paciente.fechaNacimiento).fromNow(true)}
            // </div>
            // `;

            // agregamos prestaciones
            // let elementosRUP: HTMLCollection = document.getElementsByClassName('rup-card');

            // const total = elementosRUP.length;
            // for (let i = 0; i < total; i++) {
            //     content += ' <div class="rup-card">' + elementosRUP[i].innerHTML + '</div>';
            // }

            // Sanitizar? no se recibe HTML "foráneo", quizá no haga falta
            // content = this.sanitizer.sanitize(1, content);

            this.servicioDocumentos.descargar(content).subscribe(data => {
                if (data) {
                    // Generar descarga como PDF
                    this.descargarArchivo(data, { type: 'application/pdf' });
                } else {
                    // Fallback a impresión normal desde el navegador
                    window.print();
                }
            });
        });
    }

    private descargarArchivo(data: any, headers: any): void {
        let blob = new Blob([data], headers);
        let nombreArchivo = this.slug.slugify('CENSODIARIO' + '-' + moment().format('DD-MM-YYYY-hmmss')) + '.pdf';
        saveAs(blob, nombreArchivo);
    }

}
