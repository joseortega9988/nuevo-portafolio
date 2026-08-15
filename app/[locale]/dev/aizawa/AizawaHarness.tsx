'use client';

import { useState } from 'react';

import { AizawaAttractor } from '@/animations/aizawa-attractor';

export function AizawaHarness() {
  const [ready, setReady] = useState(false);

  return (
    <main style={{ position: 'relative', height: '100vh' }}>
      <AizawaAttractor onReady={() => setReady(true)} />
      <p
        style={{ position: 'absolute', bottom: 16, left: 16, zIndex: 2 }}
        data-ready={ready ? '' : undefined}
      >
        A2 · aizawa-attractor — onReady: {ready ? 'fired' : 'pending'}
      </p>
    </main>
  );
}
