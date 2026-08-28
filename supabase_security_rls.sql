-- ========================================================================
-- SCRIPT DE SEGURANÇA MESTRE: ATIVAÇÃO DE ROW LEVEL SECURITY (RLS)
-- ShapeMap App - Proteção Total do Banco de Dados
-- ========================================================================
-- Execute este script no SQL Editor do painel do seu Supabase (https://supabase.com/dashboard).

-- 1. HABILITAR RLS NAS TABELAS PRINCIPAIS
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- 2. LIMPAR POLÍTICAS ANTIGAS (PARA EVITAR DUPLICAÇÃO)
DROP POLICY IF EXISTS "trainers_select_policy" ON public.trainers;
DROP POLICY IF EXISTS "trainers_insert_policy" ON public.trainers;
DROP POLICY IF EXISTS "trainers_update_policy" ON public.trainers;
DROP POLICY IF EXISTS "trainers_delete_policy" ON public.trainers;

DROP POLICY IF EXISTS "students_select_policy" ON public.students;
DROP POLICY IF EXISTS "students_insert_policy" ON public.students;
DROP POLICY IF EXISTS "students_update_policy" ON public.students;
DROP POLICY IF EXISTS "students_delete_policy" ON public.students;

DROP POLICY IF EXISTS "evaluations_select_policy" ON public.evaluations;
DROP POLICY IF EXISTS "evaluations_insert_policy" ON public.evaluations;
DROP POLICY IF EXISTS "evaluations_update_policy" ON public.evaluations;
DROP POLICY IF EXISTS "evaluations_delete_policy" ON public.evaluations;

-- ========================================================================
-- 3. POLÍTICAS DA TABELA TRAINERS (PROFISSIONAIS)
-- ========================================================================
-- Treinador só pode visualizar a sua própria conta ou contar referências
CREATE POLICY "trainers_select_policy" 
ON public.trainers 
FOR SELECT 
TO authenticated 
USING (
    auth.uid() = id OR referred_by = auth.uid()::text
);

-- Treinador só pode inserir seu próprio registro
CREATE POLICY "trainers_insert_policy" 
ON public.trainers 
FOR INSERT 
TO authenticated 
WITH CHECK (
    auth.uid() = id
);

-- Treinador só pode atualizar seu próprio perfil
CREATE POLICY "trainers_update_policy" 
ON public.trainers 
FOR UPDATE 
TO authenticated 
USING (
    auth.uid() = id
) 
WITH CHECK (
    auth.uid() = id
);

-- Treinador só pode deletar sua própria conta
CREATE POLICY "trainers_delete_policy" 
ON public.trainers 
FOR DELETE 
TO authenticated 
USING (
    auth.uid() = id
);

-- ========================================================================
-- 4. POLÍTICAS DA TABELA STUDENTS (ALUNOS)
-- ========================================================================
-- Treinador só pode visualizar seus próprios alunos
CREATE POLICY "students_select_policy" 
ON public.students 
FOR SELECT 
TO authenticated 
USING (
    auth.uid() = trainer_id
);

-- Treinador só pode cadastrar alunos para si mesmo
CREATE POLICY "students_insert_policy" 
ON public.students 
FOR INSERT 
TO authenticated 
WITH CHECK (
    auth.uid() = trainer_id
);

-- Treinador só pode editar seus próprios alunos
CREATE POLICY "students_update_policy" 
ON public.students 
FOR UPDATE 
TO authenticated 
USING (
    auth.uid() = trainer_id
) 
WITH CHECK (
    auth.uid() = trainer_id
);

-- Treinador só pode excluir seus próprios alunos
CREATE POLICY "students_delete_policy" 
ON public.students 
FOR DELETE 
TO authenticated 
USING (
    auth.uid() = trainer_id
);

-- ========================================================================
-- 5. POLÍTICAS DA TABELA EVALUATIONS (AVALIAÇÕES FÍSICAS)
-- ========================================================================
-- Treinador só pode visualizar avaliações de alunos que pertencem a ele
CREATE POLICY "evaluations_select_policy" 
ON public.evaluations 
FOR SELECT 
TO authenticated 
USING (
    student_id IN (
        SELECT id FROM public.students WHERE trainer_id = auth.uid()
    )
);

-- Treinador só pode criar avaliações para seus próprios alunos
CREATE POLICY "evaluations_insert_policy" 
ON public.evaluations 
FOR INSERT 
TO authenticated 
WITH CHECK (
    student_id IN (
        SELECT id FROM public.students WHERE trainer_id = auth.uid()
    )
);

-- Treinador só pode atualizar avaliações dos seus alunos
CREATE POLICY "evaluations_update_policy" 
ON public.evaluations 
FOR UPDATE 
TO authenticated 
USING (
    student_id IN (
        SELECT id FROM public.students WHERE trainer_id = auth.uid()
    )
) 
WITH CHECK (
    student_id IN (
        SELECT id FROM public.students WHERE trainer_id = auth.uid()
    )
);

-- Treinador só pode excluir avaliações dos seus alunos
CREATE POLICY "evaluations_delete_policy" 
ON public.evaluations 
FOR DELETE 
TO authenticated 
USING (
    student_id IN (
        SELECT id FROM public.students WHERE trainer_id = auth.uid()
    )
);
