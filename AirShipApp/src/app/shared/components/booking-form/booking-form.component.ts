import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './booking-form.component.html',
  styleUrl: './booking-form.component.scss',
})
export class BookingFormComponent {
  readonly form = this.fb.group({
    name: [''],
    phone: [''],
    note: [''],
  });

  constructor(private readonly fb: FormBuilder) {}
}
