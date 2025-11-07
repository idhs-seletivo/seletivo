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

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.fetchData('getUserRole', { email });
    if (result && !result.error) {
      return {
        id: result.email,
        email: result.email,
        name: result.nome || result.email,
        role: result.role,
        active: true,
        password: ''
      };
    }
    return null;
  }

  async getUserById(id: string): Promise<User | null> {
    const result = await this.fetchData('getUserRole', { email: id });
    if (result && !result.error) {
      return {
        id: result.email,
        email: result.email,
        name: result.nome || result.email,
        role: result.role,
        active: true
      };
    }
    return null;
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

      const userData = await sheetsService.getUserByEmail(email.toLowerCase().trim());

      if (!userData) {
        throw new Error('Usuário não encontrado');
      }

      if (!userData.active) {
        throw new Error('Usuário inativo');
      }

      const userWithoutPassword: User = {
        id: userData.email,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        active: userData.active
      };

      setUser(userWithoutPassword);
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
