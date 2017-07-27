import { PacienteService } from './../../../../services/paciente.service';
import { Observable } from 'rxjs/Rx';
import { ITipoPrestacion } from './../../../../interfaces/ITipoPrestacion';
import { Component, Input, EventEmitter, Output, OnInit, HostBinding, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';
import { ITurno } from './../../../../interfaces/turnos/ITurno';
import { IPaciente } from './../../../../interfaces/IPaciente';
import { AgendaService } from '../../../../services/turnos/agenda.service';
import { TipoPrestacionService } from './../../../../services/tipoPrestacion.service';

@Component({
    selector: 'sobreturno',
    templateUrl: 'sobreturno.html'
})

export class AgregarSobreturnoComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;
    private _agenda: any;

    @Input('agenda')
    set agenda(value: any) {
        this._agenda = value;
    }
    get agenda(): any {
        return this._agenda;
    }

    @Output() volverAlGestor = new EventEmitter<boolean>();
    @Output() selected: EventEmitter<any> = new EventEmitter<any>();
    @Output() escaneado: EventEmitter<any> = new EventEmitter<any>();


    paciente: IPaciente;
    tipoPrestacion: ITipoPrestacion;
    resultado: any;
    showAgregarSobreturno = true;
    showCreateUpdate = false;
    showSobreturno = true;
    pacientesSearch = false;
    horaTurno = null;
    telefono: String = '';
    cambioTelefono = false;

    public seleccion = null;
    public esEscaneado = false;
    hoy = new Date();
    inicio: Date;
    fin: Date;


    constructor(
        public plex: Plex,
        public serviceAgenda: AgendaService,
        public servicioTipoPrestacion: TipoPrestacionService,
        private router: Router,
        public auth: Auth,
        public servicePaciente: PacienteService) { }

    ngOnInit() {
        this.inicio = new Date(this.hoy.setHours(this.agenda.horaInicio.getHours(), this.agenda.horaInicio.getMinutes(), 0, 0));
        this.fin = new Date(this.hoy.setHours(this.agenda.horaFin.getHours(), this.agenda.horaFin.getMinutes(), 0, 0));
    }

    buscarPaciente() {
        this.showSobreturno = false;
        this.pacientesSearch = true;
    }

    afterCreateUpdate(paciente) {
        this.showCreateUpdate = false;
        this.showSobreturno = true;
        if (paciente) {
            this.servicePaciente.getById(paciente.id).subscribe(
                pacienteMPI => {
                    this.paciente = pacienteMPI;
                    this.verificarTelefono(pacienteMPI);
                });
        } else {
            this.buscarPaciente();
        }
    }

    afterSearch(paciente: IPaciente): void {
        if (paciente.id) {
            this.servicePaciente.getById(paciente.id).subscribe(
                pacienteMPI => {
                    this.paciente = pacienteMPI;
                    this.verificarTelefono(this.paciente);
                    this.showSobreturno = true;
                    this.pacientesSearch = false;
                    window.setTimeout(() => this.pacientesSearch = false, 100);
                });
        } else {
            this.seleccion = paciente;
            // this.verificarTelefono(this.seleccion);
            this.esEscaneado = true;
            this.escaneado.emit(this.esEscaneado);
            this.selected.emit(this.seleccion);
            this.pacientesSearch = false;
            this.showCreateUpdate = true;
        }
    }

    verificarTelefono(paciente: IPaciente) {
        // se busca entre los contactos si tiene un celular
        this.telefono = '';
        this.cambioTelefono = false;
        if (paciente.contacto) {
            if (paciente.contacto.length > 0) {
                paciente.contacto.forEach((contacto) => {
                    if (contacto.tipo === 'celular') {
                        this.telefono = contacto.valor;
                    }
                });
            }
        }
    }

    guardar($event) {

        if ($event.formValid) {

            let pacienteSave = {
                id: this.paciente.id,
                documento: this.paciente.documento,
                apellido: this.paciente.apellido,
                nombre: this.paciente.nombre,
                telefono: this.telefono
            };

            // Si cambió el teléfono lo actualizo en el MPI
            if (this.cambioTelefono) {
                let nuevoCel = {
                    'tipo': 'celular',
                    'valor': this.telefono,
                    'ranking': 1,
                    'activo': true,
                    'ultimaActualizacion': new Date()
                };
                let mpi: Observable<any>;
                let flagTelefono = false;
                // Si tiene un celular en ranking 1 y activo cargado, se reemplaza el nro
                // sino, se genera un nuevo contacto
                if (this.paciente.contacto.length > 0) {
                    this.paciente.contacto.forEach((contacto, index) => {
                        if (contacto.tipo === 'celular') {
                            contacto.valor = this.telefono;
                            flagTelefono = true;
                        }
                    });
                    if (!flagTelefono) {
                        this.paciente.contacto.push(nuevoCel);
                    }
                } else {
                    this.paciente.contacto = [nuevoCel];
                }
                console.log(this.paciente.contacto);
                let cambios = {
                    'op': 'updateContactos',
                    'contacto': this.paciente.contacto
                };
                mpi = this.servicePaciente.patch(pacienteSave.id, cambios);
                mpi.subscribe(resultado => {

                    if (resultado) {
                        this.plex.alert('Se actualizó el numero de telefono');
                    }
                });
            }

            let patch = {
                'op': 'agregarSobreturno',
                'sobreturno': {
                    horaInicio: this.combinarFechas(this.agenda.horaInicio, this.horaTurno),
                    estado: 'asignado',
                    tipoPrestacion: this.tipoPrestacion,
                    paciente: pacienteSave,
                }
            };

            this.serviceAgenda.patch(this.agenda.id, patch).subscribe(resultado => {
                this.plex.toast('success', 'Información', 'El sobreturno se guardó correctamente');
                this.volverAlGestor.emit(true);
            });
        } else {
            this.plex.alert('Debe completar los datos requeridos');
        }
    }

    combinarFechas(fecha1, fecha2) {
        if (fecha1 && fecha2) {
            let horas: number;
            let minutes: number;
            let auxiliar: Date;

            auxiliar = new Date(fecha1);
            horas = fecha2.getHours();
            minutes = fecha2.getMinutes();
            // Date.setHours(hour, min, sec, millisec)
            auxiliar.setHours(horas, minutes, 0, 0);
            return auxiliar;
        } else {
            return null;
        }
    }

    cancelar() {
        this.volverAlGestor.emit(true);
    }
}