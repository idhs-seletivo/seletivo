import { useState } from 'react';
import { Candidate } from '../types/candidate';
import { UserCheck, UserX, AlertTriangle, Clock } from 'lucide-react';
import CandidateDetailView from './CandidateDetailView';

interface CandidateListProps {
  candidates: Candidate[];
  selectedCandidate: Candidate | null;
  onSelectCandidate: (candidate: Candidate) => void;
  filterArea: string;
  filterCargo: string;
  filterStatus: string;
  onFilterAreaChange: (area: string) => void;
  onFilterCargoChange: (cargo: string) => void;
  onFilterStatusChange: (status: string) => void;
}

export default function CandidateList({
  candidates,
  selectedCandidate,
  onSelectCandidate,
  filterArea,
  filterCargo,
  filterStatus,
  onFilterAreaChange,
  onFilterCargoChange,
  onFilterStatusChange
}: CandidateListProps) {
  const [detailCandidate, setDetailCandidate] = useState<Candidate | null>(null);

  const filteredCandidates = candidates.filter(candidate => {
    const areaMatch = filterArea === 'all' || candidate.area === filterArea;
    const cargoMatch = filterCargo === 'all' ||
      (candidate.area === 'Administrativa' && candidate.cargoAdministrativo === filterCargo) ||
      (candidate.area === 'Assistencial' && candidate.cargoAssistencial === filterCargo);
    return areaMatch && cargoMatch;
  });

  const cargos = Array.from(new Set(
    candidates
      .filter(c => filterArea === 'all' || c.area === filterArea)
      .map(c => c.area === 'Administrativa' ? c.cargoAdministrativo : c.cargoAssistencial)
      .filter(Boolean)
  )).sort();

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'Classificado':
        return <UserCheck className="w-4 h-4 text-green-600" />;
      case 'Desclassificado':
        return <UserX className="w-4 h-4 text-red-600" />;
      case 'Revisar':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'Classificado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Desclassificado':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Revisar':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const handleCandidateClick = (candidate: Candidate) => {
    setDetailCandidate(candidate);
  };

  return (
    <>
      {detailCandidate && (
        <CandidateDetailView
          candidate={detailCandidate}
          onClose={() => setDetailCandidate(null)}
        />
      )}

    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          Candidatos ({filteredCandidates.length})
        </h2>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Área
            </label>
            <select
              value={filterArea}
              onChange={(e) => onFilterAreaChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">Todas</option>
              <option value="Administrativa">Administrativa</option>
              <option value="Assistencial">Assistencial</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Cargo
            </label>
            <select
              value={filterCargo}
              onChange={(e) => onFilterCargoChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">Todos</option>
              {cargos.map(cargo => (
                <option key={cargo} value={cargo}>{cargo}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => onFilterStatusChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="pending">Pendentes</option>
              <option value="all">Todos</option>
              <option value="Classificado">Classificados</option>
              <option value="Desclassificado">Desclassificados</option>
              <option value="Revisar">Para Revisar</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredCandidates.map((candidate) => (
          <button
            key={candidate.registrationNumber}
            onClick={() => handleCandidateClick(candidate)}
            className={`w-full p-4 text-left border-b border-slate-200 hover:bg-blue-50 transition-colors ${
              selectedCandidate?.registrationNumber === candidate.registrationNumber
                ? 'bg-blue-100 border-l-4 border-l-blue-600'
                : ''
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-slate-800 text-sm leading-tight">
                {candidate.name}
              </h3>
              {getStatusIcon(candidate.statusTriagem)}
            </div>

            <div className="space-y-1">
              <p className="text-xs text-slate-600">
                <span className="font-medium">Área:</span> {candidate.area}
              </p>
              <p className="text-xs text-slate-600">
                <span className="font-medium">Cargo:</span>{' '}
                {candidate.area === 'Administrativa'
                  ? candidate.cargoAdministrativo
                  : candidate.cargoAssistencial}
              </p>
              <p className="text-xs text-slate-500">
                <span className="font-medium">Nº:</span> {candidate.registrationNumber}
              </p>
            </div>

            {candidate.statusTriagem && (
              <div className={`mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(candidate.statusTriagem)}`}>
                {candidate.statusTriagem}
              </div>
            )}
          </button>
        ))}

        {filteredCandidates.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            <p className="text-sm">Nenhum candidato encontrado</p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
