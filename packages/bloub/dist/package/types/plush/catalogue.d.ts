import type { BotExpression } from '../bot/expressions.js';
import type { ShapeId } from '../bot/skins.js';
export type PlushCharacterId = 'nexo' | 'vita' | 'cloe' | 'malu' | 'yoshi' | 'fred';
/** Les formes qui ont un corps gris : toutes celles du personnaliseur. */
export type PlushShapeId = Extract<ShapeId, 'cercle' | 'galet' | 'squircle' | 'capsule' | 'triangle' | 'hexagone' | 'nuage' | 'goutte' | 'carre' | 'losange' | 'pentagone'>;
export declare const PLUSH_SHAPES: readonly PlushShapeId[];
/**
 * Les etats d'une peluche : ceux qui GARDENT le corps. Une peluche ne devient pas un point
 * d'exclamation. `thinking` n'est pas l'etat du moteur (il reduit le corps a un point) :
 * la peluche reste au repos, leve les yeux, et trois boules de feutre pulsent a cote.
 *
 * `asleep` et `failed` n'existent que chez la peluche, et rien n'y est releve : ce sont
 * des visages CHOISIS, poses sur l'etat `idle` du moteur (cf. `motion.ts`). `asleep` n'est
 * pas `sleep`, le point qui rebondit dans la video.
 */
export type PlushState = 'idle' | 'wink' | 'wide' | 'thinking' | 'notify' | 'asleep' | 'failed';
export declare const PLUSH_STATES: readonly PlushState[];
/**
 * Un patin d'oeil, en feutre (`tools/peluche/fit/matiere.py`) : cuit en deux gelules, couchee et
 * debout, faites de la gelule de l'oeil sur lequel il a ete ajuste. Sur une gelule, il est
 * recompose de leurs morceaux a l'echelle de son petit cote (`slices.ts`), jamais etire ; le clin d'oeil,
 * lui, l'ecrase a l'ecran. `dx`, `dy` le decalent a l'ecran, en unites de rayon (le recalage de
 * `ajuste-yeux.py`).
 */
export interface PlushPad {
    /** son identite (`padFade`, `failed`) : l'image couchee */
    file: string;
    /** la gelule couchee et la gelule debout (`slices.ts`) */
    images: {
        x: string;
        y: string;
    };
    /** le petit cote de la gelule ajustee, en unites de rayon */
    court: number;
    /** le patin rond (la gelule sans partie droite) mesure `kw` x `kh` fois ce petit cote */
    kw: number;
    kh: number;
    dx: number;
    dy: number;
}
export interface PlushCharacter {
    id: PlushCharacterId;
    /** la forme du moteur sous l'image : c'est elle qui place les yeux */
    shape: ShapeId;
    /** la couleur relevee sur la capture (mediane du haut du corps, hors yeux) */
    ink: string;
    body: string;
    pads: [PlushPad, PlushPad];
    face: BotExpression;
}
export declare const PLUSH_CHARACTERS: readonly PlushCharacter[];
export declare const PLUSH_CHARACTER_BY_ID: Map<PlushCharacterId, PlushCharacter>;
export declare const GENERIC_PAD: PlushPad;
/** Corps gris d'une forme, et la boule de feutre (points de reflexion, pastille). */
export declare const shapeBody: (shape: PlushShapeId) => string;
export declare const BALL = "boule.webp";
