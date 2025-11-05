import { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';

interface CandidateDetailViewProps {
  candidate: any;
  onClose: () => void;
}

export default function CandidateDetailView({ candidate, onClose }: CandidateDetailViewProps) {
  const [activeTab, setActiveTab] = useState('info');

  const isURL = (value: string): boolean => {
    if (!value || typeof value !== 'string') return false;
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const renderValue = (value: any) => {
    if (!value) return <span className="text-gray-400 italic">Vazio</span>;

    const strValue = String(value);

    if (isURL(strValue)) {
      return (
        <a
          href={strValue}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1 break-all"
        >
          {strValue}
          <ExternalLink className="w-4 h-4 flex-shrink-0" />
        </a>
      );
    }

    return <span className="break-words">{strValue}</span>;
  };

  const getNonEmptyFields = (obj: any, prefix = ''): Array<{ key: string; label: string; value: any }> => {
    const fields: Array<{ key: string; label: string; value: any }> = [];

    for (const [key, value] of Object.entries(obj)) {
      if (value && value !== '' && key !== 'data' && key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
        const label = formatLabel(key);
        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (typeof value === 'object' && !Array.isArray(value)) {
          fields.push(...getNonEmptyFields(value, fullKey));
        } else {
          fields.push({ key: fullKey, label, value });
        }
      }
    }

    return fields;
  };

  const formatLabel = (key: string): string => {
    const labelMap: { [key: string]: string } = {
      registration_number: 'NÚMERO DE INSCRIÇÃO',
      name: 'NOME COMPLETO',
      nome_social: 'NOME SOCIAL',
      cpf: 'CPF',
      area: 'Área de atuação pretendida',
      status: 'Status',
      priority: 'Prioridade',
      assigned_to: 'Atribuído a',
      assigned_at: 'Data de Atribuição',
      cargo_administrativo: 'Cargo pretendido (ADMINISTRATIVO)',
      cargo_assistencial: 'Cargo pretendido (ASSISTENCIAL)',
      adm_curriculo: 'ADM - CURRICULO',
      adm_diploma: 'ADM - DIPLOMA OU CERTIFICADO DE ESCOLARIDADE',
      adm_documentos: 'ADM - DOCUMENTOS PESSOAIS OBRIGATÓRIOS',
      adm_cursos: 'ADM - CURSOS E ESPECIALIZAÇÕES',
      assist_curriculo: 'ASSIST - CURRICULO VITAE',
      assist_diploma: 'ASSIST - DIPLOMA OU CERTIFICADO DE ESCOLARIDADE',
      assist_carteira: 'ASSIST - CARTEIRA DO CONSELHO',
      assist_cursos: 'ASSIST - CURSOS E ESPECIALIZAÇÕES',
      assist_documentos: 'ASSIST - DOCUMENTOS PESSOAIS OBRIGATÓRIOS',
      submission_date: 'Data de Submissão',
      status_triagem: 'Status da Triagem',
      data_hora_triagem: 'Data/Hora da Triagem',
      analista_triagem: 'Analista da Triagem'
    };

    return labelMap[key] || key.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getFieldValue = (key: string): any => {
    if (candidate[key] !== undefined && candidate[key] !== null && candidate[key] !== '') {
      return candidate[key];
    }
    if (candidate.data && candidate.data[key] !== undefined && candidate.data[key] !== null && candidate.data[key] !== '') {
      return candidate.data[key];
    }
    return null;
  };

  const createOrderedFields = (keys: string[]) => {
    return keys.map(key => ({
      key,
      label: formatLabel(key),
      value: getFieldValue(key)
    })).filter(field => field.value !== null);
  };

  const personalFields = createOrderedFields(['name', 'cpf', 'area', 'registration_number']);
  const cargoFields = createOrderedFields(['cargo_administrativo', 'cargo_assistencial']);
  const admFields = createOrderedFields(['adm_curriculo', 'adm_diploma', 'adm_documentos', 'adm_cursos']);
  const assistFields = createOrderedFields(['assist_curriculo', 'assist_diploma', 'assist_carteira', 'assist_cursos', 'assist_documentos']);

  const tabs = [
    { id: 'info', label: 'Informações Pessoais', count: personalFields.length },
    { id: 'cargo', label: 'Cargo', count: cargoFields.length },
    { id: 'adm', label: 'Documentos ADM', count: admFields.length },
    { id: 'assist', label: 'Documentos ASSIST', count: assistFields.length }
  ].filter(tab => tab.count > 0);

  const getActiveFields = () => {
    switch (activeTab) {
      case 'info': return personalFields;
      case 'cargo': return cargoFields;
      case 'adm': return admFields;
      case 'assist': return assistFields;
      default: return [];
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{candidate.name || 'Candidato'}</h2>
            <p className="text-blue-100 text-sm mt-1">
              Nº {candidate.registration_number}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {getActiveFields().map(field => (
              <div key={field.key} className="border-b border-gray-200 pb-4 last:border-b-0">
                <dt className="text-sm font-semibold text-gray-700 mb-2">
                  {field.label}
                </dt>
                <dd className="text-sm text-gray-900">
                  {renderValue(field.value)}
                </dd>
              </div>
            ))}

            {getActiveFields().length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum campo disponível nesta seção</p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
