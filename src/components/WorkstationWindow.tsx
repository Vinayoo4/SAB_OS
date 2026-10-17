import React, { useState } from 'react';

const WorkstationWindow: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([
    "[System] Booting SAB-OS Agentic Control Plane...",
    "[Orchestrator] Dynamic 4-Tier Model Gateway Initialized.",
    "[Memory] SQLite Epistemic Index Loaded."
  ]);

  return (
    <div className="flex flex-col w-1/3 bg-zinc-900 border border-zinc-800 rounded p-4 font-mono text-sm">
      <h2 className="text-zinc-500 mb-2 font-bold">AGENT TERMINAL</h2>
      <div className="flex-1 overflow-y-auto space-y-1">
        {logs.map((log, i) => (
          <div key={i} className={`${log.includes('error') ? 'text-red-400' : 'text-zinc-300'}`}>
            {log}
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-zinc-800">
        <input
          type="text"
          placeholder="> Dispatch Task..."
          className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-emerald-400 focus:outline-none focus:border-emerald-500"
        />
      </div>
    </div>
  );
};

export default WorkstationWindow;
