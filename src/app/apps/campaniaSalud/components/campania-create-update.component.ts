import { AdjuntosService } from './../../../modules/rup/services/adjuntos.service';
import { CampaniaSaludService } from './../services/campaniaSalud.service';
import { ICampaniaSalud } from './../interfaces/ICampaniaSalud';
import { Plex } from '@andes/plex';
import { Component, OnInit, Input, EventEmitter, Output, ViewChildren, QueryList } from '@angular/core';
import * as enumerados from '../../../utils/enumerados';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
    selector: 'campaniaForm',
    templateUrl: 'campania-create-update.html',
    styleUrls: ['../../../modules/rup/components/elementos/adjuntarDocumento.scss', 'campaniaVisualizacion.scss']
})
export class CampaniaFormComponent implements OnInit {
    /**
     * Campaña que se utiliza para crear o editar.
     *
     * @readonly
     * @type {ICampaniaSalud}
     * @memberof CampaniaFormComponent
     */
    @Input()
    get campania(): ICampaniaSalud {
        return this.campaniaEdit;
    }
    set campania(value: ICampaniaSalud) {
        this.campaniaEdit = {} as any;
        Object.assign(this.campaniaEdit, value);
        if (!this.campaniaEdit.target) {
            this.campaniaEdit.target = {};
        }
        if (!this.campaniaEdit.target.grupoEtario) {
            this.campaniaEdit.target.grupoEtario = {};
        }
        this.imagen = this.sanitizer.bypassSecurityTrustHtml(value.imagen);
    }
    @Output() cancelar = new EventEmitter<boolean>();
    @Output() guardar = new EventEmitter<ICampaniaSalud>();

    /**
     * Clon de la campaña pasada por parámetro sobre el que se realizan las modificaciones.
     * Si se guarda, es este el objeto que pisa el documento de la base de datos.
     * @type {ICampaniaSalud}
     * @memberof CampaniaFormComponent
     */
    campaniaEdit: ICampaniaSalud;
    /**
     * Donde se almacenan las diferentes opciones de sexo enumerados
     *
     * @type {any[]}
     * @memberof CampaniaFormComponent
     */
    sexos: any[];

    /*CARGA DE IMAGENES*/
    @ViewChildren('upload') childsComponents: QueryList<any>;

    // Adjuntar Archivo
    errorExt = false;
    waiting = false;
    imagenSvg: string;
    fileToken: String = null;
    timeout = null;
    lightbox = false;
    indice;
    documentos = [];
    nombreSvg: string;
    imagen: SafeHtml;
    imagenes = ['svg'];

    /*FIN CARGA DE IMAGENES*/

    constructor(private plex: Plex, private campaniaSaludService: CampaniaSaludService, public adjuntosService: AdjuntosService, public sanitizer: DomSanitizer) {

    }
    ngOnInit(): void {
        this.sexos = enumerados.getObjSexos();
    }

    /**
     * Notifica al componente padre que se seleccionó la opción de cancelar modificaciones del formulario
     *
     * @memberof CampaniaFormComponent
     */
    onCancel() {
        this.cancelar.emit();
    }

    /**
     * Notifica al componente padre que se seleccionó la opción de guardar las modicicaciones del formulario.
     *
     * @param {*} $event
     * @memberof CampaniaFormComponent
     */
    save($event) {
        if ($event.formValid) {
            if ((this.campaniaEdit.target.grupoEtario.desde && this.campaniaEdit.target.grupoEtario.hasta)
                && this.campaniaEdit.target.grupoEtario.desde > this.campaniaEdit.target.grupoEtario.hasta) {
                this.plex.info('danger', 'Edad Desde debe ser menor que la Edad Hasta.');
            } else {
                if (this.campaniaEdit.target && this.campaniaEdit.target.sexo) { // como sexo es un enumerado, debo hacer esto para obtener el id (string) que se va a guardar en base de datos
                    this.campaniaEdit.target.sexo = (this.campaniaEdit.target.sexo as any).id || this.campaniaEdit.target.sexo;
                }

                this.campaniaEdit.imagen = this.imagenSvg;

                (this.campaniaEdit.id ? this.campaniaSaludService.putCampanias(this.campaniaEdit)
                    : this.campaniaSaludService.postCampanias(this.campaniaEdit)).subscribe(res => {
                        this.plex.info('success', 'Los datos están correctos');
                        this.guardar.emit(res);
                    });
            }

        } else {
            this.plex.info('warning', 'Completar datos requeridos');
        }
    }

    /*INICIO CARGA DE IMAGENES*/
    // Adjuntar archivo
    changeListener($event): void {
        this.readThis($event.target);
    }

    readThis(inputValue: any): void {
        let ext = this.fileExtension(inputValue.value);
        this.errorExt = false;

        if (!this.imagenes.find((item) => item === ext.toLowerCase())) {
            (this.childsComponents.first as any).nativeElement.value = '';
            this.errorExt = true;
            return;
        }
        let file: File = inputValue.files[0];
        let myReader: FileReader = new FileReader();

        myReader.onloadend = (e) => {
            (this.childsComponents.first as any).nativeElement.value = '';

            this.imagenSvg = myReader.result as string;
            if (this.confirmarSvg(this.imagenSvg)) {
                this.imagen = this.sanitizer.bypassSecurityTrustHtml(this.imagenSvg);

                this.nombreSvg = file.name;
            }
        };
        myReader.readAsText(file);

    }

    fileExtension(file) {
        if (file.lastIndexOf('.') >= 0) {
            return file.slice((file.lastIndexOf('.') + 1));
        } else {
            return '';
        }
    }

    esImagen(extension) {
        return this.imagenes.find(x => x === extension.toLowerCase());
    }

    imageRemoved() {
        this.campaniaEdit.imagen = null;
    }

    activaLightbox() {
        this.lightbox = true;
    }

    createUrl() {
        return this.campaniaEdit.imagen;
    }
    // cancelarAdjunto() {
    //     clearTimeout(this.timeout);
    //     this.waiting = false;
    // }

    /**
     * Confirma si es un archivo SVG con ancho y alto 35px
     *
     * @param {string} archivo
     * @memberof CampaniaFormComponent
     */
    confirmarSvg(archivo: string): boolean {
        console.log(archivo);
        let regex = /^<\?xml .*\?>(.|\n)*<svg (.|\n)*width(.|\n)*35(.|\n)*px(.|\n)*height(.|\n)*35(.|\n)*px(.|\n)*<\/svg>?/;
        let resultado = archivo.match(regex);
        console.log(resultado);
        return regex.test(archivo);
        // return resultado && resultado.length === archivo.length;
    }

    /*FIN CARGA DE IMAGENES*/
}
