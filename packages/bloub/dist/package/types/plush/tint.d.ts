/** la mediane de l'interieur d'un corps gris (`GRIS_CIBLE` de `forme.py`) */
export declare const GRIS = 0.55;
/**
 * Courbe de la teinte, ajustee (`tools/peluche/mesure/teinte.py`) sur les quantiles des
 * corps cuits de Nexo, Malu, Yoshi, Vita et Fred, chaque forme grise teinte de l'encre du
 * personnage : ecart moyen par canal 14,3 sur 255, contre 18,8 pour la courbe d'avant.
 * `gamma` creuse les ombres, `sheen` blanchit les fibres au-dessus de la mediane.
 * La mediane reste la couleur demandee : un facteur d'exposition gagnait encore un peu,
 * mais seulement parce que le corps cuit de Malu est plus sombre que son encre, ce qui
 * tient a sa generation et pas a la matiere (celui de Yoshi est plus clair que la sienne).
 */
export declare const TINT: {
    gamma: number;
    sheen: number;
};
export declare function parseHex(hex: string): [number, number, number];
/**
 * La table : pour chaque gris 0..255, la couleur RGB 0..255. Pure, donc testable, et
 * c'est elle qu'on etalonne. En lumiere lineaire : la couleur, multipliee par l'ecart de
 * luminance a la mediane (puissance `gamma`), puis melangee vers le blanc au-dessus.
 */
export declare function tintRamp(hex: string, { gamma, sheen }?: {
    gamma: number;
    sheen: number;
}): Uint8ClampedArray;
/** L'URL `data:` du corps `url` teint en `hex`, calculee une fois. Navigateur seulement. */
export declare function tinted(url: string, hex: string): Promise<string>;
