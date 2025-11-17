declare module '@noble/curves/abstract/edwards' {
  /**
   * Backwards-compatibility stub for packages that expect the legacy CurveFn type.
   * The upstream library removed this export in v2, but some dependent typings still reference it.
   * We expose a loose alias so TypeScript can compile those declarations without downgrading the library.
   */
  export type CurveFn = unknown;
}

