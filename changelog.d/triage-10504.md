### Fixed

- When Windows could not write to the estack database for a moment while an agent wrote a reply,
  estack showed a "JavaScript error in the main process" window with "disk I/O error". Now estack
  keeps the reply text and saves it again a moment later, and no error window opens.
