/*import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthForm } from './components/Auth/AuthForm';
import { Sidebar } from './components/Layout/Sidebar';
import { Dashboard } from './components/Dashboard/Dashboard';
import Charts from './components/Charts/Charts';
import { AIAssistant } from './components/AIAssistant/AIAssistant';
import { Profile } from './components/Profile/Profile';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading BudgetBuddy...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onSuccess={() => {}} />;
  }

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'charts':
        return <Charts />;
      case 'ai-assistant':
        return <AIAssistant />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="lg:ml-20 min-h-screen">
        <main className="pt-16 lg:pt-0">
          {renderActiveComponent()}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;*/
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthForm } from './components/Auth/AuthForm';
import { Sidebar } from './components/Layout/Sidebar';
import { Dashboard } from './components/Dashboard/Dashboard';
import Charts from './components/Charts/Charts';
import { AIAssistant } from './components/AIAssistant/AIAssistant';
import { Profile } from './components/Profile/Profile';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // State to hold chart data, initially empty arrays
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading BudgetBuddy...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onSuccess={() => {}} />;
  }

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            categoryData={categoryData}
            setCategoryData={setCategoryData}
            monthlyData={monthlyData}
            setMonthlyData={setMonthlyData}
          />
        );
      case 'charts':
        return <Charts categoryData={categoryData} monthlyData={monthlyData} />;
      case 'ai-assistant':
        return <AIAssistant />;
      case 'profile':
        return <Profile />;
      default:
        return (
          <Dashboard
            categoryData={categoryData}
            setCategoryData={setCategoryData}
            monthlyData={monthlyData}
            setMonthlyData={setMonthlyData}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="lg:ml-20 min-h-screen">
        <main className="pt-16 lg:pt-0">{renderActiveComponent()}</main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;