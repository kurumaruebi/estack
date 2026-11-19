### Fixed

- A Hermes agent that starts work while estack reads its chat history, for example just after
  estack starts, now shows its answer and can use its estack tools. Before, its answer could be
  lost, the turn could end with "Hermes stopped responding", and each tool call failed with
  "History replay cannot execute tools". On a joined server, the server must also be on this version.
