import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TranslocoTestingModule } from '@ngneat/transloco';
import { ElectionAssistantComponent } from './election-assistant.component';
import { CloudFunctionsService } from '../../services/cloud-functions.service';
import { AnalyticsEventsService } from '../../services/analytics-events.service';
import en from '../../../assets/i18n/en.json';
import hi from '../../../assets/i18n/hi.json';

type AssistantHarness = {
  onPromptInput(ev: Event): void;
  submit(): void;
  useSuggestion(key: string): void;
  prompt: () => string;
  result: () => { readonly reply: string; readonly citations: readonly string[] } | null;
};

describe('ElectionAssistantComponent', () => {
  let fixture: ComponentFixture<ElectionAssistantComponent>;
  let assistantAsk: jasmine.Spy;

  beforeEach(async (): Promise<void> => {
    assistantAsk = jasmine.createSpy('assistantAsk').and.resolveTo({
      reply: 'Educational reply.',
      citations: ['https://www.eci.gov.in/'],
    });
    await TestBed.configureTestingModule({
      imports: [
        ElectionAssistantComponent,
        TranslocoTestingModule.forRoot({
          langs: { en, hi },
          translocoConfig: { availableLangs: ['en', 'hi'], defaultLang: 'en' },
        }),
      ],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        {
          provide: CloudFunctionsService,
          useValue: {
            isConfigured: true,
            assistantAsk,
          },
        },
        {
          provide: AnalyticsEventsService,
          useValue: { logAssistantQuestionAsked: (): void => undefined },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ElectionAssistantComponent);
    fixture.detectChanges();
  });

  it('creates', (): void => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('submit calls assistantAsk when prompt valid', async (): Promise<void> => {
    const cmp = fixture.componentInstance as unknown as AssistantHarness;
    cmp.onPromptInput({
      target: { value: 'What is NOTA?' },
    } as unknown as Event);
    fixture.detectChanges();
    cmp.submit();
    fixture.detectChanges();
    expect(assistantAsk).toHaveBeenCalled();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(cmp.result()?.reply).toContain('Educational');
  });

  it('useSuggestion fills prompt', (): void => {
    const cmp = fixture.componentInstance as unknown as AssistantHarness;
    cmp.useSuggestion('assistant.suggestions.nota');
    expect(cmp.prompt().length).toBeGreaterThan(0);
  });
});
