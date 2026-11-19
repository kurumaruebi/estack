import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/error/update";

export const messages = {
  "error.update.unsupported": "Aktualizacje są dostępne w zainstalowanych wersjach desktopowych.",
  "error.update.notReady": "Aktualizacja nie jest gotowa do instalacji.",
  "error.update.restartFailed": "estack nie mógł uruchomić się ponownie, aby zainstalować aktualizację.",
  "error.update.downloadStalled": "Pobieranie aktualizacji przestało odpowiadać. Spróbuj ponownie.",
  "error.update.installFailed":
    "Nie udało się zainstalować aktualizacji. Zamknij i otwórz ponownie estack, a potem spróbuj ponownie.",
  "error.update.downloadFailed": "Nie udało się pobrać aktualizacji. Spróbuj ponownie.",
  "error.update.checkFailed": "Nie udało się sprawdzić aktualizacji. Spróbuj ponownie.",
  "error.update.checkStalled": "Sprawdzanie aktualizacji przestało odpowiadać. Spróbuj ponownie.",
  "error.update.checkOffline":
    "Nie udało się połączyć z usługą aktualizacji. Sprawdź połączenie z internetem i spróbuj ponownie.",
  "error.update.checkUnavailable":
    "Usługa aktualizacji nie odpowiedziała. estack sam spróbuje ponownie za kilka minut.",
  "error.update.checkNoRelease":
    "Nie znaleziono opublikowanej aktualizacji dla tej platformy. estack sam spróbuje ponownie za kilka minut.",
  "error.update.managedByNix": "Aktualizacje tej kopii estack instaluje Nix. Zaktualizuj ją przez Nix.",
  "error.update.managedByHost":
    "Aktualizacje na tym Macu instaluje host. Aktualizacja pozostaje gotowa do czasu konserwacji hosta.",
  "error.update.siblingSession":
    "Inna sesja estack nadal działa z tej aplikacji. Najpierw zatrzymaj estack na każdym innym koncie użytkownika macOS, a potem ponownie zainstaluj aktualizację.",
  "error.update.siblingSessionSameAccount":
    "Inny proces estack nadal działa na tym koncie użytkownika. Zamknij go, a potem ponownie zainstaluj aktualizację.",
  "error.update.siblingCheckFailed": "Nie udało się sprawdzić innych sesji estack. Spróbuj ponownie przed instalacją.",
  "error.update.readOnlyLocation":
    "estack nie może instalować aktualizacji z tej lokalizacji. Zamknij estack. W Finderze przeciągnij estack do folderu Aplikacje (jeśli już tam jest, przeciągnij go na zewnątrz i z powrotem). Następnie otwórz estack i zainstaluj aktualizację ponownie.",
  "error.update.appImageMissing":
    "estack nie może zainstalować aktualizacji, ponieważ jego plik AppImage został przeniesiony, zmieniono jego nazwę lub go zastąpiono. Zamknij estack, a następnie ponownie otwórz plik AppImage.",
  "error.update.appImageReadOnly":
    "estack nie może instalować aktualizacji w folderze swojego pliku AppImage. Zamknij estack, przenieś plik AppImage do folderu w swoim folderze domowym, a następnie otwórz go i ponownie zainstaluj aktualizację.",
  "error.update.remoteDisabled": "Aktualizacje od administratorów serwera są wyłączone na tym komputerze.",
  "error.update.restartStarted": "estack już uruchamia się ponownie, aby zainstalować aktualizację.",
  "error.update.alreadyRestarting": "estack już uruchamia się ponownie.",
} as const satisfies PartialTranslation<typeof source>;
