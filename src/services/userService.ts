import { supabase } from './supabaseClient';
import { User } from '../contexts/AuthContext';

export interface AssignmentRequest {
  candidateIds: string[];
  analystId: string;
  adminId: string;
}

export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('active', true)
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function getAnalysts(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('active', true)
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function createUser(user: Omit<User, 'id' | 'active'>): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .insert({
      email: user.email,
      name: user.name,
      role: user.role,
      active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deactivateUser(id: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ active: false })
    .eq('id', id);

  if (error) throw error;
}

export async function assignCandidates(request: AssignmentRequest): Promise<void> {
  const { error } = await supabase
    .from('candidates')
    .update({
      assigned_to: request.analystId,
      assigned_by: request.adminId,
      assigned_at: new Date().toISOString(),
      status: 'pendente',
    })
    .in('id', request.candidateIds);

  if (error) throw error;
}

export async function unassignCandidates(candidateIds: string[]): Promise<void> {
  const { error } = await supabase
    .from('candidates')
    .update({
      assigned_to: null,
      assigned_by: null,
      assigned_at: null,
      status: 'pendente',
    })
    .in('id', candidateIds);

  if (error) throw error;
}
