import { RealtimeItem, tool } from '@openai/agents/realtime';


import {
  studentProfile,
  lessonHistory,
  quizHistory,
  progressSummary,
} from './sampleData';

export const supervisorAgentInstructions = `You are an expert English teacher and pedagogy supervisor. You guide a junior tutor agent in real time. You receive tools, response instructions, and the full conversation history. Produce a concise, spoken-friendly next message for the tutor to read verbatim.

# Instructions
- You can provide an answer directly, or call a tool first and then answer the question
- If you need to call a tool, but don't have the right information, you can tell the junior agent to ask for that information in your message
- Your message will be read verbatim by the junior agent, so feel free to use it like you would talk directly to the user
  
==== Domain-Specific Agent Instructions ====
You are a helpful English tutor for a product called Englify. Your goal is to maximize effective English practice while keeping content safe and age-appropriate.

# Instructions
- Keep responses short, simple, and encouraging. Favor A2–B1 language unless the learner specifies another level.
- Use tools to craft exercises, explanations, and micro-assessments rather than writing long content from scratch.
- If the learner goes off-topic or requests non-educational content, gently redirect to English practice.
- Avoid prohibited topics (adult content, hate, violence, self-harm, explicit politics, medical/legal/financial advice). If asked, refuse and suggest a safe learning activity instead.
- Vary phrasing to avoid repetition across turns.

# Response Instructions
- Spoken-friendly, concise sentences. No bullet lists.
- Provide at most one correction or instruction per turn unless the learner asks for more.
- If tool parameters are missing (e.g., level, topic), ask the learner to provide them. Never call a tool with placeholders or empty strings.
- If a request is unsafe or off-topic, refuse briefly and redirect to a safe exercise.

# Sample Phrases
## Deflecting a Prohibited or Off-Topic Request
- "Let’s keep our focus on practicing English. Would you like a short exercise on your favorite topic?"
- "I can’t help with that, but I can give you a quick English practice activity instead."

## If required information is missing
- "Which level do you prefer: A2, B1, or B2?"
- "What topic would you like: travel, food, work, or daily routine?"

# User Message Format
- Always include your final response for the tutor to read aloud.
- Keep it short, spoken-friendly, and focused on English practice.

# Example (tool call)
- User: Can we practice ordering food at B1?
- Supervisor Assistant: generatePracticePrompt(level="B1", topic="food")
- generatePracticePrompt(): {
  prompt: "You are at a cafe. Order a sandwich and a drink. The server asks follow-up questions."
}
- Supervisor Assistant:
# Message
Great—let’s role-play. You’re at a cafe. Please order a sandwich and a drink. I’ll be the server and ask a question after your first sentence.

# Example (Refusal and Redirect)
- User: Tell me a dirty joke.
- Supervisor Assistant:
# Message
I can’t help with that, but I can offer a short speaking task instead. Want a quick role-play about travel plans?
`;

export const supervisorAgentTools = [
  {
    type: "function",
    name: "generatePracticePrompt",
    description: "Create a short practice question or task at a given CEFR level and topic.",
    parameters: {
      type: "object",
      properties: {
        level: {
          type: "string",
          enum: ["A1", "A2", "B1", "B2", "C1"],
          description: "Learner level",
        },
        topic: {
          type: "string",
          description: "Conversation topic (e.g., travel, food, work, daily routine)",
        },
        target: {
          type: "string",
          description: "Optional focus, e.g., past simple, conditionals, phrasal verbs",
        },
      },
      required: ["level", "topic"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "explainMistake",
    description: "Explain a learner error concisely and provide a corrected example.",
    parameters: {
      type: "object",
      properties: {
        sentence: {
          type: "string",
          description: "Learner’s sentence",
        },
        focus: {
          type: "string",
          description: "Optional grammar/vocab focus",
        },
      },
      required: ["sentence"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "miniQuiz",
    description: "Generate a 2–3 item micro-quiz for quick assessment.",
    parameters: {
      type: "object",
      properties: {
        level: {
          type: "string",
          enum: ["A1", "A2", "B1", "B2", "C1"],
        },
        topic: {
          type: "string",
        },
      },
      required: ["level", "topic"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "getStudentProfile",
    description: "Fetch the current learner profile, including level, streak, and preferences.",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "getLessonHistory",
    description: "Return a short list of recent lessons with topics and notes.",
    parameters: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Max number of lessons to return (default 5)",
        },
      },
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "getQuizHistory",
    description: "Return recent quiz results for the learner.",
    parameters: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Max number of quizzes to return (default 5)",
        },
      },
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "getProgressSummary",
    description: "High-level progress summary for the current learner.",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
];

async function fetchResponsesMessage(body: any) {
  const response = await fetch('/api/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // Preserve the previous behaviour of forcing sequential tool calls.
    body: JSON.stringify({ ...body, parallel_tool_calls: false }),
  });

  if (!response.ok) {
    console.warn('Server returned an error:', response);
    return { error: 'Something went wrong.' };
  }

  const completion = await response.json();
  return completion;
}

function getToolResponse(fName: string) {
  switch (fName) {
    case "generatePracticePrompt":
      return { prompt: "You are at a cafe. Order a sandwich and a drink." };
    case "explainMistake":
      return { explanation: "Use 'bought' (past of buy), not 'buyed'.", example: "I bought ice cream yesterday." };
    case "miniQuiz":
      return { items: [
        { q: "Say one sentence about your last holiday.", type: "speaking" },
        { q: "Choose: go/went: 'I ___ to Paris last year.'", a: "went" },
      ] };
    case "getStudentProfile":
      return studentProfile;
    case "getLessonHistory":
      return lessonHistory;
    case "getQuizHistory":
      return quizHistory;
    case "getProgressSummary":
      return progressSummary;
    default:
      return { result: true };
  }
}

/**
 * Iteratively handles function calls returned by the Responses API until the
 * supervisor produces a final textual answer. Returns that answer as a string.
 */
async function handleToolCalls(
  body: any,
  response: any,
  addBreadcrumb?: (title: string, data?: any) => void,
) {
  let currentResponse = response;

  while (true) {
    if (currentResponse?.error) {
      return { error: 'Something went wrong.' } as any;
    }

    const outputItems: any[] = currentResponse.output ?? [];

    // Gather all function calls in the output.
    const functionCalls = outputItems.filter((item) => item.type === 'function_call');

    if (functionCalls.length === 0) {
      // No more function calls – build and return the assistant's final message.
      const assistantMessages = outputItems.filter((item) => item.type === 'message');

      const finalText = assistantMessages
        .map((msg: any) => {
          const contentArr = msg.content ?? [];
          return contentArr
            .filter((c: any) => c.type === 'output_text')
            .map((c: any) => c.text)
            .join('');
        })
        .join('\n');

      return finalText;
    }

    // For each function call returned by the supervisor model, execute it locally and append its
    // output to the request body as a `function_call_output` item.
    for (const toolCall of functionCalls) {
      const fName = toolCall.name;
      const args = JSON.parse(toolCall.arguments || '{}');
      const toolRes = getToolResponse(fName);

      // Since we're using a local function, we don't need to add our own breadcrumbs
      if (addBreadcrumb) {
        addBreadcrumb(`[supervisorAgent] function call: ${fName}`, args);
      }
      if (addBreadcrumb) {
        addBreadcrumb(`[supervisorAgent] function call result: ${fName}`, toolRes);
      }

      // Add function call and result to the request body to send back to realtime
      body.input.push(
        {
          type: 'function_call',
          call_id: toolCall.call_id,
          name: toolCall.name,
          arguments: toolCall.arguments,
        },
        {
          type: 'function_call_output',
          call_id: toolCall.call_id,
          output: JSON.stringify(toolRes),
        },
      );
    }

    // Make the follow-up request including the tool outputs.
    currentResponse = await fetchResponsesMessage(body);
  }
}

export const getNextResponseFromSupervisor = tool({
  name: 'getNextResponseFromSupervisor',
  description:
    'Determines the next response whenever the agent faces a non-trivial decision, produced by a highly intelligent supervisor agent. Returns a message describing what to do next.',
  parameters: {
    type: 'object',
    properties: {
      relevantContextFromLastUserMessage: {
        type: 'string',
        description:
          'Key information from the user described in their most recent message. This is critical to provide as the supervisor agent with full context as the last message might not be available. Okay to omit if the user message didn\'t add any new information.',
      },
    },
    required: ['relevantContextFromLastUserMessage'],
    additionalProperties: false,
  },
  execute: async (input, details) => {
    const { relevantContextFromLastUserMessage } = input as {
      relevantContextFromLastUserMessage: string;
    };

    const addBreadcrumb = (details?.context as any)?.addTranscriptBreadcrumb as
      | ((title: string, data?: any) => void)
      | undefined;

    const history: RealtimeItem[] = (details?.context as any)?.history ?? [];
    const filteredLogs = history.filter((log) => log.type === 'message');

    const body: any = {
      model: 'gpt-4.1',
      input: [
        {
          type: 'message',
          role: 'system',
          content: supervisorAgentInstructions,
        },
        {
          type: 'message',
          role: 'user',
          content: `==== Conversation History ====
          ${JSON.stringify(filteredLogs, null, 2)}
          
          ==== Relevant Context From Last User Message ===
          ${relevantContextFromLastUserMessage}
          `,
        },
      ],
      tools: supervisorAgentTools,
    };

    const response = await fetchResponsesMessage(body);
    if (response.error) {
      return { error: 'Something went wrong.' };
    }

    const finalText = await handleToolCalls(body, response, addBreadcrumb);
    if ((finalText as any)?.error) {
      return { error: 'Something went wrong.' };
    }

    return { nextResponse: finalText as string };
  },
});
  