import { Injectable, signal } from '@angular/core';
import type { ElectionRole } from '../../lib/election/roles';

@Injectable({ providedIn: 'root' })
export class ActiveRoleService {
  private readonly roleState = signal<ElectionRole>('voter');

  readonly role = this.roleState.asReadonly();

  setRole(role: ElectionRole): void {
    this.roleState.set(role);
  }
}
