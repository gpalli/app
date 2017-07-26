import { Observable } from 'rxjs/Observable';
import { Component, OnInit, Output, Input, EventEmitter, HostBinding } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import * as moment from 'moment';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { IPaciente } from './../../../interfaces/IPaciente';
import { IPrestacionPaciente } from './../../../interfaces/rup/IPrestacionPaciente';
import { IProblemaPaciente } from './../../../interfaces/rup/IProblemaPaciente';
import { IProfesional } from './../../../interfaces/IProfesional';
import { ITipoPrestacion } from './../../../interfaces/ITipoPrestacion';
import { AgendaService } from './../../../services/turnos/agenda.service';
import { PrestacionPacienteService } from './../../../services/rup/prestacionPaciente.service';
import { TipoPrestacionService } from './../../../services/tipoPrestacion.service';
import { IAgenda } from './../../../interfaces/turnos/IAgenda';

import { EstadosAgenda } from './../../turnos/enums';

@Component({
    selector: 'rup-puntoInicio',
    templateUrl: 'puntoInicio.html'
})
export class PuntoInicioComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;

    // Fecha seleccionada
    public fecha: Date = new Date();
    // Lista de agendas filtradas por fecha, tipos de prestaciones permitidas, ...
    public agendas: IAgenda[] = [];
    // Agenda seleccionada
    public agendaSeleccionada;
    // Mostrar sólo mis agendas
    public soloMisAgendas = true;
    // Lista de prestaciones filtradas por fecha, tipos de prestaciones permitidas, ...
    public prestaciones: any = [];
    // Tipos de prestacion que el usuario tiene permiso
    public tiposPrestacion: any = [];
    // Prestaciones que están fuera de la agenda
    public fueraDeAgenda: any = [];
    // estados a utilizarse en la agenda
    public estadosAgenda = EstadosAgenda;


    // FILTROS
    private resultadosOriginales: any = {agendas: [], prestaciones: []};
    private agendasOriginales: any = [];
    public prestacionSeleccion: any;
    public paciente: any;

    constructor(private router: Router,
        private plex: Plex, public auth: Auth,
        public servicioAgenda: AgendaService,
        public servicioPrestacion: PrestacionPacienteService,
        public servicioTipoPrestacion: TipoPrestacionService) { }

    ngOnInit() {
        // Carga tipos de prestaciones permitidas para el usuario
        this.servicioTipoPrestacion.get({ id: this.auth.getPermissions('rup:tipoPrestacion:?') }).subscribe(data => {
            this.tiposPrestacion = data;

            this.actualizar();
        });
    }

    /**
     * Actualiza el listado de agendas y prestaciones
     */
    actualizar() {
        Observable.forkJoin(
            // Agendas
            this.servicioAgenda.get({
                fechaDesde: this.fecha,
                fechaHasta: this.fecha
            }),
            // Prestaciones
            this.servicioPrestacion.get({
                fechaDesde: this.fecha,
                fechaHasta: this.fecha
                // TODO: filtrar por las prestaciones permitidas, pero la API no tiene ningún opción
                // this.auth.getPermissions('rup:tipoPrestacion:?')
            })
        ).subscribe(data => {
            this.agendas = data[0];
            if (this.agendas.length) {
                this.agendaSeleccionada = this.agendas[0];
            }
            this.prestaciones = data[1];

            //Object.assign(this.agendasOriginales, data[0]);
            this.agendasOriginales = JSON.parse(JSON.stringify(data[0]));
            Object.assign(this.resultadosOriginales.prestaciones, data[1]);

            // vinculamos las prestaciones a los turnos
            this.vincularTurnosPrestaciones();
            // buscamos las que estan fuera de agenda para poder listarlas
            this.fueraDeAgenda = this.prestaciones.filter(p => (!p.solicitud.turno));
            // filtramos los resultados
            this.filtrar();
        });
    }

    /**
     * Filtra el listado de agendas y prestaciones
     */
    filtrar() {
        this.agendas = this.agendasOriginales;
        this.prestaciones = this.resultadosOriginales.prestaciones;

        debugger;
       /*
        // por tipo de prestación
        if (this.prestacionSeleccion) {
            this.agendas.forEach((agenda, indexAgenda, agendas) => {

                // loopeamos los bloques de la agendas
                agenda.bloques.forEach((bloque, indexBloque, bloques) => {
                    // loopeamos los turnos dentro de los bloques
                    bloque.turnos.forEach( (turno, indexTurno, turnos) => {
                        if (typeof turno.tipoPrestacion === 'undefined' ||
                            (typeof turno.tipoPrestacion !== 'undefined' && turno.tipoPrestacion && turno.tipoPrestacion.conceptId !== this.prestacionSeleccion.conceptId) ) {
                            // agendas[indexAgenda].bloques[indexBloque].turnos.splice(indexTurno, 1);
                            turnos.splice(indexTurno, 1);
                            console.log(turnos);
                        }

                    });
                });
            });
            console.log(this.agendas);
        }
        */

        if (typeof this.paciente !== 'undefined' && this.paciente) {
            let search = this.paciente.toLowerCase();

            for (let indexAgenda = 0; indexAgenda < this.agendas.length; indexAgenda++) {

                let lengthBloques = this.agendas[indexAgenda].bloques.length;
                for (let indexBloque = 0; indexBloque < lengthBloques; indexBloque++) {
                    // let _turnos = [];
                    // let lengthTurnos = this.agendas[indexAgenda].bloques[indexBloque].turnos.length;
                    // for (let indexTurno = 0; indexTurno < lengthTurnos; indexTurno++) {
                        let _turnos = this.agendas[indexAgenda].bloques[indexBloque].turnos.filter(t => {
                            return (t.paciente &&
                               (t.paciente.nombre.toLowerCase().indexOf(search) >= 0 || t.paciente.apellido.toLowerCase().indexOf(search) >= 0
                                    ||  t.paciente.documento.toLowerCase().indexOf(search) >= 0));
                        });

                        /* let turno = this.agendas[indexAgenda].bloques[indexBloque].turnos[indexTurno];
                        if (turno.paciente) {

                            let nombreCompleto = turno.paciente.apellido + ' ' +  turno.paciente.nombre;
                            if (nombreCompleto.indexOf(search) === -1 &&  turno.paciente.nombre.indexOf(search) === -1
                                && turno.paciente.apellido.indexOf(search) === -1 &&  turno.paciente.documento.indexOf(search) == -1) {

                                // this.agendas[indexAgenda].bloques[indexBloque].turnos.splice(indexTurno, 1);
                                this.agendas[indexAgenda].bloques[indexBloque].turnos.splice(indexTurno, 1);
                                // turnos.splice(indexTurno, 1);
                            }
                        }else {
                             // turnos.splice(indexTurno, 1);
                             // this.agendas[indexAgenda].bloques[indexBloque].turnos.splice(indexTurno, 1);
                             this.agendas[indexAgenda].bloques[indexBloque].turnos.splice(indexTurno, 1);
                        } */
                    //}

                    this.agendas[indexAgenda].bloques[indexBloque].turnos = _turnos;
                    debugger;
                }
            }

            /* this.agendas.forEach( function (agenda, indexAgenda, agendas)  {

                // loopeamos los bloques de la agendas
                agenda.bloques.forEach( function (bloque, indexBloque, bloques) {
                    // loopeamos los turnos dentro de los bloques
                    // bloque.turnos = bloque.turnos.filter(turno => {
                    //    return (turno.paciente &&
                    //           (turno.paciente.nombre.indexOf(search) === -1 && turno.paciente.apellido.indexOf(search) === -1
                    //                &&  turno.paciente.documento.indexOf(search) === -1));
                    // });
                    bloque.turnos.forEach( function (turno, indexTurno, turnos) {
                        if (turno.paciente) {

                            let nombreCompleto = turno.paciente.apellido + ' ' +  turno.paciente.nombre;
                            if (nombreCompleto.indexOf(search) === -1 &&  turno.paciente.nombre.indexOf(search) === -1
                                && turno.paciente.apellido.indexOf(search) === -1 &&  turno.paciente.documento.indexOf(search) == -1) {

                                // this.agendas[indexAgenda].bloques[indexBloque].turnos.splice(indexTurno, 1);
                                turnos.splice(indexTurno, 1);
                                // turnos.splice(indexTurno, 1);
                            }
                        }else {
                             // turnos.splice(indexTurno, 1);
                             // this.agendas[indexAgenda].bloques[indexBloque].turnos.splice(indexTurno, 1);
                             turnos.splice(indexTurno, 1);
                        }

                    });
                });
            }); */
        }
        console.log(this.agendas);
    }

    /**
     * Navega para crear una nueva prestación
     */
    crearPrestacion() {
        this.router.navigate(['/rup/crear']);
    }

    iniciarPrestacion(paciente, snomedConcept, turno) {
        this.servicioPrestacion.crearPrestacion(paciente, snomedConcept, 'ejecucion', new Date(), turno).subscribe(prestacion => {
            this.plex.alert('Prestación creada.').then(() => {
                this.router.navigate(['/rup/ejecucion', prestacion.id]);
            });
        }, (err) => {
            this.plex.toast('danger', 'ERROR: No fue posible crear la prestación');
        });
    }

    // volverAlInicio() {
    //     this.paciente = null;
    //     this.mostrarLista = true;
    // }

    vincularTurnosPrestaciones() {
        // loopeamos agendas
        this.agendas.forEach(agenda => {
            agenda['cantidadPacientes'] = 0;
            agenda['cantidadTurnos'] = 0;
            // loopeamos los bloques de la agendas
            agenda.bloques.forEach(bloques => {
                agenda['cantidadTurnos'] += bloques.turnos.length;
                // loopeamos los turnos dentro de los bloques
                bloques.turnos.forEach(turno => {
                    let indexPrestacion = this.prestaciones.findIndex(prestacion => (prestacion.solicitud.turno && prestacion.solicitud.turno === turno.id));
                    // asignamos la prestacion al turno
                    turno['prestacion'] = this.prestaciones[indexPrestacion];
                    // sumamos la cantidad de pacientes
                    // agenda['cantidadPacientes'] += (indexPrestacion !== -1) ? 1 : 0;
                    agenda['cantidadPacientes'] += (turno.paciente) ? 1 : 0;
                });
            });
        });
    }

    cargarTurnos(agenda) {
        this.agendaSeleccionada = agenda ? agenda : 'fueraAgenda';
    }


    routeTo(action, id) {
        this.router.navigate(['rup/' + action + '/', id]);
    }

    /**
     * Generar listado de posibles pacientes que serán o fueron atendidos
     *
     * @memberof PuntoInicioComponent
     */
    // cargaPacientes() {
    //     this.pacientesPresentes = [];
    //     let unPacientePresente: any = {};

    //     this.agendas.forEach(agenda => {
    //         let turnos: any = [];
    //         // Recorremos los bloques de una agenda para sacar los turnos asignados.
    //         for (let i in agenda.bloques) {
    //             if (i) {
    //                 let turnosAsignados = agenda.bloques[i].turnos.filter(turno => (
    //                     (turno.estado === 'asignado') || (turno.paciente && turno.estado === 'suspendido')));
    //                 turnos = [...turnos, ...turnosAsignados];
    //             }
    //         }
    //         turnos.forEach(turno => {
    //             unPacientePresente.idAgenda = agenda.id;
    //             unPacientePresente.turno = turno;
    //             unPacientePresente.tipoPrestacion = turno.tipoPrestacion;
    //             // El estado para pacientes que aún no dieron asistencia es Programado
    //             unPacientePresente.estado = 'programado';
    //             unPacientePresente.fecha = turno.horaInicio;
    //             unPacientePresente.profesionales = agenda.profesionales;
    //             // Cargo el tipo de prestacion y el paciente del turno
    //             unPacientePresente.nombrePrestacion = turno.tipoPrestacion.nombre;
    //             unPacientePresente.paciente = turno.paciente;

    //             if (turno.asistencia === 'asistio') {
    //                 unPacientePresente.estado = 'En espera';
    //             } else {
    //                 if (turno.estado === 'suspendido') {
    //                     unPacientePresente.estado = 'suspendido';
    //                     unPacientePresente.fecha = turno.horaInicio;
    //                 }
    //             }

    //             // Buscar si existe una prestacion asociada al turno
    //             let prestacionTurno = this.prestaciones.find(x => {
    //                 if (x.solicitud.turno && (x.solicitud.turno.toString() === turno._id.toString())) {
    //                     return x;
    //                 }
    //             });

    //             if (prestacionTurno) {
    //                 unPacientePresente.idPrestacion = prestacionTurno.id;
    //                 // Cargo un objeto con el profesional que realizó el ultimo cambio de estado.
    //                 unPacientePresente.profesionales = [prestacionTurno.estados[prestacionTurno.estados.length - 1].createdBy];
    //                 if (prestacionTurno.estados[(prestacionTurno.estados.length - 1)].tipo !== 'pendiente') {
    //                     unPacientePresente.estado = prestacionTurno.estados[prestacionTurno.estados.length - 1].tipo;
    //                     unPacientePresente.fecha = prestacionTurno.estados[prestacionTurno.estados.length - 1].createdAt;
    //                 }
    //             }

    //             this.pacientesPresentes = [... this.pacientesPresentes, unPacientePresente];
    //             unPacientePresente = {};
    //         });
    //     });


    //     // Buscamos los que solo tienen prestacion y no tienen turno
    //     let prestacionesSinTurno = this.prestaciones.filter(prestacion => {
    //         if (prestacion.ejecucion.solicitud === null) {
    //             return prestacion;
    //         }
    //     });

    //     prestacionesSinTurno.forEach(prestacion => {
    //         unPacientePresente.idAgenda = null;
    //         unPacientePresente.turno = null;
    //         unPacientePresente.estado = prestacion.estados[prestacion.estados.length - 1].tipo;
    //         unPacientePresente.fecha = prestacion.estados[prestacion.estados.length - 1].createdAt;
    //         unPacientePresente.profesionales = [prestacion.estados[prestacion.estados.length - 1].createdBy];

    //         if (unPacientePresente.estado === 'pendiente') {
    //             unPacientePresente.estado = 'programado';
    //         }

    //         unPacientePresente.idPrestacion = prestacion.id;
    //         // //Cargo el tipo de prestacion
    //         unPacientePresente.nombrePrestacion = prestacion.solicitud.tipoPrestacion.term; // Recorrer las prestaciones si tiene mas de una
    //         // //Recorro agenda saco el estados
    //         unPacientePresente.paciente = prestacion.paciente;
    //         this.pacientesPresentes = [... this.pacientesPresentes, unPacientePresente];
    //         unPacientePresente = {};
    //     });


    //     // Ordenar los turnos y prestaciones por fecha y hora
    //     this.pacientesPresentes = this.pacientesPresentes.sort((a, b) => { return (a.fecha > b.fecha) ? 1 : ((b.fecha > a.fecha) ? -1 : 0); });
    //     this.pacientesPresentesCompleto = [... this.pacientesPresentes];

    //     this.filtrarPacientes(this.filtrosPacientes);
    // }

    /**
     * Filtrar el listado de pacientes
     *
     * @param {boolean} misPacientes: solo listar los pacientes del profesional
     *
     * @memberof PuntoInicioComponent
     */
    // filtrarPacientes(misPacientes: boolean) {
    //     this.filtrosPacientes = misPacientes;
    //     let usu = this.auth.usuario;
    //     let listadoFiltrado = [... this.pacientesPresentesCompleto];

    //     // solo los pacientes del profesional logueado
    //     if (this.filtrosPacientes) {
    //         listadoFiltrado = listadoFiltrado.filter(paciente => {
    //             if (paciente.profesionales.length > 0) {
    //                 let profesional = paciente.profesionales.find(profesional => {
    //                     // Si la prestacion ya esta en ejecucion tengo el documento del profesional
    //                     if (profesional.documento) {
    //                         if (profesional.documento === this.auth.usuario.username) {
    //                             return profesional;
    //                         }
    //                     } else {
    //                         if (profesional.id === this.auth.profesional.id) {
    //                             return profesional;
    //                         }
    //                     }
    //                 });
    //                 if (profesional) {
    //                     return paciente;
    //                 }
    //             }
    //         });
    //     }

    //     // por tipo de prestación
    //     if (this.prestacionSeleccion) {
    //         listadoFiltrado = listadoFiltrado.filter(paciente => {
    //             if (paciente.nombrePrestacion === this.prestacionSeleccion.nombre) {
    //                 return paciente;
    //             }
    //         });
    //     }

    //     this.pacientesPresentes = [...listadoFiltrado];

    // }

    /**************** /RELACION CON MPI **********************/

    // onReturn() {
    //     this.router.navigate(['/rup']);
    // }

    // irResumen(id) {
    //     this.router.navigate(['rup/validacion/', id]);
    // }

}


