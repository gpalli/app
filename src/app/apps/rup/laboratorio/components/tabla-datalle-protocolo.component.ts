import { IPractica } from './../interfaces/IPractica';
import { PracticaBuscarResultado } from './../interfaces/PracticaBuscarResultado.inteface';
import { ProtocoloService } from './../services/protocolo.service';
import { PracticaService } from './../services/practica.service';
import { Input, Output, Component, OnInit, HostBinding, NgModule, ViewContainerRef, ViewChild, EventEmitter } from '@angular/core';

import { Plex } from '@andes/plex';
import { Constantes } from '../controllers/constants';


@Component({
    selector: 'tabla-datalle-protocolo',
    templateUrl: 'tabla-datalle-protocolo.html',
    styleUrls: ['tabla-datalle-protocolo.scss']
})

export class TablaDatalleProtocolo implements OnInit {
    ngOnInit() {

    }

    // practicasCarga = [];
    practicas;
    practicaSeleccionada = null;

    @Input() modo: any;
    @Input() modelo: any;
    @Input() solicitudProtocolo: any;
    @Input() practicasCarga: any;
    @Input() practicasEjecucion: any;

    // @Input('practicasCarga')
    // set setPracticasEjecucion(value: any) {

    //     this.practicasEjecucion = value;
    //     // if (this.modo.id === 'validacion' || this.modo.id === 'carga') {
    //     //     this.cargarListaPracticaCarga();
    //     //     if (this.modo.id === 'validacion') {
    //     //         this.cargarResultadosAnteriores();
    //     //     }
    //     // }
    // }
    constructor(
        private servicioPractica: PracticaService,
        private servicioProtocolo: ProtocoloService,
        public plex: Plex
    ) { }

    /**
     * Retorna true si el último estado registrado es de validada, false si no.
     *
     * @returns
     * @memberof ProtocoloDetalleComponent
     */
    isProtocoloValidado() {
        return this.modelo.estados[this.modelo.estados.length - 1].tipo === 'validada';
    }

    /**
     * Elimina una práctica seleccionada tanto de la solicitud como de la ejecución
     *
     * @param {IPractica} practica
     * @memberof ProtocoloDetalleComponent
     */
    eliminarPractica(practica: IPractica) {
        let practicasSolicitud = this.solicitudProtocolo.solicitudPrestacion.practicas;
        practicasSolicitud.splice(practicasSolicitud.findIndex(x => x.id === practica.id), 1);
        this.practicasEjecucion.splice(this.practicasEjecucion.findIndex(x => x.id === practica.id), 1);
    }

    /**
     * Marca los resultados de todas las prácticas como validados
     *
     * @param {any} event
     * @memberof ProtocoloDetalleComponent
     */
    validarTodas($event, practicas) {
        practicas.forEach(practica => {
            if (practica.valor) {
                practica.valor.resultado.validado = $event.value;
            }
            // } else {
            this.validarTodas($event, practica.registros);
            // }
        });
    }

    /**
     * Agrega estado validado al protocolo en caso que todos los resultados del mismo se encuentren marcados como validados.
     *
     * @memberof ProtocoloDetalleComponent
     */
    actualizarEstadoValidacion() {
        let protocoloValidado = this.practicasEjecucion.every((practica) => {
            return practica.resultado.validado;
        });

        if (protocoloValidado) {
            this.modelo.estados.push(Constantes.estadoValidada);
        }
    }

    busquedaInicial() {
        this.practicas = null;
    }

    searchClear() {
        this.practicas = null;
    }

    busquedaFinal(resultado: PracticaBuscarResultado) {
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
        } else {
            this.practicas = resultado.practicas;
        }
    }

    loadPracticasPorNombre($event) {
        console.log($event.query);
        if ($event.query) {
            this.servicioPractica.getMatch({
                cadenaInput: $event.query
            }).subscribe((resultado: any) => {
                console.log(resultado);
                $event.callback(resultado);
            });
        } else {
            $event.callback([]);
        }
    }

    getPracticaPorCodigo(value) {
        console.log('getPracticaPorCodigo')
        if (this.practicaSeleccionada !== '') {
            this.servicioPractica.getMatchCodigo(this.practicaSeleccionada).subscribe((resultado: any) => {
                if (resultado) {
                    this.seleccionarPractica(resultado);
                }
            });
        }
    }

    /**
    * Incluye una nueva práctica seleccionada tanto a la solicitud como a la ejecución
    *
    * @param {IPractica} practica
    * @memberof ProtocoloDetalleComponent
    */
    async seleccionarPractica(practica: IPractica) {
        console.log('seleccionarPractica');
        if (practica) {
            let existe = this.solicitudProtocolo.solicitudPrestacion.practicas.findIndex(x => x.concepto.conceptId === practica.concepto.conceptId);

            if (existe === -1) {
                this.solicitudProtocolo.solicitudPrestacion.practicas.push(practica);
                let practicaEjecucion: any = {
                    _id: practica.id,
                    codigo: practica.codigo,
                    destacado: false,
                    esSolicitud: false,
                    esDiagnosticoPrincipal: false,
                    relacionadoCon: [],
                    nombre: practica.nombre,
                    concepto: practica.concepto,
                    // registros: []
                };

                // if (practica.categoria !== 'compuesta') {
                practicaEjecucion.valor = {
                    resultado: {
                        valor: null,
                        sinMuestra: false,
                        validado: false
                    }
                };
                // }
                console.log('gonna this.getPracticasRequeridas....');
                practicaEjecucion.registros = await this.getPracticasRequeridas(practica);
                this.practicasEjecucion.push(practicaEjecucion);
            } else {
                this.plex.alert('', 'Práctica ya ingresada');
            }
        }
        this.practicaSeleccionada = null;
        console.log('this.practicaSeleccionada', this.practicaSeleccionada);
    }

    /**
    * Carga practicas requeridas en practica de ejecucion
    *
    * @memberof ProtocoloDetalleComponent
    */
    async getPracticasRequeridas(practica) {
        return new Promise(async (resolve) => {
            if (practica.categoria === 'compuesta' && practica.requeridos) {
                let ids = [];
                practica.requeridos.map((id) => { ids.push(id._id); });
                // await this.servicioPractica.findByIds({ ids: ids }).subscribe((resultados) => {
                    await this.servicioPractica.findByIds( ids ).subscribe((resultados) => {
                    resultados.forEach(async (resultado: any) => {
                        resultado.valor = {
                            resultado: {
                                valor: null,
                                sinMuestra: false,
                                validado: false
                            }
                        };
                        // resultado.registros.map( (registro) => {
                        //     registro.valor = {
                        //         valor: null,
                        //         sinMuestra: false,
                        //         validado: false
                        //     };
                        // });
                        // console.log('resultados',resultado.registros)

                        // });

                        // requeridas.push({
                        //     valor: {
                        //         valor: null,
                        //         sinMuestra: false,
                        //         validado: false
                        //     },
                        //     concepto: resultado.concepto,
                        //     nombre: resultado.nombre,
                        //     requeridos: resultado.requeridos
                        // });
                        resultado.registros = await this.getPracticasRequeridas(resultado);
                    });
                    console.log('getPracticasRequeridas');
                    resolve(resultados);
                });
            } else {
                resolve([]);
            }
        });
    }
}
