import React, { useState, useEffect } from 'react';
import type { Satellite } from '../types';
import Card from './Card';

const constellations: Array<Satellite['constellation']> = ['GPS', 'GLONASS', 'Galileo', 'BeiDou'];

const generateMockSatellites = (count: number): Satellite[] => {
  const satellites: Satellite[] = [];
  for (let i = 1; i <= count; i++) {
    const constellation = constellations[Math.floor(Math.random() * constellations.length)];
    satellites.push({
      svid: i,
      constellation,
      cn0: Math.floor(Math.random() * 35) + 15, // C/N0 between 15 and 50 dB-Hz
      elevation: Math.floor(Math.random() * 90),
      azimuth: Math.floor(Math.random() * 360),
      usedInFix: Math.random() > 0.3,
    });
  }
  return satellites.sort((a,b) => b.cn0 - a.cn0);
};

const SignalBar: React.FC<{ cn0: number }> = ({ cn0 }) => {
  const percentage = Math.max(0, Math.min(100, (cn0 - 10) * (100 / 40))); // Scale 10-50 to 0-100%
  let colorClass = 'bg-red-500';
  if (cn0 >= 40) {
    colorClass = 'bg-green-500';
  } else if (cn0 >= 30) {
    colorClass = 'bg-yellow-500';
  } else if (cn0 >= 20) {
    colorClass = 'bg-orange-500';
  }
  return (
    <div className="w-full bg-slate-600 rounded-full h-4 shadow-inner">
      <div
        className={`${colorClass} h-4 rounded-full transition-all duration-500 ease-in-out`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

const GnssStatusTab: React.FC = () => {
  const [satellites, setSatellites] = useState<Satellite[]>(generateMockSatellites(18));

  useEffect(() => {
    const interval = setInterval(() => {
      setSatellites(prevSatellites =>
        prevSatellites.map(sat => ({
          ...sat,
          cn0: Math.max(10, Math.min(50, sat.cn0 + (Math.random() - 0.5) * 4)), // Fluctuate C/N0
          usedInFix: sat.cn0 > 25 ? Math.random() > 0.2 : false,
        })).sort((a,b) => b.cn0 - a.cn0)
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card title="GNSS Satellite Status (Simulated)">
        <div className="mb-4 p-3 bg-sky-900/50 border border-sky-700 rounded-lg text-sm text-sky-200">
            <strong>Disclaimer:</strong> Web browsers cannot access raw GNSS satellite data for security reasons. The information below is a realistic simulation for demonstration purposes.
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-left text-sm">
            <thead className="border-b border-slate-600 text-slate-400">
              <tr>
                <th className="p-2">SVID</th>
                <th className="p-2">Constellation</th>
                <th className="p-2">C/N0 (dB-Hz)</th>
                <th className="p-2 hidden md:table-cell">Signal Strength</th>
                <th className="p-2">In Use</th>
              </tr>
            </thead>
            <tbody>
              {satellites.map((sat, index) => (
                <tr key={sat.svid} className={`border-b border-slate-700 transition-colors ${index % 2 === 0 ? 'bg-slate-700/40' : 'bg-transparent'} hover:bg-slate-700`}>
                  <td className="p-2 font-mono">{sat.svid}</td>
                  <td className="p-2">{sat.constellation}</td>
                  <td className="p-2 font-mono">{sat.cn0.toFixed(1)}</td>
                  <td className="p-2 hidden md:table-cell">
                    <SignalBar cn0={sat.cn0} />
                  </td>
                  <td className="p-2">
                    <span className={`h-4 w-4 rounded-full inline-block ${sat.usedInFix ? 'bg-green-500' : 'bg-slate-600'}`}></span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </Card>
  );
};

export default GnssStatusTab;