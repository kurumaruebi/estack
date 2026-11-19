### Fixed

- The Claude CLI installs with less free disk space. Before, a disk with about 500 to 850 MB free
  passed the space check, then filled during the install, and estack showed only "estack could not
  update the Claude CLI. Try again." on each try. When a disk fills during the download or the
  install of a provider CLI, estack now says that there is not enough free disk space.
