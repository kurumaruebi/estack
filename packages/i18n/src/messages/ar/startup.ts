import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/startup";

export const messages = {
  "startup.failedTitle": "تعذّر بدء تشغيل estack",
  "startup.failedBody":
    "{message}\n\nلم تُعَد تعيين بياناتك المحلية ولم يُكتب فوقها. راجع دليل استكشاف الأخطاء وإصلاحها لمعرفة خطوات الاسترداد.",
  "startup.archiveChangedTitle": "تم تغيير ملفات estack",
  "startup.archiveChangedBody":
    "غيّر برنامج آخر ملف estack المسمى app.asar. يعمل estack الآن، لكنه لن يفتح بعد إنهائه.\n\nلإصلاح estack، ثبّته من جديد. تبقى بياناتك المحلية.",
  "startup.archiveChangedDownload": "تنزيل estack",
  "startup.filesDamagedBody": "بعض ملفات estack تالفة أو مفقودة.\n\nلإصلاح estack، ثبّته من جديد. تبقى بياناتك المحلية.",
  "startup.newerDataUpdatingTitle": "جارٍ تحديث estack",
  "startup.newerDataUpdatingBody":
    "حفظ إصدار أحدث من estack بياناتك. يثبّت estack أحدث إصدار ثم يفتح مرة أخرى.\n\nلم تتم إعادة تعيين بياناتك المحلية أو الكتابة فوقها.",
  "startup.newerDataTitle": "ثبّت أحدث إصدار من estack",
  "startup.newerDataBody":
    "حفظ إصدار أحدث من estack بياناتك، ولا يستطيع هذا الإصدار ({version}) فتحها. ثبّت أحدث إصدار لفتح بياناتك.\n\nلم تتم إعادة تعيين بياناتك المحلية أو الكتابة فوقها.",
  "startup.newerDataDownload": "تنزيل estack",
  "startup.newerDataGuide": "فتح الدليل",
  "startup.newerDataQuit": "إنهاء",
  "startup.newerDataLoopTitle": "لم يُفتح أحدث إصدار من estack",
  "startup.newerDataLoopBody":
    "حفظ إصدار أحدث من estack بياناتك، ولا يستطيع هذا الإصدار ({version}) فتحها. توقف estack {loopVersion} قبل أن يُفتح عدة مرات متتالية، لذلك لن يُثبَّت مرة أخرى.\n\nثبّت إصدارًا أحدث من {loopVersion} عندما يتوفر. للحصول على المساعدة، افتح الدليل.\n\nلم تتم إعادة تعيين بياناتك المحلية أو الكتابة فوقها.",
  "startup.newerDataReleases": "عرض الإصدارات",
  "startup.recoveryWindowTitle": "استرداد estack",
  "startup.recoveryTitle": "لم يُفتح estack",
  "startup.recoveryBody": {
    zero: "توقف estack {version} قبل أن يُفتح {count} مرة متتالية. لم تتم إعادة تعيين بياناتك المحلية أو الكتابة فوقها.",
    one: "توقف estack {version} قبل أن يُفتح مرة واحدة ({count}). لم تتم إعادة تعيين بياناتك المحلية أو الكتابة فوقها.",
    two: "توقف estack {version} قبل أن يُفتح مرتين متتاليتين ({count}). لم تتم إعادة تعيين بياناتك المحلية أو الكتابة فوقها.",
    few: "توقف estack {version} قبل أن يُفتح {count} مرات متتالية. لم تتم إعادة تعيين بياناتك المحلية أو الكتابة فوقها.",
    many: "توقف estack {version} قبل أن يُفتح {count} مرة متتالية. لم تتم إعادة تعيين بياناتك المحلية أو الكتابة فوقها.",
    other:
      "توقف estack {version} قبل أن يُفتح {count} مرة متتالية. لم تتم إعادة تعيين بياناتك المحلية أو الكتابة فوقها.",
  },
  "startup.recoveryHint":
    "أعد المحاولة، أو ثبّت آخر إصدار فُتح. للحصول على المساعدة، صدّر بيانات التشخيص وأرسل الملف مع بلاغك.",
  "startup.recoveryHintLatest":
    "لم يجد estack إصدارًا سابقًا يستطيع فتح بياناتك. أعد المحاولة، أو ثبّت أحدث إصدار. للحصول على المساعدة، صدّر بيانات التشخيص وأرسل الملف مع بلاغك.",
  "startup.recoveryRetry": "إعادة المحاولة",
  "startup.recoveryPreviousVersion": "تنزيل الإصدار السابق",
  "startup.recoveryLatestVersion": "تنزيل أحدث إصدار",
  "startup.recoveryExportDiagnostics": "تصدير التشخيص",
  "startup.recoveryOpenDataFolder": "فتح مجلد البيانات",
  "startup.recoveryQuit": "إنهاء",
  "startup.recoveryDiagnosticsSaved": "تم حفظ ملف التشخيص.",
  "startup.recoveryActionFailed": "تعذّر على estack تنفيذ هذا الإجراء.",
} as const satisfies PartialTranslation<typeof source>;
