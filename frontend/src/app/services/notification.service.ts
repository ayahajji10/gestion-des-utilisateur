import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private messagesSubject = new BehaviorSubject<ToastMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  show(type: 'success' | 'error' | 'warning' | 'info', message: string, title?: string, durationMs = 5000): void {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, type, title, message };
    const current = this.messagesSubject.getValue();
    this.messagesSubject.next([...current, newToast]);

    if (durationMs > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, durationMs);
    }
  }

  success(message: string, title = 'Succès'): void {
    this.show('success', message, title);
  }

  error(message: string, title = 'Erreur'): void {
    this.show('error', message, title, 7000);
  }

  warning(message: string, title = 'Attention'): void {
    this.show('warning', message, title);
  }

  info(message: string, title = 'Information'): void {
    this.show('info', message, title);
  }

  dismiss(id: string): void {
    const current = this.messagesSubject.getValue();
    this.messagesSubject.next(current.filter(m => m.id !== id));
  }
}
