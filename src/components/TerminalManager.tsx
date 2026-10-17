import React, { useEffect, useState } from 'react';

interface TerminalState {
  id: string;
  connected: boolean;
  offlineQueue: number;
}

const TerminalManager: React.FC = () => {
  const [terminals, setTerminals] = useState<TerminalState[]>([
    { id: 'STORE-101', connected: false, offlineQueue: 0 },
    { id: 'STORE-102', connected: false, offlineQueue: 5 },
    { id: 'STORE-103', connected: false, offlineQueue: 12 }
  ]);

  useEffect(() => {
    // Attempt WebSocket connection to the local orchestrator
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      console.log('[TerminalManager] Connected to Orchestrator Hub');
      setTerminals(prev => prev.map(t => ({ ...t, connected: true })));

      // Simulate syncing offline queued transactions when connected
      setTerminals(prev => {
        const queuedCount = prev.reduce((sum, t) => sum + t.offlineQueue, 0);
        if (queuedCount > 0) {
          console.log(`[TerminalManager] Syncing ${queuedCount} offline transactions...`);
          ws.send(JSON.stringify({
            type: "TRANSACTION_SYNC",
            transactions: Array(queuedCount).fill({ amount: 100, item: "SKU-01" })
          }));
        }
        return prev.map(t => ({ ...t, offlineQueue: 0 }));
      });
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'SYNC_SUCCESS') {
          console.log(`[TerminalManager] Successfully synced ${data.count} transactions.`);
        }
      } catch (e) {
        console.error(e);
      }
    };

    ws.onclose = () => {
      console.log('[TerminalManager] Disconnected from Orchestrator Hub');
      setTerminals(prev => prev.map(t => ({ ...t, connected: false })));
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded p-4 flex flex-col">
      <h2 className="text-zinc-500 mb-4 font-bold font-mono flex justify-between">
        <span>FRANCHISE POS TELEMETRY</span>
        <span className="text-[10px] text-zinc-600">(OFFLINE-FIRST SYNC)</span>
      </h2>
      <div className="flex space-x-2">
        {terminals.map(store => (
          <div key={store.id} className={`flex-1 border rounded p-2 text-center text-xs font-mono transition-colors ${store.connected ? 'bg-zinc-950 border-emerald-900/50' : 'bg-zinc-900 border-red-900/50'}`}>
            <div className="text-zinc-400 mb-1">{store.id}</div>
            {store.connected ? (
              <div className="text-emerald-500 text-[10px]">&bull; CONNECTED (0 Q)</div>
            ) : (
              <div className="text-red-500 text-[10px]">&bull; OFFLINE ({store.offlineQueue} Q)</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TerminalManager;
