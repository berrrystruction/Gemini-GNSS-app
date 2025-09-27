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
  const [expandedSvid, setExpandedSvid] = useState<number | null>(null);

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

  const handleRowClick = (svid: number) => {
    setExpandedSvid(prev => (prev === svid ? null : svid));
  };

  const handleCloseDetails = () => {
    setExpandedSvid(null);
  };

  const satellitesInUse = satellites.filter(sat => sat.usedInFix).length;
  const totalSatellites = satellites.length;

  return (
    <Card title="GNSS Satellite Status (Simulated)">
        <div className="mb-4 p-3 bg-sky-900/50 border border-sky-700 rounded-lg text-sm text-sky-200">
            <strong>Disclaimer:</strong> Web browsers cannot access raw GNSS satellite data for security reasons. The information below is a realistic simulation for demonstration purposes.
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-center">
            <div className="bg-slate-700 p-3 rounded-lg">
                <span className="block text-sm text-sky-400">Satellites Tracked</span>
                <span className="text-3xl font-semibold">{totalSatellites}</span>
            </div>
            <div className="bg-slate-700 p-3 rounded-lg">
                <span className="block text-sm text-sky-400">Satellites in Use</span>
                <span className="text-3xl font-semibold">{satellitesInUse}</span>
            </div>
        </div>

        <div className="flex justify-end mb-2">
            {expandedSvid !== null && (
                <button 
                    onClick={handleCloseDetails} 
                    className="text-xs bg-sky-800 hover:bg-sky-700 text-sky-200 font-semibold py-1 px-3 rounded-full transition-colors"
                >
                    Close Details
                </button>
            )}
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
                <React.Fragment key={sat.svid}>
                  <tr 
                    onClick={() => handleRowClick(sat.svid)}
                    className={`border-b border-slate-700 transition-colors cursor-pointer ${index % 2 === 0 ? 'bg-sky-950/60' : 'bg-transparent'} hover:bg-sky-900`}
                  >
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
                  {expandedSvid === sat.svid && (
                     <tr className="bg-slate-700/50">
                       <td colSpan={5} className="p-4 text-white">
                         <div className="grid grid-cols-2 gap-4 text-center">
                           <div className="bg-slate-600 p-2 rounded-lg">
                               <span className="block text-xs text-sky-400">Elevation</span>
                               <span className="font-mono text-xl">{sat.elevation}°</span>
                           </div>
                           <div className="bg-slate-600 p-2 rounded-lg">
                               <span className="block text-xs text-sky-400">Azimuth</span>
                               <span className="font-mono text-xl">{sat.azimuth}°</span>
                           </div>
                         </div>
                         <p className="text-xs text-slate-400 mt-3 text-center">Elevation: Angle above the horizon. Azimuth: Direction from North (0°).</p>
                       </td>
                     </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
    </Card>
  );
};

export default GnssStatusTab;