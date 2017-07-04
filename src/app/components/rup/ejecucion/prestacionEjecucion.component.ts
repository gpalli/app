import { element } from 'protractor';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit, HostBinding, ViewEncapsulation } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { DropdownItem } from '@andes/plex';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';

// servicios
import { PrestacionPacienteService } from './../../../services/rup/prestacionPaciente.service';
import { TipoPrestacionService } from './../../../services/tipoPrestacion.service';

// interfaces
import { IProfesional } from './../../../interfaces/IProfesional';
import { ElementosRupService } from '../../../services/rup/elementosRUP.service';

@Component({
    selector: 'rup-prestacionEjecucion',
    templateUrl: 'prestacionEjecucion.html',
    styleUrls: ['prestacionEjecucion.css'],
    // Use to disable CSS Encapsulation for this component
    encapsulation: ViewEncapsulation.None
})

export class PrestacionEjecucionComponent implements OnInit {
    //Le pasamos la prestacion que se esta ejecutando.
    //  @Input() prestacionEjecucion: object;

    // prestacion actual en ejecucion
    public prestacion: any;
    // array de elementos RUP que se pueden ejecutar
    public elementosRUP: any[];
    // elementoRUP de la prestacion actual
    public elementoRUPprestacion: any;

    // concepto snomed seleccionado del buscador a ejecutar
    public conceptoSnomedSeleccionado: any;

    // array de resultados a guardar devueltos por RUP
    public data: any[] = [];

    //Variable a pasar al buscador de Snomed.. Indica el tipo de busqueda
    public tipoBusqueda: string = 'problemas'; //Por defecto trae los problemas
    public showPlanes: boolean = false;
    public registros: any[] = [];

    //Variable para mostrar el div dropable en el momento que se hace el drag
    public isDraggingConcepto: boolean = false;


    constructor(private servicioPrestacion: PrestacionPacienteService,
        private servicioElementosRUP: ElementosRupService,
        public plex: Plex, public auth: Auth,
        private router: Router, private route: ActivatedRoute,
        public servicioTipoPrestacion: TipoPrestacionService) {
    }

    /**
     * Inicializamos prestacion a traves del id que viene como parametro de la url
     * Cargamos tipos de prestaciones posibles
     * Inicializamos los datos de la prestacion en caso que se hayan registardo
     * Cargamos los problemas del paciente
     *
     * @memberof PrestacionEjecucionComponent
     */
    ngOnInit() {

        this.route.params.subscribe(params => {
            let id = params['id'];
            // Mediante el id de la prestación que viene en los parámetros recuperamos el objeto prestación
            this.servicioPrestacion.getById(id).subscribe(prestacion => {
                this.prestacion = prestacion;

                this.servicioElementosRUP.get({}).subscribe(elementosRup => {
                    this.elementosRUP = elementosRup;
                    this.elementoRUPprestacion = this.servicioElementosRUP.buscarElementoRup(this.elementosRUP, prestacion.solicitud.tipoPrestacion);
                });

            }, (err) => {
                if (err) {
                    this.plex.info('danger', err, 'Error');
                    this.router.navigate(['/rup']);
                }
            });

        });
    }

    /**
     * Carga un nuevo registro en el array en una posicion determinada
     * 
     * @param posicion: posicion donde cargar el nuevo registro
     * @param registro: objeto a cargar en el array de registros
     */
    cargarRegistroEnPosicion(posicion: number, registro: any) {
        this.registros.splice(posicion, 0, registro);
    }



    /**
     * Al hacer clic en un resultado de SNOMED search se ejecuta esta funcion
     * y se agrega a un array de elementos en ejecucion el elemento rup perteneciente
     * a dicho concepto de snomed
     * @param {any} snomedConcept
     * @memberof PrestacionEjecucionComponent
     */
    ejecutarConcepto(snomedConcept) {
        console.log('Ejecucion');
        console.log(snomedConcept);
        this.conceptoSnomedSeleccionado = snomedConcept;

        // elemento a ejecutar dinámicamente luego de buscar y clickear en snomed
        let elementoRUP = this.servicioElementosRUP.buscarElementoRup(this.elementosRUP, snomedConcept);
        // armamos el elemento data a agregar al array de ejecucion
        let data = {
            tipo: snomedConcept.semanticTag,
            concepto: snomedConcept,
            elementoRUP: elementoRUP
        };

        switch (snomedConcept.semanticTag) {
            case 'trastorno':
            case 'hallazgo':
            case 'problema':
                data.tipo = 'problemas';
                break;
            case 'procedimiento':
                data.tipo = (this.tipoBusqueda) ? 'planes' : 'procedimientos';
                break;
        }

        // agregamos al array de ejecucion
        this.registros.push(data);
    }

    ejecutarConceptoHuds(resultadoHuds) {
        if (resultadoHuds.tipo === 'prestacion') {
            this.ejecutarConcepto(resultadoHuds.data.solicitud.tipoPrestacion);
        } else {
            this.ejecutarConcepto(resultadoHuds.data.concepto);
        }
    }

    /*
      * Event emmiter ejecutado cuando se devuelven valores
      * desde un átomo / molecula / fórmula desde RUP
      */
    getValoresRup(datos, elementoRUP) {
        // si esta seteado el valor en data, pero no tiene ninguna key con valores dentro
        // ej: data[signosVitales]: {}
        if (this.data[elementoRUP.key] !== 'undefined' && !Object.keys(datos).length) {
            // eliminamos la prestacion de data
            delete this.data[elementoRUP.key];
        } else {
            // si no está seteada la prestacion en data
            // entonces inicializamos el objeto vacío
            if (!this.data[elementoRUP.key]) {
                this.data[elementoRUP.key] = {};
            }

            // asignamos los valores que devuelve RUP en la variable datos
            // a nuestro array de valores data
            this.data[elementoRUP.key] = datos[elementoRUP.key];
        }
    }

    volver(ruta) {
        /*
        //valida si quedaron datos sin guardar..
        if (this.prestacionesEjecucion.length > 0 || this.tiposPrestaciones.length > 0) {
            this.plex.confirm('Se van a descartar los cambios sin guardar', 'Atención').then((confirmar) => {
                if (confirmar === true) {
                    this.router.navigate(['rup/resumen', this.prestacion.id]);
                }
            });
        } else {
            this.router.navigate(['rup/resumen', this.prestacion.id]);
        }
        */
        this.router.navigate(['rup/resumen', this.prestacion.id]);
    }
    // //Recibe el parametro y lo setea para realizar la busqueda en Snomed
    // filtroBuscadorSnomed(tipoBusqueda) {
    //     this.showPlanes = false;// Oculta el buscador de planes
    //     console.log(tipoBusqueda);
    //     this.tipoBusqueda = tipoBusqueda;
    // }
    // //Muestra el buscador de planes
    // busquedaPlanes() {
    //     this.tipoBusqueda = 'planes';
    //     this.showPlanes = true;
    // }


    onConceptoDrop(e: any) {
        console.log('onConceptoDrop');
        console.log(e.dragData);
        this.ejecutarConcepto(e.dragData);
    }

     arrastrandoConcepto(dragging: boolean) {
        this.isDraggingConcepto = dragging;
    }
}
