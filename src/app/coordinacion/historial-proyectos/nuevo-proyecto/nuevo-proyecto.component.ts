import { Component, inject, signal, SimpleChanges } from '@angular/core';
import { AuthenticacionService } from '../../../services/authenticacion.service';
import { FirestoreService } from '../../../services/firestore.service';
import { AlertaService } from '../../../services/alerta.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AlertaInformativoComponent } from '../../../shared/alerta-informativo/alerta-informativo.component';

@Component({
  selector: 'app-nuevo-proyecto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertaInformativoComponent],
  templateUrl: './nuevo-proyecto.component.html',
  styleUrl: './nuevo-proyecto.component.css'
})
export class NuevoProyectoComponent {


  private _authcations = inject(AuthenticacionService);
  private _firestore = inject(FirestoreService);
  public _alerta = inject(AlertaService);


  // Signal para controlar la visibilidad del modal (igual que app-form1-sedes)
  mostrarModal = signal<boolean>(false);

  // Formulario reactivo
  agregarProyectoForm: FormGroup;

  // Modo del formulario y datos cuando es edición
  modo: 'crear' | 'editar';
  datosEdicion: any = null;

  // Obtiene el programId
  programIdForCreate: string = '';

  constructor(private fb: FormBuilder) {
    this.agregarProyectoForm = this.fb.group({
      nombreProyecto: ['', [Validators.required, Validators.maxLength(120)]],
      codigoProyecto: [null, [Validators.required, Validators.maxLength(80)]],
      codigoEstudiantes: [[]],
      estudiantes: [[]],
      codigoDirectorTematico: [null],
      directorTematico: [null],
      codigoDirectorMetodologico: [null],
      directorMetodologico: [null],
      ano: [null],
      estadoProyecto: ['En Progreso'],
      porcentaje: [1],
      documentos: [null],
      fechaInicio: [null, [Validators.required]],
      fechaFin: [null, [Validators.required]],
      prorogas: [null],
      programa: ['', [Validators.required]],
    });
    
  }

  // Abrir modal. Permite pasar datos cuando es edición o contexto cuando es creación
  abrirModal(modo: any, datos: any) {
    this.mostrarModal.set(true);
    this.modo = modo;
    if (modo === 'editar' && datos) {
      this.datosEdicion = datos;
      this.cargarDatos();
    } else if (modo === 'crear') {
      // modo crear
      this.datosEdicion = null;
      this.resetForm();
    }
  }

  // Cerrar modal
  cerrarModal() {
    this.resetForm();
    this.mostrarModal.set(false);
  }

  // Guardar cambios (crear o editar)
  async handleSave() {
    if (!this.agregarProyectoForm.valid) {
      this._alerta.showWarning('Por favor, completa el formulario correctamente.');
      this.markFormGroupTouched();
      return;
    }
    const path = `Proyectos`;
    const raw = this.agregarProyectoForm.value;
    console.log(raw);

    try {
      if (this.modo === 'editar' && this.datosEdicion?.id) {
        await this._firestore.updateDocument(`${path}/${this.datosEdicion.id}`, raw);
        this._alerta.showSuccess('Proyecto actualizado exitosamente.');
      } else {
        // crear: adjunta metadatos mínimos
        // const nuevo = {
        //   ...payload,
        //   programId: this.programIdForCreate
        // };
        await this._firestore.createDocument(path, raw);
        this._alerta.showSuccess('Proyecto creado exitosamente.');
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

  // Cargar datos al formulario cuando es edición
  private cargarDatos() {
    if (!this.datosEdicion) return;
    this.agregarProyectoForm.patchValue({
      nombreProyecto: this.datosEdicion.nombreProyecto ?? '',
      codigoProyecto: this.datosEdicion.codigoProyecto ?? null,
      codigoEstudiantes: this.datosEdicion.codigoEstudiantes ?? null,
      estudiantes: this.datosEdicion.estudiantes ?? null,
      codigoDirectorTematico: this.datosEdicion.codigoDirectorTematico ?? null,
      directorTematico: this.datosEdicion.directorTematico ?? null,
      codigoDirectorMetodologico: this.datosEdicion.codigoDirectorMetodologico ?? null,
      directorMetodologico: this.datosEdicion.directorMetodologico ?? null,
      ano: this.datosEdicion.ano ?? null,
      estadoProyecto: this.datosEdicion.estadoProyecto ?? 'En Progreso',
      porcentaje: this.datosEdicion.porcentaje ?? 1,
      documentos: this.datosEdicion.documentos ?? null,
      fechaInicio: this.datosEdicion.fechaInicio ?? null,
      fechaFin: this.datosEdicion.fechaFin ?? null,
      prorogas: this.datosEdicion.prorogas ?? null,
      programa: this.datosEdicion.programa ?? '',
    });
  }

  // Resetear formulario a estado inicial
  private resetForm() {
    this.agregarProyectoForm.reset();
    this.agregarProyectoForm.get('estadoProyecto')?.setValue('En Progreso');
    this.agregarProyectoForm.get('ano')?.setValue(new Date(Date.now()).getFullYear());
    this.agregarProyectoForm.get('codigoEstudiantes')?.setValue([]);
    this.agregarProyectoForm.get('estudiantes')?.setValue([]);
    this.agregarProyectoForm.get('porcentaje')?.setValue(1);
  }

  // Helpers de validación
  private markFormGroupTouched(): void {
    Object.keys(this.agregarProyectoForm.controls).forEach(key => {
      const control = this.agregarProyectoForm.get(key);
      control?.markAsTouched();
    });
  }

  hasError(fieldName: string): boolean {
    const field = this.agregarProyectoForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.agregarProyectoForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['min']) return 'El valor debe ser mayor a 0';
      if (field.errors['maxlength']) return 'Longitud máxima superada';
    }
    return '';
  }

  
}
