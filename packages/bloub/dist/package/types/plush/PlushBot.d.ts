import type { JSX } from '@solidjs/web';
import { type BotExpression, type ExpressionId } from '../bot/expressions.js';
import { type PlushCharacterId, type PlushShapeId, type PlushState } from './catalogue.js';
import { type PlushTransition } from './transition.js';
export interface PlushBotProps {
    /** un des six personnages : corps, couleur, yeux et visage cuits. Prioritaire sur `shape`. */
    character?: PlushCharacterId;
    /** une forme grise, teinte en `color` */
    shape?: PlushShapeId;
    /** un id du personnaliseur ou `#rrggbb` ; ignore pour un personnage */
    color?: string;
    /**
     * `asleep` et `failed` imposent leur visage (yeux fermes ; la pose et l'inclinaison de
     * `triste` sur l'oeil le plus ouvert de la peluche, cf. `failedFace`), comme `wink` et
     * `wide` le leur : `expression` n'y compte pas.
     */
    state?: PlushState;
    /**
     * Le visage au repos : un id du catalogue ou une expression complete. Sans lui, un
     * personnage garde le sien et une forme prend `neutre`. Il glisse vers le nouveau
     * visage avec la duree des morphs du moteur.
     */
    expression?: ExpressionId | BotExpression;
    /**
     * Comment le corps change (forme, personnage ou couleur) : `flip` par defaut, `pop`,
     * `warp`, `dissolve` ou `cut`. Les yeux suivent le corps. Cf. `transition.ts`.
     */
    transition?: PlushTransition;
    /**
     * Agrandit le visage : un avatar de 24 a 40 px lit mieux son regard avec des yeux plus
     * grands que ceux de la capture, comme un caractere en petit corps a une graisse a lui.
     * Les yeux ET leur ecart grandissent, depuis le bord exterieur du visage (`faceGrowth`) :
     * agrandis sur place, ils passaient a travers le bord des formes etroites. CHOISI, 1 par
     * defaut (le visage ajuste, rendu identique) ; le moteur ne change pas. `wide` deborde deja
     * des corps courts a 1, et davantage au-dela.
     */
    eyeScale?: number;
    size?: number;
    fps?: number;
    autoPause?: boolean;
    /**
     * Arrete la peluche sur la pose a l'ecran, apres la transition en cours, et la reprend de
     * la meme pose : rien ne saute. Pour un avatar qui ne bouge qu'au survol, c'est elle, pas
     * `frozenAt` (cf. `paused` de `BloubBot`).
     */
    paused?: boolean;
    frozenAt?: number;
    follow?: boolean;
    initialPhase?: number;
    /**
     * Ou trouver les images si le bundler ne les a pas emises avec le paquet (un CDN, un
     * dossier `public/`). Un prefixe d'URL : `${assetBase}${fichier}`.
     */
    assetBase?: string;
    ariaLabel?: string;
    class?: string;
    style?: JSX.CSSProperties | string;
}
/**
 * Une peluche : `BloubBot` avec le rendu de feutre branche dans `layer`. Le moteur, les
 * yeux, le clignement et les transitions sont les siens ; cette enveloppe ne fait que
 * traduire les props et dater l'entree dans `thinking`.
 */
export default function PlushBot(props: PlushBotProps): JSX.Element;
