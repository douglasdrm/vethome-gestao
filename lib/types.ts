// =============================================
// VETHOME — Database Types
// Gerado com base no schema Supabase
// =============================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ─── Enums ────────────────────────────────────────────────────────────────────

export type StatusAgenda = 'agendado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado';
export type TipoEvento  = 'atendimento' | 'vacina' | 'exame' | 'cirurgia' | 'observacao' | 'receita' | 'retorno';
export type Especie     = 'canina' | 'felina' | 'aviaria' | 'equina' | 'outra';
export type Sexo        = 'macho' | 'femea';
export type TipoLancamento = 'receita' | 'despesa';
export type StatusFinanceiro = 'pendente' | 'pago' | 'cancelado';

// ─── Tables ────────────────────────────────────────────────────────────────────

export interface Cliente {
  id: string;
  user_id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Animal {
  id: string;
  user_id: string;
  cliente_id: string;
  nome: string;
  especie: Especie;
  raca: string | null;
  data_nascimento: string | null;
  sexo: Sexo | null;
  peso_kg: number | null;
  cor: string | null;
  observacoes: string | null;
  foto_url: string | null;
  created_at: string;
  updated_at: string;

  // Joins
  cliente?: Cliente;
}

export interface Evento {
  id: string;
  user_id: string;
  animal_id: string;
  tipo: TipoEvento;
  titulo: string;
  descricao: string | null;
  data: string;
  metadata: Json | null;
  atendimento_id: string | null;
  created_at: string;

  // Joins
  animal?: Animal;
}

export interface Agenda {
  id: string;
  user_id: string;
  cliente_id: string;
  animal_id: string;
  data_hora: string;
  duracao_min: number;
  descricao: string | null;
  status: StatusAgenda;
  valor: number | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;

  // Joins
  cliente?: Cliente;
  animal?: Animal;
}

export interface Atendimento {
  id: string;
  user_id: string;
  animal_id: string;
  cliente_id: string;
  data_hora: string;
  tipo: TipoEvento;
  anamnese: string | null;
  diagnostico: string | null;
  tratamento: string | null;
  prescricao: string | null;
  peso_kg: number | null;
  temperatura: number | null;
  valor: number | null;
  status_pagamento: StatusFinanceiro;
  observacoes: string | null;
  created_at: string;
  updated_at: string;

  // Joins
  animal?: Animal;
  cliente?: Cliente;
}

export interface Vacina {
  id: string;
  user_id: string;
  animal_id: string;
  nome: string;
  fabricante: string | null;
  lote: string | null;
  data_aplicacao: string;
  data_reforco: string | null;
  observacoes: string | null;
  created_at: string;

  // Joins
  animal?: Animal;
}

export interface Financeiro {
  id: string;
  user_id: string;
  tipo: TipoLancamento;
  descricao: string;
  valor: number;
  data: string;
  status: StatusFinanceiro;
  atendimento_id: string | null;
  cliente_id: string | null;
  observacoes: string | null;
  created_at: string;

  // Joins
  cliente?: Cliente;
}

// ─── Request/Response DTOs ────────────────────────────────────────────────────

export type CreateClienteDto = Omit<Cliente, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type UpdateClienteDto = Partial<CreateClienteDto>;

export type CreateAnimalDto  = Omit<Animal,  'id' | 'user_id' | 'created_at' | 'updated_at' | 'cliente'>;
export type UpdateAnimalDto  = Partial<CreateAnimalDto>;

export type CreateAgendaDto  = Omit<Agenda,  'id' | 'user_id' | 'created_at' | 'updated_at' | 'cliente' | 'animal'>;
export type UpdateAgendaDto  = Partial<CreateAgendaDto>;

export type CreateAtendimentoDto = Omit<Atendimento, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'animal' | 'cliente'>;
export type UpdateAtendimentoDto = Partial<CreateAtendimentoDto>;

export type CreateVacinaDto = Omit<Vacina, 'id' | 'user_id' | 'created_at' | 'animal'>;
export type UpdateVacinaDto = Partial<CreateVacinaDto>;

// ─── Supabase Database type ────────────────────────────────────────────────────

export type Database = {
  public: {
    Tables: {
      clientes: { Row: Cliente; Insert: CreateClienteDto & { user_id: string }; Update: UpdateClienteDto };
      animais:  { Row: Animal;  Insert: CreateAnimalDto  & { user_id: string }; Update: UpdateAnimalDto };
      eventos:  { Row: Evento;  Insert: Omit<Evento, 'id' | 'created_at'>; Update: Partial<Evento> };
      agenda:   { Row: Agenda;  Insert: CreateAgendaDto  & { user_id: string }; Update: UpdateAgendaDto };
      atendimentos: { Row: Atendimento; Insert: CreateAtendimentoDto & { user_id: string }; Update: UpdateAtendimentoDto };
      vacinas:  { Row: Vacina;  Insert: CreateVacinaDto  & { user_id: string }; Update: UpdateVacinaDto };
      financeiro: { Row: Financeiro; Insert: Omit<Financeiro, 'id' | 'created_at' | 'cliente'>; Update: Partial<Financeiro> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      status_agenda: StatusAgenda;
      tipo_evento: TipoEvento;
      especie: Especie;
      sexo: Sexo;
      tipo_lancamento: TipoLancamento;
      status_financeiro: StatusFinanceiro;
    };
  };
};
