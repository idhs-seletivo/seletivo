import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { candidateService } from '../services/candidateService';
import AssignmentPanel from './AssignmentPanel';
import AnalystDashboard from './AnalystDashboard';
import CsvImportTool from './CsvImportTool';
import { BarChart3, Users, Upload } from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'allocation' | 'my-candidates' | 'import'>('allocation');
  const [stats, setStats] = useState({
    total: 0,
    pendente: 0,
    em_analise: 0,
    concluido: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const data = await candidateService.getStatistics();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 overflow-y-auto">
      <div className="bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Sistema de Triagem</h1>
              <p className="text-sm text-gray-600">Admin: {user?.name}</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Sair
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Total de Candidatos</div>
              <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-sm text-yellow-800">Pendente</div>
              <div className="text-2xl font-bold text-yellow-800">{stats.pendente}</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-800">Em Análise</div>
              <div className="text-2xl font-bold text-blue-800">{stats.em_analise}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-800">Concluído</div>
              <div className="text-2xl font-bold text-green-800">{stats.concluido}</div>
            </div>
          </div>
        </div>

        <div className="px-6 border-t">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('import')}
              className={`px-4 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'import'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Upload className="w-4 h-4" />
              Importar
            </button>
            <button
              onClick={() => setActiveTab('allocation')}
              className={`px-4 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'allocation'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Users className="w-4 h-4" />
              Alocação
            </button>
            <button
              onClick={() => setActiveTab('my-candidates')}
              className={`px-4 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'my-candidates'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Meus Candidatos
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'import' && <CsvImportTool />}
        {activeTab === 'allocation' && (
          <AssignmentPanel
            adminId={user?.id || ''}
            onAssignmentComplete={loadStats}
          />
        )}
        {activeTab === 'my-candidates' && <AnalystDashboard />}
      </div>
    </div>
  );
}
