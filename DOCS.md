# Englify AI Agent

Our task is to built Englify AI Agent.

We're using OpenAI's Realtime SDK to build the Realtime AI Agents.
Agents are very comprehensive and complex. They can call tools, call other agents, and more.
Here's a [link to the docs](https://github.com/openai/openai-realtime-agents/) and [link to the agents sdk](https://github.com/openai/openai-agents-js).

I saw that we have src/app/agentConfigs/guardrails.ts file. This AI validates the realtime output according to moderation policies. 

Scope completed: The codebase now focuses on an English tutor. The `chatSupervisor` agent acts as a junior tutor with a supervisor generating prompts, explanations, and mini-quizzes. Guardrails classify INAPPROPRIATE, OFF_TOPIC, NON_ENGLISH, or NONE.