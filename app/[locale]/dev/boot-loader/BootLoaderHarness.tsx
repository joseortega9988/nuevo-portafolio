'use client';

import { useState } from 'react';

import { BootLoader } from '@/animations/boot-loader';

export function BootLoaderHarness() {
  const [sceneReady, setSceneReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [key, setKey] = useState(0);

  const replay = () => {
    sessionStorage.removeItem('jo-boot-loader-shown');
    setSceneReady(false);
    setDismissed(false);
    setKey((n) => n + 1);
  };

  return (
    <main style={{ display: 'grid', gap: '1rem', padding: '4rem 2rem' }}>
      <h1>A1 · boot-loader</h1>
      <p>Status: {dismissed ? 'dismissed' : 'running'}</p>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button type="button" onClick={() => setSceneReady(true)}>
          fire sceneReady
        </button>
        <button type="button" onClick={replay}>
          replay
        </button>
      </div>
      <BootLoader
        key={key}
        sceneReady={sceneReady}
        onDismissed={() => setDismissed(true)}
      />
    </main>
  );
}
