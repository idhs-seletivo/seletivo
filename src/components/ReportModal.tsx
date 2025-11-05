import { X, FileText, Users, BarChart } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateClassifiedReport: () => void;
  onGenerateDisqualifiedReport: () => void;
  onGenerateGeneralReport: () => void;
}

export default function ReportModal({
  isOpen,
  onClose,
  onGenerateClassifiedReport,
  onGenerateDisqualifiedReport,
  onGenerateGeneralReport
}: ReportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800">Gerar Relatório</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-slate-600 mb-6">
            Escolha o tipo de relatório que deseja gerar:
          </p>

          <button
            onClick={() => {
              onGenerateGeneralReport();
              onClose();
            }}
            className="w-full p-6 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-300 rounded-lg transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <BarChart className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold text-slate-800 mb-1">Relatório Geral</h3>
                <p className="text-sm text-slate-600">
                  Resumo completo com estatísticas, métricas e todos os candidatos organizados por status
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              onGenerateClassifiedReport();
              onClose();
            }}
            className="w-full p-6 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-2 border-green-300 rounded-lg transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold text-slate-800 mb-1">Apenas Classificados</h3>
                <p className="text-sm text-slate-600">
                  Lista detalhada com nome, área, cargo e número de registro dos candidatos classificados
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              onGenerateDisqualifiedReport();
              onClose();
            }}
            className="w-full p-6 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border-2 border-red-300 rounded-lg transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold text-slate-800 mb-1">Apenas Desclassificados</h3>
                <p className="text-sm text-slate-600">
                  Lista detalhada com nome, área, cargo e número de registro dos candidatos desclassificados
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 rounded-b-xl">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors font-medium"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
