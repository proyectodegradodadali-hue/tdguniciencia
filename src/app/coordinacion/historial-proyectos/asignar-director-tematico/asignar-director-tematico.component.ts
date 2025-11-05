import { Component, inject, signal, SimpleChanges } from '@angular/core';
import { AuthenticacionService } from '../../../services/authenticacion.service';
import { FirestoreService } from '../../../services/firestore.service';
import { AlertaService } from '../../../services/alerta.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { AlertaInformativoComponent } from "../../../shared/alerta-informativo/alerta-informativo.component";
import { CommonModule } from '@angular/common';
import { Models } from '../../../interfaces/models';

@Component({
  selector: 'app-asignar-director-tematico',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AlertaInformativoComponent],
  templateUrl: './asignar-director-tematico.component.html',
  styleUrl: './asignar-director-tematico.component.css'
})
export class AsignarDirectorTematicoComponent {

  private _authcations = inject(AuthenticacionService);
  private _firestore = inject(FirestoreService);
  public _alerta = inject(AlertaService);


  // Signal para controlar la visibilidad del modal (igual que app-form1-sedes)
  mostrarModal = signal<boolean>(false);


  // Modo del formulario y datos cuando es edición
  modo: 'crear' | 'editar';
  datosEdicion: any = null;

  constructor() {
  }

  // Abrir modal. Permite pasar datos cuando es edición o contexto cuando es creación
  abrirModal(modo: any, datos: any) {
    this.mostrarModal.set(true);
    this.consultarDocentesTematicos();
    this.modo = modo;
    if (modo === 'editar' && datos) {
      if (datos.codigoDirectorTematico) {
        this.docentesSeleccionados = [{
          codigoEstudiante: datos.codigoDirectorTematico,
          nombreUsuario: datos.directorTematico
        }];
      }else{
        this.docentesSeleccionados = [];
      }
      this.datosEdicion = datos;
    }
  }

  // Cerrar modal
  cerrarModal() {
    this.mostrarModal.set(false);
  }

  // Guardar cambios (crear o editar)
  async handleSave() {
    if (this.docentesSeleccionados.length === 0) {
      this._alerta.showWarning('Por favor, selecciona al menos un docente.');
      return;
    }
    const path = `Proyectos`;
    // crear: adjunta metadatos mínimos
    const nuevo = {
      ...this.datosEdicion,
      codigoDirectorTematico: this.docentesSeleccionados[0].codigoEstudiante,
      directorTematico: this.docentesSeleccionados[0].nombreUsuario,
    };

    console.log(nuevo);

    try {
      if (this.modo === 'editar' && this.datosEdicion?.id) {
        await this._firestore.updateDocument(`${path}/${this.datosEdicion.id}`, nuevo);
        this._alerta.showSuccess('Director Temático actualizado exitosamente.');
      }
      this.cerrarModal();
    } catch (error) {
      this._alerta.showError('Tu Conexión Internet Falló');
    }
    
  }

  // Cancelar
  handleCancel() {
    this.cerrarModal();
  }
  
  docentesTematicos: any[] = [];
  docentesTematicosAll: any[] = [];
  docentesSeleccionados: any[] = [];
  searchText: string = '';
  subcripcion: any;

  consultarDocentesTematicos() {
    const path = `Docentes`;
    const q: Models.Firebases.whereQuery[] = [];
    const extras: Models.Firebases.extrasQuery = {
      orderParam: 'docCreado',
      // directionSort: 'desc',
      // limit: 10,
      // group: true
    };
    this.subcripcion = this._firestore.getDocumentsQueryChanges(path, q, extras).subscribe(res => {
      this.docentesTematicosAll = res;
      this.docentesTematicos = res;
      this.applyFilters();
      console.log('docentesTematicos', this.docentesTematicos);
    });
  }

  agregarDocente(docente: any) {
    this.docentesSeleccionados.length = 0;
    this.docentesSeleccionados.push(docente);
  }

  removerDocente(docente: any) {
    this.docentesSeleccionados = this.docentesSeleccionados.filter(item => item.id !== docente.id);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
    console.log('searchText', this.searchText);
  }

  applyFilters() {
    let filtered = [...this.docentesTematicosAll];
    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase();
      filtered = filtered.filter(item => 
        item.nombreUsuario?.toLowerCase().includes(search) ||
        item.codigoEstudiante?.toLowerCase().includes(search)
      );
    }
    this.docentesTematicos = filtered;
  }

  ngOnDestroy(): void {
    if (this.subcripcion) {
      this.subcripcion.unsubscribe();
    }
  }
}
