import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, ToastMessage } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" *ngIf="(messages$ | async) as messages">
      <div
        *ngFor="let toast of messages"
        class="toast-item"
        [ngClass]="'toast-' + toast.type"
      >
        <div class="toast-icon">
          <span *ngIf="toast.type === 'success'">✓</span>
          <span *ngIf="toast.type === 'error'">✕</span>
          <span *ngIf="toast.type === 'warning'">⚠</span>
          <span *ngIf="toast.type === 'info'">ℹ</span>
        </div>
        <div class="toast-content">
          <div class="toast-title" *ngIf="toast.title">{{ toast.title }}</div>
          <div class="toast-body">{{ toast.message }}</div>
        </div>
        <button class="toast-close" (click)="dismiss(toast.id)" aria-label="Fermer">×</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 420px;
      width: calc(100% - 48px);
      pointer-events: none;
    }
    .toast-item {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 18px;
      border-radius: 10px;
      background: #ffffff;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      border-left: 5px solid;
      animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .toast-success { border-color: #10b981; }
    .toast-success .toast-icon { background: #d1fae5; color: #065f46; }

    .toast-error { border-color: #ef4444; }
    .toast-error .toast-icon { background: #fee2e2; color: #991b1b; }

    .toast-warning { border-color: #f59e0b; }
    .toast-warning .toast-icon { background: #fef3c7; color: #92400e; }

    .toast-info { border-color: #3b82f6; }
    .toast-info .toast-icon { background: #dbeafe; color: #1e40af; }

    .toast-icon {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      flex-shrink: 0;
    }
    .toast-content {
      flex: 1;
    }
    .toast-title {
      font-weight: 600;
      font-size: 14px;
      color: #1e293b;
      margin-bottom: 2px;
    }
    .toast-body {
      font-size: 13px;
      color: #475569;
      line-height: 1.4;
    }
    .toast-close {
      background: transparent;
      border: none;
      font-size: 20px;
      line-height: 1;
      color: #94a3b8;
      cursor: pointer;
      padding: 0 4px;
      transition: color 0.15s;
    }
    .toast-close:hover {
      color: #1e293b;
    }
  `]
})
export class NotificationComponent {
  private notificationService = inject(NotificationService);
  messages$ = this.notificationService.messages$;

  dismiss(id: string): void {
    this.notificationService.dismiss(id);
  }
}
