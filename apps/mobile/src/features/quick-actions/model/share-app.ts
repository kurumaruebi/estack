import { Share } from "react-native";
import { supportLog, supportLogValue } from "@/features/support/model/support-log";
import { isIOS } from "@/shared/lib/platform";

/** The download page links to the App Store, Google Play and the desktop apps, so it fits each receiver. */
const DOWNLOAD_URL = "https://estack.invalid/download";

/** Opens the share sheet with the download link of estack. */
export function shareEstack(): void {
  Share.share(isIOS ? { url: DOWNLOAD_URL } : { message: DOWNLOAD_URL }).catch((error: unknown) => {
    supportLog.add("warn", "app", `Share sheet not opened: ${supportLogValue(error)}`);
  });
}
