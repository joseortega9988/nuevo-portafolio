/**
 * Shattered-torus shader.
 *
 * The vertex stage hinges each fragment away from the shell under the cursor;
 * the fragment stage draws the barycentric wireframe that is revealed as the
 * shell opens.
 */

export const shellVertexShader = /* glsl */ `
  attribute vec3 aCenter;
  attribute vec3 aAxis;
  attribute float aSeed;

  uniform vec2  uCursor;        // normalised device coordinates
  uniform float uCursorRadius;
  uniform float uMaxLift;
  uniform float uMaxAngle;
  uniform float uDissolve;      // 0 → intact, 1 → fully scattered
  uniform float uDissolveDistance;

  varying vec3  vBary;
  varying vec3  vNormalW;
  varying float vLift;

  attribute vec3 aBarycentric;

  /** Rodrigues' rotation of v about a unit axis. */
  vec3 rotateAxis(vec3 v, vec3 axis, float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return v * c + cross(axis, v) * s + axis * dot(axis, v) * (1.0 - c);
  }

  void main() {
    // Where this fragment's centre lands on screen, so proximity is measured
    // in the space the cursor actually lives in — independent of how the torus
    // happens to be rotated.
    vec4 centreClip = projectionMatrix * modelViewMatrix * vec4(aCenter, 1.0);
    vec2 centreNdc = centreClip.xy / max(centreClip.w, 0.0001);

    float distance = length(centreNdc - uCursor);
    float proximity = 1.0 - smoothstep(0.0, uCursorRadius, distance);
    // Fragments facing away should not react; otherwise the far side of the
    // torus opens in sympathy with the near side.
    proximity *= step(0.0, centreClip.w);

    float lift = proximity * uMaxLift;
    float angle = proximity * uMaxAngle * (aSeed * 1.6 - 0.8);

    vec3 local = position - aCenter;
    vec3 rotated = rotateAxis(local, normalize(aAxis), angle);
    vec3 displaced = aCenter + rotated + normal * lift;

    // Dissolve: fragments scatter outward along their own axis, staggered by
    // their seed so the shell comes apart unevenly rather than as one shell.
    float stagger = clamp((uDissolve - aSeed * 0.35) / 0.65, 0.0, 1.0);
    displaced += normalize(aAxis + normal) * stagger * uDissolveDistance;
    displaced = aCenter + rotateAxis(displaced - aCenter, normalize(aAxis), stagger * 2.4);

    vBary = aBarycentric;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vLift = proximity;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

export const shellFragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uSurface;
  uniform vec3 uEdge;
  uniform vec3 uRim;
  uniform float uOpacity;

  varying vec3  vBary;
  varying vec3  vNormalW;
  varying float vLift;

  void main() {
    // Barycentric wireframe: the distance to the nearest triangle edge is just
    // the smallest barycentric coordinate. fwidth keeps the line one pixel wide
    // at any depth, which no geometry-based wireframe can do.
    vec3 width = fwidth(vBary);
    vec3 edges = smoothstep(vec3(0.0), width * 1.6, vBary);
    float edge = 1.0 - min(min(edges.x, edges.y), edges.z);

    // Cheap PBR-ish shading: one key direction plus a rim term.
    vec3 normal = normalize(vNormalW);
    float key = clamp(dot(normal, normalize(vec3(0.4, 0.8, 0.6))), 0.0, 1.0);
    float rim = pow(1.0 - abs(normal.z), 2.6);

    vec3 colour = uSurface * (0.28 + key * 0.55);
    colour += uRim * rim * 0.7;
    // The interior glow strengthens as a fragment lifts — that is what makes
    // the shell look lit from within rather than merely open.
    colour += uEdge * edge * (0.55 + vLift * 1.9);

    if (uOpacity <= 0.001) discard;
    gl_FragColor = vec4(colour, uOpacity);
  }
`;
