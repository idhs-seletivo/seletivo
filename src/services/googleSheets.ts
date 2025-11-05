import { Candidate } from '../types/candidate';

function extractSpreadsheetId(input: string | undefined): string | undefined {
  if (!input) return undefined;

  const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match) {
    return match[1];
  }

  if (input.includes('/') || input.includes('?') || input.includes('edit') || input.includes('sharing')) {
    console.error('Invalid SPREADSHEET_ID format. Use only the ID, not the full URL.');
    return undefined;
  }

  return input;
}

const SPREADSHEET_ID = extractSpreadsheetId(import.meta.env.VITE_GOOGLE_SHEETS_ID);

let cachedAccessToken: string | null = null;
let cachedSheetName: string | null = null;

export function setAccessToken(token: string) {
  cachedAccessToken = token;
}

export function getAccessToken(): string | null {
  return cachedAccessToken;
}

async function getFirstSheetName(): Promise<string | null> {
  if (cachedSheetName) return cachedSheetName;

  if (!SPREADSHEET_ID || !cachedAccessToken) return null;

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?fields=sheets.properties.title`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${cachedAccessToken}`,
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.sheets && data.sheets.length > 0) {
      cachedSheetName = data.sheets[0].properties.title;
      console.log('First sheet name:', cachedSheetName);
      return cachedSheetName;
    }
  } catch (error) {
    console.error('Error getting sheet name:', error);
  }

  return null;
}

async function updateSheet(range: string, values: any[][]): Promise<boolean> {
  if (!SPREADSHEET_ID || !cachedAccessToken) {
    console.error('Missing configuration for write operation');
    return false;
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?valueInputOption=USER_ENTERED`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${cachedAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error updating sheet:', errorData);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error updating sheet:', error);
    return false;
  }
}

export async function fetchCandidates(): Promise<Candidate[]> {
  if (!SPREADSHEET_ID || SPREADSHEET_ID === 'your_spreadsheet_id_here') {
    console.error('Google Sheets ID not configured correctly.');
    console.error('IMPORTANT: Use only the spreadsheet ID, not the full URL.');
    console.error('Example: 1NaetcGUJ5_HYsQ-NCK3V3zFEnDfyfwmjX4wrUwI7NFw');
    console.error('NOT: https://docs.google.com/spreadsheets/d/1NaetcGUJ5.../edit?usp=sharing');
    throw new Error('Configure o ID da planilha corretamente. Use apenas o ID, não a URL completa.');
  }

  if (!cachedAccessToken) {
    console.warn('No access token available. Please login first.');
    return [];
  }

  try {
    console.log('Fetching candidates from Google Sheets...');

    // Primeiro tenta obter o nome real da primeira aba
    const sheetName = await getFirstSheetName();

    let range = 'A:Z';
    let url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}`;

    // Se conseguiu o nome da aba, usa ele
    if (sheetName) {
      range = `${sheetName}!A:Z`;
      url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}`;
      console.log('Using sheet:', sheetName);
    }

    let response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${cachedAccessToken}`,
      },
    });

    // Se falhar e tinha nome da aba, tenta sem nome
    if (!response.ok && response.status === 400 && sheetName) {
      console.log('Trying without sheet name...');
      range = 'A:Z';
      url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}`;
      response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${cachedAccessToken}`,
        },
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Google Sheets API error:', errorData);

      if (response.status === 403) {
        throw new Error('Acesso negado. Verifique se a API Key está correta e se a Google Sheets API está habilitada.');
      }
      if (response.status === 404) {
        throw new Error('Planilha não encontrada. Verifique o ID da planilha.');
      }

      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    const rows = data.values;

    if (!rows || rows.length < 2) {
      console.warn('No candidate data found');
      return [];
    }

    const headers = rows[0];
    console.log('Available columns:', headers);

    const candidates: Candidate[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];

      if (!row || row.every(cell => !cell || cell.toString().trim() === '')) {
        continue;
      }

      const rowData = new Array(19).fill('');
      for (let j = 0; j < row.length; j++) {
        rowData[j] = row[j] || '';
      }

      const candidate: Candidate = {
        submissionDate: rowData[0],
        name: rowData[1]?.trim() || '',
        cpf: rowData[2],
        area: (rowData[3] as 'Administrativa' | 'Assistencial') || '',
        cargoAdministrativo: rowData[4],
        cargoAssistencial: rowData[5],
        admCurriculo: rowData[6],
        admDiploma: rowData[7],
        admDocumentos: rowData[8],
        admCursos: rowData[9],
        assistCurriculo: rowData[10],
        assistDiploma: rowData[11],
        assistCarteira: rowData[12],
        assistCursos: rowData[13],
        assistDocumentos: rowData[14],
        registrationNumber: rowData[15] || `temp-${i + 1}`,
        statusTriagem: (rowData[16] as 'Classificado' | 'Desclassificado' | 'Revisar') || '',
        dataHoraTriagem: rowData[17],
        analistaTriagem: rowData[18],
      };

      if (candidate.name) {
        candidates.push(candidate);
      }
    }

    console.log(`${candidates.length} candidates loaded successfully`);
    return candidates;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Erro de rede ao conectar com Google Sheets. Verifique sua conexão.');
      throw new Error('Erro de conexão. Verifique sua internet e as configurações do Google Sheets.');
    }
    console.error('Critical error fetching candidates:', error);
    throw error;
  }
}

export async function updateCandidateStatus(
  registrationNumber: string,
  status: 'Classificado' | 'Desclassificado' | 'Revisar',
  analystEmail: string
): Promise<boolean> {
  if (!SPREADSHEET_ID) {
    console.error('Google Sheets ID not configured');
    return false;
  }

  if (!cachedAccessToken) {
    console.error('Access token not available for write operation');
    return false;
  }

  try {
    // Obtém o nome da primeira aba
    const sheetName = await getFirstSheetName();

    let range = 'A:Z';
    let readUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}`;

    if (sheetName) {
      range = `${sheetName}!A:Z`;
      readUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}`;
    }

    let readResponse = await fetch(readUrl, {
      headers: {
        'Authorization': `Bearer ${cachedAccessToken}`,
      },
    });

    // Se falhar e tinha nome da aba, tenta sem nome
    if (!readResponse.ok && readResponse.status === 400 && sheetName) {
      range = 'A:Z';
      readUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}`;
      readResponse = await fetch(readUrl, {
        headers: {
          'Authorization': `Bearer ${cachedAccessToken}`,
        },
      });
    }
    if (!readResponse.ok) {
      throw new Error(`Failed to read sheet: ${readResponse.statusText}`);
    }

    const data = await readResponse.json();
    const rows = data.values;

    if (!rows || rows.length < 2) {
      throw new Error('No data found in sheet');
    }

    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][15] === registrationNumber) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex === -1) {
      console.error(`Candidate with registration number ${registrationNumber} not found`);
      return false;
    }

    const now = new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Usa o mesmo range que foi usado para ler (com ou sem nome da aba)
    const sheetPrefix = range.includes('!') ? range.split('!')[0] + '!' : '';
    const updateRange = `${sheetPrefix}Q${rowIndex}:S${rowIndex}`;
    const values = [[status, now, analystEmail]];

    const success = await updateSheet(updateRange, values);

    if (success) {
      console.log(`Candidate ${registrationNumber} status updated to ${status}`);
    } else {
      console.error('Failed to update candidate status');
    }

    return success;

  } catch (error) {
    console.error('Error updating candidate status:', error);
    return false;
  }
}
