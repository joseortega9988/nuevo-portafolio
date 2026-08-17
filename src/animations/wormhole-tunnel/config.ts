/** Wormhole tunnel geometry and motion tuning. */
export const TUNNEL_CONFIG = {
  /** Boxes per ring. Mobile drops density first — a ring still reads as a
   *  ring at lower counts, unlike the row axis below. */
  columns: { high: 64, medium: 44, low: 28 },
  /** Rings from the vanishing point (row 0) out to the boxes that shear away
   *  and fall near the viewer. Fixed across tiers: thinning this axis breaks
   *  the spiral's compounding radius and the tunnel reads as flat rings. */
  rows: 18,
  /** Two concentric box rings per row/column cell, offset in the fall term —
   *  what keeps the falling debris from reading as a single flat sheet. */
  layers: 2,

  /** Radius of a freshly-spawned ring, before any compounding. */
  baseRadius: 3,
  /** Half-width of the frame drawn on each box face, in UV units. */
  edgeWidth: 0.09,

  /** Multiplies uTime's advance. Slower than a 1:1 clock reads calmer behind
   *  a footer that sits on screen for a while rather than a hero moment. */
  speed: 0.055,
  /**
   * Orbit of the whole tunnel about its own axis, radians/second.
   *
   * This is the reference pen's `scene.rotation.y = -t/10000`, i.e. 0.1 rad/s,
   * and it is what actually sells the depth: seen from above, the funnel
   * turning under a fixed camera reads as the camera circling it, and the
   * parallax between the near rings and the far ones is the only cue in the
   * scene that separates them.
   *
   * Deliberately NOT tied to `speed` above. It was scaled down alongside it
   * when the forward travel was slowed, which took the orbit to ~1/18th of
   * the reference and flattened the whole thing out. Held a little under the
   * pen's figure so it stays calm behind a footer, while the parallax is
   * clearly readable again.
   */
  rotationSpeed: 0.031,

  camera: {
    fov: 50,
    /**
     * High and pulled back, aimed down into the mouth of the funnel — the
     * reference framing, and the one thing the earlier attempts were all
     * missing.
     *
     * Every previous position looked straight ahead, because nothing set a
     * `target`: a camera with no aim stares down -Z regardless of how high it
     * sits. That is what put the ring plane's horizon across the frame and
     * left the empty band above it. Seen from above and aimed at the centre,
     * the funnel's own walls wrap the whole frame, so there is no horizon to
     * leave a gap in the first place.
     *
     * Closer than the reference pen's 6,6. A desktop footer is wide, so at
     * that distance the rings stacked up into a dense mesh with far too many
     * of them on screen at once; moving in crops the view to the first rings
     * of the funnel, which is what keeps it reading as a tunnel rather than
     * as texture. The whole vector is scaled so only distance changes and the
     * viewing angle is preserved.
     */
    position: [0, 4.2, 4.2] as const,
    /**
     * A phone's frustum is tall and narrow, so the frame framed for a wide
     * screen arrived cropped — the tunnel filled edge to edge with no void
     * around it. Pulled back rather than widening the fov, which would have
     * bent the boxes near the edges instead of just showing more of them.
     */
    positionNarrow: [0, 7.6, 7.6] as const,
    /** What the camera aims at. Without this the aim is undefined and the
     *  camera simply looks along -Z — see the note on `position`. */
    target: [0, 0, 1] as const,
    near: 0.1,
    far: 60,
  },

} as const;
