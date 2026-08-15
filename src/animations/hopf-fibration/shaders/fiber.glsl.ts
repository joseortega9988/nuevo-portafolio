/**
 * Fibre shader.
 *
 * Colour comes from which ring of base points a fibre lifted from, so the
 * nested tori read as distinct bands — magenta on the inner rings, cyan
 * through the middle, violet toward the outside, matching the reference frame.
 */

export const fiberVertexShader = /* glsl */ `
  attribute float aPhase;
  attribute float aBand;

  varying float vPhase;
  varying float vBand;
  varying float vDepth;

  void main() {
    vPhase = aPhase;
    vBand = aBand;

    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vDepth = -viewPosition.z;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

export const fiberFragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uMagenta;
  uniform vec3 uCyan;
  uniform vec3 uViolet;
  uniform vec3 uCore;

  uniform float uTime;
  uniform float uPulse;
  uniform float uPulseSpeed;

  varying float vPhase;
  varying float vBand;
  varying float vDepth;

  void main() {
    vec3 colour = mix(uMagenta, uCyan, smoothstep(0.0, 0.55, vBand));
    colour = mix(colour, uViolet, smoothstep(0.55, 1.0, vBand));

    // A pulse chasing around each fibre. Offsetting by the band keeps the
    // rings from flashing in unison, which would read as a strobe.
    float wave = fract(vPhase * uPulse - uTime * uPulseSpeed + vBand * 0.37);
    float head = smoothstep(0.90, 1.0, wave);

    colour = mix(colour, uCore, head * 0.7);

    // Additive blending does not depth-sort, so far arcs are faded manually
    // to keep the centre of the frame from washing out.
    float depthFade = 1.0 - smoothstep(4.0, 12.0, vDepth);
    float brightness = (0.30 + head * 1.9) * depthFade;

    gl_FragColor = vec4(colour * brightness, 1.0);
  }
`;
