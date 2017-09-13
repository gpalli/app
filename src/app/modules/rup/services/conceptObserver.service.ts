import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { ISnomedConcept } from '../interfaces/snomed-concept.interface';
import { IPrestacionRegistro } from '../interfaces/prestacion.registro.interface';

@Injectable()
export class ConceptObserverService {
  private observers: { [concepto: string]: Subject<IPrestacionRegistro> } = {};

  /**
   * Devuelve un observable para el concepto indicado
   *
   * @param {ISnomedConcept} concepto Concepto de SNOMED
   * @returns {Subject<any>} Observable
   * @memberof ConceptObserverService
   */
  public observe(registro: IPrestacionRegistro): Observable<IPrestacionRegistro> {
    if (!this.observers[registro.concepto.conceptId]) {
      this.observers[registro.concepto.conceptId] = new Subject<IPrestacionRegistro>();
    };
    // Filtra para que notifique al mismo elemento que lo generó el cambio
    return this.observers[registro.concepto.conceptId].filter((value, index) => value !== registro);
  }

  /**
   * Notifica de los cambios de un registro a todos los observers
   *
   * @param {ISnomedConcept} concepto Concepto de SNOMED
   * @param {IPrestacionRegistro} registro Registro
   * @memberof ConceptObserverService
   */
  public notify(concepto: ISnomedConcept, registro: IPrestacionRegistro) {
    if (this.observers[concepto.conceptId]) {
      this.observers[concepto.conceptId].next(registro);
    }
  }
};
