import { Component, inject, signal } from '@angular/core';
import { AuthenticacionService } from '../../../services/authenticacion.service';
import { FirestoreService } from '../../../services/firestore.service';
import { AlertaService } from '../../../services/alerta.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-eliminar-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './eliminar-usuarios.component.html',
  styleUrl: './eliminar-usuarios.component.css'
})
export class EliminarUsuariosComponent {

  private _authcations = inject(AuthenticacionService);
  private _firestore = inject(FirestoreService);
  public _alerta = inject (AlertaService);

  elminarDoc:any;

  // Signal para controlar la visibilidad del modal
  mostrarModal = signal<boolean>(false);

  async handleSave() {
    //console.log('ID del documento a eliminar----->>>',this.elminarDoc.id);
    //const nit = this._authcations.getCurrentUser().displayName;
    try {
      await this._firestore.updateDocument(`Estudiantes/${this.elminarDoc.id}`, {estado: 'NoActivo'});
      this._alerta.showSuccess('Registro eliminado exitosamente.');
      this.cerrarModal(); // Cerrar el modal después de guardar
    } catch (error) {
      this._alerta.showError('No se elimino el registro. Conexión Internet Fallo');
    }
  }

  // Método para manejar el clic en "Cancelar"
  handleCancel() {
    this.cerrarModal();
  }
  
  // Método para cerrar el modal
  cerrarModal() {
    this.mostrarModal.set(false);
  }

  // Método para abrir el modal
  abrirModal(idDocumento:any) { // crear o editar
    //console.log('Abril el modal Eliminar----->>>',idDocumento)
    this.elminarDoc = idDocumento;
    this.mostrarModal.set(true);
  }

}
