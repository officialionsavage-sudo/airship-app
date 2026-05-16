import { Pipe, PipeTransform } from '@angular/core';
import { formatAdminDate, formatAdminDateTime } from '../../core/admin-datetime';

@Pipe({ name: 'adminDateTime', standalone: true })
export class AdminDateTimePipe implements PipeTransform {
  transform(value: string | number | Date | null | undefined, placeholder = '—'): string {
    return formatAdminDateTime(value, placeholder);
  }
}

@Pipe({ name: 'adminDate', standalone: true })
export class AdminDatePipe implements PipeTransform {
  transform(value: string | null | undefined, placeholder = '—'): string {
    return formatAdminDate(value, placeholder);
  }
}
