/**
 * The luminous disk the funnel stands on: a white-blue core, rings breathing
 * outward, and slow rays sweeping around it.
 */

export const baseDiskVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const baseDiskFragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uSpring;
  uniform vec3 uCore;
  uniform float uTime;
  uniform float uRings;
  uniform float uIntensity;

  varying vec2 vUv;

  void main() {
    vec2 centred = vUv * 2.0 - 1.0;
    float radius = length(centred);
    if (radius > 1.0) discard;

    float angle = atan(centred.y, centred.x);

    // Core: a tight exponential falloff is what makes it read as emissive
    // rather than as a flat lit disc.
    float core = exp(-radius * 6.5);

    // Rings travel outward; the radius factor keeps them from crowding the
    // centre where the core already dominates.
    float rings = sin(radius * uRings * 6.2831 - uTime * 1.3) * 0.5 + 0.5;
    rings *= smoothstep(0.05, 0.45, radius) * (1.0 - radius) * 0.55;

    // Rays: a low-frequency sweep, deliberately soft so it suggests rotation
    // without reading as a spoked wheel.
    float rays = pow(sin(angle * 9.0 + uTime * 0.35) * 0.5 + 0.5, 3.0);
    rays *= smoothstep(0.15, 0.9, radius) * (1.0 - radius) * 0.4;

    float edgeFade = 1.0 - smoothstep(0.7, 1.0, radius);
    float glow = (core * 1.5 + rings + rays) * edgeFade * uIntensity;

    vec3 colour = mix(uSpring, uCore, clamp(core * 1.8, 0.0, 1.0));
    gl_FragColor = vec4(colour * glow, 1.0);
  }
`;
