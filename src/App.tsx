import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import WorkstationWindow from './components/WorkstationWindow';
import TradingDashboard from './components/TradingDashboard';
import TerminalManager from './components/TerminalManager';

interface SystemProfile {
  total_memory_mb: number;
  free_memory_mb: number;
  cpu_cores: number;
  os_name: string;
  mode: string;
}

const App: React.FC = () => {
  const [profile, setProfile] = useState<SystemProfile | null>(null);

  useEffect(() => {
    invoke<SystemProfile>('get_hardware_profile')
      .then((res) => setProfile(res))
      .catch(console.error);
  }, []);

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-white p-4 space-y-4">
      <header className="flex justify-between items-center bg-zinc-900 p-4 border border-zinc-800 rounded">
        <h1 className="text-xl font-bold tracking-widest text-emerald-400">SAB-OS CONTROL PLANE</h1>
        <div className="text-xs text-zinc-400 font-mono">
          {profile ? (
            <div className="flex space-x-4">
              <span>RAM: {profile.free_memory_mb}MB / {profile.total_memory_mb}MB</span>
              <span>CPU: {profile.cpu_cores} Cores</span>
              <span className="text-emerald-500 font-bold">[{profile.mode}]</span>
            </div>
          ) : (
            'Profiling Hardware...'
          )}
        </div>
      </header>

      <main className="flex flex-1 space-x-4 overflow-hidden">
        <WorkstationWindow />
        <div className="flex flex-col flex-1 space-y-4">
          <TradingDashboard />
          <TerminalManager />
        </div>
      </main>
    </div>
  );
};

export default App;
