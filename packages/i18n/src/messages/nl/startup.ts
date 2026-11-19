import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/startup";

export const messages = {
  "startup.failedTitle": "estack kan niet starten",
  "startup.failedBody":
    "{message}\n\nJe lokale gegevens zijn niet gereset of overschreven. Bekijk de handleiding voor probleemoplossing voor herstelstappen.",
  "startup.archiveChangedTitle": "estack-bestanden zijn gewijzigd",
  "startup.archiveChangedBody":
    "Een ander programma heeft het estack-bestand app.asar gewijzigd. estack werkt nu, maar opent niet meer nadat je het afsluit.\n\nInstalleer estack opnieuw om het te herstellen. Je lokale gegevens blijven bewaard.",
  "startup.archiveChangedDownload": "estack downloaden",
  "startup.filesDamagedBody":
    "Sommige estack-bestanden zijn beschadigd of ontbreken.\n\nInstalleer estack opnieuw om het te herstellen. Je lokale gegevens blijven bewaard.",
  "startup.newerDataUpdatingTitle": "estack wordt bijgewerkt",
  "startup.newerDataUpdatingBody":
    "Een nieuwere versie van estack heeft je gegevens opgeslagen. estack installeert de nieuwste versie en opent daarna opnieuw.\n\nJe lokale gegevens zijn niet gereset of overschreven.",
  "startup.newerDataTitle": "Installeer de nieuwste estack",
  "startup.newerDataBody":
    "Een nieuwere versie van estack heeft je gegevens opgeslagen, en deze versie ({version}) kan ze niet openen. Installeer de nieuwste versie om je gegevens te openen.\n\nJe lokale gegevens zijn niet gereset of overschreven.",
  "startup.newerDataDownload": "estack downloaden",
  "startup.newerDataGuide": "Gids openen",
  "startup.newerDataQuit": "Stoppen",
  "startup.newerDataLoopTitle": "De nieuwste estack opende niet",
  "startup.newerDataLoopBody":
    "Een nieuwere versie van estack heeft je gegevens opgeslagen, en deze versie ({version}) kan ze niet openen. estack {loopVersion} stopte meerdere keren achter elkaar voordat het opende, dus het wordt niet opnieuw geïnstalleerd.\n\nInstalleer een versie nieuwer dan {loopVersion} zodra er een beschikbaar is. Open de gids voor hulp.\n\nJe lokale gegevens zijn niet gereset of overschreven.",
  "startup.newerDataReleases": "Versies tonen",
  "startup.recoveryWindowTitle": "estack-herstel",
  "startup.recoveryTitle": "estack is niet geopend",
  "startup.recoveryBody": {
    one: "estack {version} stopte voordat het openging, {count} keer achter elkaar. Je lokale gegevens zijn niet gewist of overschreven.",
    other:
      "estack {version} stopte voordat het openging, {count} keer achter elkaar. Je lokale gegevens zijn niet gewist of overschreven.",
  },
  "startup.recoveryHint":
    "Probeer het opnieuw, of installeer de laatste versie die wel opende. Exporteer voor hulp de diagnose en stuur het bestand mee met je melding.",
  "startup.recoveryHintLatest":
    "estack vond geen eerdere versie die je gegevens kan openen. Probeer het opnieuw, of installeer de nieuwste versie. Exporteer voor hulp de diagnose en stuur het bestand mee met je melding.",
  "startup.recoveryRetry": "Opnieuw",
  "startup.recoveryPreviousVersion": "Vorige versie downloaden",
  "startup.recoveryLatestVersion": "Nieuwste versie downloaden",
  "startup.recoveryExportDiagnostics": "Diagnose exporteren",
  "startup.recoveryOpenDataFolder": "Gegevensmap openen",
  "startup.recoveryQuit": "Stoppen",
  "startup.recoveryDiagnosticsSaved": "Het diagnosebestand is opgeslagen.",
  "startup.recoveryActionFailed": "estack kon deze actie niet uitvoeren.",
} as const satisfies PartialTranslation<typeof source>;
