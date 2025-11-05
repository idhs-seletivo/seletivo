import { useState, useEffect } from 'react';
import { candidateService, Candidate } from '../services/candidateService';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import DocumentViewer from './DocumentViewer';

export default function AnalystDashboard() {
  const { user, logout } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pendente: 0,
    em_analise: 0,
    concluido: 0,
  });

  useEffect(() => {
    if (user) {
      loadCandidates();
      loadStats();
    }
  }, [user]);

  async function loadCandidates() {
    if (!user) return;

    try {
      setLoading(true);
      const response = await candidateService.getCandidates(1, 100, {
        assignedTo: user.id,
      });
      setCandidates(response.data);
      if (response.data.length > 0 && !selectedCandidate) {
        setSelectedCandidate(response.data[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar candidatos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    if (!user) return;

    try {
      const data = await candidateService.getStatistics(user.id);
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }

  async function handleStatusChange(status: 'pendente' | 'em_analise' | 'concluido') {
    if (!selectedCandidate) return;

    try {
      await candidateService.updateCandidateStatus(selectedCandidate.id, status);
      await loadCandidates();
      await loadStats();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status do candidato');
    }
  }

  function moveToNext() {
    if (!selectedCandidate) return;
    const currentIndex = candidates.findIndex(c => c.id === selectedCandidate.id);
    if (currentIndex < candidates.length - 1) {
      setSelectedCandidate(candidates[currentIndex + 1]);
    }
  }

  function moveToPrevious() {
    if (!selectedCandidate) return;
    const currentIndex = candidates.findIndex(c => c.id === selectedCandidate.id);
    if (currentIndex > 0) {
      setSelectedCandidate(candidates[currentIndex - 1]);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 overflow-y-auto">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Meus Candidatos</h1>
            <p className="text-sm text-gray-600">Analista: {user?.name}</p>
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
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-sm text-yellow-800 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Pendente
            </div>
            <div className="text-2xl font-bold text-yellow-800">{stats.pendente}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-800 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Em Análise
            </div>
            <div className="text-2xl font-bold text-blue-800">{stats.em_analise}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-green-800 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Concluído
            </div>
            <div className="text-2xl font-bold text-green-800">{stats.concluido}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 bg-white border-r overflow-auto">
          <div className="p-4">
            <h2 className="font-semibold text-gray-800 mb-4">Lista de Candidatos</h2>
            <div className="space-y-2">
              {candidates.map(candidate => (
                <div
                  key={candidate.id}
                  onClick={() => setSelectedCandidate(candidate)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedCandidate?.id === candidate.id
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-800 text-sm">{candidate.name}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {candidate.registration_number}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        candidate.status === 'concluido'
                          ? 'bg-green-100 text-green-800'
                          : candidate.status === 'em_analise'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {candidate.status === 'concluido'
                        ? 'Concluído'
                        : candidate.status === 'em_analise'
                        ? 'Em Análise'
                        : 'Pendente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {selectedCandidate ? (
            <>
              <div className="flex-1 overflow-auto">
                <DocumentViewer candidate={selectedCandidate} />
              </div>

              <div className="bg-white border-t p-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={moveToPrevious}
                      disabled={!selectedCandidate || candidates.findIndex(c => c.id === selectedCandidate.id) === 0}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={moveToNext}
                      disabled={!selectedCandidate || candidates.findIndex(c => c.id === selectedCandidate.id) === candidates.length - 1}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                    >
                      Próximo
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange('em_analise')}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Iniciar Análise
                    </button>
                    <button
                      onClick={() => handleStatusChange('concluido')}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Concluir
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">Selecione um candidato para visualizar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
