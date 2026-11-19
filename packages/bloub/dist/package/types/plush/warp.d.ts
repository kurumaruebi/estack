export interface Warp {
    /** charge les deux corps ; la promesse se resout quand ils sont prets */
    corps(avant: string, apres: string): Promise<void>;
    dessine(ra: readonly number[], rb: readonly number[], rc: readonly number[], melange: number): void;
    detruit(): void;
}
/** `null` sans WebGL 2 : la peluche retombe alors sur `cut`. */
export declare function creeWarp(canvas: HTMLCanvasElement): Warp | null;
/** le canvas couvre le viewBox du bot : `DEMI_VIEWBOX` de chaque cote du centre */
export declare const COTE_VIEWBOX: number;
