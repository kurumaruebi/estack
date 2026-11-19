// Slug to guide body, on the same terms as the news bodies: eager, so the prose
// is in the server's HTML rather than arriving after hydration.

import type { ArticleBody } from "../body";
import { AgenticAIDefinition } from "./agentic-ai-definition";
import { AIAgentWorkflow } from "./ai-agent-workflow";
import { AIAgentsExamples } from "./ai-agents-examples";
import { AIAgentsVsAgenticAI } from "./ai-agents-vs-agentic-ai";
import { AITeammatesVsAIChatbots } from "./ai-teammates-vs-ai-chatbots";
import { AIWorkspaceVsChat } from "./ai-workspace-vs-chat";
import { Estack101 } from "./estack-101";
import { EstackHostedServers } from "./estack-hosted-servers";
import { EstackMarketplace } from "./estack-marketplace";
import { ImportGrokBotAgents } from "./import-grok-bot-agents";
import { ImportHermesAgents } from "./import-hermes-agents";
import { InstallEstackVPS } from "./install-estack-vps";
import { WhatAreAIAgents } from "./what-are-ai-agents";
import { WtfIsEstack } from "./wtf-is-estack";

export const GUIDE_BODIES: Readonly<Record<string, ArticleBody>> = {
  "ai-agent-workflow": AIAgentWorkflow,
  "ai-teammates-vs-ai-chatbots": AITeammatesVsAIChatbots,
  "ai-workspace-vs-chat": AIWorkspaceVsChat,
  "install-estack-vps": InstallEstackVPS,
  "import-hermes-agents": ImportHermesAgents,
  "import-grok-bot-agents": ImportGrokBotAgents,
  "ai-agents-examples": AIAgentsExamples,
  "ai-agents-vs-agentic-ai": AIAgentsVsAgenticAI,
  "agentic-ai-definition": AgenticAIDefinition,
  "what-are-ai-agents": WhatAreAIAgents,
  "estack-101": Estack101,
  "estack-hosted-servers": EstackHostedServers,
  "estack-marketplace": EstackMarketplace,
  "wtf-is-estack": WtfIsEstack,
};
