import { type Look } from '../bot/engine.js';
import { type BotExpression } from '../bot/expressions.js';
import { type StateId } from '../bot/states.js';
import type { GazeScript } from '../ui/gaze.js';
import type { PlushPad, PlushState } from './catalogue.js';
/**
 * L'etat du moteur sous un etat de peluche. `thinking`, `asleep` et `failed` gardent le
 * corps au repos : le moteur reste sur `idle`, la peluche ne change que le visage et le decor.
 */
export declare const engineState: (state: PlushState) => StateId;
/**
 * Duree d'arrivee dans un etat : le `morph` de l'etat du moteur du meme nom. `asleep` prend
 * celui de `sleep` (l'endormissement de la video), `failed` celui du repos, qu'il garde.
 */
export declare const morphOf: (state: PlushState) => number;
/**
 * La derive du regard au repos, reduite : c'est celle que les six personnages ont eue
 * pendant tout l'essai, celle que l'utilisateur a validee. `mix` nul : le regard reste
 * celui de la pose (le visage au repos, le regard releve d'un clin d'oeil).
 */
export declare const REST_LOOK: Look;
/**
 * Le regard pendant `thinking` : en haut, du cote des points. CHOISI, pas releve — la video
 * n'a pas de peluche qui reflechit. Sous le tangage du visage `neutre` (28,6°), donc aucun
 * oeil ne passe le limbe.
 */
export declare const THINK_LOOK: Look;
/**
 * Le regard endormi : la derive presque eteinte (les yeux fermes ne cherchent rien) et plus
 * aucun clignement : des yeux fermes ne clignent pas. CHOISI.
 */
export declare const ASLEEP_LOOK: Look;
/** Le regard d'un etat : `thinking` vise les points, `asleep` dort, les autres sont au repos. */
export declare const lookOf: (state: PlushState) => Look;
/**
 * Un regard qui glisse de `from` a `to` en `duration`, avec la courbe des morphs du moteur.
 * Le composant applique un script image par image (rattrapage d'1/60 s) : c'est donc au
 * script d'etre continu, et il l'est parce que `from` est le dernier regard rendu.
 */
export declare const glide: (from: Look, to: Look, duration: number) => GazeScript;
/** amplitude du « non », en degres de lacet */
export declare const SHAKE_YAW = 12;
/** duree du « non » : deux allers-retours */
export declare const SHAKE = 0.8;
export declare const shake: (t: number) => number;
/**
 * Le script de regard a l'entree dans un etat, depuis le dernier regard rendu : un glissement
 * vers le regard de l'etat, et le « non » de `failed` par-dessus. Le « non » passe par `spin`,
 * qui s'ajoute au lacet quel que soit `mix` : il secoue le regard de la pose, pas une cible.
 */
export declare function enter(from: Look, state: PlushState): GazeScript;
/**
 * Endormi : les deux yeux fermes, avec le regard tombant et l'ecart de `somnolent`, le
 * visage d'avant le sommeil. Pas au catalogue des expressions, comme les visages des
 * personnages.
 */
export declare const ASLEEP_FACE: BotExpression;
/** largeur/hauteur d'un oeil rond aplati par `failed` : juste au-dela de la bande ou une pente se perd */
export declare const FAILED_ASPECT = 1.8;
/** l'oeil le plus ouvert d'un visage (aire de la gelule), que `failed` donne aux deux yeux */
export declare const openEye: (face: BotExpression) => 0 | 1;
export declare function failedFace(base: BotExpression): BotExpression;
/** Les patins de `failed` : celui de l'oeil le plus ouvert, chacun a sa place (`dx`, `dy`). */
export declare function failedPads(pads: readonly [PlushPad, PlushPad], base: BotExpression): readonly [PlushPad, PlushPad];
/**
 * Le passage d'un patin a l'autre en entrant dans `failed` ou en en sortant : un fondu, sur
 * la duree et la courbe du changement de visage du moteur (`SHAPE_MORPH`, easeOutQuint),
 * pendant que la gelule glisse. Une photo ne se deforme pas en une autre ; sans fondu,
 * l'oeil plisse de Vita doublait de largeur d'une image a l'autre. `start` est le niveau
 * d'ou part le nouveau patin : un aller-retour en plein fondu repart de ce qu'on voit.
 */
export interface PadFade {
    from: readonly [PlushPad, PlushPad] | null;
    at: number;
    start: number;
}
export declare const NO_PAD_FADE: PadFade;
/** opacite des patins courants ; ceux de `from` ont le complement */
export declare const padFadeLevel: (fade: PadFade, t: number) => number;
export declare const padFadeToggle: (fade: PadFade, from: readonly [PlushPad, PlushPad], t: number) => PadFade;
/**
 * Agrandir les yeux (`eyeScale`) sans les pousser hors du corps ni les souder. Grandir chacun
 * autour de son centre ne va pas : le regard au repos du moteur porte les yeux contre le bord,
 * en haut a droite, et l'oeil agrandi le traverse ; et des yeux deja proches (`wide`,
 * `notify`, Fred) se touchent. C'est donc le VISAGE entier qui grandit — tailles et ecart
 * ensemble, aucun oeil ne gagne sur l'autre — autour de son point le plus exterieur : le
 * point du visage le plus loin du centre du corps, dans la direction centre -> visage. Ce
 * point reste la ou le moteur l'a pose, avec la marge que le moteur lui a laissee, et le
 * visage gagne sa taille vers l'interieur.
 *
 * `eyes` : la matrice de chaque oeil (a, b, c, d, e, f, e et f deja decales du patin) et la
 * taille de sa gelule. Rend, par oeil, le deplacement de son centre a l'ecran ; sa taille,
 * elle, est multipliee par `scale` dans son repere. Une fonction continue de l'image
 * courante (un `max` de fonctions continues), sans choix ni recherche : rien a faire
 * trembler (cf. `eyefit.ts`).
 */
export declare function faceGrowth(eyes: readonly {
    m: readonly number[];
    w: number;
    h: number;
}[], scale: number): {
    x: number;
    y: number;
}[];
/** les six nombres d'une chaine `matrix(a,b,c,d,e,f)` */
export declare const matrixOf: (transform: string) => number[];
/**
 * La frange du feutre, hors de la gelule, en petits cotes : `dehors` (30 px) sur la gelule de
 * reference (205 px de petit cote) de `tools/peluche/fit/feutre.py`. Les paupieres se posent
 * au-dela : le patin garde son bord de fibres, qui fait la douceur de la paupiere.
 */
export declare const LID_FRANGE: number;
/**
 * Douceur du bord des paupieres, au-dela de la frange, en petits cotes (CHOISI, juge a 4x sur
 * Yoshi `curieux`, `fier` et `somnolent`) : ce qui reste de l'ombre portee s'y eteint. A 0,25,
 * c'etait un halo translucide autour du patin.
 */
export declare const LID_SOFT = 0.1;
/** le bord doux en paliers : autant de gelules imbriquees (CHOISI) */
export declare const LID_BANDS = 4;
/**
 * L'ouverture s'elargit de la gelule a toute l'image (ombre portee) en `l^LID_MARGE` (CHOISI) :
 * a l'ouvert tout est visible, sans saut au debut d'un clignement, mais des que l'oeil se ferme
 * un peu, les paupieres suivent la gelule, comme le trou du moteur. A 4, la marge tenait encore
 * a mi-clignement : une gelule bien plus large que le patin, dont les arcs le coupaient presque
 * a plat, un patin rond (Fred) se fermait en carre.
 */
export declare const LID_MARGE = 8;
/** les paupieres d'un oeil qui cligne */
export interface LidMask {
    /** le centre de l'oeil (avant le decalage du patin) et l'ecrasement vertical, a l'ecran, autour de lui */
    x: number;
    y: number;
    s: number;
    /**
     * des gelules imbriquees, dans le repere du patin (sous sa correction), de la plus large a
     * l'ouverture elle-meme : demi-largeur, demi-hauteur, rayon et opacite. Peintes l'une sur
     * l'autre, elles montent par paliers egaux de 0 au bord a 1 dans l'ouverture.
     */
    bands: {
        w: number;
        h: number;
        r: number;
        alpha: number;
    }[];
}
/**
 * Le moteur ferme un oeil en l'ecrasant verticalement A L'ECRAN (`open`, compose en dernier
 * dans la matrice `L = ecrasement . L0`) : c'est la mesure pour le trou du masque plat, mais
 * ecraser une photo de feutre en fait un baton. Le patin est donc pose avec `L0` : cette
 * matrice, `L^-1 . L0`, se met SOUS celle de l'oeil et lui retire l'ecrasement. Oeil
 * ouvert, `undefined` : rien a retirer.
 */
export declare function unsquash(m: readonly number[], open: number): string | undefined;
/**
 * La gelule d'un oeil mi-clos AU REPOS (`rest` < 1 : `somnolent`, « paupieres a moitie
 * tombees »), posee sous `L0` : chacun de ses axes est raccourci de ce que l'ecrasement de
 * repos raccourcit son image a l'ecran. C'est une gelule plus courte, recomposee en morceaux
 * comme celle de toute expression, jamais une image ecrasee. Des paupieres qui la coupaient au
 * repos en laissaient un carre, les cotes droits et le haut et le bas fondus.
 */
export declare function restCapsule(m: readonly number[], open: number, rest: number, w: number, h: number): {
    w: number;
    h: number;
};
/**
 * Un patin qui cligne garde sa forme : la fourrure du corps se ferme dessus, comme des paupieres.
 * Amincir le patin en gelule faisait une autre gelule, pas un oeil qui se ferme ; c'est bon pour
 * une expression au repos (`restCapsule`), pas pour le geste.
 *
 * L'ouverture est la gelule de l'oeil, ecrasee verticalement A L'ECRAN autour de son centre,
 * comme le moteur ecrase le trou du masque plat : ses paupieres sont courbes et suivent
 * l'inclinaison de l'oeil. Une bande horizontale coupait un oeil incline (`curieux`) en
 * parallelogramme flou. L'ecrasement `s` va de 1 (`open` = `rest`, l'oeil de l'expression) a 0
 * (`open` = `blinkScale(0)`) : le moteur garde un trait a l'oeil ferme, une fente de feutre s'y
 * lisait comme un oeil ouvert. La gelule est elargie de la frange du feutre (`LID_FRANGE`) ; a
 * l'ouvert, jusqu'a couvrir toute l'image, ombre comprise, une marge qui part en `l^LID_MARGE`.
 * Bord doux sur `LID_SOFT` petit cote, au-dela. `m` : la matrice de l'oeil ; `gelule` : la demi-taille de la gelule dessinee
 * (`restCapsule`) ; `image` : la demi-etendue de ses morceaux (`padExtent`). Hors clignement,
 * `null` : pas de masque.
 */
export declare function lidMask(m: readonly number[], open: number, rest: number, gelule: {
    x: number;
    y: number;
}, image: {
    x: number;
    y: number;
}): LidMask | null;
/**
 * Le visage qu'impose un etat, ou `null` quand il laisse celui de la peluche. `base` est le
 * visage propre de la peluche (celui du personnage, `neutre` pour une forme).
 */
export declare const faceOf: (state: PlushState, base: BotExpression) => BotExpression | null;
export declare const THINK_X = 0.62;
export declare const THINK_Y = -1.3;
export declare const THINK_SCALE = 0.6;
/** emergence des points, celle de l'etat `thinking` */
export declare const EMERGE = 0.3;
/**
 * Histoire des points, datee sur l'horloge du bot. Les fondus repartent du niveau atteint,
 * et la pulsation n'est pas remise a zero tant que les points sont encore visibles : un
 * aller-retour rapide ne fait sauter ni l'opacite ni les rayons.
 */
export interface DotsTrack {
    /** origine de la pulsation */
    phase: number;
    /** entree (ou sortie) la plus recente, et la visibilite d'ou elle part */
    at: number;
    from: number;
    on: boolean;
    /** duree de la sortie : le morph de l'etat d'arrivee */
    exit: number;
}
export declare const NO_DOTS: DotsTrack;
export declare function dotsVisibility(track: DotsTrack, t: number): number;
/** Entree dans `thinking` (`on`) ou sortie vers `next`, a l'instant `t`. */
export declare function dotsToggle(track: DotsTrack, on: boolean, t: number, next: PlushState): DotsTrack;
export interface PlushDot {
    x: number;
    y: number;
    r: number;
    opacity: number;
}
/** Les trois points a l'instant `t`, en unites de rayon. Vide quand ils sont invisibles. */
export declare function thinkingDots(track: DotsTrack, t: number): PlushDot[];
/** vie d'un « z », en secondes */
export declare const Z_LIFE = 3;
export interface PlushZ {
    x: number;
    y: number;
    /** cote du « z », en unites de rayon */
    size: number;
    opacity: number;
}
/** Les « z » a l'instant `t`, en unites de rayon. Vide quand ils sont invisibles. */
export declare function sleepZs(track: DotsTrack, t: number): PlushZ[];
