import { type Accessor } from 'solid-js';
import { type PlushTransition, type Rendu } from './transition.js';
/** un corps de passage : l'image (deja teinte) et le contour que le moteur lui donne */
export interface PlushBodyView {
    url: string | null;
    radii: readonly number[];
}
/** un changement de corps, date sur l'horloge du bot */
export interface PlushPassage {
    avant: PlushBodyView;
    apres: PlushBodyView;
    debut: number;
}
export interface PlushBodyProps {
    passage: PlushPassage;
    transition: PlushTransition;
    rendu: Accessor<Rendu>;
    /** l'instant du bot, pour les rayons du `warp` */
    clock: () => number;
    /** cote du bot en px, pour la resolution du canvas du `warp` */
    size?: number;
}
/**
 * Le corps de la peluche, au repos ou en transition. Au repos, une seule `<image>` ; le
 * canvas du `warp` et les filtres du `dissolve` ne sont montes que pendant le passage,
 * pour qu'une peluche immobile ne coute rien de plus qu'avant.
 */
export default function PlushBody(props: PlushBodyProps): import("@solidjs/web").JSX.Element;
