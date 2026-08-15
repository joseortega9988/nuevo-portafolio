export interface Point2 {
  u: number;
  v: number;
}

/**
 * Sutherland–Hodgman clipping of a convex polygon against one half-plane.
 *
 * Keeps the side of the perpendicular bisector of (seed → neighbour) that
 * contains the seed. Clipping a square against the bisectors of every nearby
 * seed is the definition of a Voronoi cell, so this produces exact polygons
 * rather than a rasterised approximation — which is what keeps 2500 fragments
 * down to a few tens of thousands of vertices instead of hundreds of thousands.
 */
export function clipAgainstBisector(
  polygon: readonly Point2[],
  seed: Point2,
  neighbour: Point2,
): Point2[] {
  // Bisector: points p with dot(p − midpoint, direction) ≤ 0 lie on the seed's
  // side, where direction points from the seed toward the neighbour.
  const dirU = neighbour.u - seed.u;
  const dirV = neighbour.v - seed.v;
  const midU = (seed.u + neighbour.u) / 2;
  const midV = (seed.v + neighbour.v) / 2;

  const side = (p: Point2): number => (p.u - midU) * dirU + (p.v - midV) * dirV;

  const output: Point2[] = [];
  const count = polygon.length;

  for (let i = 0; i < count; i += 1) {
    const current = polygon[i];
    const next = polygon[(i + 1) % count];
    if (!current || !next) continue;

    const currentSide = side(current);
    const nextSide = side(next);
    const currentInside = currentSide <= 0;
    const nextInside = nextSide <= 0;

    if (currentInside) output.push(current);

    // Crossing the bisector: insert the intersection point.
    if (currentInside !== nextInside) {
      const t = currentSide / (currentSide - nextSide);
      output.push({
        u: current.u + (next.u - current.u) * t,
        v: current.v + (next.v - current.v) * t,
      });
    }
  }

  return output;
}
