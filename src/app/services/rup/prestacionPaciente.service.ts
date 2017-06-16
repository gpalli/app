import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { environment } from '../../../environments/environment';
import { Server } from '@andes/shared';
import { IPrestacionPaciente } from './../../interfaces/rup/IPrestacionPaciente';
import { IProblemaPaciente } from './../../interfaces/rup/IProblemaPaciente';

@Injectable()
export class PrestacionPacienteService {

    private prestacionesUrl = '/modules/rup/prestaciones';  // URL to web api

    constructor(private server: Server) { }

    /**
     * Metodo get. Trae lista de objetos prestacion.
     *
     * @param {*} params Opciones de busqueda
     * @param {*} [options={}] Options a pasar a la API
     * @returns {Observable<IPrestacionPaciente[]>}
     *
     * @memberof PrestacionPacienteService
     */
    get(params: any, options: any = {}): Observable<IPrestacionPaciente[]> {

        if (typeof options.showError === 'undefined') {
            options.showError = true;
        }

        let opt;
        opt = {
            params: params,
            options
        };

        return this.server.get(this.prestacionesUrl, opt);
    }
    /**
     * Metodo getById. Trae el objeto tipoPrestacion por su Id.
     * @param {String} id Busca por Id
     */
    getById(id: String, options: any = {}): Observable<IPrestacionPaciente> {
        if (typeof options.showError === 'undefined') {
            options.showError = true;
        }

        let url = this.prestacionesUrl + '/' + id;
        return this.server.get(url, options);
    }

    /**
     * Metodo getById. Trae el objeto tipoPrestacion por su Id.
     * @param {String} id Busca por Id
     */
    getByKey(params: any, options: any = {}): Observable<IPrestacionPaciente[]> {
        if (typeof options.showError === 'undefined') {
            options.showError = true;
        }

        let opt;
        opt = {
            params: params,
            options
        };

        let url = this.prestacionesUrl + '/forKey/';
        return this.server.get(url, opt);
    }

    /**
     * Metodo post. Inserta un objeto prestacionPaciente nuevo.
     * @param {IPrestacionPaciente} prestacion Recibe IPrestacionPaciente
     */
    post(prestacion: any): Observable<IPrestacionPaciente> {
        return this.server.post(this.prestacionesUrl, prestacion);
    }

    /**
     * Metodo put. Actualiza un objeto prestacionPaciente.
     * @param {IPrestacionPaciente} problema Recibe IPrestacionPaciente
     */
    put(prestacion: IPrestacionPaciente): Observable<IPrestacionPaciente> {
        return this.server.put(this.prestacionesUrl + '/' + prestacion.id, prestacion);
    }

    patch(prestacion: IPrestacionPaciente, cambios: any): Observable<IPrestacionPaciente> {
        return this.server.patch(this.prestacionesUrl + '/' + prestacion.id, cambios);
    }

// tslint:disable-next-line:eofline
}
