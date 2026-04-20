-- ########################################################
-- VETHOME GESTÃO - DATABASE SCHEMA (V2 - Timeline Unified)
-- ########################################################

-- 1. Perfil do Veterinário
CREATE TABLE IF NOT EXISTS public.perfis (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    nome TEXT,
    crmv TEXT,
    whatsapp_padrao TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Clientes
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    nome TEXT NOT NULL,
    whatsapp TEXT,
    endereco TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON public.clientes (nome);
CREATE INDEX IF NOT EXISTS idx_clientes_user ON public.clientes (user_id);

-- 3. Animais (Pacientes)
CREATE TABLE IF NOT EXISTS public.animais (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    cliente_id UUID REFERENCES public.clientes NOT NULL,
    nome TEXT NOT NULL,
    especie TEXT,
    raca TEXT,
    data_nascimento DATE,
    peso_atual DECIMAL,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_animais_nome ON public.animais (nome);
CREATE INDEX IF NOT EXISTS idx_animais_cliente ON public.animais (cliente_id);

-- 4. Eventos (TIMELINE CENTRAL - FONTE ÚNICA DE VERDADE)
CREATE TABLE IF NOT EXISTS public.eventos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    animal_id UUID REFERENCES public.animais NOT NULL,
    tipo TEXT NOT NULL, -- 'atendimento', 'vacina', 'receita', 'observacao', 'peso'
    titulo TEXT NOT NULL,
    descricao TEXT,
    data TIMESTAMPTZ DEFAULT now(),
    metadata JSONB DEFAULT '{}', -- Dados extras (ex: dosagem, valor, status)
    referencia_id UUID, -- ID original (do registro de vacina ou atendimento se for separado)
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_eventos_animal_data ON public.eventos (animal_id, data DESC);

-- 5. Atendimentos (Dados detalhados se necessário)
CREATE TABLE IF NOT EXISTS public.atendimentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    animal_id UUID REFERENCES public.animais NOT NULL,
    data TIMESTAMPTZ DEFAULT now(),
    descricao TEXT,
    procedimentos TEXT,
    valor DECIMAL DEFAULT 0,
    pagamento_status TEXT DEFAULT 'pendente',
    forma_pagamento TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Vacinas (Dados detalhados)
CREATE TABLE IF NOT EXISTS public.vacinas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    animal_id UUID REFERENCES public.animais NOT NULL,
    nome TEXT NOT NULL,
    data_aplicacao DATE DEFAULT CURRENT_DATE,
    proxima_dose DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Agenda
CREATE TABLE IF NOT EXISTS public.agenda (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    cliente_id UUID REFERENCES public.clientes NOT NULL,
    animal_id UUID REFERENCES public.animais NOT NULL,
    data_hora TIMESTAMPTZ NOT NULL,
    descricao TEXT,
    status TEXT DEFAULT 'agendado', -- 'agendado', 'concluido', 'cancelado'
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_agenda_data ON public.agenda (data_hora);

-- 8. Financeiro
CREATE TABLE IF NOT EXISTS public.financeiro (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    tipo TEXT NOT NULL, -- 'entrada', 'saida'
    valor DECIMAL NOT NULL,
    data TIMESTAMPTZ DEFAULT now(),
    descricao TEXT,
    atendimento_id UUID REFERENCES public.atendimentos,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Modelos de Mensagem
CREATE TABLE IF NOT EXISTS public.modelos_mensagem (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    titulo TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ####################
-- LOGICA DE NEGOCIO (FUNCTIONS & TRIGGERS)
-- ####################

-- 1. Função genérica para gerar evento na timeline
CREATE OR REPLACE FUNCTION public.fn_gerar_evento()
RETURNS TRIGGER AS $$
DECLARE
    v_titulo TEXT;
    v_animal_id UUID;
    v_user_id UUID;
BEGIN
    v_animal_id := NEW.animal_id;
    v_user_id := NEW.user_id;

    -- Definir título baseado no tipo
    IF TG_ARGV[0] = 'atendimento' THEN
        v_titulo := 'Atendimento Clínico';
    ELSIF TG_ARGV[0] = 'vacina' THEN
        v_titulo := 'Vacinação: ' || NEW.nome;
    ELSIF TG_ARGV[0] = 'peso' THEN
        v_titulo := 'Pesagem: ' || NEW.peso_atual || 'kg';
    ELSE
        v_titulo := 'Registro de ' || TG_ARGV[0];
    END IF;

    INSERT INTO public.eventos (user_id, animal_id, tipo, titulo, descricao, data, referencia_id)
    VALUES (
        v_user_id,
        v_animal_id,
        TG_ARGV[0],
        v_titulo,
        COALESCE(NEW.descricao, ''),
        now(),
        NEW.id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Função para gerar financeiro automático
CREATE OR REPLACE FUNCTION public.fn_gerar_financeiro_atendimento()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.valor > 0 THEN
        INSERT INTO public.financeiro (user_id, tipo, valor, data, descricao, atendimento_id)
        VALUES (
            NEW.user_id, 
            'entrada', 
            NEW.valor, 
            COALESCE(NEW.data, now()), 
            'Atendimento: ' || LEFT(NEW.descricao, 50), 
            NEW.id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ####################
-- RLS (SEGURANÇA)
-- ####################

ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atendimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modelos_mensagem ENABLE ROW LEVEL SECURITY;

-- Políticas unificadas (Simplified)
CREATE POLICY "Acesso total dono" ON public.clientes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Acesso total dono" ON public.animais FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Acesso total dono" ON public.eventos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Acesso total dono" ON public.atendimentos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Acesso total dono" ON public.vacinas FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Acesso total dono" ON public.agenda FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Acesso total dono" ON public.financeiro FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Acesso total dono" ON public.modelos_mensagem FOR ALL USING (auth.uid() = user_id);

-- ####################
-- GATILHOS (TRIGGERS)
-- ####################

-- Atendimentos
CREATE TRIGGER trg_atendimento_timeline
AFTER INSERT ON public.atendimentos
FOR EACH ROW EXECUTE PROCEDURE public.fn_gerar_evento('atendimento');

CREATE TRIGGER trg_atendimento_financeiro
AFTER INSERT ON public.atendimentos
FOR EACH ROW EXECUTE PROCEDURE public.fn_gerar_financeiro_atendimento();

-- Vacinas
CREATE TRIGGER trg_vacina_timeline
AFTER INSERT ON public.vacinas
FOR EACH ROW EXECUTE PROCEDURE public.fn_gerar_evento('vacina');

-- ####################
-- FUNÇÕES RPC (INTERFACE DA APLICAÇÃO)
-- ####################

-- Função para registrar atendimento rápido
CREATE OR REPLACE FUNCTION public.registrar_atendimento_completo(
    p_animal_id UUID,
    p_descricao TEXT,
    p_procedimentos TEXT,
    p_valor DECIMAL,
    p_forma_pagamento TEXT,
    p_status_pagamento TEXT
) RETURNS UUID AS $$
DECLARE
    v_atendimento_id UUID;
BEGIN
    INSERT INTO public.atendimentos (
        user_id, 
        animal_id, 
        descricao, 
        procedimentos, 
        valor, 
        forma_pagamento, 
        pagamento_status
    ) VALUES (
        auth.uid(),
        p_animal_id,
        p_descricao,
        p_procedimentos,
        p_valor,
        p_forma_pagamento,
        p_status_pagamento
    ) RETURNING id INTO v_atendimento_id;

    RETURN v_atendimento_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
