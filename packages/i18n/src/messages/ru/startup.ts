import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/startup";

export const messages = {
  "startup.failedTitle": "estack не удалось запустить",
  "startup.failedBody":
    "{message}\n\nЛокальные данные не сброшены и не перезаписаны. Шаги восстановления — в руководстве по устранению неполадок.",
  "startup.archiveChangedTitle": "Файлы estack изменены",
  "startup.archiveChangedBody":
    "Другая программа изменила файл estack app.asar. Сейчас estack работает, но после выхода он больше не запустится.\n\nЧтобы исправить это, установите estack заново. Ваши локальные данные сохранятся.",
  "startup.archiveChangedDownload": "Скачать estack",
  "startup.filesDamagedBody":
    "Некоторые файлы estack повреждены или отсутствуют.\n\nЧтобы исправить это, установите estack заново. Ваши локальные данные сохранятся.",
  "startup.newerDataUpdatingTitle": "Обновление estack",
  "startup.newerDataUpdatingBody":
    "Более новая версия estack сохранила ваши данные. estack устанавливает последнюю версию и затем откроется снова.\n\nВаши локальные данные не были сброшены или перезаписаны.",
  "startup.newerDataTitle": "Установите последнюю версию estack",
  "startup.newerDataBody":
    "Более новая версия estack сохранила ваши данные, и эта версия ({version}) не может их открыть. Установите последнюю версию, чтобы открыть данные.\n\nВаши локальные данные не были сброшены или перезаписаны.",
  "startup.newerDataDownload": "Скачать estack",
  "startup.newerDataGuide": "Открыть руководство",
  "startup.newerDataQuit": "Выйти",
  "startup.newerDataLoopTitle": "Последняя версия estack не открылась",
  "startup.newerDataLoopBody":
    "Более новая версия estack сохранила ваши данные, и эта версия ({version}) не может их открыть. estack {loopVersion} несколько раз подряд останавливался до открытия, поэтому он не будет установлен снова.\n\nУстановите версию новее {loopVersion}, когда она появится. Чтобы получить помощь, откройте руководство.\n\nВаши локальные данные не были сброшены или перезаписаны.",
  "startup.newerDataReleases": "Показать версии",
  "startup.recoveryWindowTitle": "Восстановление estack",
  "startup.recoveryTitle": "estack не открылся",
  "startup.recoveryBody": {
    one: "estack {version} остановился до открытия {count} раз подряд. Ваши локальные данные не сброшены и не перезаписаны.",
    few: "estack {version} остановился до открытия {count} раза подряд. Ваши локальные данные не сброшены и не перезаписаны.",
    many: "estack {version} остановился до открытия {count} раз подряд. Ваши локальные данные не сброшены и не перезаписаны.",
    other:
      "estack {version} остановился до открытия {count} раза подряд. Ваши локальные данные не сброшены и не перезаписаны.",
  },
  "startup.recoveryHint":
    "Попробуйте снова или установите последнюю версию, которая открывалась. Чтобы получить помощь, экспортируйте диагностику и отправьте файл вместе с отчётом.",
  "startup.recoveryHintLatest":
    "estack не нашёл более раннюю версию, которая может открыть ваши данные. Попробуйте снова или установите последнюю версию. Чтобы получить помощь, экспортируйте диагностику и отправьте файл вместе с отчётом.",
  "startup.recoveryRetry": "Повторить",
  "startup.recoveryPreviousVersion": "Скачать прошлую версию",
  "startup.recoveryLatestVersion": "Скачать последнюю версию",
  "startup.recoveryExportDiagnostics": "Экспорт диагностики",
  "startup.recoveryOpenDataFolder": "Открыть папку данных",
  "startup.recoveryQuit": "Выйти",
  "startup.recoveryDiagnosticsSaved": "Файл диагностики сохранён.",
  "startup.recoveryActionFailed": "estack не удалось выполнить это действие.",
} as const satisfies PartialTranslation<typeof source>;
