import { CheckCircle, XCircle, AlertTriangle, ChevronLeft, ChevronRight, LogOut, FileText } from 'lucide-react';

interface ActionPanelProps {
  onClassify: () => void;
  onDisqualify: () => void;
  onReview: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onLogout: () => void;
  onGenerateReport: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  currentIndex: number;
  totalCandidates: number;
  analystEmail: string;
}

export default function ActionPanel({
  onClassify,
  onDisqualify,
  onReview,
  onPrevious,
  onNext,
  onLogout,
  onGenerateReport,
  hasPrevious,
  hasNext,
  currentIndex,
  totalCandidates,
  analystEmail
}: ActionPanelProps) {
  return (
    <div className="bg-white border-t border-slate-200 p-4 shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 rounded-full w-10 h-10 flex items-center justify-center">
            <span className="text-sm font-bold text-slate-700">
              {analystEmail.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-800">{analystEmail}</div>
            <div className="text-xs text-slate-500">
              Candidato {currentIndex + 1} de {totalCandidates}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onPrevious}
            disabled={!hasPrevious}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-400 text-slate-700 rounded-lg transition-colors font-medium"
            title="Anterior (←)"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-2">
            <button
              onClick={onClassify}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold shadow-md hover:shadow-lg"
              title="Classificar (1)"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Classificar</span>
              <span className="bg-green-700 bg-opacity-50 px-2 py-0.5 rounded text-xs">1</span>
            </button>

            <button
              onClick={onDisqualify}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold shadow-md hover:shadow-lg"
              title="Desclassificar (2)"
            >
              <XCircle className="w-5 h-5" />
              <span>Desclassificar</span>
              <span className="bg-red-700 bg-opacity-50 px-2 py-0.5 rounded text-xs">2</span>
            </button>

            <button
              onClick={onReview}
              className="flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors font-semibold shadow-md hover:shadow-lg"
              title="Marcar para Revisar (3)"
            >
              <AlertTriangle className="w-5 h-5" />
              <span>Revisar</span>
              <span className="bg-yellow-700 bg-opacity-50 px-2 py-0.5 rounded text-xs">3</span>
            </button>
          </div>

          <button
            onClick={onNext}
            disabled={!hasNext}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-400 text-slate-700 rounded-lg transition-colors font-medium"
            title="Próximo (→)"
          >
            <span className="hidden sm:inline">Próximo</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="w-px h-8 bg-slate-300" />

          <button
            onClick={onGenerateReport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            title="Gerar Relatório"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden lg:inline">Relatório</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 bg-slate-100 rounded-lg p-3">
        <div className="text-xs text-slate-600 space-y-1">
          <div className="flex items-center gap-4">
            <span><kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono">1</kbd> Classificar</span>
            <span><kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono">2</kbd> Desclassificar</span>
            <span><kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono">3</kbd> Revisar</span>
            <span><kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono">←</kbd> <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono">→</kbd> Navegar</span>
            <span><kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono">R</kbd> Currículo</span>
            <span><kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono">D</kbd> Diploma</span>
            <span><kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono">C</kbd> Carteira</span>
          </div>
        </div>
      </div>
    </div>
  );
}
