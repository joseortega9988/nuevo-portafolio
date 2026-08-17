/**
 * Wormhole tunnel shader.
 *
 * The vertex stage does not move each box with a translate + rotate instance
 * transform; it warps the box's own local vertices directly, the same trick
 * the reference pen uses to keep the whole tunnel in one draw call. A ring's
 * radius compounds with depth (so the tunnel spirals rather than nests
 * concentric circles), and a ring freshly returned to the near end is
 * additionally pushed down by a cubic falloff that vanishes within a couple
 * of rows — that is what reads as the front rows shearing away and falling
 * while the rest stays a calm receding spiral.
 *
 * Each row owns a fixed slice of the time cycle (row / uRowCount), so it
 * completes a lap and wraps back to the near end at a different moment than
 * every other row. That staggering is what keeps the tunnel looping
 * seamlessly: a single row wrapping is invisible because it happens exactly
 * when that row is smallest and farthest away, near the vanishing point —
 * unlike animating every row from one shared clock, which snaps the whole
 * structure back to its start on the same frame.
 *
 * The fragment stage draws a picture-frame outline per box face from UV
 * alone (border = distance to the nearest face edge), the same
 * fwidth-antialiased technique as the Voronoi torus's wireframe, so no
 * texture is needed.
 */

export const tunnelVertexShader = /* glsl */ `
  attribute vec3 aRCL; // row, column, layer

  uniform float uTime;
  uniform float uRowCount;
  uniform float uColumnCount;
  uniform float uBaseRadius;
  uniform float uZShiftScale;

  varying vec2 vUv;
  varying float vDepth; // 0 near → 1 far, drives the colour mix
  varying float vGlow;  // brightens the rows currently shearing away

  void main() {
    float arc = 6.28318530718 / uColumnCount;

    // This row's own position in the cycle, offset by its slice so every
    // row wraps at a different moment (see the file header). Subtracting
    // uTime (rather than adding it) is what makes the conveyor recede away
    // from the viewer over time instead of growing toward them.
    float depth = fract(aRCL.x / uRowCount - uTime);

    float radius = uBaseRadius * pow(1.0 + arc, depth * uRowCount);
    float zOffset = (radius - uBaseRadius) * uZShiftScale;

    vec4 warped = vec4(position, 1.0);

    // The far face of each box sits one ring further out than the near
    // face, which is what gives the boxes depth instead of collapsing to a
    // card.
    if (warped.z > 0.0) {
      radius *= 1.0 + arc;
    }

    warped.xz *= radius * arc;
    warped.z += zOffset + uBaseRadius;

    // A fixed per-column wobble (not time-driven) so the fall height varies
    // across the ring instead of every box dropping in lockstep. Tied to
    // this row's own depth rather than a shared clock, so the fall always
    // fires right as a row returns to the near end — the same instant that
    // would otherwise be its visible wrap.
    float wobble = sin(aRCL.y / 5.3) * 1.1
                 + sin(aRCL.y / 1.3) * 1.5
                 + cos(aRCL.y / 1.7) * 2.5;

    float fall = 2.0 - depth * uRowCount + abs(wobble);
    fall += aRCL.z * abs(sin(aRCL.y));
    fall = max(fall, 0.0);
    warped.y += fall * fall * fall + aRCL.z;

    float angle = aRCL.y * arc;
    float s = sin(angle);
    float c = cos(angle);
    warped.xz = warped.xz * mat2(c, -s, s, c);

    vUv = uv;
    vDepth = depth;
    vGlow = clamp(1.0 - fall / 6.0, 0.0, 1.0);

    gl_Position = projectionMatrix * modelViewMatrix * warped;
  }
`;

export const tunnelFragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uNear;
  uniform vec3 uFar;
  uniform float uEdgeWidth;

  varying vec2 vUv;
  varying float vDepth;
  varying float vGlow;

  void main() {
    float borderX = min(vUv.x, 1.0 - vUv.x);
    float borderY = min(vUv.y, 1.0 - vUv.y);
    float border = min(borderX, borderY);

    float aa = fwidth(border) * 1.5;
    float frame = 1.0 - smoothstep(uEdgeWidth - aa, uEdgeWidth + aa, border);
    if (frame <= 0.02) discard;

    vec3 colour = mix(uNear, uFar, vDepth);

    // Kept close to 1 on purpose: with thousands of overlapping saturated
    // fragments, a higher ceiling here blows the whole tunnel out to a flat,
    // washed-out fill instead of reading as lines against black. This is now
    // the only thing setting the tunnel's brightness — the scene carries no
    // bloom pass, so what this writes is what ships on every device.
    colour *= 0.4 + frame * 0.45 + vGlow * 0.35;

    gl_FragColor = vec4(colour, 1.0);
  }
`;
