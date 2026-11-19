import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/startup";

export const messages = {
  "startup.failedTitle": "estack non è riuscito ad avviarsi",
  "startup.failedBody":
    "{message}\n\nI tuoi dati locali non sono stati reimpostati né sovrascritti. Consulta la guida alla risoluzione dei problemi per i passaggi di ripristino.",
  "startup.archiveChangedTitle": "I file di estack sono stati modificati",
  "startup.archiveChangedBody":
    "Un altro programma ha modificato il file app.asar di estack. estack ora funziona, ma non si aprirà più dopo la chiusura.\n\nPer ripararlo, installa di nuovo estack. I tuoi dati locali restano.",
  "startup.archiveChangedDownload": "Scarica estack",
  "startup.filesDamagedBody":
    "Alcuni file di estack sono danneggiati o mancanti.\n\nPer ripararlo, installa di nuovo estack. I tuoi dati locali restano.",
  "startup.newerDataUpdatingTitle": "Aggiornamento di estack",
  "startup.newerDataUpdatingBody":
    "Una versione più recente di estack ha salvato i tuoi dati. estack installa l’ultima versione e poi si riapre.\n\nI tuoi dati locali non sono stati reimpostati né sovrascritti.",
  "startup.newerDataTitle": "Installa l’ultima versione di estack",
  "startup.newerDataBody":
    "Una versione più recente di estack ha salvato i tuoi dati e questa versione ({version}) non può aprirli. Installa l’ultima versione per aprire i tuoi dati.\n\nI tuoi dati locali non sono stati reimpostati né sovrascritti.",
  "startup.newerDataDownload": "Scarica estack",
  "startup.newerDataGuide": "Apri guida",
  "startup.newerDataQuit": "Esci",
  "startup.newerDataLoopTitle": "L’ultima versione di estack non si è aperta",
  "startup.newerDataLoopBody":
    "Una versione più recente di estack ha salvato i tuoi dati e questa versione ({version}) non può aprirli. estack {loopVersion} si è fermato prima di aprirsi più volte di seguito, quindi non viene installato di nuovo.\n\nInstalla una versione più recente di {loopVersion} quando sarà disponibile. Per ricevere aiuto, apri la guida.\n\nI tuoi dati locali non sono stati reimpostati né sovrascritti.",
  "startup.newerDataReleases": "Mostra versioni",
  "startup.recoveryWindowTitle": "Ripristino di estack",
  "startup.recoveryTitle": "estack non si è aperto",
  "startup.recoveryBody": {
    one: "estack {version} si è chiuso prima di aprirsi, {count} volta di seguito. I tuoi dati locali non sono stati reimpostati né sovrascritti.",
    other:
      "estack {version} si è chiuso prima di aprirsi, {count} volte di seguito. I tuoi dati locali non sono stati reimpostati né sovrascritti.",
  },
  "startup.recoveryHint":
    "Riprova, oppure installa l’ultima versione che si è aperta. Per ricevere aiuto, esporta la diagnostica e invia il file con la tua segnalazione.",
  "startup.recoveryHintLatest":
    "estack non ha trovato una versione precedente che possa aprire i tuoi dati. Riprova, oppure installa l’ultima versione. Per ricevere aiuto, esporta la diagnostica e invia il file con la tua segnalazione.",
  "startup.recoveryRetry": "Riprova",
  "startup.recoveryPreviousVersion": "Scarica versione precedente",
  "startup.recoveryLatestVersion": "Scarica ultima versione",
  "startup.recoveryExportDiagnostics": "Esporta diagnostica",
  "startup.recoveryOpenDataFolder": "Apri cartella dati",
  "startup.recoveryQuit": "Esci",
  "startup.recoveryDiagnosticsSaved": "Il file di diagnostica è stato salvato.",
  "startup.recoveryActionFailed": "estack non è riuscito a eseguire questa azione.",
} as const satisfies PartialTranslation<typeof source>;
