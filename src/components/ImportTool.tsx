import { useState, useEffect } from 'react';
import { Candidate } from '../types/candidate';
import { processMultipleUrls } from '../services/jotformService';
import {
  FileText,
  GraduationCap,
  CreditCard,
  Award,
  FolderOpen,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

interface DocumentViewerProps {
  candidate: Candidate;
  onFocusDocument?: (docKey: string) => void;
}

interface Document {
  key: string;
  label: string;
  url?: string;
  icon: React.ReactNode;
  isPrimary?: boolean;
}

export default function DocumentViewer({ candidate, onFocusDocument }: DocumentViewerProps) {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  const documents: Document[] = candidate.area === 'Administrativa'
    ? [
        { key: 'curriculo', label: 'Currículo', url: candidate.admCurriculo, icon: <FileText className="w-5 h-5" />, isPrimary: true },
        { key: 'diploma', label: 'Diploma', url: candidate.admDiploma, icon: <GraduationCap className="w-5 h-5" />, isPrimary: true },
        { key: 'documentos', label: 'Documentos Pessoais', url: candidate.admDocumentos, icon: <CreditCard className="w-5 h-5" /> },
        { key: 'cursos', label: 'Cursos', url: candidate.admCursos, icon: <Award className="w-5 h-5" /> }
      ]
    : [
        { key: 'curriculo', label: 'Currículo', url: candidate.assistCurriculo, icon: <FileText className="w-5 h-5" />, isPrimary: true },
        { key: 'diploma', label: 'Diploma', url: candidate.assistDiploma, icon: <GraduationCap className="w-5 h-5" />, isPrimary: true },
        { key: 'carteira', label: 'Carteira do Conselho', url: candidate.assistCarteira, icon: <CreditCard className="w-5 h-5" />, isPrimary: true },
        { key: 'cursos', label: 'Cursos', url: candidate.assistCursos, icon: <Award className="w-5 h-5" /> },
        { key: 'documentos', label: 'Documentos Pessoais', url: candidate.assistDocumentos, icon: <FolderOpen className="w-5 h-5" /> }
      ];

  const availableDocs = documents.filter(doc => doc.url);

  useEffect(() => {
    if (availableDocs.length > 0 && !selectedDoc) {
      const firstPrimary = availableDocs.find(d => d.isPrimary);
      setSelectedDoc(firstPrimary ? firstPrimary.key : availableDocs[0].key);
    }
  }, [candidate.registrationNumber]);

  const handleDocumentSelect = (docKey: string) => {
    setSelectedDoc(docKey);
    onFocusDocument?.(docKey);
  };

  const selectedDocument = availableDocs.find(d => d.key === selectedDoc);
  const processedFiles = processMultipleUrls(selectedDocument?.url);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="p-4 bg-white border-b border-slate-200">
        <div className="mb-3">
          <h2 className="text-lg font-bold text-slate-800">Documentos</h2>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {availableDocs.map((doc) => (
            <button
              key={doc.key}
              onClick={() => handleDocumentSelect(doc.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all whitespace-nowrap ${
                selectedDoc === doc.key
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400 hover:bg-blue-50'
              } ${doc.isPrimary ? 'font-semibold' : ''}`}
            >
              {doc.icon}
              <span className="text-sm">{doc.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Área principal SIMPLIFICADA com rolagem */}
      <div className="flex-1 p-4 overflow-hidden">
        {selectedDocument?.url ? (
          <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
            <div className="p-6 flex-shrink-0">
              <div className="flex items-center gap-3 mb-4">
                {selectedDocument.icon}
                <h3 className="text-xl font-bold text-slate-800">{selectedDocument.label}</h3>
              </div>
            </div>
            
            {/* Container dos arquivos COM ALTURA FIXA E ROLAGEM */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <div className="space-y-3">
                {processedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {file.type === 'pdf' && <FileText className="w-5 h-5 text-blue-600" />}
                        {file.type === 'image' && <Award className="w-5 h-5 text-green-600" />}
                        {file.type === 'jotform' && <ExternalLink className="w-5 h-5 text-purple-600" />}
                        {file.type === 'unknown' && <FolderOpen className="w-5 h-5 text-slate-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold text-slate-700">
                            {processedFiles.length > 1 ? `Arquivo ${idx + 1}` : 'Link do documento'}
                          </span>
                          {file.type === 'pdf' && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">PDF</span>
                          )}
                          {file.type === 'image' && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">Imagem</span>
                          )}
                          {file.type === 'jotform' && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">Jotform</span>
                          )}
                        </div>
                        <div className="bg-white p-3 rounded border border-slate-200 mb-3">
                          <a
                            href={file.displayUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all font-mono"
                          >
                            {file.displayUrl}
                          </a>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={file.displayUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Abrir link
                          </a>
                          {file.type !== 'jotform' && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(file.displayUrl);
                                alert('Link copiado!');
                              }}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-600 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors"
                            >
                              <FileText className="w-4 h-4" />
                              Copiar link
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {processedFiles.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>Nenhum link encontrado</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg shadow-lg py-12">
            <FolderOpen className="w-16 h-16 text-slate-300 mb-4" />
            <p className="text-slate-500">Nenhum documento disponível</p>
          </div>
        )}
      </div>
    </div>
  );
}
