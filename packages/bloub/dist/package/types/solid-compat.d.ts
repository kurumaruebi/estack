import { type Accessor } from 'solid-js';
type OnOptions = {
    defer?: boolean;
};
type Accessors<T extends readonly unknown[]> = {
    [K in keyof T]: Accessor<T[K]>;
};
export declare function on<T, U = void>(dependencies: Accessor<T>, effect: (input: T, previousInput: T | undefined, previousValue: U | undefined) => U, options?: OnOptions): void;
export declare function on<T extends readonly unknown[], U = void>(dependencies: Accessors<T>, effect: (input: T, previousInput: T | undefined, previousValue: U | undefined) => U, options?: OnOptions): void;
export declare function onMount(effect: () => void | (() => void)): void;
/**
 * La derniere valeur non nulle de la condition d'un `Show`. Pendant une transition, Solid garde
 * l'ancien enfant en vie jusqu'a la validation, et ses effets relisent la valeur, qui est deja
 * `null`. Lire un champ dessus levait une TypeError et figeait toute la reactivite.
 *
 * Passer la SOURCE de la condition, jamais l'accesseur que `Show` donne a son enfant : depuis
 * Solid 2.0.0, relire cet accesseur pendant que l'enfant est garde leve « Stale read from <Show> »,
 * que la page attrape comme une erreur.
 */
export declare function held<T>(source: Accessor<T | null | undefined | false>): Accessor<T>;
export {};
