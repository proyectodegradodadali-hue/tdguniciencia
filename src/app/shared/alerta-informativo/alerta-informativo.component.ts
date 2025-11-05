import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, signal } from '@angular/core';

export type AlertType = 'success' | 'warning' | 'error';

@Component({
  selector: 'app-alerta-informativo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alerta-informativo.component.html',
  styleUrl: './alerta-informativo.component.css'
})
export class AlertaInformativoComponent implements OnInit {

  @Input() type: AlertType = 'success';
  @Input() message: string = '';
  
  visible = signal(false);
  showExit = signal(false);

  ngOnInit() {
    // Mostrar la alerta
    this.visible.set(true);

    // Iniciar animación de salida después de 5 segundos
    setTimeout(() => {
      this.showExit.set(true);
      // Remover el componente después de que termine la animación
      setTimeout(() => {
        this.visible.set(false);
      }, 700); // duración de la animación
    }, 5000);
  }

  getAlertClass(): string {
    const baseClasses = 'border';
    
    switch (this.type) {
      case 'success':
        return `${baseClasses} bg-green-100 text-green-800 border-green-200`;
      case 'warning':
        return `${baseClasses} bg-yellow-100 text-yellow-800 border-yellow-200`;
      case 'error':
        return `${baseClasses} bg-red-100 text-red-800 border-red-200`;
      default:
        return `${baseClasses} bg-green-100 text-green-800 border-green-200`;
    }
  }

  containerClasses(): string {
    const baseClasses = 'fixed top-5 right-5 min-w-[300px] z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 transition-all duration-700 ease-in-out';
    const animationClasses = this.showExit() 
      ? 'translate-x-full opacity-0' 
      : 'translate-x-0 opacity-100';
    
    return `${baseClasses} ${animationClasses}`;
  }

}
