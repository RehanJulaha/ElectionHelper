import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';
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
  private static readonly MAX_PROMPT_CHARS = 2000;

  private readonly fn = inject(CloudFunctionsService);
  private readonly transloco = inject(TranslocoService);

  protected readonly prompt = signal('');
  protected readonly loading = signal(false);
  protected readonly errorKey = signal<string | null>(null);
  protected readonly result = signal<AssistantAskResponse | null>(null);

  protected readonly canUse = this.fn.isConfigured;
  protected readonly maxPromptChars = ElectionAssistantComponent.MAX_PROMPT_CHARS;
  protected readonly promptLength = computed(() => this.prompt().trim().length);
  protected readonly canSubmit = computed(
    () => this.canUse && !this.loading() && this.promptLength() > 0 && this.promptLength() <= this.maxPromptChars
  );
  protected readonly suggestedPrompts = [
    'assistant.suggestions.pollingDay',
    'assistant.suggestions.nota',
    'assistant.suggestions.returningOfficer',
    'assistant.suggestions.counting',
  ] as const;

  onPromptInput(ev: Event): void {
    const v = (ev.target as HTMLTextAreaElement).value;
    this.prompt.set(v.slice(0, this.maxPromptChars));
  }

  useSuggestion(key: string): void {
    const text = this.transloco.translate(key);
    this.prompt.set(text.slice(0, this.maxPromptChars));
    this.errorKey.set(null);
  }

  submit(): void {
    const p = this.prompt().trim();
    if (p.length === 0 || !this.fn.isConfigured || p.length > this.maxPromptChars) {
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
