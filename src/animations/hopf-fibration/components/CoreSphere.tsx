'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import { AdditiveBlending, BackSide } from 'three';

import { buildPalette } from '@/lib/palette';

const coreVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-viewPosition.xyz);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

/**
 * Rendered on the back faces so the shell is seen from inside: the falloff
 * then peaks at the centre of the silhouette instead of at its rim, which is
 * what makes it read as a glowing body rather than a lit ball.
 */
const coreFragmentShader = /* glsl */ `
  precision highp float;
  uniform vec3 uCore;
  uniform vec3 uCyan;
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    float facing = abs(dot(normalize(vNormal), normalize(vView)));
    float glow = pow(facing, 2.4);
    // A slow breath, so the core is never perfectly static.
    glow *= 0.86 + 0.14 * sin(uTime * 0.9);
    vec3 colour = mix(uCyan, uCore, glow);
    gl_FragColor = vec4(colour * glow * 1.7, 1.0);
  }
`;

export function CoreSphere() {
  const { uniforms, time } = useMemo(() => {
    const palette = buildPalette();
    const time = { value: 0 };
    return {
      time,
      uniforms: {
        uCore: { value: palette.core },
        uCyan: { value: palette.cyan },
        uTime: time,
      },
    };
  }, []);

  useFrame((_, delta) => {
    time.value += delta;
  });

  return (
    <mesh>
      <sphereGeometry args={[0.95, 48, 48]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={coreVertexShader}
        fragmentShader={coreFragmentShader}
        transparent
        blending={AdditiveBlending}
        side={BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}
