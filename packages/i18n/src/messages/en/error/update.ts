import { defineMessages } from "../../../message";

export const messages = defineMessages("error.update", {
  // Updater state the user reads.
  "error.update.unsupported": "Updates are available in installed desktop builds.",
  "error.update.notReady": "An update is not ready to install.",
  "error.update.restartFailed": "estack could not restart to install the update.",
  "error.update.downloadStalled": "The update download stopped responding. Try again.",
  "error.update.installFailed": "Could not install the update. Quit and reopen estack, then try again.",
  "error.update.downloadFailed": "Could not download the update. Try again.",
  "error.update.checkFailed": "Could not check for updates. Try again.",
  "error.update.checkStalled": "The update check stopped responding. Try again.",
  "error.update.checkOffline": "Could not reach the update service. Check your internet connection, then try again.",
  "error.update.checkUnavailable": "The update service did not answer. estack tries again on its own in a few minutes.",
  "error.update.checkNoRelease":
    "No published update was found for this platform. estack tries again on its own in a few minutes.",
  "error.update.managedByNix": "Nix installs updates for this copy of estack. Update it with Nix.",
  "error.update.managedByHost":
    "Updates on this Mac are installed by the host. The update stays ready until the host's maintenance runs.",
  "error.update.siblingSession":
    "Another estack session is still running from this application. Stop estack in every other macOS user account first, then install the update again.",
  "error.update.siblingSessionSameAccount":
    "Another estack process is still running in this user account. Quit it, then install the update again.",
  "error.update.siblingCheckFailed": "Could not verify other estack sessions. Try again before installing.",
  "error.update.readOnlyLocation":
    "estack cannot install updates from this location. Quit estack. In Finder, drag estack into the Applications folder (if it is already there, drag it out and back in). Then open estack and install the update again.",
  "error.update.appImageMissing":
    "estack cannot install the update because its AppImage file was moved, renamed or replaced. Quit estack, then open the AppImage file again.",
  "error.update.appImageReadOnly":
    "estack cannot install updates in the folder of its AppImage file. Quit estack, move the AppImage file to a folder in your home folder, then open it and install the update again.",
  // A joined server's admin reads these from the host.
  "error.update.remoteDisabled": "Updates from server admins are turned off on this computer.",
  "error.update.restartStarted": "estack is already restarting to install the update.",
  "error.update.alreadyRestarting": "estack is already restarting.",
});
