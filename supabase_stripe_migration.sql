-- ==========================================
-- SCRIPT DE MIGRAÇÃO: INTEGRAÇÃO STRIPE
-- ==========================================
-- Execute este script no SQL Editor do painel do seu Supabase.

-- 1. Adicionar colunas de assinatura à tabela trainers
ALTER TABLE public.trainers 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_id TEXT,
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE;

-- 2. Atualizar a trigger de cadastro para iniciar novas contas como 'inactive' por padrão
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.trainers (
        id, nome, email, cor_primaria, lang, settings, 
        subscription_status, current_period_end
    )
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'nome', 'Prof. Novo'),
        new.email,
        '#1A1A2E',
        'pt',
        '{
            "defaultMetodo": "pollock7",
            "anamnesePerguntas": [
                "Já treinou antes?",
                "Treina há quanto tempo?",
                "Tempo sem atividade física?",
                "Objetivo?",
                "Frequência semanal?",
                "Tempo de treino por dia?",
                "Doença/Problema de saúde?",
                "Limitação de movimento?",
                "Dor em algum movimento?",
                "Cirurgias?",
                "Medicamento controlado?",
                "Está fazendo dieta?",
                "Consumo de alcool?",
                "Fuma?"
            ],
            "perimetriaCampos": [
                { "label": "Pescoço", "key": "pescoco", "active": true },
                { "label": "Ombros", "key": "ombros", "active": true },
                { "label": "Peitoral", "key": "peitoral", "active": true },
                { "label": "Cintura", "key": "cintura", "active": true },
                { "label": "Abdominal", "key": "abdominal", "active": true },
                { "label": "Quadril", "key": "quadril", "active": true },
                { "label": "Braço Dir.", "key": "bracoDireito", "active": true },
                { "label": "Braço Esq.", "key": "bracoEsquerdo", "active": true },
                { "label": "Coxa Dir.", "key": "coxaDireita", "active": true },
                { "label": "Coxa Esq.", "key": "coxaEsquerda", "active": true },
                { "label": "Panturrilha Dir.", "key": "panturrilhaDireita", "active": true },
                { "label": "Panturrilha Esq.", "key": "panturrilhaEsquerda", "active": true }
            ],
            "exerciciosForca": ["Supino Reto", "Agachamento", "Puxada Aberta", "Leg Press 45°", "Rosca Direta", "Puxada Pulley", "Tríceps Pulley"]
        }'::jsonb,
        'inactive', -- Inicia inativo (sem acesso)
        NULL       -- Sem período de validade inicial
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
