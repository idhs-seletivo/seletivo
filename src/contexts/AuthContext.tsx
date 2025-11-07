import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'analista';
  active: boolean;
  password?: string; // Para autenticação básica
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
  isAnalyst: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Serviço para comunicação com Google Sheets
class GoogleSheetsService {
  private scriptUrl: string;

  constructor(scriptUrl: string) {
    this.scriptUrl = scriptUrl;
  }

  async fetchData(action: string, data?: any): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('action', action);
      
      if (data) {
        formData.append('data', JSON.stringify(data));
      }

      const response = await fetch(this.scriptUrl, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro na comunicação com Google Apps Script:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.fetchData('getUserByEmail', { email });
  }

  async getUserById(id: string): Promise<User | null> {
    return this.fetchData('getUserById', { id });
  }
}

// URL do seu Google Apps Script (substitua pela sua URL)
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzeUN52MaVkpQsORTIIiAkhHSVrlVR82UrISGLOoeyWsHCJlseTPS1Te9Mst24AcfpBhA/exec';
const sheetsService = new GoogleSheetsService(SCRIPT_URL);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar se há usuário salvo no localStorage
  useEffect(() => {
    checkStoredUser();
  }, []);

  async function checkStoredUser() {
    try {
      setLoading(true);
      const storedUser = localStorage.getItem('currentUser');
      
      if (storedUser) {
        const userData: User = JSON.parse(storedUser);
        
        // Verificar se o usuário ainda existe/está ativo
        const freshUser = await sheetsService.getUserById(userData.id);
        
        if (freshUser && freshUser.active) {
          setUser(freshUser);
        } else {
          // Usuário não existe mais ou está inativo
          localStorage.removeItem('currentUser');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Erro ao verificar usuário armazenado:', error);
      localStorage.removeItem('currentUser');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    try {
      setLoading(true);
      
      // Buscar usuário pelo email
      const userData = await sheetsService.getUserByEmail(email.toLowerCase().trim());

      if (!userData) {
        throw new Error('Usuário não encontrado');
      }

      if (!userData.active) {
        throw new Error('Usuário inativo');
      }

      // Verificar senha (básico - em produção use hash)
      if (userData.password !== password) {
        throw new Error('Senha incorreta');
      }

      // Remover password do objeto user antes de salvar
      const { password: _, ...userWithoutPassword } = userData;
      
      setUser(userWithoutPassword as User);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      setLoading(true);
      setUser(null);
      localStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setLoading(false);
    }
  }

  function isAdmin(): boolean {
    return user?.role === 'admin';
  }

  function isAnalyst(): boolean {
    return user?.role === 'analista';
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isAnalyst }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
