import { IBarrio } from './../../interfaces/IBarrio';
import { ILocalidad } from './../../interfaces/ILocalidad';
import { IPais } from './../../interfaces/IPais';
import {Observable} from 'rxjs/Rx';
import { Component, OnInit, Output, Input, EventEmitter} from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, REACTIVE_FORM_DIRECTIVES } from '@angular/forms';

import { BarrioService } from './../../services/barrio.service';
import { LocalidadService } from './../../services/localidad.service';
import { ProvinciaService } from './../../services/provincia.service';
import { PaisService } from './../../services/pais.service';
import * as enumerados from './../../utils/enumerados';

import {IPaciente } from './../../interfaces/IPaciente';
import { IProvincia } from './../../interfaces/IProvincia';

@Component({
    selector: 'paciente-create',
    directives: [REACTIVE_FORM_DIRECTIVES],
    templateUrl: 'components/paciente/paciente-create.html'
})
export class PacienteCreateComponent implements OnInit {
    createForm: FormGroup;
    estados = [];
    sexos = [];
    generos = [];
    estadosCiviles = [];
    tiposContactos = [];
    paises: IPais[] = [];
    provincias: IProvincia[] = [];
    localidades: ILocalidad[]= [];
    barrios: IBarrio[] = [];

    constructor(private formBuilder: FormBuilder, private PaisService: PaisService,
    private ProvinciaService: ProvinciaService, private LocalidadService: LocalidadService, 
    private BarrioService: BarrioService) {}

    ngOnInit() {

        //CArga de combos
        this.PaisService.get().subscribe(resultado => {debugger; this.paises = resultado});
        this.ProvinciaService.get().subscribe(resultado => {debugger; this.provincias = resultado});
        this.LocalidadService.get().subscribe(resultado => {debugger; this.localidades = resultado});

        this.sexos = enumerados.getSexo();
        this.generos = enumerados.getGenero();
        this.estadosCiviles = enumerados.getEstadoCivil();
        this.tiposContactos = enumerados.getTipoComunicacion();
        this.estados = enumerados.getEstados();

        this.createForm = this.formBuilder.group({
            nombre: ['', Validators.required],
            apellido: ['', Validators.required],
            alias: [''],
            documento: ['', Validators.required],
            fechaNacimiento: [''],
            estado: [''],
            sexo: [''],
            genero: [''],
            estadoCivil: [''],
            contacto: this.formBuilder.array([
                this.iniContacto(1)
            ]),
            direccion: this.formBuilder.array([
                this.formBuilder.group({
                    valor: [''],
                    ubicacion: this.formBuilder.group({
                        pais: [''],
                        provincia: [''],
                        localidad: [''],
                        barrio: ['']
                    }),
                    ranking: [''],
                    codigoPostal: [''],
                    latitud: [''],
                    longitud: [''],
                    activo: [true]
                })
            ])
        });
    }

    iniContacto(rank: Number) {
        // Inicializa contacto
        let cant = 0;
        let fecha = new Date();
        return this.formBuilder.group({
            tipo: [''],
            valor: [''],
            ranking: [rank],
            ultimaActualizacion: [fecha],
            activo: [true]
        });
    }

    addContacto() {
        // agrega formMatricula 
        const control = <FormArray> this.createForm.controls['contacto'];
        control.push(this.iniContacto(control.length));
    }

    removeContacto(i: number) {
        // elimina formMatricula
        const control = <FormArray>this.createForm.controls['contacto'];
        control.removeAt(i);
    }

    onSave(model: IPaciente, isvalid: boolean) {
        debugger;
        if (isvalid) {
            /* let profOperation: Observable < IProfesional > ;
             model.habilitado = true;
             profOperation = this.profesionalService.post(model);

             profOperation.subscribe(resultado => {
                 debugger;
                 this.data.emit(resultado);
             });*/

        } else {
            alert("Complete datos obligatorios");
        }
    }

    onCancel() {
        //this.data.emit(null)
    }

    filtrarProvincias(idPais: String){
        debugger;
       this.provincias = this.provincias.filter((p) => p.pais._id == idPais);
    }

    filtrarLocalidades(idProvincia: String){
       this.localidades = this.localidades.filter((loc) => loc.provincia._id == idProvincia);
    }

}