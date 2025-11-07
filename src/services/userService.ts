import { User } from '../contexts/AuthContext';

export interface AssignmentRequest {
  candidateIds: string[];
  analystId: string;
  adminId: string;
}

// Serviço para comunicação com Google Sheets
class GoogleSheetsService {
  private scriptUrl: string;

  constructor(scriptUrl: string) {
    this.scriptUrl = scriptUrl;
  }

  async fetchData(action: string, data?: any): Promise<any> {
    try {
      const url = new URL(this.scriptUrl);
      url.searchParams.append('action', action);

      if (data) {
        Object.keys(data).forEach(key => {
          url.searchParams.append(key, String(data[key]));
        });
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        redirect: 'follow'
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erro na comunicação com Google Apps Script:', error);
      throw error;
    }
  }
}

// URL do seu Google Apps Script
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzeUN52MaVkpQsORTIIiAkhHSVrlVR82UrISGLOoeyWsHCJlseTPS1Te9Mst24AcfpBhA/exec';
const sheetsService = new GoogleSheetsService(SCRIPT_URL);

export async function getUsers(): Promise<User[]> {
  try {
    const result = await sheetsService.fetchData('getAllUsers');
    if (result && result.users) {
      return result.users.map((user: any) => ({
        id: user.Email || user.id,
        email: user.Email || user.email,
        name: user.Nome || user.name,
        role: user.Role || user.role,
        active: user.Ativo !== undefined ? user.Ativo : user.active,
        password: user.Password || user.password
      }));
    }
    return [];
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    throw error;
  }
}

export async function getAnalysts(): Promise<User[]> {
  try {
    const users = await getUsers();
    return users.filter((user: User) => user.role === 'analista' && user.active);
  } catch (error) {
    console.error('Erro ao buscar analistas:', error);
    throw error;
  }
}

export async function createUser(user: Omit<User, 'id' | 'active'>): Promise<User> {
  try {
    return await sheetsService.fetchData('createUser', user);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  try {
    return await sheetsService.fetchData('updateUser', { id, updates });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
}

export async function deactivateUser(id: string): Promise<void> {
  try {
    await sheetsService.fetchData('deactivateUser', { id });
  } catch (error) {
    console.error('Erro ao desativar usuário:', error);
    throw error;
  }
}

export async function assignCandidates(request: AssignmentRequest): Promise<void> {
  try {
    await sheetsService.fetchData('assignCandidates', request);
  } catch (error) {
    console.error('Erro ao atribuir candidatos:', error);
    throw error;
  }
}

export async function unassignCandidates(candidateIds: string[]): Promise<void> {
  try {
    await sheetsService.fetchData('unassignCandidates', { candidateIds });
  } catch (error) {
    console.error('Erro ao remover atribuição de candidatos:', error);
    throw error;
  }
}
