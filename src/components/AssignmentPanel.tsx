import { useState, useEffect } from 'react';
import { Users, ChevronRight, Loader2 } from 'lucide-react';
import { candidateService, Candidate } from '../services/candidateService';
import { getAnalysts, assignCandidates } from '../services/userService';
import { User } from '../contexts/AuthContext';

interface AssignmentPanelProps {
  adminId: string;
  onAssignmentComplete: () => void;
}

export default function AssignmentPanel({ adminId, onAssignmentComplete }: AssignmentPanelProps) {
  const [analysts, setAnalysts] = useState<User[]>([]);
  const [unassignedCandidates, setUnassignedCandidates] = useState<Candidate[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [selectedAnalyst, setSelectedAnalyst] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadAnalysts();
    loadUnassignedCandidates();
  }, [page]);

  async function loadAnalysts() {
    try {
      const data = await getAnalysts();
      setAnalysts(data);
    } catch (error) {
      console.error('Erro ao carregar analistas:', error);
    }
  }

  async function loadUnassignedCandidates() {
    try {
      setLoading(true);
      const response = await candidateService.getUnassignedCandidates(page, 50);
      setUnassignedCandidates(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Erro ao carregar candidatos:', error);
    } finally {
      setLoading(false);
    }
  }

  function toggleCandidate(id: string) {
    const newSelection = new Set(selectedCandidates);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedCandidates(newSelection);
  }

  function selectAll() {
    if (selectedCandidates.size === unassignedCandidates.length) {
      setSelectedCandidates(new Set());
    } else {
      setSelectedCandidates(new Set(unassignedCandidates.map(c => c.id)));
    }
  }

  async function handleAssign() {
    if (!selectedAnalyst || selectedCandidates.size === 0) {
      alert('Selecione um analista e pelo menos um candidato');
      return;
    }

    try {
      setLoading(true);
      await assignCandidates({
        candidateIds: Array.from(selectedCandidates),
        analystId: selectedAnalyst,
        adminId,
      });

      setSelectedCandidates(new Set());
      setSelectedAnalyst('');
      await loadUnassignedCandidates();
      onAssignmentComplete();
      alert('Candidatos alocados com sucesso!');
    } catch (error) {
      console.error('Erro ao alocar candidatos:', error);
      alert('Erro ao alocar candidatos');
    } finally {
      setLoading(false);
    }
  }

  const analystWorkload = analysts.reduce((acc, analyst) => {
    acc[analyst.id] = unassignedCandidates.filter(c => c.assigned_to === analyst.id).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          Alocação de Candidatos
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Atribua candidatos para os analistas realizarem a triagem
        </p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Candidatos Não Alocados ({unassignedCandidates.length})
              </h3>
              <button
                onClick={selectAll}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {selectedCandidates.size === unassignedCandidates.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : unassignedCandidates.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Nenhum candidato não alocado encontrado</p>
              </div>
            ) : (
              <div className="space-y-2">
                {unassignedCandidates.map(candidate => (
                  <div
                    key={candidate.id}
                    onClick={() => toggleCandidate(candidate.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedCandidates.has(candidate.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.has(candidate.id)}
                        onChange={() => toggleCandidate(candidate.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{candidate.name}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Inscrição: {candidate.registration_number} • Área: {candidate.area}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-600">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Alocar para Analista</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecione o Analista
                  </label>
                  <select
                    value={selectedAnalyst}
                    onChange={(e) => setSelectedAnalyst(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Escolha um analista...</option>
                    {analysts.map(analyst => (
                      <option key={analyst.id} value={analyst.id}>
                        {analyst.name} ({analyst.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2">
                  <div className="text-sm text-gray-600 mb-2">
                    Selecionados: <span className="font-semibold">{selectedCandidates.size}</span>
                  </div>
                </div>

                <button
                  onClick={handleAssign}
                  disabled={!selectedAnalyst || selectedCandidates.size === 0 || loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Alocando...
                    </>
                  ) : (
                    <>
                      Alocar Candidatos
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-gray-50 border rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Carga de Trabalho</h4>
              <div className="space-y-2">
                {analysts.map(analyst => (
                  <div key={analyst.id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">{analyst.name}</span>
                    <span className="font-semibold text-gray-900">
                      {analystWorkload[analyst.id] || 0} candidatos
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
