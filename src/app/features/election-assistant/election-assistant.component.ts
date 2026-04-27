import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslocoPipe } from '@ngneat/transloco';
import { CloudFunctionsService, type AssistantAskResponse } from '../../services/cloud-functions.service';

@Component({
  standalone: true,
  selector: 'app-election-assistant',
  imports: [TranslocoPipe],
  templateUrl: './election-assistant.component.html',
  styleUrl: './election-assistant.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ElectionAssistantComponent {
  private readonly fn = inject(CloudFunctionsService);

  protected readonly prompt = signal('');
  protected readonly loading = signal(false);
  protected readonly errorKey = signal<string | null>(null);
  protected readonly result = signal<AssistantAskResponse | null>(null);

  protected readonly canUse = this.fn.isConfigured;

  onPromptInput(ev: Event): void {
    const v = (ev.target as HTMLTextAreaElement).value;
    this.prompt.set(v);
  }

  submit(): void {
    const p = this.prompt().trim();
    if (p.length === 0 || !this.fn.isConfigured) {
      return;
    }
    this.loading.set(true);
    this.errorKey.set(null);
    this.result.set(null);
    this.fn
      .assistantAsk(p)
      .then((r) => {
        this.result.set(r);
      })
      .catch(() => {
        this.errorKey.set('assistant.errorGeneric');
      })
      .finally(() => {
        this.loading.set(false);
      });
  }
}
