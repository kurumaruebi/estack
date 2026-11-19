export declare const PLUSH_TRANSITIONS: readonly ["flip", "pop", "warp", "dissolve", "cut"];
export type PlushTransition = (typeof PLUSH_TRANSITIONS)[number];
export declare const DEFAULT_TRANSITION: PlushTransition;
export declare const popCourbe: (t: number) => number;
export declare const POP: number;
/** le rapetissement avant le pop : la moitie du morph de forme */
export declare const RETRAIT: number;
export declare const DUREE: Record<PlushTransition, number>;
/** Ce qu'une transition dessine a un instant donne. */
export interface Rendu {
    /** quel(s) corps : l'ancien, le nouveau, ou les deux melanges */
    corps: 'avant' | 'apres' | 'deux';
    /** poids du nouveau corps quand il y en a deux (fondu, seuil de dissolution) */
    melange: number;
    /** echelle du groupe corps + yeux, autour du centre */
    sx: number;
    sy: number;
    /** la forme que le moteur doit avoir : il y place les yeux */
    bascule: boolean;
    fini: boolean;
}
export declare const REPOS_AVANT: Rendu;
export declare const REPOS_APRES: Rendu;
/**
 * `s` : secondes depuis le changement. Avant (s < 0) on dessine l'ancien corps ; une fois
 * la duree passee, le nouveau, a l'echelle 1.
 */
export declare function rendu(transition: PlushTransition, s: number): Rendu;
/**
 * Les rayons du contour pendant `warp`, a `s` secondes du changement : exactement ceux
 * que le moteur donne au corps (`shapeAtTime`), pour que le feutre reste sous les yeux.
 */
export declare function rayonsWarp(avant: readonly number[], apres: readonly number[], s: number): number[];
