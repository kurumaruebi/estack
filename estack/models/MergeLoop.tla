---------------------------- MODULE MergeLoop ----------------------------
EXTENDS Naturals

CONSTANTS PRs, InScope, Approved, Fixed

VARIABLES stage, mergedBy, sessions, handled, pending, effected, deploys, fuzzes, stopped

vars == <<stage, mergedBy, sessions, handled, pending, effected, deploys, fuzzes, stopped>>

Init ==
  /\ stage = [p \in PRs |-> "open"]
  /\ mergedBy = [p \in PRs |-> "none"]
  /\ sessions = PRs
  /\ handled = {}
  /\ pending = {}
  /\ effected = {}
  /\ deploys = [p \in PRs |-> 0]
  /\ fuzzes = [p \in PRs |-> 0]
  /\ stopped \in BOOLEAN

ToggleStop ==
  /\ stopped' = ~stopped
  /\ UNCHANGED <<stage, mergedBy, sessions, handled, pending, effected, deploys, fuzzes>>

MergeOutside(p) ==
  /\ stage[p] = "open"
  /\ stage' = [stage EXCEPT ![p] = "merged"]
  /\ mergedBy' = [mergedBy EXCEPT ![p] = "outside"]
  /\ UNCHANGED <<sessions, handled, pending, effected, deploys, fuzzes, stopped>>

Close(p) ==
  /\ stage[p] = "open"
  /\ stage' = [stage EXCEPT ![p] = "closed"]
  /\ UNCHANGED <<mergedBy, sessions, handled, pending, effected, deploys, fuzzes, stopped>>

FollowUp(p) ==
  /\ p \notin sessions
  /\ sessions' = sessions \cup {p}
  /\ UNCHANGED <<stage, mergedBy, handled, pending, effected, deploys, fuzzes, stopped>>

WorkerMerges(p) ==
  /\ stage' = [stage EXCEPT ![p] = "merged"]
  /\ mergedBy' = [mergedBy EXCEPT ![p] = "worker"]
  /\ pending' = pending \cup {p}
  /\ handled' = IF Fixed THEN handled \cup {p} ELSE handled
  /\ sessions' = IF Fixed THEN sessions \ {p} ELSE sessions
  /\ UNCHANGED <<effected, deploys, fuzzes, stopped>>

ApprovedMerge(p) ==
  /\ pending = {}
  /\ p \in Approved
  /\ stage[p] = "open"
  /\ WorkerMerges(p)

SweepFixed(p) ==
  \/ /\ p \in handled
     /\ sessions' = sessions \ {p}
     /\ UNCHANGED <<stage, mergedBy, handled, pending, effected, deploys, fuzzes, stopped>>
  \/ /\ p \notin handled
     /\ stage[p] \in {"merged", "closed"}
     /\ sessions' = sessions \ {p}
     /\ handled' = handled \cup {p}
     /\ UNCHANGED <<stage, mergedBy, pending, effected, deploys, fuzzes, stopped>>
  \/ /\ p \notin handled
     /\ stage[p] = "open"
     /\ p \in InScope
     /\ ~stopped
     /\ WorkerMerges(p)

SweepBefore(p) ==
  \/ /\ stage[p] = "merged"
     /\ pending' = pending \cup {p}
     /\ UNCHANGED <<stage, mergedBy, sessions, handled, effected, deploys, fuzzes, stopped>>
  \/ /\ stage[p] = "open"
     /\ p \in InScope
     /\ WorkerMerges(p)

Sweep(p) ==
  /\ pending = {}
  /\ p \in sessions
  /\ IF Fixed THEN SweepFixed(p) ELSE SweepBefore(p)

SideEffectAllowed(p) == ~Fixed \/ (~stopped /\ p \notin effected)

AfterMerge(p) ==
  /\ p \in pending
  /\ pending' = pending \ {p}
  /\ IF SideEffectAllowed(p)
       THEN /\ deploys' = [deploys EXCEPT ![p] = @ + 1]
            /\ fuzzes' = [fuzzes EXCEPT ![p] = @ + 1]
            /\ effected' = effected \cup {p}
       ELSE UNCHANGED <<deploys, fuzzes, effected>>
  /\ UNCHANGED <<stage, mergedBy, sessions, handled, stopped>>

Next ==
  \/ ToggleStop
  \/ \E p \in PRs :
       \/ MergeOutside(p)
       \/ Close(p)
       \/ FollowUp(p)
       \/ ApprovedMerge(p)
       \/ Sweep(p)
       \/ AfterMerge(p)

Spec == Init /\ [][Next]_vars

TypeOK ==
  /\ stage \in [PRs -> {"open", "merged", "closed"}]
  /\ mergedBy \in [PRs -> {"none", "outside", "worker"}]
  /\ sessions \subseteq PRs
  /\ handled \subseteq PRs
  /\ pending \subseteq PRs
  /\ effected \subseteq PRs

DeployOnlyAfterOwnMerge == \A p \in PRs : deploys[p] > 0 => mergedBy[p] = "worker"

AtMostOncePerMerge == \A p \in PRs : deploys[p] <= 1 /\ fuzzes[p] <= 1

AgentMergesOnlyInScope == \A p \in PRs : (mergedBy[p] = "worker" /\ p \notin Approved) => p \in InScope

StopFreezesSideEffects == [][stopped => UNCHANGED <<deploys, fuzzes>>]_vars

NoDeployEver == \A p \in PRs : deploys[p] = 0

Bounded == \A p \in PRs : deploys[p] <= 2 /\ fuzzes[p] <= 2
=============================================================================
