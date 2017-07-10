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
    xconsole(e) {
        console.log(e);
    }
    listOne: Array<string> = ['Coffee', 'Orange Juice', 'Red Wine', 'Unhealty drink!', 'Water'];
    @HostBinding('class.plex-layout') layout = true;
    // Le pasamos la prestacion que se esta ejecutando.
    //  @Input() prestacionEjecucion: object;

    // prestacion actual en ejecucion
    public prestacion: any;
    // array de elementos RUP que se pueden ejecutar
    public elementosRUP: any[];
    // elementoRUP de la prestacion actual
    public elementoRUPprestacion: any;

    // concepto snomed seleccionado del buscador a ejecutar
    //public conceptoSnomedSeleccionado: any;

    // array de resultados a guardar devueltos por RUP
    public data: any[] = [];

    // Variable a pasar al buscador de Snomed.. Indica el tipo de busqueda
    public tipoBusqueda = 'problemas'; // Por defecto trae los problemas
    public showPlanes = false;
    public registros: any[] = [];
    public relacion = null;
    public conceptoARelacionar = [];

    //Variable para mostrar el div dropable en el momento que se hace el drag
    public isDraggingConcepto: Boolean = false;

    //Variable para mostrar el div dropable en el momento que se hace el drag
    public isDraggingRegistro: Boolean = false;

    public elementosRUPcollapse: any[] = [];

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
    /*
    cargarRegistroEnPosicion(posicion: number, registro: any) {
        this.registros.splice(posicion, 0, registro);
    }
    */

    /**
     * Mover un registro a una posicion especifica
     *
     * @param posicionActual: posicion actual del registro
     * @param posicionNueva: posicion donde cargar el registro
     * @param registro: objeto a mover en el array de registros
     */
    moverRegistroEnPosicion(posicionActual: number, posicionNueva: number, registro: any) {
        this.registros.splice(posicionActual, 1);
        this.registros.splice(posicionNueva, 0, registro);

        // quitamos relacion si existe
        if (this.registros[posicionNueva].relacionadoCon) {
            this.registros[posicionNueva].relacionadoCon = null;
        }

        console.log(this.registros);
    }


    /**
     * Mover un registro hacia una posicion especifica
     * Para ello busca su posicion actual y llama a moverRegistroEnPoscion()
     *
     * @param {number} posicionNueva: posicion actual del registro
     * @param {*} registro: objeto a mover en el array de registros
     * @memberof PrestacionEjecucionComponent
     */
    moverRegistro(posicionNueva: number, registro: any) {
        //buscamos posicion actual
        let posicionActual = this.registros.findIndex(r => (registro.dragData.concepto.conceptId === r.concepto.conceptId));

        // si la posicion a la que lo muevo es distinta a la actual
        // o si la posicion nueva es distinta a la siguiente de la actual (misma posicion)
        if ( (posicionActual !== posicionNueva) && (posicionNueva !== posicionActual + 1) ) {
            // movemos
            this.moverRegistroEnPosicion(posicionActual, posicionNueva, registro.dragData);
        }

    }

    vincularRegistros(registroOrigen: any, registroDestino: any) {
        debugger;
        // si proviene del drag and drop
        if (registroOrigen.dragData) {
            registroOrigen = registroOrigen.dragData;
        }

        // si no existe lo agrego
        let existe = this.registros.find(registro => registro.concepto.conceptId === registroOrigen.concepto.conceptId);
        if (!existe) {
            this.ejecutarConcepto(registroOrigen, registroDestino);
        }

        // buscamos en la posicion que se encuentra el registro de orgien y destino
        let indexOrigen = this.registros.findIndex(r => (registroOrigen.concepto.conceptId === r.concepto.conceptId));
        let indexDestino = this.registros.findIndex(r => (registroDestino.concepto.conceptId === r.concepto.conceptId));

        // solo vinculamos si no es el mismo elemento
        if (registroOrigen.concepto.conceptId === registroDestino.concepto.conceptId) {
            return false;
        }

        // si ya está vinculado a algun otro registro, no permitimos la vinculacion
        if (registroDestino.relacionadoCon) {
            return false;
        }

        // buscamos todos los conceptos que tenga relacionados
        let relacionados = this.registros.filter(r => {
            return (r.relacionadoCon && r.relacionadoCon.conceptId === registroOrigen.concepto.conceptId);
        });

        // vinculamos
        this.registros[indexOrigen].relacionadoCon = registroDestino.concepto;

        // movemos
        let _registro = this.registros[indexOrigen];
        this.registros.splice(indexOrigen, 1);
        this.registros.splice(indexDestino + 1, 0, _registro);

        //this.moverRegistroEnPosicion()
        if (relacionados.length) {
            relacionados.forEach(r => {
                r.relacionadoCon = null;
            });
        }

        console.log(this.registros);
    }

    crearRegistro(snomedConcept): any {
        debugger;
        // si proviene del drag and drop
        if (snomedConcept.dragData) {
            snomedConcept = snomedConcept.dragData;
        }

        // elemento a ejecutar dinámicamente luego de buscar y clickear en snomed
        let elementoRUP = this.servicioElementosRUP.buscarElementoRup(this.elementosRUP, snomedConcept);

        // armamos el elemento data a agregar al array de registros
        let data = {
            tipo: snomedConcept.semanticTag,
            concepto: snomedConcept,
            elementoRUP: elementoRUP,
            valor: null,
            destacado: false,
            relacionadoCon: null
        };

        switch (snomedConcept.semanticTag) {
            case 'trastorno':
            case 'hallazgo':
            case 'problema':
                data.tipo = 'problemas';
                break;
            case ('procedimiento'):
                if (this.tipoBusqueda === 'procedimientos') {
                    data.tipo = 'procedimientos';
                } else {
                    data.tipo = 'planes';
                }
                // data.tipo = (this.tipoBusqueda) ? 'planes' : 'procedimientos';
                break;
        }

        return data;
    }
    /**
     * Al hacer clic en un resultado de SNOMED search se ejecuta esta funcion
     * y se agrega a un array de elementos en ejecucion el elemento rup perteneciente
     * a dicho concepto de snomed
     * @param {any} snomedConcept
     * @param {any} registroVincular Registro al cual vamos a vincular el nuevo
     * @memberof PrestacionEjecucionComponent
     */
    ejecutarConcepto(snomedConcept, registroDestino = null) {
        debugger;

        let existe = this.registros.find(registro => registro.concepto.conceptId === snomedConcept.conceptId);
        if (existe) {
            this.plex.toast('warning', 'El elemento seleccionado ya se encuentra agregado.');

            return false;
        }

        // creamos el registro
        let data = this.crearRegistro(snomedConcept);
        if (!data) {
            return false;
        }

        // agregamos al array de registros
        // this.cargarRegistroEnPosicion(this.registros.length, data);
        this.registros.splice(this.registros.length, 0, data);

        // agregamos el elemento al collapse
        this.elementosRUPcollapse.push(this.data);
        this.elementosRUPcollapse[this.elementosRUPcollapse.length - 1] = false;
    }

    ejecutarConceptoHuds(resultadoHuds) {
        if (resultadoHuds.tipo === 'prestacion') {
            this.ejecutarConcepto(resultadoHuds.data.solicitud.tipoPrestacion);
        } else {
            this.ejecutarConcepto(resultadoHuds.data.concepto);
        }
    }

    /* ordenamiento de los elementos */
    /**
     * Indicando si estoy arrastrando registro
     *
     * @param {boolean} dragging true/false
     *
     * @memberof PrestacionEjecucionComponent
     */
    draggingRegistro(dragging: Boolean) {
        console.log(dragging);
        this.isDraggingRegistro = dragging;
    }
    /* fin ordenamiento de los elementos */

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
        if (e.dragData.tipo) {
            switch (e.dragData.tipo) {
                case 'prestacion':
                    this.ejecutarConcepto(e.dragData.data.solicitud.tipoPrestacion);
                    break;
                case 'hallazgo':
                case 'trastorno':
                    this.ejecutarConcepto(e.dragData.data.concepto);
                    break;
                default:
                    this.ejecutarConcepto(e.dragData);
                    break;
            }

        } else {
            this.ejecutarConcepto(e.dragData);
        }
    }

    arrastrandoConcepto(dragging: boolean) {
        this.isDraggingConcepto = dragging;
    }
    recibeTipoBusqueda(tipoDeBusqueda) {
        this.tipoBusqueda = tipoDeBusqueda;
    }

}
