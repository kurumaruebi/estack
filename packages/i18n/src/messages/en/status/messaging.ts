import { defineMessages } from "../../../message";

export const messages = defineMessages("status.messaging", {
  // Text that estack posts in a Slack conversation. Slack users read it. It names no agent: in
  // Slack, every answer comes from estack.
  "status.messaging.working": "Working on it…",
  // It names no product: WhatsApp posts it from the owner's own number, also in a group.
  "status.messaging.queued": "Waiting for an earlier request to finish. The answer comes here.",
  "status.messaging.busy": "Too many requests are waiting. Try again later.",
  "status.messaging.failed": "estack could not finish this request. The estack host has the details.",
  "status.messaging.noAnswer": "estack finished without a written answer.",
  "status.messaging.noAgent": "No agent can answer here yet. Add the Slack Orchestrator in estack.",
  "status.messaging.delegated": "A teammate is working on it. The answer comes here.",
  "status.messaging.stopped": "Stopped.",
  "status.messaging.stop": "Stop",
  "status.messaging.approvalTitle": "estack asks for approval to continue.",
  "status.messaging.approvalCommand": "Run a command",
  "status.messaging.approvalFileChange": "Change files",
  "status.messaging.approvalPermissions": "Get more permissions",
  "status.messaging.approve": "Approve",
  "status.messaging.deny": "Deny",
  "status.messaging.approvedBy": "Approved by {user}.",
  "status.messaging.deniedBy": "Denied by {user}.",
  "status.messaging.answeredOnHost": "Answered on the estack host.",
  "status.messaging.requestInactive": "This request is no longer active.",
  "status.messaging.onlyRequester": "Only {user} can do this. The estack host can also answer.",
  "status.messaging.hostOnly": "Only the estack host can answer this request.",
  "status.messaging.filesSkipped": "Some files were not sent: {names}.",
  // The name and title of the agent that estack adds to answer in Slack. The user can rename it.
  "status.messaging.orchestratorName": "Slack Orchestrator",
  "status.messaging.orchestratorTitle": "Answers in Slack and asks the team",
  // The same texts for Discord. Discord users read the first one.
  "status.messaging.discordNoAgent": "No agent can answer here yet. Add the Discord Orchestrator in estack.",
  "status.messaging.discordOrchestratorName": "Discord Orchestrator",
  "status.messaging.discordOrchestratorTitle": "Answers in Discord and asks the team",
  // The sidebar section that estack puts the Slack Orchestrator in. The user can rename it.
  "status.messaging.integrationsSection": "Integrations",
  // The page a development Slack install ends on.
  "status.messaging.signInReceived": "estack received the Slack install. You can close this tab.",
  "status.messaging.signInUnknown": "estack did not start this Slack install. Start it again in estack.",
  // Text that estack posts in a Telegram chat, and the Telegram Orchestrator agent. Telegram users
  // read the posts. The user can rename the agent.
  "status.messaging.telegramNoAgent": "No agent can answer here yet. Add the Telegram Orchestrator in estack.",
  "status.messaging.telegramLinked":
    "estack is connected to this chat. Mention {bot} or reply to a message of estack to ask the agents.",
  "status.messaging.telegramOrchestratorName": "Telegram Orchestrator",
  "status.messaging.telegramOrchestratorTitle": "Answers in Telegram and asks the team",
  // Text that estack posts from a linked WhatsApp number, and the WhatsApp Orchestrator agent.
  // WhatsApp users read the posts. Personal WhatsApp has no buttons, so a person answers with a number.
  "status.messaging.whatsappNoAgent": "No agent can answer here yet. Add the WhatsApp Orchestrator in estack.",
  "status.messaging.whatsappApprovalMenu": "Reply 1 to approve or 2 to deny.",
  "status.messaging.whatsappStopMenu": "Reply stop to stop.",
  "status.messaging.whatsappPairingCode":
    "This number answers only people that its owner allowed. Give the owner this code: {code}",
  "status.messaging.whatsappPairingApproved": "You can now send requests to this number.",
  "status.messaging.whatsappOwnChat": "Message yourself",
  // The first message after a link, in the linked number's own "Message yourself" chat.
  "status.messaging.whatsappWelcomeOwn":
    "👋 *estack is connected*\n\nWrite here to ask your agents. The WhatsApp Orchestrator answers, or gives the work to the right agent.\n\nSend *stop* to stop a request.",
  "status.messaging.whatsappWelcomeDedicated":
    "👋 *estack is connected*\n\nThe people you allow in estack can now write to this number. A new person gets a code: approve it in estack under Requests.\n\nSend *stop* to stop a request.",
  // Notices in the owner's own chat when another estack is linked to the same number, or when the
  // chat gets requests too fast, as two Estacks that answer each other do.
  "status.messaging.whatsappOtherEstack":
    "Another estack is linked to this WhatsApp number, so you can get two answers. To fix this, open Linked devices in WhatsApp on your phone and log out the estack that you do not use.",
  "status.messaging.whatsappPaused":
    "estack stopped answering here for 10 minutes: too many messages came in a short time. If another estack is linked to this number, open Linked devices in WhatsApp on your phone and log out the estack that you do not use.",
  "status.messaging.whatsappOrchestratorName": "WhatsApp Orchestrator",
  "status.messaging.whatsappOrchestratorTitle": "Answers in WhatsApp and asks the team",
});
