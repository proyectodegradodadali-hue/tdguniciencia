import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertaService } from '../../../services/alerta.service';
import { AuthenticacionService } from '../../../services/authenticacion.service';
import { FirestoreService } from '../../../services/firestore.service';
import { AlertaInformativoComponent } from "../../../shared/alerta-informativo/alerta-informativo.component";

@Component({
  selector: 'app-nuevo-docentes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertaInformativoComponent],
  templateUrl: './nuevo-docentes.component.html',
  styleUrl: './nuevo-docentes.component.css'
})
export class NuevoDocentesComponent {

  private _authcations = inject(AuthenticacionService);
  private _firestore = inject(FirestoreService);
  public _alerta = inject(AlertaService);


  // Signal para controlar la visibilidad del modal (igual que app-form1-sedes)
  mostrarModal = signal<boolean>(false);

  // Formulario reactivo
  agregarDocenteForm: FormGroup;

  // Modo del formulario y datos cuando es edición
  modo: 'crear' | 'editar';
  datosEdicion: any = null;

  // Obtiene el programId
  programIdForCreate: string = '';

  constructor(private fb: FormBuilder) {
    this.agregarDocenteForm = this.fb.group({
      nombreUsuario: ['', [Validators.required, Validators.maxLength(120)]],
      numeroIdentificacion: [null, [Validators.required, Validators.maxLength(80)]],
      correoInstitucional: ['', [Validators.required, Validators.maxLength(500)]],
      numeroCelular: ['', [Validators.required]],
      programa: ['', [Validators.required]],
      codigoEstudiante: ['', [Validators.required]],
      contraseña: ['', [Validators.required, Validators.minLength(8)]],
      tipoUsuario: ['Docente'],
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
    if (!this.agregarDocenteForm.valid) {
      this._alerta.showWarning('Por favor, completa el formulario correctamente.');
      this.markFormGroupTouched();
      return;
    }
    const path = `Docentes`;
    const raw = this.agregarDocenteForm.value;
    console.log(raw);

    try {
      if (this.modo === 'editar' && this.datosEdicion?.id) {
        await this._firestore.updateDocument(`${path}/${this.datosEdicion.id}`, raw);
        this._alerta.showSuccess('Docente actualizado exitosamente.');
      } else {
        // crear: adjunta metadatos mínimos
        // const nuevo = {
        //   ...payload,
        //   programId: this.programIdForCreate
        // };
        // registro de usuario Authentication firebase
        await this._authcations.registerWithEmail(this.agregarDocenteForm.value.correoInstitucional, this.agregarDocenteForm.value.contraseña,this.agregarDocenteForm.value.codigoEstudiante,this.agregarDocenteForm.value.programa);

        await this._firestore.createDocument(path, raw);
        this._alerta.showSuccess('Docente creado exitosamente.');
      }
      this.cerrarModal();
    } catch (error) {
      this._alerta.showError('Tu Conexión Internet Falló');
    }
    

      // obtener el uid del usuario recien creado
      //const uid = this._authcations.getCurrentUser().uid;
      // const codigoEstudiante = this._authcations.getCurrentUser().displayName;
      
      
      //console.log('raw', codigoEstudiante);
      // // Normaliza meta y valorReal a 0 si vienen vacíos
      // const payload = {
      //   ...raw,
      //   meta: (raw.meta === '' || raw.meta === null || raw.meta === undefined) ? 0 : Number(raw.meta),
      //   valorReal: (raw.comportamiento === 'Ascendente') ? (raw.valorReal === '' || raw.valorReal === null || raw.valorReal === undefined) ? 0 : Number(raw.valorReal) : (raw.valorReal === '' || raw.valorReal === null || raw.valorReal === undefined) ? 0 : Number(raw.meta),
      // };
      
      
    
  }

  // Cancelar
  handleCancel() {
    this.cerrarModal();
  }

  // Cargar datos al formulario cuando es edición
  private cargarDatos() {
    if (!this.datosEdicion) return;
    this.agregarDocenteForm.patchValue({
      nombreUsuario: this.datosEdicion.nombreUsuario ?? '',
      numeroIdentificacion: this.datosEdicion.numeroIdentificacion ?? null,
      correoInstitucional: this.datosEdicion.correoInstitucional ?? '',
      numeroCelular: this.datosEdicion.numeroCelular ?? '',
      programa: this.datosEdicion.programa ?? '',
      codigoEstudiante: this.datosEdicion.codigoEstudiante ?? '',
      contraseña: this.datosEdicion.contraseña ?? '',
    });
  }

  // Resetear formulario a estado inicial
  private resetForm() {
    this.agregarDocenteForm.reset();
    this.agregarDocenteForm.get('tipoUsuario')?.setValue('Docente');
  }

  // Helpers de validación
  private markFormGroupTouched(): void {
    Object.keys(this.agregarDocenteForm.controls).forEach(key => {
      const control = this.agregarDocenteForm.get(key);
      control?.markAsTouched();
    });
  }

  hasError(fieldName: string): boolean {
    const field = this.agregarDocenteForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.agregarDocenteForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['min']) return 'El valor debe ser mayor a 0';
      if (field.errors['maxlength']) return 'Longitud máxima superada';
      if (field.errors['minlength']) return 'Contraseña debe tener al menos 8 caracteres';
    }
    return '';
  }

}
