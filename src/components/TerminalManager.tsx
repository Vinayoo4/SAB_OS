import React, { useEffect, useState, useRef } from 'react';
import { get, set } from 'idb-keyval';

interface TerminalState {
  id: string;
  connected: boolean;
  offlineQueue: number;
}

interface PendingTransaction {
  id: string;
  amount: number;
  item: string;
  timestamp: number;
  synced: boolean;
}

const TerminalManager: React.FC = () => {
  const [terminals, setTerminals] = useState<TerminalState[]>([
    { id: 'STORE-101', connected: false, offlineQueue: 0 },
    { id: 'STORE-102', connected: false, offlineQueue: 5 },
    { id: 'STORE-103', connected: false, offlineQueue: 12 }
  ]);

  const wsRef = useRef<WebSocket | null>(null);

  // Load offline transactions from IndexedDB
  const loadOfflineTransactions = async () => {
    const pending = await get<PendingTransaction[]>('pending_sales') || [];
    setTerminals(prev => {
      const newTerminals = [...prev];
      if (newTerminals.length > 0) {
         newTerminals[0].offlineQueue = pending.filter(t => !t.synced).length;
      }
      return newTerminals;
    });
    return pending;
  };

  const simulateOfflineTransaction = async () => {
    const pending = await get<PendingTransaction[]>('pending_sales') || [];
    const newTx: PendingTransaction = {
      id: Math.random().toString(36).substring(7),
      amount: Math.floor(Math.random() * 100) + 10,
      item: `SKU-${Math.floor(Math.random() * 100)}`,
      timestamp: Date.now(),
      synced: false
    };
    pending.push(newTx);
    await set('pending_sales', pending);
    console.log(`[TerminalManager] Offline transaction saved to IndexedDB: ${newTx.id}`);
    loadOfflineTransactions();
  };

  useEffect(() => {
    loadOfflineTransactions();

    const connectWebSocket = () => {
      const ws = new WebSocket('ws://localhost:8080');
      wsRef.current = ws;

      ws.onopen = async () => {
        console.log('[TerminalManager] Connected to Orchestrator Hub');
        setTerminals(prev => prev.map(t => ({ ...t, connected: true })));

        // Sync actual offline queued transactions from IndexedDB when connected
        const pending = await get<PendingTransaction[]>('pending_sales') || [];
        const toSync = pending.filter(t => !t.synced);

        if (toSync.length > 0) {
          console.log(`[TerminalManager] Syncing ${toSync.length} offline transactions from IndexedDB...`);
          ws.send(JSON.stringify({
            type: "TRANSACTION_SYNC",
            transactions: toSync
          }));
        }
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'SYNC_SUCCESS') {
            console.log(`[TerminalManager] Successfully synced ${data.count} transactions.`);

            // Mark all currently unsynced as synced
            const pending = await get<PendingTransaction[]>('pending_sales') || [];
            pending.forEach(t => {
               if (!t.synced) t.synced = true;
            });
            await set('pending_sales', pending);
            loadOfflineTransactions();
          } else if (data.type === 'SECURITY_ALERT') {
            console.log(`[TerminalManager] Received SECURITY ALERT from Orchestrator:`, data.event);
            // Flash UI or show alert
            alert(`SECURITY ALERT: ${data.event.event} - Confidence: ${data.event.confidence}`);
            // Trigger Tauri Hardware Command
            try {
              const { invoke } = await import('@tauri-apps/api/core');
              await invoke('trigger_alarm');
            } catch (err) {
              console.warn('[TerminalManager] Not running inside Tauri, or trigger_alarm failed:', err);
            }
          }
        } catch (e) {
          console.error(e);
        }
      };

      ws.onclose = () => {
        console.log('[TerminalManager] Disconnected from Orchestrator Hub');
        setTerminals(prev => prev.map(t => ({ ...t, connected: false })));

        // Reconnect after delay
        setTimeout(connectWebSocket, 5000);
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) wsRef.current.close();
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
              <div className="text-emerald-500 text-[10px]">&bull; CONNECTED ({store.offlineQueue} Q)</div>
            ) : (
              <div className="text-red-500 text-[10px]">&bull; OFFLINE ({store.offlineQueue} Q)</div>
            )}
          </div>
        ))}
      </div>

      {/* Dev Tool to mock offline transaction */}
      <div className="mt-4 pt-2 border-t border-zinc-800 text-right">
         <button onClick={simulateOfflineTransaction} className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-1 rounded hover:bg-zinc-700">
            [ SIMULATE SALE ]
         </button>
      </div>
    </div>
  );
};

export default TerminalManager;
