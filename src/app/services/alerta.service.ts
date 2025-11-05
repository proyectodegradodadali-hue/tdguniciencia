import { Injectable } from '@angular/core';

export type AlertType = 'success' | 'warning' | 'error';

@Injectable({
  providedIn: 'root'
})
export class AlertaService {

  showAlert = false;
  alertType: AlertType = 'success';
  alertMessage = '';

  showSuccess(message: string) {
    this.alertType = 'success';
    this.alertMessage = message;
    this.showAlert = true;
    this.resetAlert();
  }

  showWarning(message: string) {
    this.alertType = 'warning';
    this.alertMessage = message;
    this.showAlert = true;
    this.resetAlert();
  }

  showError(message: string) {
    this.alertType = 'error';
    this.alertMessage = message;
    this.showAlert = true;
    this.resetAlert();
  }

  private resetAlert() {
    setTimeout(() => {
      this.showAlert = false;
    }, 5500);
  }
}
