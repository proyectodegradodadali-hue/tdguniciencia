import { Component, inject, signal, SimpleChanges } from '@angular/core';
import { AuthenticacionService } from '../../../services/authenticacion.service';
import { FirestoreService } from '../../../services/firestore.service';
import { AlertaService } from '../../../services/alerta.service';
import { Models } from '../../../interfaces/models';
import { AlertaInformativoComponent } from '../../../shared/alerta-informativo/alerta-informativo.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-asignar-estudiantes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AlertaInformativoComponent],
  templateUrl: './asignar-estudiantes.component.html',
  styleUrl: './asignar-estudiantes.component.css'
})
export class AsignarEstudiantesComponent {

  private _authcations = inject(AuthenticacionService);
  private _firestore = inject(FirestoreService);
  public _alerta = inject(AlertaService);


  // Signal para controlar la visibilidad del modal (igual que app-form1-sedes)
  mostrarModal = signal<boolean>(false);


  // Modo del formulario y datos cuando es edición
  modo: 'crear' | 'editar';
  datosEdicion: any = null;

  constructor() {
    this.consultarEstudiantes();
  }

  // Abrir modal. Permite pasar datos cuando es edición o contexto cuando es creación
  abrirModal(modo: any, datos: any) {

    this.mostrarModal.set(true);
    this.modo = modo;

    if (modo === 'editar' && datos) {
      if (datos.codigoEstudiantes.length > 0) {
        
        this.estudiantesSeleccionados = datos.codigoEstudiantes.map((codigo: string) => {
          return this.estudiantes.find((estudiante: any) => estudiante.codigoEstudiante === codigo);
        });

        this.estudiantes = this.estudiantes.filter(item => !this.estudiantesSeleccionados.some(estudiante => estudiante.codigoEstudiante === item.codigoEstudiante));

        this.estudiantesAll = [...this.estudiantes];
      }else{

        this.estudiantesSeleccionados = [];
      }

      this.datosEdicion = datos;
    }
  }

  // Cerrar modal
  cerrarModal() {
    this.consultarEstudiantes();
    this.mostrarModal.set(false);
  }

  // Guardar cambios (crear o editar)
  async handleSave() {
    if (this.estudiantesSeleccionados.length === 0) {
      this._alerta.showWarning('Por favor, selecciona al menos un estudiante.');
      return;
    }
    const path = `Proyectos`;
    // crear: adjunta metadatos mínimos
    const nuevo = {
      ...this.datosEdicion,
      codigoEstudiantes: this.estudiantesSeleccionados.map((estudiante: any) => estudiante.codigoEstudiante),
      estudiantes: this.estudiantesSeleccionados.map((estudiante: any) => estudiante.nombreUsuario),
    };

    console.log(nuevo);

    try {
      if (this.modo === 'editar' && this.datosEdicion?.id) {
        await this._firestore.updateDocument(`${path}/${this.datosEdicion.id}`, nuevo);
        this.consultarEstudiantes();
        this.searchText = '';
        this.applyFilters();
        this._alerta.showSuccess('Estudiantes actualizados exitosamente.');
      }
      this.cerrarModal();
    } catch (error) {
      this._alerta.showError('Tu Conexión Internet Falló');
    }
    
  }
  
  estudiantes: any[] = [];
  estudiantesAll: any[] = [];
  estudiantesSeleccionados: any[] = [];
  searchText: string = '';
  subcripcion: any;

  consultarEstudiantes() {
    const path = `Estudiantes`;
    const q: Models.Firebases.whereQuery[] = [];
    const extras: Models.Firebases.extrasQuery = {
      orderParam: 'docCreado',
      // directionSort: 'desc',
      // limit: 10,
      // group: true
    };
    this.subcripcion = this._firestore.getDocumentsQueryChanges(path, q, extras).subscribe(res => {
      this.estudiantesAll = res;
      this.estudiantes = res;
      this.applyFilters();
      console.log('estudiantes', this.estudiantes);
    });
  }

  agregarEstudiante(estudiante: any) {
    console.log(estudiante);
    this.estudiantesSeleccionados.push(estudiante);
    console.log('this.estudiantesSeleccionados',this.estudiantesSeleccionados);
    this.estudiantes = this.estudiantes.filter(item => item.id !== estudiante.id);
    this.estudiantesAll = [...this.estudiantes];
    console.log('this.estudiantes',this.estudiantes);
  }

  removerEstudiante(estudiante: any) {
    this.estudiantesSeleccionados = this.estudiantesSeleccionados.filter(item => item.id !== estudiante.id);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
    console.log('searchText', this.searchText);
  }

  applyFilters() {
    let filtered = [...this.estudiantesAll];
    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase();
      filtered = filtered.filter(item => 
        item.nombreUsuario?.toLowerCase().includes(search) ||
        item.codigoEstudiante?.toLowerCase().includes(search)
      );
    }
    this.estudiantes = filtered;
  }

  ngOnDestroy(): void {
    if (this.subcripcion) {
      this.subcripcion.unsubscribe();
    }
  }
}
