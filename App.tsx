
import React, { useState } from 'react';
import MapTab from './components/MapTab';
import ImuTab from './components/ImuTab';
import GnssStatusTab from './components/GnssStatusTab';
import { Tab } from './types';
import { MapIcon, ChipIcon, SatelliteIcon } from './components/Icons';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Map);

  const renderTabContent = () => {
    switch (activeTab) {
      case Tab.Map:
        return <MapTab />;
      case Tab.Imu:
        return <ImuTab />;
      case Tab.Gnss:
        return <GnssStatusTab />;
      default:
        return <MapTab />;
    }
  };
  
  const TabButton = ({ tab, label, icon }: { tab: Tab, label: string, icon: JSX.Element }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 rounded-lg ${
        activeTab === tab 
          ? 'bg-sky-600 text-white shadow-md' 
          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col">
      <header className="bg-slate-800 shadow-lg p-4">
        <h1 className="text-2xl font-bold text-center text-sky-400">Sensor Dashboard</h1>
        <p className="text-center text-slate-400 text-sm">GNSS & IMU Real-time Data</p>
      </header>
      
      <nav className="p-4 bg-slate-800/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex justify-center items-center gap-2 md:gap-4 p-2 bg-slate-800 rounded-xl shadow-inner">
          <TabButton tab={Tab.Map} label="Map (GNSS)" icon={<MapIcon />} />
          <TabButton tab={Tab.Imu} label="IMU" icon={<ChipIcon />} />
          <TabButton tab={Tab.Gnss} label="GNSS Status" icon={<SatelliteIcon />} />
        </div>
      </nav>

      <main className="flex-grow p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {renderTabContent()}
        </div>
      </main>

      <footer className="text-center p-4 text-xs text-slate-500 bg-slate-800">
        <p>&copy; 2024 Sensor Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
