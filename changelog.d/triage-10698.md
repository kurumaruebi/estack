### Fixed

- When an agent asks a teammate and the teammate's turn fails, estack now records that turn as
  failed. Before, the turn stayed recorded as running until the next start of estack.
