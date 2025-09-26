import { useState } from 'react'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [backupCount, setBackupCount] = useState(12)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SB</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">SafeBase</h1>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                Test Tailwind
              </span>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">Bonjour, Hamza</span>
              <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
                <span className="text-slate-700 text-sm font-medium">H</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: '📊' },
              { id: 'databases', name: 'Bases de données', icon: '🏗️' },
              { id: 'backups', name: 'Sauvegardes', icon: '💾' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Bases actives</p>
                <p className="text-3xl font-bold text-slate-900">5</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏗️</span>
              </div>
            </div>
            <div className="mt-4">
              <span className="inline-flex items-center text-sm text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Toutes connectées
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Sauvegardes</p>
                <p className="text-3xl font-bold text-slate-900">{backupCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💾</span>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-slate-600">Cette semaine</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Stockage</p>
                <p className="text-3xl font-bold text-slate-900">2.3 GB</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setBackupCount(backupCount + 1)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 shadow-sm"
          >
            <span>💾</span>
            <span>Créer une sauvegarde</span>
          </button>

          <button className="bg-white hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-lg font-medium border border-slate-300 transition-colors flex items-center space-x-2">
            <span>🏗️</span>
            <span>Ajouter une base</span>
          </button>

          <button className="bg-white hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-lg font-medium border border-slate-300 transition-colors flex items-center space-x-2">
            <span>📋</span>
            <span>Voir les logs</span>
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Activité récente</h3>
          <div className="space-y-4">
            {[
              { action: 'Sauvegarde créée', target: 'ecommerce_db', time: 'Il y a 2h', status: 'success' },
              { action: 'Base connectée', target: 'blog_db', time: 'Il y a 4h', status: 'info' },
              { action: 'Sauvegarde échouée', target: 'analytics_db', time: 'Il y a 6h', status: 'error' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    item.status === 'success' ? 'bg-green-500' :
                    item.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.action}</p>
                    <p className="text-sm text-slate-600">{item.target}</p>
                  </div>
                </div>
                <span className="text-sm text-slate-500">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-sm text-slate-600">
        <p>SafeBase - Gestionnaire de sauvegardes • Tailwind CSS fonctionne ! ✅</p>
      </footer>
    </div>
  )
}

export default App
