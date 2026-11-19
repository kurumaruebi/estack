import { type Accessor } from 'solid-js';
import { type JSX } from '@solidjs/web';
import { type BotFrame } from '../bot/engine.js';
import { type GazeScript } from '../ui/gaze.js';
import { type BotExpression } from '../bot/expressions.js';
import { type Block } from '../bot/cycles.js';
import { type StateId } from '../bot/states.js';
export interface BloubBotRef {
    readonly svg: SVGSVGElement;
    seek(index: number, offset?: number): void;
    renderAt(seconds: number): void;
}
/**
 * Ce que le composant passe a un rendu de remplacement du corps (`layer`).
 *
 * `frame` est l'image courante du moteur ; `time` l'instant ou elle a ete echantillonnee,
 * et `clock` l'horloge du bot MAINTENANT — c'est sur elle que le composant date ses
 * changements d'etat (`engine.setState(id, clock)`), donc un rendu qui date les siens
 * pareil reste dans le meme temps que le moteur, fige ou pas.
 *
 * `hold` est la seule chose qu'un rendu dit au composant : « j'ai une transition qui court
 * encore tant de secondes ». Un bot en pause (`paused`) ne s'arrete pas avant ; sans elle,
 * il s'arreterait des que le moteur est au repos et figerait la transition du rendu.
 */
export interface BotLayerContext {
    frame: Accessor<BotFrame>;
    time: () => number;
    clock: () => number;
    hold: (seconds: number) => void;
    ink: Accessor<string>;
    uid: string;
}
export interface BloubBotProps {
    size?: number;
    shape?: string;
    /** un id du personnalisateur, ou une couleur `#rrggbb` donnee telle quelle */
    color?: string;
    /** un id du catalogue, ou une expression complete (un visage qui n'est pas au catalogue) */
    expression?: string | BotExpression;
    paper?: string;
    ariaLabel?: string;
    frozenAt?: number;
    cycle?: Block[];
    follow?: boolean;
    gaze?: GazeScript | null;
    block?: number;
    state?: StateId;
    playing?: boolean;
    elapsed?: number;
    /**
     * Cadence maximale de rendu, en images par seconde. Sans elle le bot dessine a
     * la cadence de l'ecran : sur un 120 Hz c'est deux fois le travail d'un 60 Hz
     * pour la meme animation. Le rendu tombe sur le plus grand diviseur de la
     * cadence de l'ecran qui ne depasse pas `fps`, donc l'intervalle reste
     * regulier — un bot bride a 30 sur un ecran a 75 Hz dessine a 25.
     */
    fps?: number;
    /**
     * Suspend la boucle quand personne ne peut voir le bot : onglet en arriere-plan,
     * element sorti du viewport, ancetre `display: none`. L'horloge s'arrete avec
     * elle, donc l'animation reprend sur la pose qu'elle avait — elle ne saute pas.
     * A mettre a `false` seulement si le SVG est lu hors ecran par autre chose que
     * `renderAt` (l'export, lui, passe par `frozenAt` et n'a jamais de boucle).
     */
    autoPause?: boolean;
    /**
     * Arrete le bot sans le figer : l'horloge s'arrete sur la pose a l'ecran, et la reprise
     * repart de la meme, donc rien ne saute ni a l'arret ni au depart. L'arret attend que le
     * bot soit au repos — pas de fondu, de morph ou de clignement en cours, pas de transition
     * du `layer` — et un changement de prop pendant la pause se joue jusqu'au bout avant de
     * s'arreter a nouveau. C'est ce qu'il faut a un avatar qui ne bouge qu'au survol :
     * `frozenAt`, lui, dessine une DATE, et passer de l'un a l'autre ferait sauter la pose.
     * Un bot qui suit le pointeur (`follow`) ne s'arrete pas.
     */
    paused?: boolean;
    /**
     * Date de depart du bot dans son montage, en secondes. Lue une fois, au montage :
     * l'horloge, le bloc et la pose partent de cette date, donc plusieurs bots montes
     * ensemble ne respirent pas a l'unisson. Ignoree par un bot fige (`frozenAt`).
     */
    initialPhase?: number;
    /**
     * Rendu de remplacement du corps, des points et de la pastille : le moteur tourne
     * pareil, seul le dessin change. C'est ce que `@estack/bloub/plush` branche
     * ici ; le code du rendu reste dans son entree, hors du bundle principal.
     */
    layer?: (context: BotLayerContext) => JSX.Element;
    onBlockChange?: (value: number) => void;
    onStateChange?: (value: StateId) => void;
    onPlayingChange?: (value: boolean) => void;
    onElapsedChange?: (value: number) => void;
    ref?: (value: BloubBotRef) => void;
    class?: string;
    style?: JSX.CSSProperties | string;
}
export default function BloubBot(rawProps: BloubBotProps): JSX.Element;
