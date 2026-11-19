import type { PlushPad } from './catalogue.js';
/**
 * Le patin sur une gelule de `w` x `h` px : des morceaux d'une gelule de feutre, jamais etiree.
 *
 * Le feutre (`tools/peluche/fit/feutre.py`) a un grain et une frange : etire, chaque fibre
 * devenait une raie. Chaque patin est donc cuit en gelule, couchee (`x`) et debout (`y`) : le
 * patin rond (la gelule ajustee sans sa partie droite) allonge d'une partie droite de
 * `2 BARRE` petits cotes, le feutre lu sur le patin rond et prolonge dans la partie droite. Les
 * deux bouts sont le patin rond tel quel ; la partie droite est SYMETRIQUE (et a la meme
 * lumiere partout). Sur une gelule longue de `2 e` de plus que large, a l'echelle `u` du
 * petit cote, chaque moitie montre son bout et `e` de partie droite :
 * - jusqu'a `BARRE`, d'un seul morceau. Les deux moities se rejoignent au centre sur deux
 *   colonnes symetriques de l'image : la meme matiere ;
 * - au-dela, par troncons de `BARRE` : l'image lue jusqu'a son milieu, puis au-dela de son
 *   milieu (le reflet de ce qui precede), et ainsi de suite. Jusqu'a `BARRES` troncons ; plus
 *   loin, ils s'etirent (aucun oeil du catalogue n'y va).
 *
 * Aucune coupe ne tombe sur le bord d'une image (le bord d'un `<image>` est antialiase en plus
 * de la coupe : un liseré). Toutes sont paralleles, et les morceaux s'additionnent
 * (`plus-lighter`) dans un groupe isole : leurs couvertures antialiasees se completent a 1.
 * Tout est continu en `w`, `h`, l'image elle-meme comprise quand l'oeil passe de couche a
 * debout : sur une gelule ronde, les deux images montrent le MEME patin rond (`matiere.py`).
 */
export interface PadPiece {
    /** l'image : la gelule couchee (`x`) ou debout (`y`) */
    src: 'x' | 'y';
    /** le rectangle ou le morceau est pose, centre sur l'oeil */
    x: number;
    y: number;
    w: number;
    h: number;
    /** ce qu'il montre de son image (0 a 1) : le `viewBox` de l'`<svg>` imbrique */
    viewBox: string;
}
/** un troncon de partie droite, en petits cotes : la moitie de celle de l'image (`barre` de `matiere.py`) */
export declare const BARRE = 0.5;
/**
 * Au-dela de ce nombre de troncons de chaque cote, ils s'etirent plutot que de se multiplier
 * (CHOISI) : aucun oeil du catalogue ne va si loin ; le plus long (Vita, 3,8 fois plus long que
 * large) en demande trois.
 */
export declare const BARRES = 3;
/** Les morceaux du patin `pad` pose sur une gelule de `w` x `h` px. */
export declare function padPieces(pad: PlushPad, w: number, h: number): PadPiece[];
/** La demi-etendue des morceaux, centres sur l'oeil : ce que couvrent les images, frange et ombre comprises. */
export declare function padExtent(pieces: readonly PadPiece[]): {
    x: number;
    y: number;
};
