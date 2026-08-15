/**
 * A procedural sea rendered in screen space, driven by scroll rather than time.
 *
 * `uPhase` is the section's normalised scroll progress, and every visual —
 * sun height, sky gradient, fog density, specular colour — is a function of it.
 * The phase stops are fixed by the brief: 0 sunrise, 0.30 midday, 0.60 dusk,
 * 1.00 full darkness. Because the final multiply reaches exactly zero at
 * uPhase = 1, the section ends on true black and hands off to the starfield
 * below without a seam.
 */

export const seaVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    // Full-screen triangle-style quad: the geometry is already in clip space,
    // so the camera never enters into it.
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const seaFragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uAmber;
  uniform vec3 uCyan;
  uniform vec3 uCore;
  uniform vec3 uMagenta;
  uniform vec3 uViolet;
  uniform vec3 uVoid;
  uniform vec3 uDeep;

  uniform float uPhase;
  uniform float uTime;
  uniform float uAspect;
  uniform int   uOctaves;

  varying vec2 vUv;

  const float PI = 3.14159265;
  const int MAX_OCTAVES = 5;
  const float HORIZON = 0.46;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  // Value noise. Cheaper than gradient noise and, once summed into the wave
  // field below, indistinguishable at this scale.
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  /**
   * Summed sines with a noise-warped domain. The loop bound must be a
   * constant in GLSL ES 1.0, so the octave count arrives as a uniform and
   * breaks out early — that is what "halve the octaves on mobile" does.
   */
  float waveHeight(vec2 p) {
    float height = 0.0;
    float amplitude = 0.55;
    float frequency = 1.0;

    for (int i = 0; i < MAX_OCTAVES; i++) {
      if (i >= uOctaves) break;
      float phase = uTime * (0.35 + float(i) * 0.11);
      vec2 q = p * frequency;
      // Warping the domain by noise is what stops the sum reading as a
      // regular corrugation.
      q += noise(q * 0.5 + phase * 0.2) * 0.6;
      height += sin(q.x * 1.7 + phase) * cos(q.y * 1.3 - phase * 0.7) * amplitude;
      amplitude *= 0.48;
      frequency *= 2.05;
    }
    return height;
  }

  /** Blends four palette stops across the fixed phase schedule. */
  vec3 phaseMix(vec3 dawn, vec3 midday, vec3 dusk, vec3 night) {
    vec3 colour = mix(dawn, midday, smoothstep(0.0, 0.30, uPhase));
    colour = mix(colour, dusk, smoothstep(0.30, 0.60, uPhase));
    colour = mix(colour, night, smoothstep(0.60, 1.0, uPhase));
    return colour;
  }

  void main() {
    vec2 uv = vUv;
    vec2 aspectUv = vec2((uv.x - 0.5) * uAspect, uv.y);

    // The light rises to its peak at the midday stop, not at the midpoint of
    // the scroll — hence the piecewise remap before the sine.
    float arc = uPhase < 0.30
      ? (uPhase / 0.30) * 0.5
      : 0.5 + ((uPhase - 0.30) / 0.70) * 0.5;
    float lightY = sin(arc * PI) * 0.46 + HORIZON - 0.06;
    float lightX = mix(-0.42, 0.42, uPhase) * uAspect;
    vec2 light = vec2(lightX, lightY);

    vec3 lightColour = phaseMix(uAmber, uCore, uMagenta, uViolet);
    vec3 skyHigh = phaseMix(uViolet, uCyan, uViolet, uVoid);
    vec3 skyLow  = phaseMix(uAmber, uCore, uMagenta, uDeep);
    vec3 seaBase = phaseMix(uAmber, uCyan, uViolet, uVoid);

    vec3 colour;

    if (uv.y > HORIZON) {
      // ── sky ──
      float t = (uv.y - HORIZON) / (1.0 - HORIZON);
      colour = mix(skyLow, skyHigh, pow(t, 0.75));

      // The disc, plus a wide bloom around it that does the atmospheric work.
      float d = length(aspectUv - light);
      colour += lightColour * exp(-d * 26.0) * 1.4;
      colour += lightColour * exp(-d * 4.5) * 0.30;
    } else {
      // ── sea ──
      // Fake perspective: distance grows without bound toward the horizon, so
      // wave detail compresses exactly the way a real sea does.
      float below = HORIZON - uv.y;
      float distance = 0.075 / max(below, 0.0016);
      vec2 seaPos = vec2(aspectUv.x * distance * 1.6, distance);

      float height = waveHeight(seaPos);
      // Finite difference for a cheap normal — full derivatives are not worth
      // it when the surface is only ever seen at a grazing angle.
      float dx = waveHeight(seaPos + vec2(0.06, 0.0)) - height;
      float dy = waveHeight(seaPos + vec2(0.0, 0.06)) - height;
      vec3 normal = normalize(vec3(-dx, 0.35, -dy));

      colour = seaBase * (0.30 + height * 0.16);

      // Specular, concentrated into a glitter path under the light rather
      // than a single highlight.
      vec3 toLight = normalize(vec3(light.x - aspectUv.x, 0.45, 1.0));
      float specular = pow(max(dot(normal, toLight), 0.0), 22.0);
      float path = exp(-abs(aspectUv.x - light.x) * 3.2);
      colour += lightColour * specular * path * 2.2;

      // Haze thickens toward the horizon line.
      float fog = exp(-below * 7.0);
      colour = mix(colour, skyLow, fog * 0.85);
    }

    // Vignette, so the copy layered over the centre keeps its contrast.
    float vignette = 1.0 - length(uv - 0.5) * 0.55;
    colour *= vignette;

    // The descent into night. Reaching literally zero at uPhase = 1 is what
    // makes the handoff to the next section seamless.
    colour *= 1.0 - smoothstep(0.80, 1.0, uPhase);

    gl_FragColor = vec4(colour, 1.0);
  }
`;
