import type { ProjectStatus } from '@prisma/client';

export function apiStatusToDb(status: 'launching' | 'under-construction' | 'ready'): ProjectStatus {
  if (status === 'under-construction') return 'under_construction';
  return status;
}

export function dbStatusToApi(status: ProjectStatus): 'launching' | 'under-construction' | 'ready' {
  if (status === 'under_construction') return 'under-construction';
  return status;
}
