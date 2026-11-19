import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/status/messaging";

export const messages = {
  "status.messaging.working": "Trabajando en ello…",
  "status.messaging.queued": "En espera hasta que termine una solicitud anterior. La respuesta llegará aquí.",
  "status.messaging.busy": "Hay demasiadas solicitudes en espera. Inténtalo más tarde.",
  "status.messaging.failed": "estack no pudo completar esta solicitud. El host de estack tiene los detalles.",
  "status.messaging.noAnswer": "estack terminó sin una respuesta escrita.",
  "status.messaging.noAgent": "Aún no puede responder ningún agente aquí. Añade el Orquestador de Slack en estack.",
  "status.messaging.delegated": "Un compañero está trabajando en ello. La respuesta llegará aquí.",
  "status.messaging.stopped": "Detenido.",
  "status.messaging.stop": "Detener",
  "status.messaging.approvalTitle": "estack pide aprobación para continuar.",
  "status.messaging.approvalCommand": "Ejecutar un comando",
  "status.messaging.approvalFileChange": "Cambiar archivos",
  "status.messaging.approvalPermissions": "Obtener más permisos",
  "status.messaging.approve": "Aprobar",
  "status.messaging.deny": "Rechazar",
  "status.messaging.approvedBy": "Aprobado por {user}.",
  "status.messaging.deniedBy": "Rechazado por {user}.",
  "status.messaging.answeredOnHost": "Respondido en el host de estack.",
  "status.messaging.requestInactive": "Esta solicitud ya no está activa.",
  "status.messaging.onlyRequester": "Solo {user} puede hacerlo. El host de estack también puede responder.",
  "status.messaging.hostOnly": "Solo el host de estack puede responder a esta solicitud.",
  "status.messaging.filesSkipped": "Algunos archivos no se enviaron: {names}.",
  "status.messaging.orchestratorName": "Orquestador de Slack",
  "status.messaging.orchestratorTitle": "Responde en Slack y consulta al equipo",
  "status.messaging.discordNoAgent":
    "Aún no puede responder ningún agente aquí. Añade el Orquestador de Discord en estack.",
  "status.messaging.discordOrchestratorName": "Orquestador de Discord",
  "status.messaging.discordOrchestratorTitle": "Responde en Discord y consulta al equipo",
  "status.messaging.integrationsSection": "Integraciones",
  "status.messaging.signInReceived": "estack recibió la instalación de Slack. Puedes cerrar esta pestaña.",
  "status.messaging.signInUnknown": "estack no inició esta instalación de Slack. Iníciala de nuevo en estack.",
  "status.messaging.telegramNoAgent":
    "Aún no hay ningún agente que pueda responder aquí. Añade el Orquestador de Telegram en estack.",
  "status.messaging.telegramLinked":
    "estack está conectado a este chat. Menciona a {bot} o responde a un mensaje de estack para consultar a los agentes.",
  "status.messaging.telegramOrchestratorName": "Orquestador de Telegram",
  "status.messaging.telegramOrchestratorTitle": "Responde en Telegram y consulta al equipo",
  "status.messaging.whatsappNoAgent":
    "Aún no hay ningún agente que pueda responder aquí. Añade el Orquestador de WhatsApp en estack.",
  "status.messaging.whatsappApprovalMenu": "Responde 1 para aprobar o 2 para rechazar.",
  "status.messaging.whatsappStopMenu": "Responde «stop» para detener.",
  "status.messaging.whatsappPairingCode":
    "Este número solo responde a las personas que su propietario permitió. Dale este código al propietario: {code}",
  "status.messaging.whatsappPairingApproved": "Ya puedes enviar solicitudes a este número.",
  "status.messaging.whatsappOwnChat": "Envíate un mensaje",
  "status.messaging.whatsappWelcomeOwn":
    "👋 *estack está conectado*\n\nEscribe aquí para preguntar a tus agentes. El WhatsApp Orchestrator responde o pasa el trabajo al agente adecuado.\n\nEnvía *stop* para detener una solicitud.",
  "status.messaging.whatsappWelcomeDedicated":
    "👋 *estack está conectado*\n\nLas personas que permitas en estack ya pueden escribir a este número. Una persona nueva recibe un código: apruébalo en estack, en Solicitudes.\n\nEnvía *stop* para detener una solicitud.",
  "status.messaging.whatsappOtherEstack":
    "Otro estack está vinculado a este número de WhatsApp, así que puedes recibir dos respuestas. Para solucionarlo, abre Dispositivos vinculados en WhatsApp en tu teléfono y cierra la sesión del estack que no usas.",
  "status.messaging.whatsappPaused":
    "estack dejó de responder aquí durante 10 minutos: llegaron demasiados mensajes en poco tiempo. Si otro estack está vinculado a este número, abre Dispositivos vinculados en WhatsApp en tu teléfono y cierra la sesión del estack que no usas.",
  "status.messaging.whatsappOrchestratorName": "Orquestador de WhatsApp",
  "status.messaging.whatsappOrchestratorTitle": "Responde en WhatsApp y consulta al equipo",
} as const satisfies PartialTranslation<typeof source>;
