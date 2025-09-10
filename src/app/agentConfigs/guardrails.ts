import { zodTextFormat } from 'openai/helpers/zod';
import { GuardrailOutputZod, GuardrailOutput } from '@/app/types';
import { createApiHeaders } from '@/app/lib/apiRequest';

// Validator that calls the /api/responses endpoint to
// validates the realtime output according to moderation policies. 
// This will prevent the realtime model from responding in undesired ways
// By sending it a corrective message and having it redirect the conversation.
export async function runGuardrailClassifier(
  message: string,
  companyName: string = 'Englify',
): Promise<GuardrailOutput> {
  const messages = [
    {
      role: 'user',
      content: `Classify text by moderation policy. Output only the category and one-word reason.

      <info>
      - Application: ${companyName}
      - Context: English language learning assistant (teacher). The assistant should keep students focused on practicing English politely and safely.
      </info>

      <message>
      ${message}
      </message>

      <output_classes>
      - INAPPROPRIATE: Profanity, sexual content, hate speech, threats, harassment, self-harm, or any unsafe content not suitable for students.
      - OFF_TOPIC: Discussion that derails from English practice, e.g., tech support, politics, personal gossip, product promotions, or unrelated chit-chat.
      - NON_ENGLISH: Predominantly non-English text when the task is to practice English (allow occasional non-English words for translation exercises).
      - NONE: If none of the above apply.
      </output_classes>
      `,
    },
  ];

  const response = await fetch('/api/responses', {
    method: 'POST',
    headers: createApiHeaders(),
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      input: messages,
      text: {
        format: zodTextFormat(GuardrailOutputZod, 'output_format'),
      },
    }),
  });

  if (!response.ok) {
    console.warn('Server returned an error:', response);
    return Promise.reject('Error with runGuardrailClassifier.');
  }

  const data = await response.json();

  try {
    const output = GuardrailOutputZod.parse(data.output_parsed);
    return {
      ...output,
      testText: message,
    };
  } catch (error) {
    console.error('Error parsing the message content as GuardrailOutput:', error);
    return Promise.reject('Failed to parse guardrail output.');
  }
}

export interface RealtimeOutputGuardrailResult {
  tripwireTriggered: boolean;
  outputInfo: any;
}

export interface RealtimeOutputGuardrailArgs {
  agentOutput: string;
  agent?: any;
  context?: any;
}

// Creates a guardrail bound to a specific company name for output moderation purposes. 
export function createModerationGuardrail(companyName: string) {
  return {
    name: 'moderation_guardrail',

    async execute({ agentOutput }: RealtimeOutputGuardrailArgs): Promise<RealtimeOutputGuardrailResult> {
      try {
        const res = await runGuardrailClassifier(agentOutput, companyName);
        const triggered = res.moderationCategory !== 'NONE';
        return {
          tripwireTriggered: triggered,
          outputInfo: res,
        };
      } catch {
        return {
          tripwireTriggered: false,
          outputInfo: { error: 'guardrail_failed' },
        };
      }
    },
  } as const;
}