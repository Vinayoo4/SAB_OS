import React from 'react';

const TerminalManager: React.FC = () => {
  return (
    <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded p-4 flex flex-col">
      <h2 className="text-zinc-500 mb-4 font-bold font-mono">FRANCHISE POS TELEMETRY</h2>
      <div className="flex space-x-2">
        {['STORE-101', 'STORE-102', 'STORE-103'].map(store => (
          <div key={store} className="flex-1 bg-zinc-950 border border-zinc-800 rounded p-2 text-center text-xs font-mono">
            <div className="text-zinc-400 mb-1">{store}</div>
            <div className="text-emerald-500 text-[10px]">&bull; CONNECTED</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TerminalManager;
