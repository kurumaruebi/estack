; electron-builder includes this file in the NSIS installer. Its `protocols` setting registers the
; estack:// scheme only on macOS and Linux, so the installer writes the Windows key itself.
; The application writes the same key at each start (`src/main/index.ts`).

; A chosen folder such as D:\estack inherits Modify rights for "Authenticated Users" from the drive
; root, so another account could replace estack.exe. Give access only to this user, SYSTEM and
; Administrators, as %LOCALAPPDATA% does, and reset the files to inherit it. This runs before the
; files are copied at each install and update, because an update deletes the folder. The installer
; makes the folder, so this user owns it and icacls can change it. On a drive with no ACLs, such as
; exFAT, icacls fails and the install continues.
!macro estackRestrictInstallDirectory
  Push $0
  Push $1
  ReadEnvStr $0 USERDOMAIN
  ReadEnvStr $1 USERNAME
  nsExec::ExecToLog '"$SYSDIR\icacls.exe" "$INSTDIR" /inheritance:r /grant:r "*S-1-5-18:(OI)(CI)F" "*S-1-5-32-544:(OI)(CI)F" "$0\$1:(OI)(CI)F" /Q'
  Pop $0
  ${if} $0 == 0
    nsExec::ExecToLog '"$SYSDIR\icacls.exe" "$INSTDIR\*" /reset /T /C /Q'
    Pop $0
  ${endIf}
  Pop $1
  Pop $0
!macroend

; This replaces the check after the earlier version is removed, so it keeps that check first.
!macro customUnInstallCheck
  ${if} ${Errors}
    DetailPrint `Uninstall was not successful. Not able to launch uninstaller!`
  ${elseIf} $R0 != 0
    MessageBox MB_OK|MB_ICONEXCLAMATION "$(uninstallFailed): $R0"
    DetailPrint `Uninstall was not successful. Uninstaller error code: $R0.`
    SetErrorLevel 2
    Quit
  ${endIf}
  CreateDirectory "$INSTDIR"
  !insertmacro estackRestrictInstallDirectory
!macroend

!macro customInstall
  WriteRegStr SHCTX "Software\Classes\estack" "" "URL:estack invitations"
  WriteRegStr SHCTX "Software\Classes\estack" "URL Protocol" ""
  WriteRegStr SHCTX "Software\Classes\estack\DefaultIcon" "" "$appExe,0"
  WriteRegStr SHCTX "Software\Classes\estack\shell\open\command" "" '"$appExe" "%1"'
  !insertmacro estackRemoveAppFromDataFolder
  !insertmacro estackRemoveAppAboveInstallDirectory
!macroend

; estack keeps the agent workspaces in %USERPROFILE%\estack (`src/backend/agent-store.ts`) and its
; user data in %APPDATA%\estack (`app.setName` in `src/main/index.ts`). The uninstaller deletes the
; installation folder, and an update moves each file in it to a temporary folder that it then
; deletes. An installation folder must not be one of these folders or a folder that holds one.
; Sets OUT to "1" when the folder in the variable PATH is such a folder, otherwise to "0". A
; trailing backslash is removed from PATH. OUT must not be PATH, $R8 or $R9.
!macro estackHoldsUserData PATH OUT
  Push $R8
  Push $R9
  StrCpy ${OUT} "0"
  StrCpy $R9 ${PATH} 1 -1
  ${if} $R9 == "\"
    StrCpy ${PATH} ${PATH} -1
  ${endIf}
  ${if} ${PATH} != ""
    !insertmacro estackHolds ${PATH} "$PROFILE\estack" ${OUT}
    !insertmacro estackHolds ${PATH} "$APPDATA\estack" ${OUT}
  ${endIf}
  Pop $R9
  Pop $R8
!macroend

!macro estackHolds PATH FOLDER OUT
  StrLen $R9 ${PATH}
  StrCpy $R8 "${FOLDER}" $R9
  ${if} $R8 == ${PATH}
    StrCpy $R8 "${FOLDER}" 1 $R9
    ${if} $R8 == ""
    ${orIf} $R8 == "\"
      StrCpy ${OUT} "1"
    ${endIf}
  ${endIf}
!macroend

!ifndef BUILD_UNINSTALLER
  ; "1" when the registry names an earlier installation in a folder with user data.
  Var estackRegisteredInDataFolder
  ; The folder with user data that holds an earlier estack.exe. The update removes that copy.
  Var estackDataFolderInstall

  ; The assisted installer accepted a folder that did not exist yet, so a first installation could go
  ; to %USERPROFILE%\estack, and the app then made the agent folders in it. The earlier uninstaller
  ; would move them with the app files and delete them, or it stops the update with "Failed to
  ; uninstall old application files". Do not run that uninstaller: `customCheckAppRunning` removes its
  ; registry entry, and `customInstall` removes only the app files. A copy whose registry entry is
  ; already gone, for example after an install that stopped, is removed too. An update installs in the
  ; default folder: this macro sets it for a silent run, and in a visible run the page after the folder
  ; page (`customPageAfterChangeDir`) refuses the folder with user data.
  !macro customInit
    ReadRegStr $1 SHCTX "${INSTALL_REGISTRY_KEY}" InstallLocation
    !insertmacro estackHoldsUserData $1 $0
    ${if} $0 == "1"
      StrCpy $estackRegisteredInDataFolder "1"
      ${if} ${FileExists} "$1\${APP_EXECUTABLE_FILENAME}"
        StrCpy $estackDataFolderInstall $1
      ${endIf}
    ${elseIf} ${FileExists} "$PROFILE\estack\${APP_EXECUTABLE_FILENAME}"
      StrCpy $estackDataFolderInstall "$PROFILE\estack"
    ${elseIf} ${FileExists} "$APPDATA\estack\${APP_EXECUTABLE_FILENAME}"
      StrCpy $estackDataFolderInstall "$APPDATA\estack"
    ${endIf}
    !insertmacro estackHoldsUserData $INSTDIR $0
    ${if} $0 == "1"
      StrCpy $INSTDIR "$LocalAppData\Programs\${APP_FILENAME}"
    ${endIf}
  !macroend

  ; The installer runs this check before it removes the earlier version. It is the default check.
  ; When the registry names a folder with user data, the update closes the app there, so the check
  ; looks for the earlier estack.exe only: a match on the folder would also stop the programs that
  ; agents run from their workspaces. Then the registry no longer names that installation, so
  ; `uninstallOldVersion` does not run its uninstaller. The uninstaller keeps the default check.
  !macro customCheckAppRunning
    !insertmacro IS_POWERSHELL_AVAILABLE
    ${if} $estackRegisteredInDataFolder == "1"
    ${andIf} $estackDataFolderInstall != ""
      Push $INSTDIR
      StrCpy $INSTDIR "$estackDataFolderInstall\${APP_EXECUTABLE_FILENAME}"
    ${endIf}
    !insertmacro _CHECK_APP_RUNNING
    ${if} $estackRegisteredInDataFolder == "1"
      ${if} $estackDataFolderInstall != ""
        Pop $INSTDIR
      ${endIf}
      DeleteRegKey SHCTX "${UNINSTALL_REGISTRY_KEY}"
      !ifdef UNINSTALL_REGISTRY_KEY_2
        DeleteRegKey SHCTX "${UNINSTALL_REGISTRY_KEY_2}"
      !endif
      DeleteRegValue SHCTX "${INSTALL_REGISTRY_KEY}" InstallLocation
    ${endIf}
  !macroend

  ; electron-builder includes these for the default check only, and that check needs them.
  !include "getProcessInfo.nsh"
  Var pid
!endif

; After the new copy is installed, delete the earlier app from the folder with user data.
!macro estackRemoveAppFromDataFolder
  ${if} $estackDataFolderInstall != ""
    !insertmacro estackRemoveAppFiles $estackDataFolderInstall
  ${endIf}
!macroend

; An installation in the default folder whose registry entry is gone, for example after an update
; that stopped, is installed again in an estack subfolder (`estackSafeInstallDirectory`). The
; earlier copy stays in the default folder, often with files missing, and no update reaches it. Its
; login item and shortcuts then open a copy that fails at start. Delete its app files. Only this
; user has the default folder, and it holds only estack.
!macro estackRemoveAppAboveInstallDirectory
  ${if} $INSTDIR == "$LocalAppData\Programs\${APP_FILENAME}\${APP_FILENAME}"
  ${andIf} ${FileExists} "$LocalAppData\Programs\${APP_FILENAME}\${APP_EXECUTABLE_FILENAME}"
    !insertmacro estackRemoveAppFiles "$LocalAppData\Programs\${APP_FILENAME}"
  ${endIf}
!macroend

; Only the files and folders that an estack installation has are deleted from FOLDER, so the agent
; folders stay. A file that Windows still holds stays too; it does not stop the update. The login
; item names the executable (`src/main/login-item.ts`), and Electron calls it by the AppUserModelId:
; point it at the new copy, or estack no longer opens at sign-in.
!macro estackRemoveAppFiles FOLDER
  Push $0
  Push $1
  Push $2
  StrCpy $0 ${FOLDER}
  ReadRegStr $1 HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "${APP_ID}"
  ${StrContains} $2 "$0\${APP_EXECUTABLE_FILENAME}" $1
  ${if} $2 != ""
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "${APP_ID}" '"$appExe"'
  ${endIf}
  Delete "$0\${APP_EXECUTABLE_FILENAME}"
  Delete "$0\${UNINSTALL_FILENAME}"
  Delete "$0\uninstallerIcon.ico"
  Delete "$0\chrome_100_percent.pak"
  Delete "$0\chrome_200_percent.pak"
  Delete "$0\resources.pak"
  Delete "$0\d3dcompiler_47.dll"
  Delete "$0\dxcompiler.dll"
  Delete "$0\dxil.dll"
  Delete "$0\ffmpeg.dll"
  Delete "$0\libEGL.dll"
  Delete "$0\libGLESv2.dll"
  Delete "$0\vk_swiftshader.dll"
  Delete "$0\vk_swiftshader_icd.json"
  Delete "$0\vulkan-1.dll"
  Delete "$0\icudtl.dat"
  Delete "$0\snapshot_blob.bin"
  Delete "$0\v8_context_snapshot.bin"
  Delete "$0\LICENSE.electron.txt"
  Delete "$0\LICENSES.chromium.html"
  RMDir /r "$0\locales"
  RMDir /r "$0\resources"
  Pop $2
  Pop $1
  Pop $0
!macroend

; An update runs the old uninstaller first. Keep the key then, so that links work during the update.
; Delete the key only when it still opens this copy. Another copy can own it now.
!macro customUnInstall
  ${ifNot} ${isUpdated}
    Push $0
    ReadRegStr $0 SHCTX "Software\Classes\estack\shell\open\command" ""
    ${if} $0 == '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'
      DeleteRegKey SHCTX "Software\Classes\estack"
    ${endIf}
    Pop $0
  ${endIf}
!macroend

; estack installs for the current user only. The application writes the estack:// key in HKCU at
; each start, and an update finds only one installation. This skips the "All users" page.
!macro customInstallMode
  StrCpy $isForceCurrentInstall "1"
!macroend

; The app starts an update visibly (`src/main/update-service.ts`), so the user sees the progress page
; until the new version opens. An update skips every other page; the earlier uninstaller deletes
; estack.exe before the new files are copied, and a silent update gave no sign of that. This is the
; default finish page of the assisted installer, but in an update it opens the app at once and skips
; the page, which also closes the installer. The installer opens the app by itself only in a silent run.
!macro customFinishPage
  Function StartApp
    ${if} ${isUpdated}
      StrCpy $1 "--updated"
    ${else}
      StrCpy $1 ""
    ${endif}
    ${StdUtils.ExecShellAsUser} $0 "$launchLink" "open" "$1"
  FunctionEnd

  Function estackSkipFinishPageInUpdate
    ${if} ${isUpdated}
      ${if} ${isForceRun}
        ; Otherwise the app window opens behind the installer window.
        HideWindow
        Call StartApp
      ${endIf}
      Abort
    ${endIf}
  FunctionEnd

  !define MUI_PAGE_CUSTOMFUNCTION_PRE estackSkipFinishPageInUpdate
  !define MUI_FINISHPAGE_RUN
  !define MUI_FINISHPAGE_RUN_FUNCTION "StartApp"
  !insertmacro MUI_PAGE_FINISH
!macroend

; The uninstaller and each update delete the whole installation folder. electron-builder adds an
; estack subfolder only when the chosen path does not contain "estack", so a choice such as
; %USERPROFILE%\estack (the agent workspaces) or %APPDATA%\estack (the user data) would be
; deleted. Another account can also make a folder first and keep its rights on it. Use only a folder
; that does not exist or that holds this user's earlier installation. Until then, add an estack
; subfolder. The app makes %USERPROFILE%\estack only at its first start, so that folder can also not
; exist yet: use the default folder for it and for a folder that holds it. The page shows nothing;
; Abort skips it. In a visible update, the install mode page has set the folder from the registry
; again, so this page uses the folder that `customInit` uses for a silent update.
!macro customPageAfterChangeDir
  !include FileFunc.nsh

  Page custom estackSafeInstallDirectory

  Function estackSafeInstallDirectory
    Push $0
    Push $1
    ${if} ${isUpdated}
      !insertmacro estackHoldsUserData $INSTDIR $0
      ${if} $0 == "1"
        StrCpy $INSTDIR "$LocalAppData\Programs\${APP_FILENAME}"
      ${endIf}
      Pop $1
      Pop $0
      Abort
    ${endIf}
    ReadRegStr $1 HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation
    StrCpy $0 $INSTDIR 1 -1
    ${if} $0 == "\"
      StrCpy $INSTDIR $INSTDIR -1
    ${endIf}
    ${StrContains} $0 "${APP_FILENAME}" $INSTDIR
    ${if} $0 == ""
      StrCpy $INSTDIR "$INSTDIR\${APP_FILENAME}"
    ${endIf}
    !insertmacro estackHoldsUserData $INSTDIR $0
    ${if} $0 == "1"
      StrCpy $INSTDIR "$LocalAppData\Programs\${APP_FILENAME}"
    ${endIf}
    ${do}
      ${if} $INSTDIR == $1
        ${exitDo}
      ${endIf}
      ${DirState} "$INSTDIR" $0
      ${if} $0 == -1
        ${exitDo}
      ${endIf}
      StrCpy $INSTDIR "$INSTDIR\${APP_FILENAME}"
    ${loop}
    Pop $1
    Pop $0
    Abort
  FunctionEnd
!macroend
