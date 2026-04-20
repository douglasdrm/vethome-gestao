'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/AppShell';
import { 
  Stethoscope, 
  Plus, 
  Search, 
  TrendingUp, 
  Trash2, 
  Edit3, 
  Loader2,
  Clock,
  Tag,
  DollarSign,
  Package,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Servico {
  id: string;
  nome: string;
  preco: number;
  categoria: string;
  tempo_estimado_min: number;
}

interface ItemEstoque {
  id: string;
  nome: string;
  categoria: string;
  preco_venda?: number;
  unidade: string;
}

export default function ServicosPage() {
  const [activeTab, setActiveTab] = useState<'servicos' | 'produtos'>('servicos');
  const [loading, setLoading] = useState(true);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [produtos, setProdutos] = useState<ItemEstoque[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    preco: '',
    categoria: 'Consulta',
    tempo_estimado_min: '30'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Busca Serviços
      const { data: servs, error: sErr } = await supabase
        .from('servicos')
        .select('*')
        .order('nome');
      
      if (sErr) throw sErr;
      setServicos(servs || []);

      // Busca Produtos (Estoque)
      const { data: prods, error: pErr } = await supabase
        .from('estoque')
        .select('id, nome, categoria, preco_venda, unidade')
        .order('nome');
      
      if (!pErr) setProdutos(prods || []);

    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (servico?: Servico) => {
    if (servico) {
      setEditId(servico.id);
      setFormData({
        nome: servico.nome,
        preco: servico.preco.toString(),
        categoria: servico.categoria || 'Consulta',
        tempo_estimado_min: (servico.tempo_estimado_min || 30).toString()
      });
    } else {
      setEditId(null);
      setFormData({
        nome: '',
        preco: '',
        categoria: 'Consulta',
        tempo_estimado_min: '30'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sessão expirada');

      const payload = {
        user_id: user.id,
        nome: formData.nome,
        preco: parseFloat(formData.preco),
        categoria: formData.categoria,
        tempo_estimado_min: parseInt(formData.tempo_estimado_min)
      };

      if (editId) {
        const { error } = await supabase
          .from('servicos')
          .update(payload)
          .eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('servicos')
          .insert([payload]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
    
    try {
      const { error } = await supabase.from('servicos').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredServicos = servicos.filter(s => 
    s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProdutos = produtos.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-4">
              <div className="p-3 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-100 text-white">
                <DollarSign size={28} />
              </div>
              Serviços & Preços
            </h1>
            <p className="text-slate-400 font-medium mt-2 ml-1">Gerencie o catálogo de valores da sua clínica.</p>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => handleOpenModal()}
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-[2rem] font-bold shadow-xl flex items-center gap-2 transition-all active:scale-95"
            >
              <Plus size={20} />
              Novo Serviço
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-[2rem] w-fit border border-slate-200">
          <button 
            onClick={() => setActiveTab('servicos')}
            className={`px-8 py-3 rounded-[1.8rem] text-sm font-bold transition-all ${activeTab === 'servicos' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Serviços Clínicos
          </button>
          <button 
            onClick={() => setActiveTab('produtos')}
            className={`px-8 py-3 rounded-[1.8rem] text-sm font-bold transition-all ${activeTab === 'produtos' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Produtos em Estoque
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text" 
              placeholder={`Buscar em ${activeTab === 'servicos' ? 'serviços' : 'produtos'}...`}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[2rem] focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-sm font-semibold shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-medium">Carregando catálogo...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'servicos' ? (
              filteredServicos.length > 0 ? (
                filteredServicos.map((s) => (
                  <div key={s.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                       <button onClick={() => handleOpenModal(s)} className="p-2 bg-slate-50 text-slate-500 hover:text-emerald-600 rounded-xl transition-colors shadow-sm"><Edit3 size={16} /></button>
                       <button onClick={() => handleDelete(s.id)} className="p-2 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-xl transition-colors shadow-sm"><Trash2 size={16} /></button>
                    </div>
                    
                    <div className="mb-4">
                      <span className="inline-flex px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-3">
                        {s.categoria}
                      </span>
                      <h3 className="text-xl font-bold text-slate-800 leading-tight pr-12">{s.nome}</h3>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-50">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock size={16} />
                        <span className="text-xs font-bold">{s.tempo_estimado_min} min</span>
                      </div>
                      <div className="text-2xl font-black text-slate-900 tracking-tight">
                        R$ {s.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center animate-in fade-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Stethoscope size={40} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Nenhum serviço encontrado</h3>
                  <p className="text-slate-500">Comece cadastrando sua primeira consulta ou procedimento.</p>
                </div>
              )
            ) : (
              filteredProdutos.length > 0 ? (
                filteredProdutos.map((p) => (
                  <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                    <div className="mb-4">
                      <span className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-3">
                        {p.categoria}
                      </span>
                      <h3 className="text-xl font-bold text-slate-800 leading-tight">{p.nome}</h3>
                      <p className="text-xs text-slate-400 font-medium mt-1">Unidade: {p.unidade}</p>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-50">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Package size={16} />
                        <span className="text-xs font-bold whitespace-nowrap">Disponível em estoque</span>
                      </div>
                      <div className="text-2xl font-black text-slate-900 tracking-tight">
                        {p.preco_venda 
                          ? `R$ ${p.preco_venda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                          : <span className="text-slate-300 text-sm">Sem preço</span>
                        }
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center">
                   <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Package size={40} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Seu estoque está vazio</h3>
                  <p className="text-slate-500">Cadastre produtos no módulo de Estoque para vê-los aqui.</p>
                </div>
              )
            )}
          </div>
        )}

      </div>

      {/* Modal de Serviço */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative overflow-hidden animate-in zoom-in fade-in duration-300">
            <div className="p-10">
              <h2 className="text-2xl font-black text-slate-800 mb-2">{editId ? 'Editar Serviço' : 'Novo Serviço'}</h2>
              <p className="text-slate-500 text-sm mb-8 font-medium">Preencha os detalhes do procedimento clínico.</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nome do Serviço</label>
                  <input 
                    required
                    type="text"
                    placeholder="Ex: Consulta Clínica"
                    className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold"
                    value={formData.nome}
                    onChange={e => setFormData({...formData, nome: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Preço (R$)</label>
                    <input 
                      required
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold"
                      value={formData.preco}
                      onChange={e => setFormData({...formData, preco: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Tempo (min)</label>
                    <input 
                      required
                      type="number"
                      placeholder="30"
                      className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold"
                      value={formData.tempo_estimado_min}
                      onChange={e => setFormData({...formData, tempo_estimado_min: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Categoria</label>
                  <select 
                    className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27none%27%20viewBox%3D%270%200%2020%2020%27%3E%3Cpath%20stroke%3D%27%236B7280%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%20stroke-width%3D%271.5%27%20d%3D%27m6%208%204%204%204-4%27%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1rem_center] bg-no-repeat"
                    value={formData.categoria}
                    onChange={e => setFormData({...formData, categoria: e.target.value})}
                  >
                    <option>Consulta</option>
                    <option>Vacina</option>
                    <option>Cirurgia</option>
                    <option>Exame</option>
                    <option>Outros</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                   <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-8 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={modalLoading}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-slate-200 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
                  >
                    {modalLoading ? <Loader2 className="animate-spin" size={20} /> : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </AppShell>
  );
}
