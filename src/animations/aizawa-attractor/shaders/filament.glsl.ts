/**
 * Filament shader for the Aizawa attractor.
 *
 * Colour is a function of height, not of trajectory index: that is what makes
 * the funnel read as one continuous object shading from spring green at the
 * base disk up through amber and violet to magenta at the crown, exactly as in
 * the reference frame. Every stop arrives as a uniform from tokens.css.
 */

export const filamentVertexShader = /* glsl */ `
  attribute float aProgress;

  uniform float uMinY;
  uniform float uRangeY;

  varying float vProgress;
  varying float vHeight;
  varying float vDepth;

  void main() {
    vProgress = aProgress;
    vHeight = clamp((position.y - uMinY) / uRangeY, 0.0, 1.0);

    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    // Distance from the camera, used to keep the far side of the funnel from
    // blowing out once additive blending stacks hundreds of lines.
    vDepth = -viewPosition.z;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

export const filamentFragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uSpring;
  uniform vec3 uAmber;
  uniform vec3 uViolet;
  uniform vec3 uMagenta;
  uniform vec3 uCore;

  uniform float uTime;
  uniform float uFlowRepeat;
  uniform float uFlowSpeed;
  uniform float uIntensity;

  varying float vProgress;
  varying float vHeight;
  varying float vDepth;

  void main() {
    // Four-stop vertical gradient. smoothstep rather than hard mix so no band
    // edge is visible where hundreds of filaments cross.
    vec3 colour = mix(uSpring, uAmber, smoothstep(0.00, 0.34, vHeight));
    colour = mix(colour, uViolet, smoothstep(0.34, 0.68, vHeight));
    colour = mix(colour, uMagenta, smoothstep(0.68, 1.00, vHeight));

    // A pulse travelling along the curve. fract() of (position − time) gives a
    // sawtooth; the two smoothsteps carve a bright head with a soft tail out
    // of it, which reads as flow rather than as a moving dash.
    float wave = fract(vProgress * uFlowRepeat - uTime * uFlowSpeed);
    float head = smoothstep(0.86, 1.00, wave);
    float tail = smoothstep(0.0, 0.86, wave) * 0.35;

    colour = mix(colour, uCore, head * 0.8);

    // Additive blending has no depth sorting, so distance is faded manually.
    float depthFade = 1.0 - smoothstep(1.6, 5.5, vDepth);
    float brightness = (0.16 + tail + head * 1.6) * uIntensity * depthFade;

    // Alpha stays at 1 and brightness rides on the colour: with additive
    // blending that is what actually accumulates into the bloom pass.
    gl_FragColor = vec4(colour * brightness, 1.0);
  }
`;
