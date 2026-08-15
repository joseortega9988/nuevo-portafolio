/**
 * Accretion disk.
 *
 * Every streak's position is derived in the vertex shader from its orbital
 * parameters and the clock, so the CPU uploads nothing per frame. The tail
 * vertex is placed where the particle *was* a fraction of a second ago, which
 * makes each streak's length proportional to its own orbital speed — the inner
 * disk draws long smears, the outer edge draws short ticks.
 */

export const diskVertexShader = /* glsl */ `
  attribute float aRadius;
  attribute float aAngle;
  attribute float aHeight;
  attribute float aTail;
  attribute float aSeed;

  uniform float uTime;
  uniform float uAngularSpeed;
  uniform float uKepler;
  uniform float uTrailSeconds;
  uniform float uLensing;
  uniform float uInnerRadius;

  varying float vRadius;
  varying float vSeed;
  varying float vApproach;

  void main() {
    // Keplerian shear: angular speed falls off with radius, so the disk winds
    // up over time instead of turning as one rigid plate.
    float omega = uAngularSpeed / pow(aRadius, uKepler);

    // The tail vertex is simply this particle a moment earlier.
    float t = uTime - aTail * uTrailSeconds;
    float theta = aAngle + omega * t;

    float x = cos(theta) * aRadius;
    float z = sin(theta) * aRadius;

    /**
     * Gravitational lensing, approximated.
     *
     * Light from the far side of the disk is bent up and over the core, so the
     * disk appears to arc above the black silhouette rather than disappearing
     * behind it. That arc is the single most recognisable feature of the image,
     * and faking it as a vertical lift — strongest directly behind the core and
     * falling off with radius — costs one term here instead of a ray marcher.
     */
    float behind = smoothstep(0.0, -1.0, -z / aRadius);
    float closeness = uInnerRadius / max(aRadius, 0.0001);
    float lift = uLensing * behind * closeness * closeness;

    vec3 position = vec3(x, aHeight + lift, z);

    vRadius = aRadius;
    vSeed = aSeed;
    // +1 where the orbit carries the particle toward the camera, -1 away.
    // Drives the beaming term in the fragment stage.
    vApproach = -cos(theta);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const diskFragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uCore;
  uniform vec3 uAmber;
  uniform vec3 uMagenta;
  uniform vec3 uViolet;
  uniform vec3 uCyan;
  uniform vec3 uSpring;

  uniform float uInner;
  uniform float uOuter;
  uniform float uBeamStrength;
  uniform float uBeamAngle;
  uniform float uOpacity;

  varying float vRadius;
  varying float vSeed;
  varying float vApproach;

  void main() {
    // Temperature by radius: white-hot at the inner edge, cooling out through
    // amber and magenta into violet and cyan at the rim.
    float t = clamp((vRadius - uInner) / (uOuter - uInner), 0.0, 1.0);

    vec3 colour = mix(uCore, uAmber, smoothstep(0.00, 0.16, t));
    colour = mix(colour, uMagenta, smoothstep(0.16, 0.40, t));
    colour = mix(colour, uViolet, smoothstep(0.40, 0.66, t));
    colour = mix(colour, uCyan, smoothstep(0.66, 0.88, t));
    colour = mix(colour, uSpring, smoothstep(0.88, 1.00, t) * 0.5);

    // Relativistic beaming. The approaching side is dramatically brighter and
    // shifts toward the core colour; the receding side falls away. Without
    // this the disk reads as a flat ring of confetti.
    float approach = vApproach * cos(uBeamAngle) ;
    float beam = 0.5 + 0.5 * approach;
    float gain = mix(1.0 - uBeamStrength, 1.0 + uBeamStrength, beam);
    // Only the very hottest part of the bright side washes toward white.
    // Pushing this further turned the whole approaching half into a grey
    // smear and threw away the colour ramp that makes the disk worth looking
    // at in the first place.
    colour = mix(colour, uCore, pow(beam, 6.0) * 0.4);

    // Per-streak variation so the disk grains rather than banding.
    float jitter = 0.55 + 0.45 * fract(vSeed * 43.13);
    // The inner edge is intrinsically brighter regardless of which side it is.
    float inner = mix(1.7, 0.5, smoothstep(0.0, 0.6, t));

    float brightness = gain * jitter * inner * uOpacity;

    gl_FragColor = vec4(colour * brightness, 1.0);
  }
`;

/** The dark core, plus the thin ring of light bent around it. */
export const horizonVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const horizonFragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uCore;
  uniform float uHorizon;
  uniform float uRing;
  uniform float uOpacity;

  varying vec2 vUv;

  void main() {
    vec2 centred = vUv * 2.0 - 1.0;
    float r = length(centred);
    if (r > 1.0) discard;

    // Inside the horizon: genuinely black, and opaque so the far side of the
    // disk is occluded rather than showing through.
    if (r < uHorizon) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }

    // The photon ring: a narrow, very bright band just outside the horizon.
    float ring = smoothstep(uRing, uHorizon, r) * smoothstep(uHorizon - 0.02, uHorizon, r);
    float glow = exp(-(r - uHorizon) * 26.0);

    float alpha = clamp(ring + glow * 0.85, 0.0, 1.0) * uOpacity;
    gl_FragColor = vec4(uCore * (ring * 2.2 + glow * 1.4), alpha);
  }
`;
