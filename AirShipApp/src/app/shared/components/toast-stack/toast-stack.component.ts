import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { ToastItem, ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-stack',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-stack.component.html',
  styleUrl: './toast-stack.component.scss',
  animations: [
    trigger('toast', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(14px) scale(0.98)' }),
        animate(
          '300ms cubic-bezier(0.2, 0.9, 0.2, 1)',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' }),
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-out',
          style({ opacity: 0, transform: 'translateY(10px) scale(0.98)' }),
        ),
      ]),
    ]),
  ],
})
export class ToastStackComponent {
  constructor(readonly toast: ToastService) {}

  readonly trackToast = (_: number, item: ToastItem) => item.id;
}
