import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/startup";

export const messages = {
  // The one native error box: the app could not start, so no renderer exists to show it.
  "startup.failedTitle": "estack n’a pas pu démarrer",
  "startup.failedBody":
    "{message}\n\nVos données locales n’ont pas été réinitialisées ni écrasées. Consultez le guide de dépannage pour savoir comment récupérer la situation.",
  "startup.archiveChangedTitle": "Des fichiers d’estack ont été modifiés",
  "startup.archiveChangedBody":
    "Un autre programme a modifié le fichier app.asar d’estack. estack fonctionne maintenant, mais il ne s’ouvrira plus après sa fermeture.\n\nPour le réparer, réinstallez estack. Vos données locales sont conservées.",
  "startup.archiveChangedDownload": "Télécharger estack",
  "startup.filesDamagedBody":
    "Certains fichiers d’estack sont endommagés ou manquants.\n\nPour le réparer, réinstallez estack. Vos données locales sont conservées.",
  "startup.newerDataUpdatingTitle": "Mise à jour d’estack",
  "startup.newerDataUpdatingBody":
    "Une version plus récente d’estack a enregistré vos données. estack installe la dernière version, puis se rouvre.\n\nVos données locales n’ont pas été réinitialisées ni écrasées.",
  "startup.newerDataTitle": "Installez la dernière version d’estack",
  "startup.newerDataBody":
    "Une version plus récente d’estack a enregistré vos données, et cette version ({version}) ne peut pas les ouvrir. Installez la dernière version pour ouvrir vos données.\n\nVos données locales n’ont pas été réinitialisées ni écrasées.",
  "startup.newerDataDownload": "Télécharger estack",
  "startup.newerDataGuide": "Ouvrir le guide",
  "startup.newerDataQuit": "Quitter",
  "startup.newerDataLoopTitle": "La dernière version d’estack ne s’est pas ouverte",
  "startup.newerDataLoopBody":
    "Une version plus récente d’estack a enregistré vos données, et cette version ({version}) ne peut pas les ouvrir. estack {loopVersion} s’est arrêté avant de s’ouvrir plusieurs fois de suite : il n’est donc pas réinstallé.\n\nInstallez une version plus récente que {loopVersion} dès qu’elle est disponible. Pour obtenir de l’aide, ouvrez le guide.\n\nVos données locales n’ont pas été réinitialisées ni écrasées.",
  "startup.newerDataReleases": "Voir les versions",
  "startup.recoveryWindowTitle": "Récupération d’estack",
  "startup.recoveryTitle": "estack ne s’est pas ouvert",
  "startup.recoveryBody": {
    one: "estack {version} s’est arrêté avant de s’ouvrir, {count} fois de suite. Vos données locales n’ont pas été réinitialisées ni écrasées.",
    other:
      "estack {version} s’est arrêté avant de s’ouvrir, {count} fois de suite. Vos données locales n’ont pas été réinitialisées ni écrasées.",
  },
  "startup.recoveryHint":
    "Réessayez, ou installez la dernière version qui s’est ouverte. Pour obtenir de l’aide, exportez le diagnostic et envoyez le fichier avec votre rapport.",
  "startup.recoveryHintLatest":
    "estack n’a trouvé aucune version antérieure capable d’ouvrir vos données. Réessayez, ou installez la dernière version. Pour obtenir de l’aide, exportez le diagnostic et envoyez le fichier avec votre rapport.",
  "startup.recoveryRetry": "Réessayer",
  "startup.recoveryPreviousVersion": "Télécharger la version précédente",
  "startup.recoveryLatestVersion": "Télécharger la dernière version",
  "startup.recoveryExportDiagnostics": "Exporter le diagnostic",
  "startup.recoveryOpenDataFolder": "Ouvrir le dossier des données",
  "startup.recoveryQuit": "Quitter",
  "startup.recoveryDiagnosticsSaved": "Le fichier de diagnostic est enregistré.",
  "startup.recoveryActionFailed": "estack n’a pas pu effectuer cette action.",
} as const satisfies PartialTranslation<typeof source>;
