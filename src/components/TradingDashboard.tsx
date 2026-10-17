import React from 'react';

const TradingDashboard: React.FC = () => {
  return (
    <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded p-4 flex flex-col">
      <h2 className="text-zinc-500 mb-4 font-bold font-mono">QUANTITATIVE SANDBOX</h2>
      <div className="flex-1 flex items-center justify-center border border-dashed border-zinc-700 rounded bg-zinc-950 text-zinc-500 font-mono text-sm">
        [ Vectorized Multi-Timeframe Matrix Output ]
      </div>
    </div>
  );
};

export default TradingDashboard;
