import type { BotLayerContext } from '../components/BloubBot.js';
import { type PlushPassage } from './body.js';
import type { PlushPad } from './catalogue.js';
import { type DotsTrack, type PadFade } from './motion.js';
import { type PlushTransition, type Rendu } from './transition.js';
export interface PlushLayerProps {
    context: BotLayerContext;
    /** le corps, ou le passage d'un corps a l'autre ; une image nulle n'est pas encore prete */
    passage: PlushPassage;
    transition: PlushTransition;
    /** un bot fige n'a pas d'horloge qui avance : il montre le nouveau corps, au repos */
    frozen?: boolean;
    /** l'etape de la transition, a chaque changement : le moteur suit `bascule` */
    onStep?: (step: Pick<Rendu, 'bascule' | 'fini'>) => void;
    size?: number;
    pads: readonly [PlushPad, PlushPad];
    /** l'echelle des yeux, dans le repere de l'oeil (cf. `eyeScale` de `PlushBot`) */
    eyeScale?: number;
    /** les patins d'avant, en fondu sous les courants (entree et sortie de `failed`) */
    padFade?: PadFade;
    padHref: (file: string) => string;
    /** la boule teinte a la couleur du bot (points de reflexion) et au bleu de la pastille */
    dot: string | null;
    notif: string | null;
    dots: DotsTrack;
    /** les « z » de `asleep` */
    zs: DotsTrack;
}
/**
 * Le rendu peluche, branche dans `BloubBot` par `layer`. Le corps est une image FIXE :
 * il ne respire pas, ne se deforme pas. Seuls les yeux bougent, poses par les matrices
 * du moteur — c'est la peluche qui a ete validee, celle « qui ne bouge que des yeux ».
 * La seule exception est le changement de corps (`transition.ts`), qui emporte les yeux
 * avec lui.
 */
export default function PlushLayer(props: PlushLayerProps): import("@solidjs/web").JSX.Element;
