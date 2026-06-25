import { useState, useCallback, useRef, useEffect } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, LabelList
} from "recharts";
import { supabase } from "./supabase";


// ── TRANSLATIONS ──────────────────────────────────────────────────────────────
const TR = {
  pt: {
    // Nav
    inicio: "Início",
    ajustes: "Ajustes",
    perfil: "Perfil",
    // Login
    entrar_conta: "Entrar na conta",
    acesse_sua_area: "Acesse sua área profissional",
    email: "E-mail",
    senha: "Senha",
    mantenha_me_conectado: "Mantenha-me conectado",
    entrando: "Entrando...",
    entrar: "Entrar",
    esqueci_senha: "Esqueci minha senha",
    nao_tem_conta: "Não tem conta?",
    criar_conta_gratis: "Criar conta",
    plataforma_av: "Plataforma de Avaliação Física",
    // Home
    avaliador: "Avaliador(a)",
    alunos: "Alunos",
    pesquisar_aluno: "Pesquisar aluno...",
    novo_aluno: "Novo Aluno",
    masculino: "Masculino",
    feminino: "Feminino",
    genero: "Gênero",
    telefone: "Telefone",
    data_nascimento: "Data de Nascimento",
    cadastrar_aluno: "Cadastrar Aluno",
    nome_completo: "Nome Completo",
    nenhum_aluno: "Nenhum aluno encontrado",
    cadastre_primeiro_aluno: "Cadastre seu primeiro aluno para começar.",
    excluir_aluno: "Excluir Aluno",
    confirmar_exclusao: "Confirmar exclusão",
    realmente_deseja_excluir: "Você realmente deseja excluir",
    acao_nao_desfeita: "Esta ação não pode ser desfeita.",
    nao_cancelar: "Não, cancelar",
    sim_excluir: "Sim, excluir",
    bem_vindo: "Seja bem-vindo",
    todos_alunos: "Todos os Alunos",
    nenhum_aluno_cadastrado: "Nenhum aluno cadastrado ainda",
    clique_novo_aluno: 'Clique em "Novo Aluno" acima para começar.',
    nenhum_aluno_busca: "Nenhum aluno encontrado para sua busca.",
    este_mes: "Este mês",
    excluir: "Excluir",
    cadastrar: "Cadastrar",
    nome_completo_placeholder: "Ex: João Silva",
    // Aluno
    ultima_aval: "última: ",
    sem_avaliacoes: "Sem avaliações",
    nova_avaliacao: "Nova Avaliação",
    selecione_2_a_5: "Selecione de 2 a 5 avaliações para comparar",
    comparar: "Comparar",
    nenhuma_avaliacao: "Nenhuma avaliação",
    inicie_primeira_av: "Inicie a primeira avaliação física.",
    iniciar_avaliacao: "Iniciar Avaliação",
    historico_av: "Histórico de Avaliações",
    avaliacao_num: "Avaliação #",
    editar_aluno: "Editar Aluno",
    salvar_alteracoes: "Salvar Alterações",
    cancelar: "Cancelar",
    // AvalForm
    dados: "Dados",
    anamnese: "Anamnese",
    composicao: "Composição",
    perimetria: "Perimetria",
    forca: "Testes de Força",
    flexibilidade: "Flexibilidade",
    cardiovascular: "Cardiovascular",
    metabolismo: "Metabolismo",
    fotos: "Fotos",
    resultados: "Resultados",
    salvo_automaticamente: "Salvo automaticamente",
    metodo_avaliacao: "Método de Avaliação",
    add_outra_comp: "Adicionar outra avaliação de composição",
    media_de: "Média de ",
    avaliacoes: "Avaliações",
    dobras_cutaneas: "Dobras Cutâneas",
    bioimpedancia: "Bioimpedância",
    gordura: "% Gordura",
    massa_magra: "Massa Magra",
    massa_gorda: "Massa Gorda",
    peso: "Peso",
    altura: "Altura",
    idade: "Idade",
    gordura_corporal: "Gordura Corporal",
    medidas_cm: "Medidas em centímetros",
    exercicio: "Exercício",
    repeticoes: "Repetições",
    carga: "Carga",
    add_exercicio: "Adicionar Exercício",
    banco_wells: "Banco de Wells",
    classificacao: "Classificação",
    fc_repouso: "Frequência Cardíaca de Repouso",
    fc_recuperacao: "Frequência Cardíaca de Recuperação",
    fc_maxima: "Frequência Cardíaca Máxima",
    pressao_arterial: "Pressão Arterial",
    vo2_maximo: "VO2 Máximo",
    taxa_metabolica: "Taxa Metabólica Basal",
    gasto_energetico: "Gasto Energético Diário",
    registro_fotografico: "Registro Fotográfico",
    anotacoes_fotos: "Anotações das fotos",
    concluida: "Avaliação Concluída!",
    todos_dados_registrados: "Todos os dados foram registrados com sucesso.",
    salvar_pdf: "Salvar como PDF",
    continuar_sem_pdf: "Continuar sem PDF",
    resumo_geral: "Resumo Geral da Avaliação",
    // ConfirmLeave
    alteracoes_nao_salvas: "Alterações não salvas",
    se_sair_agora: "Você fez alterações nesta avaliação. Se sair agora, os novos dados serão perdidos. Deseja realmente sair?",
    sair_sem_salvar: "Sair sem salvar",
    // Comparar
    relatorio_comparativo: "Relatório Comparativo",
    periodo: "Período: ",
    evolucao_peso: "Evolução do Peso",
    evolucao_gordura: "Evolução do % Gordura",
    evolucao_massa_magra: "Evolução da Massa Magra",
    evolucao_massa_gorda: "Evolução da Massa Gorda",
    evolucao_corporal: "Evolução Corporal",
    comparativo_indices: "Comparativo de Índices",
    // Perfil
    meu_perfil: "Meu Perfil",
    dados_pessoais: "Dados Pessoais",
    nome: "Nome",
    email_insta: "E-mail ou Instagram",
    idioma: "Idioma",
    sistema_medidas: "Sistema de Medidas",
    metrico: "Métrico (kg, cm)",
    imperial: "Imperial (lb, in)",
    cor_tema: "Cor do Tema",
    // Classifications
    "Muito Ruim": "Muito Ruim",
    "Ruim": "Ruim",
    "Médio": "Médio",
    "Bom": "Bom",
    "Excelente": "Excelente",
    "Baixo": "Baixo",
    "Moderado": "Moderado",
    "Alto": "Alto",
    "Muito Alto": "Muito Alto",
    "Abaixo do Peso": "Abaixo do Peso",
    "Peso Normal": "Peso Normal",
    "Sobrepeso": "Sobrepeso",
    "Obesidade Grau I": "Obesidade Grau I",
    "Obesidade Grau II": "Obesidade Grau II",
    "Obesidade Grau III": "Obesidade Grau III",
    // Default Questions
    "Já treinou antes?": "Já treinou antes?",
    "Treina há quanto tempo?": "Treina há quanto tempo?",
    "Tempo sem atividade física?": "Tempo sem atividade física?",
    "Objetivo?": "Objetivo?",
    "Frequência semanal?": "Frequência semanal?",
    "Tempo de treino por dia?": "Tempo de treino por dia?",
    "Doença/Problema de saúde?": "Doença/Problema de saúde?",
    "Limitação de movimento?": "Limitação de movimento?",
    "Dor em algum movimento?": "Dor em algum movimento?",
    "Cirurgias?": "Cirurgias?",
    "Medicamento controlado?": "Medicamento controlado?",
    "Está fazendo dieta?": "Está fazendo dieta?",
    "Consumo de alcool?": "Consumo de alcool?",
    "Fumante?": "Fumante?",
    "Qualidade do sono?": "Qualidade do sono?",
    "Nível de estresse?": "Nível de estresse?",
    // Perimetria Fields
    "Pescoço": "Pescoço",
    "Ombros": "Ombros",
    "Peitoral": "Peitoral",
    "Braço Direito": "Braço Direito",
    "Braço Esquerdo": "Braço Esquerdo",
    "Antebraço Dir.": "Antebraço Dir.",
    "Antebraço Esq.": "Antebraço Esq.",
    "Cintura": "Cintura",
    "Abdômen": "Abdômen",
    "Quadril": "Quadril",
    "Coxa Direita": "Coxa Direita",
    "Coxa Esquerda": "Coxa Esquerda",
    "Panturrilha Dir.": "Panturrilha Dir.",
    "Panturrilha Esq.": "Panturrilha Esq.",
    // Ajustes
    ajustes_sub: "Defina os modelos e opções fixas aplicados a todas as avaliações.",
    aparencia: "Aparência",
    cor_principal_sub: "Cor principal do aplicativo e dos PDFs",
    cor_personalizada: "Cor Personalizada",
    anamnese_modelo_sub: "Modelo de perguntas padrão (arraste para reordenar)",
    placeholder_cirurgia: "Ex: Já fez cirurgia cardíaca?",
    add: "Add",
    arrastar_reordenar: "Arrastar para reordenar",
    metodo_preferencial_sub: "Composição corporal - Método padrão",
    metodo_padrao: "Método Padrão",
    nenhum_selecionar: "Nenhum (selecionar na hora)",
    perimetria_modelo_sub: "Circunferências ativas (novas no topo, arraste para reordenar)",
    placeholder_antebraco: "Ex: Antebraço",
    forca_modelo_sub: "Testes de força - Exercícios favoritos (arraste para reordenar)",
    placeholder_supino: "Ex: Supino Reto",
    "Nenhum (selecionar na hora)": "Nenhum (selecionar na hora)",
    "Pollock 7 Dobras": "Pollock 7 Dobras",
    "Pollock 3 Dobras": "Pollock 3 Dobras",
    "Faulkner": "Faulkner",
    "Petroski": "Petroski",
    "Durnin-Womersley": "Durnin-Womersley",
    "Marinha Americana": "Marinha Americana",
    "Bioimpedância": "Bioimpedância",
    // Dobras
    "Tricipital": "Tricipital",
    "Subescapular": "Subescapular",
    "Peitoral": "Peitoral",
    "Axilar Média": "Axilar Média",
    "Supra-ilíaca": "Supra-ilíaca",
    "Abdominal": "Abdominal",
    "Coxa": "Coxa",
    "Bicipital": "Bicipital",
    "Panturrilha": "Panturrilha",
    // Perimetria Abreviada
    "Braço Dir.": "Braço Dir.",
    "Braço Esq.": "Braço Esq.",
    "Coxa Dir.": "Coxa Dir.",
    "Coxa Esq.": "Coxa Esq.",
    "Panturrilha Dir.": "Panturrilha Dir.",
    "Panturrilha Esq.": "Panturrilha Esq.",
    "Pant. Dir.": "Pant. Dir.",
    "Pant. Esq.": "Pant. Esq.",
    // Exercícios de força padrão
    "Puxada Aberta": "Puxada Aberta",
    "Supino Reto": "Supino Reto",
    "Agachamento": "Agachamento",
    "Leg Press 45°": "Leg Press 45°",
    "Rosca Direta": "Rosca Direta",
    "Puxada Pulley": "Puxada Pulley",
    "Tríceps Pulley": "Tríceps Pulley",
    // Novas chaves para AvalForm e CompararScreen
    calculado_auto_cintura_quadril: "Calculado automaticamente com cintura e quadril",
    cintura_lbl: "Cintura",
    quadril_lbl: "Quadril",
    risco_cardiovascular: "Risco Cardiovascular",
    preencha_cintura_quadril: "Preencha cintura e quadril acima para calcular o RCQ.",
    personalize_exercicios: "Personalize os exercícios avaliados",
    adicione_quantos_quiser: "Adicione quantos exercícios quiser",
    teste_num: "Teste #",
    selecione_exercicio: "Selecione um exercício...",
    outro_digitar: "Outro (digitar)...",
    nome_exercicio_custom: "Nome do Exercício Personalizado",
    digite_nome_exercicio: "Digite o nome do exercício...",
    adicionar_exercicio_btn: "Adicionar Exercício",
    sentar_alcancar_wells: "Sentar e Alcançar (Wells)",
    angulo_popliteo: "Ângulo Poplíteo",
    teste_thomas: "Teste de Thomas",
    encurtado: "Encurtado",
    normal: "Normal",
    avaliacao_cardio_hemo: "Avaliação cardiorrespiratória e hemodinâmica",
    tipo_teste_cardio: "Tipo de Teste Cardiorrespiratório",
    teste_cooper_12: "Teste de Cooper (12 min)",
    teste_esteira_inc: "Teste de Esteira (Incremental)",
    velocidade_final: "Velocidade Final",
    inclinacao_final: "Inclinação Final",
    vo2_max_estimado: "VO2 Máx Estimado",
    fc_max_medida: "FC Máxima (Medida)",
    fc_max_estimada_lbl: "FC Máx Estimada (220 - idade):",
    metabolismo_sub: "Taxa Metabólica Basal e gasto calórico diário",
    tmb_sub: "Taxa Metabólica Basal (TMB)",
    gasto_energetico_minimo: "Gasto energético mínimo diário calculado pela fórmula de",
    preencha_idade_sexo_peso: "Preencha a idade, sexo, peso e altura nas abas anteriores para calcular a TMB automaticamente.",
    fotos_sub: "Fotos de acompanhamento do aluno",
    opcional_fotos: "Opcional — adicione as fotos que desejar",
    posicoes: "Posições",
    frente: "Frente",
    lado: "Lado",
    costas: "Costas",
    observacoes_fotos: "Observações sobre as fotos",
    placeholder_obs_fotos: "Ex: Redução visível de gordura abdominal, boa postura, assimetria leve nos ombros...",
    capa_identificacao: "Capa e Identificação",
    identificacao_indices_gerais: "Identificação & Índices Gerais",
    identificacao_indices_corp: "Identificação & Índices Corporais",
    nome_avaliado: "Nome do Avaliado",
    data_avaliacao: "Data da Avaliação",
    objetivo: "Objetivo",
    gasto_basal: "Gasto Basal",
    perimetria_circunferencias: "Perimetria (Circunferências)",
    historico_anamnese: "Histórico & Anamnese",
    desempenho_acompanhamento: "Desempenho e Acompanhamento Visual",
    acompanhamento_visual: "Acompanhamento Visual",
    sem_foto: "Sem foto",
    finalizar_avaliacao_btn: "Finalizar Avaliação",
    comparar_erro_duas_av: "São necessárias pelo menos duas avaliações cadastradas para realizar comparações.",
    avaliacoes_nao_encontradas: "Avaliações não encontradas.",
    antes: "Antes",
    depois: "Depois",
    risco_pontos: "Risco: ",
    calculo_rcq: "Cálculo RCQ",
    medidas_perimetria_cm: "Medidas de Perimetria (Circunferências em cm)",
    teste_forca_pontos: "Teste de Força: ",
    condicionamento_vo2: "Condicionamento Físico (VO2 Máximo)",
    sinais_vitais_fc: "Sinais Vitais & Frequência Cardíaca",
    gasto_calorico_basal_tmb: "Gasto Calórico Basal (TMB)",
    acompanhamento_visual_menos: "Acompanhamento Visual - ",
    observacoes_acomp_visual: "Observações do Acompanhamento Visual",
    sem_observacoes: "Sem observações",
    "Muito Fraco": "Muito Fraco",
    "Abaixo da Média": "Abaixo da Média",
    "Média": "Média",
    "Acima da Média": "Acima da Média",
    "Superior": "Superior",
    peso_lbl: "peso",
    percentual_gordura_lbl: "percentual de gordura",
    massa_magra_lbl: "massa magra",
    massa_gorda_lbl: "massa gorda",
    rcq_lbl: "Relação Cintura-Quadril (RCQ)",
    vo2_lbl: "VO2 Máximo",
    anterior: "Anterior"
  },
  en: {
    // Nav
    inicio: "Home",
    ajustes: "Settings",
    perfil: "Profile",
    // Login
    entrar_conta: "Log in to account",
    acesse_sua_area: "Access your professional area",
    email: "Email",
    senha: "Password",
    mantenha_me_conectado: "Keep me signed in",
    entrando: "Logging in...",
    entrar: "Log in",
    esqueci_senha: "Forgot my password",
    nao_tem_conta: "Don't have an account?",
    criar_conta_gratis: "Create account",
    plataforma_av: "Physical Evaluation Platform",
    // Home
    avaliador: "Trainer",
    alunos: "Students",
    pesquisar_aluno: "Search student...",
    novo_aluno: "New Student",
    masculino: "Male",
    feminino: "Female",
    genero: "Gender",
    telefone: "Phone",
    data_nascimento: "Date of Birth",
    cadastrar_aluno: "Register Student",
    nome_completo: "Full Name",
    nenhum_aluno: "No student found",
    cadastre_primeiro_aluno: "Register your first student to start.",
    excluir_aluno: "Delete Student",
    confirmar_exclusao: "Confirm deletion",
    realmente_deseja_excluir: "Are you sure you want to delete",
    acao_nao_desfeita: "This action cannot be undone.",
    nao_cancelar: "No, cancel",
    sim_excluir: "Yes, delete",
    bem_vindo: "Welcome",
    todos_alunos: "All Students",
    nenhum_aluno_cadastrado: "No students registered yet",
    clique_novo_aluno: 'Click on "New Student" above to start.',
    nenhum_aluno_busca: "No students found for your search.",
    este_mes: "This month",
    excluir: "Delete",
    cadastrar: "Register",
    nome_completo_placeholder: "e.g., John Doe",
    // Aluno
    ultima_aval: "last: ",
    sem_avaliacoes: "No evaluations",
    nova_avaliacao: "New Evaluation",
    selecione_2_a_5: "Select 2 to 5 evaluations to compare",
    comparar: "Compare",
    nenhuma_avaliacao: "No evaluations",
    inicie_primeira_av: "Start the first physical evaluation.",
    iniciar_avaliacao: "Start Evaluation",
    historico_av: "Evaluation History",
    avaliacao_num: "Evaluation #",
    editar_aluno: "Edit Student",
    salvar_alteracoes: "Save Changes",
    cancelar: "Cancel",
    // AvalForm
    dados: "Data",
    anamnese: "Anamnesis",
    composicao: "Composition",
    perimetria: "Circumference",
    forca: "Strength Tests",
    flexibilidade: "Flexibility",
    cardiovascular: "Cardiovascular",
    metabolismo: "Metabolism",
    fotos: "Photos",
    resultados: "Results",
    salvo_automaticamente: "Saved automatically",
    metodo_avaliacao: "Evaluation Method",
    add_outra_comp: "Add another composition evaluation",
    media_de: "Average of ",
    avaliacoes: "Evaluations",
    dobras_cutaneas: "Skinfolds",
    bioimpedancia: "Bioimpedance",
    gordura: "Fat %",
    massa_magra: "Lean Mass",
    massa_gorda: "Fat Mass",
    peso: "Weight",
    altura: "Height",
    idade: "Age",
    gordura_corporal: "Body Fat",
    medidas_cm: "Measurements in centimeters",
    exercicio: "Exercise",
    repeticoes: "Repetitions",
    carga: "Load",
    add_exercicio: "Add Exercise",
    banco_wells: "Sit and Reach",
    classificacao: "Classification",
    fc_repouso: "Resting Heart Rate",
    fc_recuperacao: "Recovery Heart Rate",
    fc_maxima: "Max Heart Rate",
    pressao_arterial: "Blood Pressure",
    vo2_maximo: "VO2 Max",
    taxa_metabolica: "Basal Metabolic Rate",
    gasto_energetico: "Daily Energy Expenditure",
    registro_fotografico: "Photographic Record",
    anotacoes_fotos: "Photo notes",
    concluida: "Evaluation Completed!",
    todos_dados_registrados: "All data has been successfully registered.",
    salvar_pdf: "Save as PDF",
    continuar_sem_pdf: "Continue without PDF",
    resumo_geral: "General Evaluation Summary",
    // ConfirmLeave
    alteracoes_nao_salvas: "Unsaved changes",
    se_sair_agora: "You made changes to this evaluation. If you leave now, the new data will be lost. Do you really want to leave?",
    sair_sem_salvar: "Leave without saving",
    // Comparar
    relatorio_comparativo: "Comparative Report",
    periodo: "Period: ",
    evolucao_peso: "Weight Evolution",
    evolucao_gordura: "Fat % Evolution",
    evolucao_massa_magra: "Lean Mass Evolution",
    evolucao_massa_gorda: "Fat Mass Evolution",
    evolucao_corporal: "Body Evolution",
    comparativo_indices: "Index Comparison",
    // Perfil
    meu_perfil: "My Profile",
    dados_pessoais: "Personal Data",
    nome: "Name",
    email_insta: "Email or Instagram",
    idioma: "Language",
    sistema_medidas: "Measurement System",
    metrico: "Metric (kg, cm)",
    imperial: "Imperial (lb, in)",
    cor_tema: "Theme Color",
    // Classifications
    "Muito Ruim": "Very Poor",
    "Ruim": "Poor",
    "Médio": "Average",
    "Bom": "Good",
    "Excelente": "Excellent",
    "Baixo": "Low",
    "Moderado": "Moderate",
    "Alto": "High",
    "Muito Alto": "Very High",
    "Abaixo do Peso": "Underweight",
    "Peso Normal": "Normal Weight",
    "Sobrepeso": "Overweight",
    "Obesidade Grau I": "Obesity Class I",
    "Obesidade Grau II": "Obesity Class II",
    "Obesidade Grau III": "Obesity Class III",
    // Default Questions
    "Já treinou antes?": "Have you trained before?",
    "Treina há quanto tempo?": "How long have you been training?",
    "Tempo sem atividade física?": "Time without physical activity?",
    "Objetivo?": "Goal?",
    "Frequência semanal?": "Weekly frequency?",
    "Tempo de treino por dia?": "Training time per day?",
    "Doença/Problema de saúde?": "Disease/Health problem?",
    "Limitação de movimento?": "Movement limitation?",
    "Dor em algum movimento?": "Pain in any movement?",
    "Cirurgias?": "Surgeries?",
    "Medicamento controlado?": "Controlled medication?",
    "Está fazendo dieta?": "Are you dieting?",
    "Consumo de alcool?": "Alcohol consumption?",
    "Fumante?": "Smoker?",
    "Qualidade do sono?": "Sleep quality?",
    "Nível de estresse?": "Stress level?",
    // Perimetria Fields
    "Pescoço": "Neck",
    "Ombros": "Shoulders",
    "Peitoral": "Chest",
    "Braço Direito": "Right Arm",
    "Braço Esquerdo": "Left Arm",
    "Antebraço Dir.": "Right Forearm",
    "Antebraço Esq.": "Left Forearm",
    "Cintura": "Waist",
    "Abdômen": "Abdomen",
    "Quadril": "Hips",
    "Coxa Direita": "Right Thigh",
    "Coxa Esquerda": "Left Thigh",
    "Panturrilha Dir.": "Right Calf",
    "Panturrilha Esq.": "Left Calf",
    // Ajustes
    ajustes_sub: "Define models and static options applied to all evaluations.",
    aparencia: "Appearance",
    cor_principal_sub: "Main color of the application and PDFs",
    cor_personalizada: "Custom Color",
    anamnese_modelo_sub: "Default questions template (drag to reorder)",
    placeholder_cirurgia: "e.g., Have you had heart surgery?",
    add: "Add",
    arrastar_reordenar: "Drag to reorder",
    metodo_preferencial_sub: "Body composition - Default method",
    metodo_padrao: "Default Method",
    nenhum_selecionar: "None (select on the spot)",
    perimetria_modelo_sub: "Active circumferences (new at top, drag to reorder)",
    placeholder_antebraco: "e.g., Forearm",
    forca_modelo_sub: "Strength tests - Favorite exercises (drag to reorder)",
    placeholder_supino: "e.g., Bench Press",
    "Nenhum (selecionar na hora)": "None (select on the spot)",
    "Pollock 7 Dobras": "Pollock 7 Skinfolds",
    "Pollock 3 Dobras": "Pollock 3 Skinfolds",
    "Faulkner": "Faulkner",
    "Petroski": "Petroski",
    "Durnin-Womersley": "Durnin-Womersley",
    "Marinha Americana": "US Navy",
    "Bioimpedância": "Bioimpedance",
    // Dobras
    "Tricipital": "Triceps",
    "Subescapular": "Subscapular",
    "Peitoral": "Chest",
    "Axilar Média": "Midaxillary",
    "Supra-ilíaca": "Suprailiac",
    "Abdominal": "Abdominal",
    "Coxa": "Thigh",
    "Bicipital": "Biceps",
    "Panturrilha": "Calf",
    // Perimetria Abreviada
    "Braço Dir.": "Right Arm",
    "Braço Esq.": "Left Arm",
    "Coxa Dir.": "Right Thigh",
    "Coxa Esq.": "Left Thigh",
    "Panturrilha Dir.": "Right Calf",
    "Panturrilha Esq.": "Left Calf",
    "Pant. Dir.": "Right Calf",
    "Pant. Esq.": "Left Calf",
    // Default strength exercises
    "Puxada Aberta": "Lat Pulldown",
    "Supino Reto": "Bench Press",
    "Agachamento": "Squat",
    "Leg Press 45°": "Leg Press 45°",
    "Rosca Direta": "Bicep Curl",
    "Puxada Pulley": "Cable Pulldown",
    "Tríceps Pulley": "Triceps Pushdown",
    calculado_auto_cintura_quadril: "Calculated automatically with waist and hip",
    cintura_lbl: "Waist",
    quadril_lbl: "Hip",
    risco_cardiovascular: "Cardiovascular Risk",
    preencha_cintura_quadril: "Fill in waist and hip above to calculate WHR.",
    personalize_exercicios: "Customize the evaluated exercises",
    adicione_quantos_quiser: "Add as many exercises as you want",
    teste_num: "Test #",
    selecione_exercicio: "Select an exercise...",
    outro_digitar: "Other (type)...",
    nome_exercicio_custom: "Custom Exercise Name",
    digite_nome_exercicio: "Type exercise name...",
    adicionar_exercicio_btn: "Add Exercise",
    sentar_alcancar_wells: "Sit and Reach",
    angulo_popliteo: "Popliteal Angle",
    teste_thomas: "Thomas Test",
    encurtado: "Shortened",
    normal: "Normal",
    avaliacao_cardio_hemo: "Cardiorespiratory and hemodynamic evaluation",
    tipo_teste_cardio: "Cardiorespiratory Test Type",
    teste_cooper_12: "Cooper Test (12 min)",
    teste_esteira_inc: "Treadmill Test (Incremental)",
    velocidade_final: "Final Speed",
    inclinacao_final: "Final Incline",
    vo2_max_estimado: "Estimated VO2 Max",
    fc_max_medida: "Max Heart Rate (Measured)",
    fc_max_estimada_lbl: "Est. Max Heart Rate (220 - age):",
    metabolismo_sub: "Basal Metabolic Rate and daily caloric expenditure",
    tmb_sub: "Basal Metabolic Rate (BMR)",
    gasto_energetico_minimo: "Minimum daily energy expenditure calculated by the formula of",
    preencha_idade_sexo_peso: "Fill in age, sex, weight, and height in the previous tabs to calculate BMR automatically.",
    fotos_sub: "Student follow-up photos",
    opcional_fotos: "Optional — add any photos you want",
    posicoes: "Positions",
    frente: "Front",
    lado: "Side",
    costas: "Back",
    observacoes_fotos: "Photo Observations",
    placeholder_obs_fotos: "e.g., Visible reduction in abdominal fat, good posture, slight shoulder asymmetry...",
    capa_identificacao: "Cover and Identification",
    identificacao_indices_gerais: "Identification & General Indices",
    identificacao_indices_corp: "Identification & Body Indices",
    nome_avaliado: "Name of the Evaluated",
    data_avaliacao: "Evaluation Date",
    objetivo: "Goal",
    gasto_basal: "Basal Expenditure",
    perimetria_circunferencias: "Circumference Measurements",
    historico_anamnese: "History & Anamnesis",
    desempenho_acompanhamento: "Performance & Visual Tracking",
    acompanhamento_visual: "Visual Tracking",
    sem_foto: "No photo",
    finalizar_avaliacao_btn: "Finish Evaluation",
    comparar_erro_duas_av: "At least two registered evaluations are required to perform comparisons.",
    avaliacoes_nao_encontradas: "Evaluations not found.",
    antes: "Before",
    depois: "After",
    risco_pontos: "Risk: ",
    calculo_rcq: "WHR Calculation",
    medidas_perimetria_cm: "Circumference Measurements (in cm)",
    teste_forca_pontos: "Strength Test: ",
    condicionamento_vo2: "Physical Conditioning (VO2 Max)",
    sinais_vitais_fc: "Vital Signs & Heart Rate",
    gasto_calorico_basal_tmb: "Basal Caloric Expenditure (BMR)",
    acompanhamento_visual_menos: "Visual Tracking - ",
    observacoes_acomp_visual: "Visual Tracking Notes",
    sem_observacoes: "No notes",
    "Muito Fraco": "Very Weak",
    "Abaixo da Média": "Below Average",
    "Média": "Average",
    "Acima da Média": "Above Average",
    "Superior": "Superior",
    peso_lbl: "weight",
    percentual_gordura_lbl: "body fat percentage",
    massa_magra_lbl: "lean mass",
    massa_gorda_lbl: "fat mass",
    rcq_lbl: "Waist-to-Hip Ratio (WHR)",
    vo2_lbl: "VO2 Max",
    anterior: "Previous"
  },
  es: {
    // Nav
    inicio: "Inicio",
    ajustes: "Ajustes",
    perfil: "Perfil",
    // Login
    entrar_conta: "Iniciar sesión",
    acesse_sua_area: "Accede a tu área profesional",
    email: "Correo electrónico",
    senha: "Contraseña",
    mantenha_me_conectado: "Mantener sesión iniciada",
    entrando: "Entrando...",
    entrar: "Entrar",
    esqueci_senha: "Olvidé mi contraseña",
    nao_tem_conta: "¿No tienes cuenta?",
    criar_conta_gratis: "Crear cuenta",
    plataforma_av: "Plataforma de Evaluación Física",
    // Home
    avaliador: "Evaluador/a",
    alunos: "Alumnos",
    pesquisar_aluno: "Buscar alumno...",
    novo_aluno: "Nuevo Alumno",
    masculino: "Masculino",
    feminino: "Femenino",
    genero: "Género",
    telefone: "Teléfono",
    data_nascimento: "Fecha de Nacimiento",
    cadastrar_aluno: "Registrar Alumno",
    nome_completo: "Nombre Completo",
    nenhum_aluno: "Ningún alumno encontrado",
    cadastre_primeiro_aluno: "Registra tu primer alumno para empezar.",
    excluir_aluno: "Eliminar Alumno",
    confirmar_exclusao: "Confirmar eliminación",
    realmente_deseja_excluir: "¿Realmente deseas eliminar a",
    acao_nao_desfeita: "Esta acción no se puede deshacer.",
    nao_cancelar: "No, cancelar",
    sim_excluir: "Sí, eliminar",
    bem_vindo: "Bienvenido",
    todos_alunos: "Todos los Alumnos",
    nenhum_aluno_cadastrado: "Ningún alumno registrado aún",
    clique_novo_aluno: 'Haz clic en "Nuevo Alumno" arriba para empezar.',
    nenhum_aluno_busca: "Ningún alumno encontrado para tu búsqueda.",
    este_mes: "Este mes",
    excluir: "Eliminar",
    cadastrar: "Registrar",
    nome_completo_placeholder: "Ej: Juan Pérez",
    // Aluno
    ultima_aval: "última: ",
    sem_avaliacoes: "Sin evaluaciones",
    nova_avaliacao: "Nueva Evaluación",
    selecione_2_a_5: "Selecciona de 2 a 5 evaluaciones para comparar",
    comparar: "Comparar",
    nenhuma_avaliacao: "Ninguna evaluación",
    inicie_primeira_av: "Inicia la primera evaluación física.",
    iniciar_avaliacao: "Iniciar Evaluación",
    historico_av: "Historial de Evaluaciones",
    avaliacao_num: "Evaluación #",
    editar_aluno: "Editar Aluno",
    salvar_alteracoes: "Guardar Cambios",
    cancelar: "Cancelar",
    // AvalForm
    dados: "Datos",
    anamnese: "Anamnesis",
    composicao: "Composición",
    perimetria: "Perímetros",
    forca: "Pruebas de Fuerza",
    flexibilidade: "Flexibilidad",
    cardiovascular: "Cardiovascular",
    metabolismo: "Metabolismo",
    fotos: "Fotos",
    resultados: "Resultados",
    salvo_automaticamente: "Guardado automáticamente",
    metodo_avaliacao: "Método de Evaluación",
    add_outra_comp: "Añadir otra evaluación de composición",
    media_de: "Promedio de ",
    avaliacoes: "Evaluaciones",
    dobras_cutaneas: "Pliegues Cutáneos",
    bioimpedancia: "Bioimpedancia",
    gordura: "% Grasa",
    massa_magra: "Massa Magra",
    massa_gorda: "Masa Gorda",
    peso: "Peso",
    altura: "Altura",
    idade: "Edad",
    gordura_corporal: "Grasa Corporal",
    medidas_cm: "Medidas en centímetros",
    exercicio: "Ejercicio",
    repeticoes: "Repeticiones",
    carga: "Carga",
    add_exercicio: "Añadir Ejercicio",
    banco_wells: "Banco de Wells",
    classificacao: "Clasificación",
    fc_repouso: "Frecuencia Cardíaca en Reposo",
    fc_recuperacao: "Frecuencia Cardíaca de Recuperación",
    fc_maxima: "Frecuencia Cardíaca Máxima",
    pressao_arterial: "Presión Arterial",
    vo2_maximo: "VO2 Máximo",
    taxa_metabolica: "Tasa Metabólica Basal",
    gasto_energetico: "Gasto Energético Diario",
    registro_fotografico: "Registro Fotográfico",
    anotacoes_fotos: "Notas de las fotos",
    concluida: "¡Evaluación Completada!",
    todos_dados_registrados: "Todos los datos se registraron con éxito.",
    salvar_pdf: "Guardar como PDF",
    continuar_sem_pdf: "Continuar sin PDF",
    resumo_geral: "Resumen General de la Evaluación",
    // ConfirmLeave
    alteracoes_nao_salvas: "Cambios sin guardar",
    se_sair_agora: "¿Has realizado cambios en esta evaluación. Si sales ahora, los nuevos datos se perderán. ¿Realmente deseas salir?",
    sair_sem_salvar: "Salir sin guardar",
    // Comparar
    relatorio_comparativo: "Reporte Comparativo",
    periodo: "Período: ",
    evolucao_peso: "Evolución del Peso",
    evolucao_gordura: "Evolución del % de Grasa",
    evolucao_massa_magra: "Evolución de la Masa Magra",
    evolucao_massa_gorda: "Evolución de la Masa Gorda",
    evolucao_corporal: "Evolución Corporal",
    comparativo_indices: "Comparación de Índices",
    // Perfil
    meu_perfil: "Mi Perfil",
    dados_pessoais: "Datos Personales",
    nome: "Nombre",
    email_insta: "Correo o Instagram",
    idioma: "Idioma",
    sistema_medidas: "Sistema de Medidas",
    metrico: "Métrico (kg, cm)",
    imperial: "Imperial (lb, in)",
    cor_tema: "Color del Tema",
    // Classifications
    "Muito Ruim": "Muy Malo",
    "Ruim": "Malo",
    "Médio": "Medio",
    "Bom": "Bueno",
    "Excelente": "Excelente",
    "Baixo": "Bajo",
    "Moderado": "Moderado",
    "Alto": "Alto",
    "Muito Alto": "Muy Alto",
    "Abaixo do Peso": "Bajo Peso",
    "Peso Normal": "Peso Normal",
    "Sobrepeso": "Sobrepeso",
    "Obesidade Grau I": "Obesidad Clase I",
    "Obesidade Grau II": "Obesidad Clase II",
    "Obesidade Grau III": "Obesidad Clase III",
    // Default Questions
    "Já treinou antes?": "¿Has entrenado antes?",
    "Treina há quanto tempo?": "¿Cuánto tiempo llevas entrenando?",
    "Tempo sem atividade física?": "¿Tiempo sin actividad física?",
    "Objetivo?": "¿Objetivo?",
    "Frequência semanal?": "¿Frecuencia semanal?",
    "Tempo de treino por dia?": "¿Tiempo de entrenamiento diario?",
    "Doença/Problema de saúde?": "¿Enfermedad/Problema de salud?",
    "Limitação de movimento?": "¿Limitación de movimiento?",
    "Dor em algum movimento?": "¿Dolor en algún movimiento?",
    "Cirurgias?": "¿Cirugías?",
    "Medicamento controlado?": "¿Medicamento controlado?",
    "Está fazendo dieta?": "¿Está haciendo dieta?",
    "Consumo de alcool?": "¿Consumo de alcohol?",
    "Fumante?": "¿Fumador?",
    "Qualidade do sono?": "¿Calidad del sueño?",
    "Nível de estresse?": "¿Nivel de estrés?",
    // Perimetria Fields
    "Pescoço": "Cuello",
    "Ombros": "Hombros",
    "Peitoral": "Pecho",
    "Braço Direito": "Brazo Derecho",
    "Braço Esquerdo": "Brazo Izquierdo",
    "Antebraço Dir.": "Antebrazo Der.",
    "Antebraço Esq.": "Antebrazo Izq.",
    "Cintura": "Cintura",
    "Abdômen": "Abdomen",
    "Quadril": "Cadera",
    "Coxa Direita": "Muslo Derecho",
    "Coxa Esquerda": "Muslo Izquierdo",
    "Panturrilha Dir.": "Pantorrilla Der.",
    "Panturrilha Esq.": "Pantorrilla Izq.",
    // Ajustes
    ajustes_sub: "Define los modelos y opciones fijas aplicadas a todas las evaluaciones.",
    aparencia: "Apariencia",
    cor_principal_sub: "Color principal de la aplicación y PDFs",
    cor_personalizada: "Color Personalizado",
    anamnese_modelo_sub: "Plantilla de preguntas estándar (arrastra para reordenar)",
    placeholder_cirurgia: "Ej: ¿Te has sometido a una cirugía cardíaca?",
    add: "Añadir",
    arrastar_reordenar: "Arrastra para reordenar",
    metodo_preferencial_sub: "Composición corporal - Método predeterminado",
    metodo_padrao: "Método Predeterminado",
    nenhum_selecionar: "Ninguno (seleccionar al momento)",
    perimetria_modelo_sub: "Circunferencias activas (las nuevas arriba, arrastra para reordenar)",
    placeholder_antebraco: "Ej: Antebrazo",
    forca_modelo_sub: "Pruebas de fuerza - Ejercicios favoritos (arrastra para reordenar)",
    placeholder_supino: "Ej: Press de Banca",
    "Nenhum (selecionar na hora)": "Ninguno (seleccionar al momento)",
    "Pollock 7 Dobras": "Pollock 7 Pliegues",
    "Pollock 3 Dobras": "Pollock 3 Pliegues",
    "Faulkner": "Faulkner",
    "Petroski": "Petroski",
    "Durnin-Womersley": "Durnin-Womersley",
    "Marinha Americana": "Armada de EE.UU.",
    "Bioimpedância": "Bioimpedancia",
    // Dobras
    "Tricipital": "Tricipital",
    "Subescapular": "Subescapular",
    "Peitoral": "Pectoral",
    "Axilar Média": "Axilar Media",
    "Supra-ilíaca": "Suprailíaca",
    "Abdominal": "Abdominal",
    "Coxa": "Muslo",
    "Bicipital": "Bicipital",
    "Panturrilha": "Pantorrilla",
    // Perimetria Abreviada
    "Braço Dir.": "Brazo Der.",
    "Braço Esq.": "Brazo Izq.",
    "Coxa Dir.": "Muslo Der.",
    "Coxa Esq.": "Muslo Izq.",
    "Panturrilha Dir.": "Pantorrilla Der.",
    "Panturrilha Esq.": "Pantorrilla Izq.",
    "Pant. Dir.": "Pantorrilla Der.",
    "Pant. Esq.": "Pantorrilla Izq.",
    // Ejercicios de fuerza predeterminados
    "Puxada Aberta": "Jalón al Pecho",
    "Supino Reto": "Press de Banca",
    "Agachamento": "Sentadilla",
    "Leg Press 45°": "Prensa 45°",
    "Rosca Direta": "Curling de Bíceps",
    "Puxada Pulley": "Polea al Pecho",
    "Tríceps Pulley": "Tríceps en Polea",
    calculado_auto_cintura_quadril: "Calculado automáticamente con cintura y cadera",
    cintura_lbl: "Cintura",
    quadril_lbl: "Cadera",
    risco_cardiovascular: "Riesgo Cardiovascular",
    preencha_cintura_quadril: "Complete cintura y cadera arriba para calcular el RCC.",
    personalize_exercicios: "Personalice los ejercicios evaluados",
    adicione_quantos_quiser: "Añada tantos ejercicios como desee",
    teste_num: "Prueba #",
    selecione_exercicio: "Seleccione un ejercicio...",
    outro_digitar: "Otro (escribir)...",
    nome_exercicio_custom: "Nombre del Ejercicio Personalizado",
    digite_nome_exercicio: "Escriba el nombre del ejercicio...",
    adicionar_exercicio_btn: "Añadir Ejercicio",
    sentar_alcancar_wells: "Sit and Reach",
    angulo_popliteo: "Ángulo Poplíteo",
    teste_thomas: "Prueba de Thomas",
    encurtado: "Acortado",
    normal: "Normal",
    avaliacao_cardio_hemo: "Evaluación cardiorrespiratoria y hemodinámica",
    tipo_teste_cardio: "Tipo de Prueba Cardiorrespiratoria",
    teste_cooper_12: "Prueba de Cooper (12 min)",
    teste_esteira_inc: "Prueba de Cinta (Incremental)",
    velocidade_final: "Velocidad Final",
    inclinacao_final: "Inclinación Final",
    vo2_max_estimado: "VO2 Máx Estimado",
    fc_max_medida: "FC Máxima (Medida)",
    fc_max_estimada_lbl: "FC Máx Estimada (220 - edad):",
    metabolismo_sub: "Tasa Metabólica Basal y gasto calórico diario",
    tmb_sub: "Tasa Metabólica Basal (TMB)",
    gasto_energetico_minimo: "Gasto energético mínimo diario calculado por la fórmula de",
    preencha_idade_sexo_peso: "Complete edad, sexo, peso y altura en las pestañas anteriores para calcular la TMB automáticamente.",
    fotos_sub: "Fotos de seguimiento del alumno",
    opcional_fotos: "Opcional — añada las fotos que desee",
    posicoes: "Posiciones",
    frente: "Frente",
    lado: "Lado",
    costas: "Espalda",
    observacoes_fotos: "Observaciones de las fotos",
    placeholder_obs_fotos: "Ej: Reducción visible de grasa abdominal, buena postura, ligera asimetría en los hombros...",
    capa_identificacao: "Portada e Identificación",
    identificacao_indices_gerais: "Identificación e Índices Generales",
    identificacao_indices_corp: "Identificación e Índices Corporales",
    nome_avaliado: "Nombre del Evaluado",
    data_avaliacao: "Fecha de Evaluación",
    objetivo: "Objetivo",
    gasto_basal: "Gasto Basal",
    perimetria_circunferencias: "Perimetría (Circunferencias)",
    historico_anamnese: "Historial y Anamnesis",
    desempenho_acompanhamento: "Rendimiento y Seguimiento Visual",
    acompanhamento_visual: "Seguimiento Visual",
    sem_foto: "Sin foto",
    finalizar_avaliacao_btn: "Finalizar Evaluación",
    comparar_erro_duas_av: "Se requieren al menos dos evaluaciones registradas para realizar comparaciones.",
    avaliacoes_nao_encontradas: "Evaluaciones no encontradas.",
    antes: "Antes",
    depois: "Después",
    risco_pontos: "Risco: ",
    calculo_rcq: "Cálculo RCC",
    medidas_perimetria_cm: "Medidas de Perimetría (Circunferencias en cm)",
    teste_forca_pontos: "Prueba de Fuerza: ",
    condicionamento_vo2: "Acondicionamiento Físico (VO2 Máximo)",
    sinais_vitais_fc: "Signos Vitales y Frecuencia Cardíaca",
    gasto_calorico_basal_tmb: "Gasto Calórico Basal (TMB)",
    acompanhamento_visual_menos: "Seguimiento Visual - ",
    observacoes_acomp_visual: "Observaciones del Seguimiento Visual",
    sem_observacoes: "Sin observaciones",
    "Muito Fraco": "Muy Débil",
    "Abaixo da Média": "Bajo el Promedio",
    "Média": "Promedio",
    "Acima da Média": "Sobre el Promedio",
    "Superior": "Superior",
    peso_lbl: "peso",
    percentual_gordura_lbl: "porcentaje de grasa",
    massa_magra_lbl: "masa magra",
    massa_gorda_lbl: "masa grasa",
    rcq_lbl: "Relación Cintura-Cadera (RCC)",
    vo2_lbl: "VO2 Máximo",
    anterior: "Anterior"
  }
};

function t(key, lang = "pt") {
  if (!key) return "";
  const dict = TR[lang] || TR["pt"];
  const val = dict[key];
  return val !== undefined ? val : key;
}

function translateAuthError(msg, lang = "pt") {
  if (!msg) return "";
  const lower = msg.toLowerCase();
  
  const translations = {
    pt: {
      already_registered: "Este e-mail já está cadastrado.",
      invalid_credentials: "E-mail ou senha incorretos.",
      email_not_confirmed: "E-mail não confirmado. Por favor, verifique sua caixa de entrada.",
      password_too_short: "A senha deve ter pelo menos 6 caracteres.",
      invalid_email: "Insira um e-mail válido.",
      token_expired: "O link de recuperação expirou ou é inválido.",
      rate_limit: "Muitas solicitações seguidas. Por favor, tente novamente mais tarde.",
      network: "Erro de rede. Verifique sua conexão.",
      unknown: "Ocorreu um erro. Por favor, tente novamente."
    },
    es: {
      already_registered: "Este correo electrónico ya está registrado.",
      invalid_credentials: "Correo electrónico o contraseña incorrectos.",
      email_not_confirmed: "Correo electrónico no verificado. Por favor, revise su bandeja de entrada.",
      password_too_short: "La contraseña debe tener al menos 6 caracteres.",
      invalid_email: "Ingrese un correo electrónico válido.",
      token_expired: "El enlace de recuperación ha expirado o no es válido.",
      rate_limit: "Demasiadas solicitudes. Por favor, inténtelo de nuevo más tarde.",
      network: "Error de red. Verifique su conexión.",
      unknown: "Ocurrió un error. Por favor, inténtelo de nuevo."
    },
    en: {
      already_registered: "This email is already registered.",
      invalid_credentials: "Invalid email or password.",
      email_not_confirmed: "Email not confirmed. Please check your inbox.",
      password_too_short: "Password must be at least 6 characters.",
      invalid_email: "Please enter a valid email.",
      token_expired: "The recovery link has expired or is invalid.",
      rate_limit: "Too many requests. Please try again later.",
      network: "Network error. Please check your connection.",
      unknown: "An error occurred. Please try again."
    }
  };

  const tDict = translations[lang] || translations["pt"];

  if (lower.includes("already registered") || lower.includes("already_registered") || lower.includes("user_already_exists") || lower.includes("user already exists")) {
    return tDict.already_registered;
  }
  if (lower.includes("invalid grant") || lower.includes("invalid login credentials") || lower.includes("invalid_credentials") || lower.includes("double check")) {
    return tDict.invalid_credentials;
  }
  if (lower.includes("email not confirmed") || lower.includes("email_not_confirmed")) {
    return tDict.email_not_confirmed;
  }
  if (lower.includes("password should be at least") || lower.includes("password_too_short") || lower.includes("should be at least 6 characters")) {
    return tDict.password_too_short;
  }
  if (lower.includes("valid email") || lower.includes("invalid email") || lower.includes("email is not valid")) {
    return tDict.invalid_email;
  }
  if (lower.includes("token") || lower.includes("expired") || lower.includes("invalid_token") || lower.includes("not found")) {
    return tDict.token_expired;
  }
  if (lower.includes("rate limit") || lower.includes("too many requests") || lower.includes("over_limit") || lower.includes("rate_limit")) {
    return tDict.rate_limit;
  }
  if (lower.includes("network") || lower.includes("failed to fetch")) {
    return tDict.network;
  }
  
  return msg;
}

// ── CONVERSÕES DE SISTEMA DE MEDIDAS (MÉTRICO <-> IMPERIAL) ───────────────────
function toSystemWeight(kgVal, system) {
  if (kgVal === undefined || kgVal === null || kgVal === "") return "";
  var kgNum = parseFloat(kgVal);
  if (isNaN(kgNum)) return kgVal.toString();
  if (system === "imperial") return (kgNum * 2.20462).toFixed(1);
  return Number(kgNum.toFixed(1)).toString();
}

function fromSystemWeight(val, system) {
  if (val === undefined || val === null || val === "") return "";
  var valNum = parseFloat(val);
  if (isNaN(valNum)) return val.toString();
  if (system === "imperial") return (valNum / 2.20462).toFixed(2);
  return valNum.toString();
}

function toSystemLength(cmVal, system) {
  if (cmVal === undefined || cmVal === null || cmVal === "") return "";
  var cmNum = parseFloat(cmVal);
  if (isNaN(cmNum)) return cmVal.toString();
  if (system === "imperial") return (cmNum / 2.54).toFixed(1);
  return cmNum.toString();
}

function fromSystemLength(val, system) {
  if (val === undefined || val === null || val === "") return "";
  var valNum = parseFloat(val);
  if (isNaN(valNum)) return val.toString();
  if (system === "imperial") return (valNum * 2.54).toFixed(2);
  return valNum.toString();
}

function cmToFtIn(cmVal) {
  if (cmVal === undefined || cmVal === null || cmVal === "") return { ft: "", in: "" };
  var cmNum = parseFloat(cmVal);
  if (isNaN(cmNum)) return { ft: "", in: "" };
  var totalInches = cmNum / 2.54;
  var ft = Math.floor(totalInches / 12);
  var inches = (totalInches % 12).toFixed(1);
  if (parseFloat(inches) >= 12) {
    ft += 1;
    inches = "0";
  }
  if (parseFloat(inches) === Math.round(parseFloat(inches))) {
    inches = Math.round(parseFloat(inches)).toString();
  }
  return { ft: ft.toString(), in: inches };
}

function ftInToCm(ftVal, inVal) {
  if ((ftVal === undefined || ftVal === null || ftVal === "") && (inVal === undefined || inVal === null || inVal === "")) return "";
  var ft = parseFloat(ftVal) || 0;
  var inch = parseFloat(inVal) || 0;
  var totalInches = (ft * 12) + inch;
  if (totalInches <= 0) return "";
  return (totalInches * 2.54).toFixed(2);
}

function formatHeight(cmVal, system) {
  if (cmVal === undefined || cmVal === null || cmVal === "") return "";
  var cmNum = parseFloat(cmVal);
  if (isNaN(cmNum)) return cmVal.toString();
  if (system === "imperial") {
    var res = cmToFtIn(cmNum);
    return res.ft + " ft " + res.in + " in";
  }
  return cmNum.toString() + " cm";
}

function getWeightUnit(system) {
  return system === "imperial" ? "lb" : "kg";
}

function getLengthUnit(system) {
  return system === "imperial" ? "in" : "cm";
}

function toSystemCooperDist(mVal, system) {
  if (mVal === undefined || mVal === null || mVal === "") return "";
  var mNum = parseFloat(mVal);
  if (isNaN(mNum)) return mVal.toString();
  if (system === "imperial") return (mNum / 1609.34).toFixed(2);
  return Math.round(mNum).toString();
}

function fromSystemCooperDist(val, system) {
  if (val === undefined || val === null || val === "") return "";
  var valNum = parseFloat(val);
  if (isNaN(valNum)) return val.toString();
  if (system === "imperial") return Math.round(valNum * 1609.34).toString();
  return Math.round(valNum).toString();
}

function getCooperUnit(system) {
  return system === "imperial" ? "mi" : "m";
}

function toSystemSpeed(kmhVal, system) {
  if (kmhVal === undefined || kmhVal === null || kmhVal === "") return "";
  var kmhNum = parseFloat(kmhVal);
  if (isNaN(kmhNum)) return kmhVal.toString();
  if (system === "imperial") return (kmhNum / 1.60934).toFixed(1);
  return kmhNum.toString();
}

function fromSystemSpeed(val, system) {
  if (val === undefined || val === null || val === "") return "";
  var valNum = parseFloat(val);
  if (isNaN(valNum)) return val.toString();
  if (system === "imperial") return (valNum * 1.60934).toFixed(2);
  return valNum.toString();
}

function getSpeedUnit(system) {
  return system === "imperial" ? "mph" : "km/h";
}


// ── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  bg: "#F7F7F8",
  surface: "#FFFFFF",
  border: "#E8E8EC",
  borderLight: "#F0F0F4",
  text: "#0C0C14",
  sub: "#5A5A72",
  muted: "#9898B0",
  success: "#00A86B",
  danger: "#E53B3B",
  warning: "#F59E0B",
  blue: "#2563EB",
  shadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 24px rgba(0,0,0,0.08)",
};

var CORES = ["#111827", "#2563EB", "#DC2626", "#DB2777", "#7C3AED"];
let _ACC = "#1A1A2E";
function ac() { return _ACC; }
function acL() { return _ACC + "18"; }

// ── GLOBAL STYLE COMPONENT ────────────────────────────────────────────────────
function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
      * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
      .recharts-wrapper:focus, svg:focus { outline: none !important; }
      body { margin: 0; background: #F7F7F8; font-family: 'Outfit', sans-serif; }
      input, select, textarea, button { font-family: 'Outfit', sans-serif; }
      /* Impedir o zoom automático no iOS ao focar campos de entrada */
      @media (max-width: 768px) {
        input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="color"]):not([type="file"]),
        select,
        textarea {
          font-size: 16px !important;
        }
      }
      input[type=number]::-webkit-outer-spin-button,
      input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
      ::-webkit-scrollbar { width: 4px; height: 4px; }
      ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }
      @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      @keyframes popIn { 0%{opacity:0;transform:scale(0.4)} 60%{transform:scale(1.12)} 100%{opacity:1;transform:scale(1)} }
      @keyframes checkDraw { from{stroke-dashoffset:60} to{stroke-dashoffset:0} }
      @keyframes fall { 0%{transform:translateY(-10px) rotate(0deg);opacity:1} 100%{transform:translateY(140px) rotate(700deg);opacity:0} }
      @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      @keyframes pulse { 0% { opacity: 0.35; } 100% { opacity: 1; } }
      @keyframes logoFill {
        0% { height: 0%; }
        45% { height: 100%; }
        55% { height: 100%; }
        100% { height: 0%; }
      }
      @keyframes logoPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      .fu { animation: fadeUp 0.28s ease both; }

      .print-anamnese-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
        font-size: 13px;
      }
      .print-anamnese-row {
        border-bottom: 1px solid #F0F0F4;
        padding-bottom: 8px;
      }

      .print-page-1, .print-page-2, .print-page-3 {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .print-grid-2-col {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .print-only { display: none !important; }

      @media print {
        body { background: #ffffff !important; margin: 0 !important; padding: 0 !important; }
        body * { visibility: hidden !important; }
        #print-section, #print-section *, #print-compare-section, #print-compare-section * { visibility: visible !important; }
        
        .no-print, .no-print * { display: none !important; }
        .print-only { display: block !important; }
        .recharts-tooltip-wrapper { display: none !important; }



        /* Fotos comparativas compactas e sem quebra inadequada */
        .print-photos-container {
          display: block !important;
        }
        .print-photos-container .print-card {
          padding: 12px 16px !important;
          margin-top: 0 !important;
          margin-bottom: 12px !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .print-photos-container img {
          max-height: 220px !important;
          object-fit: contain !important;
        }

        /* Forçar todos os títulos nos relatórios em preto para maior destaque */
        .eval-header-print .eval-name,
        .eval-header-print .brand-name,
        .eval-name-print,
        .student-name-print,
        .compare-header-title,
        #print-section .print-card > div:first-child,
        #print-compare-section .print-card > div:first-child,
        #print-section .print-card > div[style*="text-transform"],
        #print-compare-section .print-card > div[style*="text-transform"],
        #print-section .print-card > div[style*="font-size: 12px"],
        #print-compare-section .print-card > div[style*="font-size: 11px"],
        #print-compare-section .print-card > div[style*="font-size: 10px"] {
          color: #000000 !important;
        }
        
        /* Reset containers to not take space or style */
        #root {
          padding: 0 !important;
          margin: 0 !important;
        }
        .app-container {
          max-width: 100% !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          position: static !important;
          background: #ffffff !important;
        }
        .app-container > div {
          padding: 0 !important;
          margin: 0 !important;
          height: auto !important;
          min-height: 0 !important;
        }
        .fu {
          padding: 0 !important;
          margin: 0 !important;
        }
        
        #print-section, #print-compare-section {
          position: relative !important;
          display: block !important;
          width: 100% !important;
          max-width: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
          box-shadow: none !important;
          border: none !important;
        }
        
        /* PÁGINAS DO RELATÓRIO */
        .print-page-1 {
          display: block !important;
          page-break-after: auto !important;
          break-after: auto !important;
          padding-top: 0 !important;
          margin-top: 0 !important;
        }
        .print-page-1 > * {
          margin-bottom: 20px !important;
        }
        
        .print-page-2 {
          display: block !important;
          page-break-after: auto !important;
          break-after: auto !important;
          padding-top: 0 !important;
          margin-top: 0 !important;
        }
        
        .print-page-3 {
          display: block !important;
          padding-top: 0 !important;
          margin-top: 0 !important;
        }
        
        .print-grid-2-col {
          display: block !important;
          clear: both !important;
          margin-bottom: 20px !important;
        }
        .print-grid-2-col::after {
          content: "" !important;
          display: table !important;
          clear: both !important;
        }
        .print-grid-2-col > * {
          float: left !important;
          width: 48% !important;
          margin-bottom: 20px !important;
        }
        .print-grid-2-col > :first-child {
          margin-right: 4% !important;
        }
        
        /* CARD PRINCIPAL E BORDAS */
        #print-section .print-card,
        #print-compare-section .print-card {
          border: 1px solid #E8E8EC !important;
          border-top: 5px solid var(--primary-color) !important;
          border-radius: 16px !important;
          padding: 24px !important;
          background: #ffffff !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          -webkit-column-break-inside: avoid !important;
          box-shadow: none !important;
        }
        
        .print-page-2 .print-full-width,
        .print-page-3 .print-full-width {
          width: 100% !important;
          margin-top: 20px !important;
        }
        
                /* CAPA (PÁGINA 1) */
        .print-page-1 .eval-header-print {
          padding-bottom: 16px !important;
          margin-bottom: 24px !important;
          border-bottom: 3px solid var(--primary-color) !important;
        }
        
        .print-page-1 .eval-header-print img,
        .print-page-1 .eval-header-print div[style*="border-radius"] {
          width: 58px !important;
          height: 58px !important;
          font-size: 24px !important;
        }
        
        .print-page-1 .eval-header-print .eval-name {
          font-size: 18px !important;
        }
        
        .print-page-1 .eval-header-print .brand-name {
          font-size: 24px !important;
        }
        
        /* Apenas o card de Identificação (primeiro card) ganha padding um pouco maior */
        .print-page-1 > .print-card {
          padding: 24px 28px !important;
        }
        
        /* Outros cards da página 1 (Composição/Perimetria) usam padding mais compacto */
        .print-page-1 .print-grid-2-col .print-card {
          padding: 20px 22px !important;
        }
        
        .print-page-1 .print-card div[style*="font-size: 12px"] {
          font-size: 14px !important;
          margin-bottom: 12px !important;
        }
        
        .print-page-1 .stat-row {
          padding: 10px 0 !important;
        }
        
        .print-page-1 .stat-row .stat-label {
          font-size: 14px !important;
        }
        
        .print-page-1 .stat-row .stat-val {
          font-size: 18px !important;
        }
        
        .print-page-1 .stat-row .stat-unit {
          font-size: 12px !important;
        }
        
        .print-page-1 .weight-height-container {
          padding-top: 16px !important;
          margin-top: 10px !important;
          gap: 12px !important;
        }
        
        .print-page-1 .weight-height-box {
          padding: 8px 14px !important;
          border: 1px solid #E8E8EC !important;
          background: #ffffff !important;
        }
        
        .print-page-1 .weight-height-box span:nth-child(1) {
          font-size: 12px !important;
        }
        
        .print-page-1 .weight-height-box span:nth-child(2) {
          font-size: 15px !important;
        }
        
        .print-page-1 .indices-container {
          gap: 12px !important;
          margin-top: 14px !important;
        }
        
        .print-page-1 .indices-card {
          padding: 12px !important;
          border: 1px solid #E8E8EC !important;
          background: #ffffff !important;
        }
        
        .print-page-1 .indices-card div[style*="font-size: 10px"] {
          font-size: 11px !important;
        }
        
        .print-page-1 .indices-card div[style*="font-size: 20px"] {
          font-size: 26px !important;
        }
        
        .print-page-1 .indices-card div[style*="font-size: 11px"] {
          font-size: 12px !important;
        }

        /* Reduzir tamanho dos elementos da composição corporal e perimetria na capa */
        .print-page-1 .print-grid-2-col .print-card div[style*="font-size: 13px"] {
          font-size: 12px !important;
          padding: 6px 0 !important;
        }
        .print-page-1 .print-grid-2-col .print-card div[style*="background:"] {
          padding: 10px 12px !important;
          border-radius: 8px !important;
          margin-top: 12px !important;
        }
        .print-page-1 .print-grid-2-col .print-card div[style*="background:"] strong {
          font-size: 13px !important;
        }
        .print-page-1 .print-grid-2-col .print-card div[style*="background:"] strong[style*="font-size: 20px"] {
          font-size: 18px !important;
        }
        .print-page-1 .print-grid-2-col .print-card div[style*="background:"] div[style*="display: grid"] {
          gap: 6px !important;
        }
        .print-page-1 .print-grid-2-col .print-card div[style*="background:"] div[style*="display: grid"] > div {
          padding: 6px !important;
          border-radius: 8px !important;
        }
        .print-page-1 .print-grid-2-col .print-card div[style*="background:"] div[style*="display: grid"] div[style*="font-size: 9px"] {
          font-size: 9px !important;
        }
        .print-page-1 .print-grid-2-col .print-card div[style*="background:"] div[style*="display: grid"] div[style*="font-size: 16px"] {
          font-size: 14px !important;
        }
        .print-page-1 .print-grid-2-col .print-card div[style*="grid-template-columns: 1fr 1fr 1fr"] {
          gap: 8px !important;
        }
        .print-page-1 .print-grid-2-col .print-card div[style*="grid-template-columns: 1fr 1fr 1fr"] > div {
          padding: 6px 8px !important;
          border-radius: 8px !important;
        }
        .print-page-1 .print-grid-2-col .print-card div[style*="grid-template-columns: 1fr 1fr 1fr"] div[style*="font-size: 9px"] {
          font-size: 9px !important;
        }
        .print-page-1 .print-grid-2-col .print-card div[style*="grid-template-columns: 1fr 1fr 1fr"] div[style*="font-size: 14px"] {
          font-size: 13px !important;
          margin-top: 2px !important;
        }

        /* ANAMNESE INTELIGENTE DENSIDADE */
        .print-anamnese-container {
          display: block !important;
        }
        
        .print-anamnese-row {
          display: block !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          -webkit-column-break-inside: avoid !important;
          border-bottom: 1px solid #E8E8EC !important;
        }
        
        /* DENSIDADE BAIXA (<= 6 perguntas: 1 coluna, fontes grandes) */
        .anamnese-print-density-low {
          padding: 24px 30px !important;
        }
        .anamnese-print-density-low div[style*="font-size: 12px"] {
          font-size: 16px !important;
          margin-bottom: 16px !important;
        }
        .anamnese-print-density-low .print-anamnese-row {
          padding-bottom: 12px !important;
          margin-bottom: 12px !important;
        }
        .anamnese-print-density-low .print-anamnese-row strong {
          font-size: 15px !important;
          margin-bottom: 4px !important;
        }
        .anamnese-print-density-low .print-anamnese-row span {
          font-size: 15px !important;
        }

        /* DENSIDADE MÉDIA (7 a 12 perguntas: 1 coluna, fontes médias) */
        .anamnese-print-density-medium {
          padding: 20px 24px !important;
        }
        .anamnese-print-density-medium div[style*="font-size: 12px"] {
          font-size: 14px !important;
          margin-bottom: 12px !important;
        }
        .anamnese-print-density-medium .print-anamnese-row {
          padding-bottom: 8px !important;
          margin-bottom: 8px !important;
        }
        .anamnese-print-density-medium .print-anamnese-row strong {
          font-size: 13px !important;
          margin-bottom: 3px !important;
        }
        .anamnese-print-density-medium .print-anamnese-row span {
          font-size: 13px !important;
        }

        /* DENSIDADE ALTA (> 12 perguntas: 1 coluna, fontes compactas) */
        .anamnese-print-density-high {
          padding: 16px 20px !important;
        }
        .anamnese-print-density-high div[style*="font-size: 12px"] {
          font-size: 12px !important;
          margin-bottom: 8px !important;
        }
        .anamnese-print-density-high .print-anamnese-row {
          padding-bottom: 6px !important;
          margin-bottom: 6px !important;
        }
        .anamnese-print-density-high .print-anamnese-row strong {
          font-size: 11px !important;
          margin-bottom: 2px !important;
        }
        .anamnese-print-density-high .print-anamnese-row span {
          font-size: 11px !important;
        }
        
        /* CARDIOVASCULAR E OUTROS DETALHES */
        .print-page-3 .cardio-grid-container {
          display: grid !important;
          grid-template-columns: 1.5fr 1fr !important;
          gap: 16px !important;
          margin-bottom: 16px !important;
        }
        
        .print-page-3 .cardio-fc-container {
          display: grid !important;
          grid-template-columns: 1fr 1fr 1fr !important;
          gap: 16px !important;
        }
        
        .print-page-3 .cardio-box {
          padding: 10px 14px !important;
          border: 1px solid #E8E8EC !important;
          background: #ffffff !important;
          border-radius: 10px !important;
        }
        
        .print-page-3 .cardio-box div:nth-child(1) {
          font-size: 10px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
        }
        
        .print-page-3 .cardio-box div:nth-child(2) {
          font-size: 18px !important;
          margin-top: 2px !important;
        }
        
        .print-page-3 .cardio-box div:nth-child(3) {
          font-size: 11px !important;
          margin-top: 4px !important;
        }

        .print-page-3 .print-card {
          margin-top: 12px !important;
          padding: 18px 24px !important;
        }
        
        div, section, .card {
          box-shadow: none !important;
        }
        .print-card, .indices-card, .cardio-box, .flex-box {
          page-break-inside: avoid !important;
        }
      }
    `}</style>
  );
}

// ── SVG ICONS ────────────────────────────────────────────────────────────────
function IcHome({ c, s }) {
  const sz = s || 22;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <path d="M3 12L12 4l9 8" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IcUsers({ c, s }) {
  const sz = s || 22;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <circle cx="8" cy="8" r="3.5" stroke={c} strokeWidth="1.8"/>
      <path d="M2 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="17" cy="9" r="2.5" stroke={c} strokeWidth="1.8"/>
      <path d="M22 20c0-2.5-2-4.5-4.5-4.5" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function IcSettings({ c, s }) {
  const sz = s || 22;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke={c} strokeWidth="1.8"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={c} strokeWidth="1.8"/>
    </svg>
  );
}
function IcTrash({ c, s }) {
  const sz = s || 18;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 11v6M14 11v6" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function IcPlus({ c, s }) {
  const sz = s || 18;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
function IcCheck({ c, s }) {
  const sz = s || 16;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <path d="M5 13l4 4L19 7" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IcBack({ c, s }) {
  const sz = s || 18;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M11 6l-6 6 6 6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IcChevron({ c, s }) {
  const sz = s || 18;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <path d="M9 18l6-6-6-6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IcSearch({ c, s }) {
  const sz = s || 18;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke={c} strokeWidth="1.8"/>
      <path d="M21 21l-4.35-4.35" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function IcEdit({ c, s }) {
  const sz = s || 14;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4z" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IcLogout({ c, s }) {
  const sz = s || 16;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IcSave({ c, s }) {
  const sz = s || 16;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 21v-8H7v8M7 3v5h8" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IcPdf({ c, s }) {
  const sz = s || 16;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 2v6h6M8 12h4M8 16h6" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function IcCompare({ c, s }) {
  const sz = s || 16;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="18" rx="1" stroke={c} strokeWidth="1.8"/>
      <rect x="14" y="3" width="7" height="18" rx="1" stroke={c} strokeWidth="1.8"/>
    </svg>
  );
}
function IcClipboard({ c, s }) {
  const sz = s || 20;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <rect x="5" y="4" width="14" height="17" rx="2" stroke={c} strokeWidth="1.8"/>
      <path d="M9 4a1 1 0 011-1h4a1 1 0 011 1v1H9V4z" stroke={c} strokeWidth="1.8"/>
      <path d="M9 11h6M9 15h4" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function IcBody({ c, s }) {
  const sz = s || 20;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="5" r="2" stroke={c} strokeWidth="1.8"/>
      <path d="M12 8v7M8 10h8M9 22l3-7 3 7" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IcRuler({ c, s }) {
  const sz = s || 20;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="20" height="10" rx="2" stroke={c} strokeWidth="1.8"/>
      <path d="M6 7v4M10 7v2M14 7v4M18 7v2" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function IcDumbbell({ c, s }) {
  const sz = s || 20;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <rect x="1" y="10" width="4" height="4" rx="1" stroke={c} strokeWidth="1.8"/>
      <rect x="19" y="10" width="4" height="4" rx="1" stroke={c} strokeWidth="1.8"/>
      <path d="M5 12h14" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      <rect x="4" y="8" width="2" height="8" rx="1" stroke={c} strokeWidth="1.8"/>
      <rect x="18" y="8" width="2" height="8" rx="1" stroke={c} strokeWidth="1.8"/>
    </svg>
  );
}
function IcChart({ c, s }) {
  const sz = s || 20;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <path d="M3 20h18M7 20V14M11 20V8M15 20V11M19 20V5" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function IcCamera({ c, s }) {
  const sz = s || 22;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="20" height="14" rx="2" stroke={c} strokeWidth="1.8"/>
      <circle cx="12" cy="14" r="3.5" stroke={c} strokeWidth="1.8"/>
      <path d="M8 7l1.5-2h5L16 7" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  );
}
function IcNotes({ c, s }) {
  const sz = s || 20;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="3" width="20" height="18" rx="2" stroke={c} strokeWidth="1.8"/>
      <path d="M6 8h12M6 12h12M6 16h8" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function IcMale({ c, s }) {
  const sz = s || 14;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <circle cx="10" cy="14" r="5" stroke={c} strokeWidth="1.8"/>
      <path d="M21 3l-5.5 5.5M21 3h-5M21 3v5" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IcFemale({ c, s }) {
  const sz = s || 14;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="9" r="5" stroke={c} strokeWidth="1.8"/>
      <path d="M12 14v7M9.5 18h5" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function IcDots({ c, s }) {
  const sz = s || 18;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="5" r="2" fill={c}/>
      <circle cx="12" cy="12" r="2" fill={c}/>
      <circle cx="12" cy="19" r="2" fill={c}/>
    </svg>
  );
}
function IcStat1({ c, s }) {
  const sz = s || 26;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <circle cx="8" cy="8" r="3" stroke={c} strokeWidth="1.8"/>
      <path d="M2 20c0-3 2.7-5.5 6-5.5s6 2.5 6 5.5" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="17" cy="9" r="2.5" stroke={c} strokeWidth="1.8"/>
      <path d="M22 20c0-2.5-2-4.5-4.5-4.5" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function IcStat2({ c, s }) {
  const sz = s || 26;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="16" height="16" rx="2" stroke={c} strokeWidth="1.8"/>
      <path d="M8 10l2 2 4-4" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 14h4" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function IcStat3({ c, s }) {
  const sz = s || 26;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke={c} strokeWidth="1.8"/>
      <path d="M16 2v4M8 2v4M3 10h18" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="12" cy="16" r="2" fill={c}/>
    </svg>
  );
}

// ── MATH ─────────────────────────────────────────────────────────────────────
function calcIMC(p, h) { return (p && h) ? (p / Math.pow(h / 100, 2)).toFixed(1) : null; }
function calcTMB(sexo, peso, altura, idade) {
  var w = parseFloat(peso);
  var h = parseFloat(altura);
  var a = parseFloat(idade);
  if (isNaN(w) || isNaN(h) || isNaN(a) || !sexo) return null;
  if (sexo === "M") {
    return Math.round(10 * w + 6.25 * h - 5 * a + 5);
  } else {
    return Math.round(10 * w + 6.25 * h - 5 * a - 161);
  }
}
function calcVO2Cooper(distancia) {
  var d = parseFloat(distancia);
  if (isNaN(d) || d <= 504.9) return null;
  return ((d - 504.9) / 44.73).toFixed(1);
}
function calcVO2Esteira(velocidade, inclinacao) {
  var v = parseFloat(velocidade);
  var inc = parseFloat(inclinacao || 0);
  if (isNaN(v) || v <= 0) return null;
  var S = v * 16.67;
  var G = inc / 100;
  if (v <= 6) {
    return (3.5 + 0.1 * S + 1.8 * S * G).toFixed(1);
  } else {
    return (3.5 + 0.2 * S + 0.9 * S * G).toFixed(1);
  }
}
function classificarVO2(sexo, idadeStr, vo2Val) {
  const vo2 = parseFloat(vo2Val);
  const idade = parseInt(idadeStr, 10);
  if (!vo2 || !idade) return null;
  if (sexo === "M") {
    if (idade < 30) {
      if (vo2 < 33.0) return ["Muito Fraco", T.danger];
      if (vo2 < 36.5) return ["Abaixo da Média", T.danger];
      if (vo2 < 42.5) return ["Média", T.warning];
      if (vo2 < 46.5) return ["Acima da Média", T.success];
      if (vo2 < 52.5) return ["Bom", T.success];
      if (vo2 < 56.1) return ["Excelente", T.success];
      return ["Superior", T.success];
    } else if (idade < 40) {
      if (vo2 < 31.5) return ["Muito Fraco", T.danger];
      if (vo2 < 35.5) return ["Abaixo da Média", T.danger];
      if (vo2 < 41.0) return ["Média", T.warning];
      if (vo2 < 45.0) return ["Acima da Média", T.success];
      if (vo2 < 49.5) return ["Bom", T.success];
      if (vo2 < 54.1) return ["Excelente", T.success];
      return ["Superior", T.success];
    } else if (idade < 50) {
      if (vo2 < 30.2) return ["Muito Fraco", T.danger];
      if (vo2 < 33.6) return ["Abaixo da Média", T.danger];
      if (vo2 < 39.0) return ["Média", T.warning];
      if (vo2 < 43.8) return ["Acima da Média", T.success];
      if (vo2 < 48.1) return ["Bom", T.success];
      if (vo2 < 52.1) return ["Excelente", T.success];
      return ["Superior", T.success];
    } else if (idade < 60) {
      if (vo2 < 26.1) return ["Muito Fraco", T.danger];
      if (vo2 < 30.2) return ["Abaixo da Média", T.danger];
      if (vo2 < 35.8) return ["Média", T.warning];
      if (vo2 < 41.0) return ["Acima da Média", T.success];
      if (vo2 < 45.4) return ["Bom", T.success];
      if (vo2 < 49.1) return ["Excelente", T.success];
      return ["Superior", T.success];
    } else if (idade < 70) {
      if (vo2 < 20.5) return ["Muito Fraco", T.danger];
      if (vo2 < 26.1) return ["Abaixo da Média", T.danger];
      if (vo2 < 32.3) return ["Média", T.warning];
      if (vo2 < 36.5) return ["Acima da Média", T.success];
      if (vo2 < 41.0) return ["Bom", T.success];
      if (vo2 < 45.1) return ["Excelente", T.success];
      return ["Superior", T.success];
    } else {
      if (vo2 < 17.5) return ["Muito Fraco", T.danger];
      if (vo2 < 23.1) return ["Abaixo da Média", T.danger];
      if (vo2 < 29.1) return ["Média", T.warning];
      if (vo2 < 33.1) return ["Acima da Média", T.success];
      if (vo2 < 37.1) return ["Bom", T.success];
      if (vo2 < 41.1) return ["Excelente", T.success];
      return ["Superior", T.success];
    }
  } else {
    if (idade < 30) {
      if (vo2 < 23.6) return ["Muito Fraco", T.danger];
      if (vo2 < 29.0) return ["Abaixo da Média", T.danger];
      if (vo2 < 33.0) return ["Média", T.warning];
      if (vo2 < 37.0) return ["Acima da Média", T.success];
      if (vo2 < 41.1) return ["Bom", T.success];
      if (vo2 < 45.5) return ["Excelente", T.success];
      return ["Superior", T.success];
    } else if (idade < 40) {
      if (vo2 < 22.8) return ["Muito Fraco", T.danger];
      if (vo2 < 27.0) return ["Abaixo da Média", T.danger];
      if (vo2 < 31.5) return ["Média", T.warning];
      if (vo2 < 35.7) return ["Acima da Média", T.success];
      if (vo2 < 40.1) return ["Bom", T.success];
      if (vo2 < 44.3) return ["Excelente", T.success];
      return ["Superior", T.success];
    } else if (idade < 50) {
      if (vo2 < 21.0) return ["Muito Fraco", T.danger];
      if (vo2 < 24.5) return ["Abaixo da Média", T.danger];
      if (vo2 < 29.0) return ["Média", T.warning];
      if (vo2 < 32.9) return ["Acima da Média", T.success];
      if (vo2 < 37.0) return ["Bom", T.success];
      if (vo2 < 41.1) return ["Excelente", T.success];
      return ["Superior", T.success];
    } else if (idade < 60) {
      if (vo2 < 20.2) return ["Muito Fraco", T.danger];
      if (vo2 < 22.8) return ["Abaixo da Média", T.danger];
      if (vo2 < 27.0) return ["Média", T.warning];
      if (vo2 < 31.5) return ["Acima da Média", T.success];
      if (vo2 < 35.8) return ["Bom", T.success];
      if (vo2 < 41.0) return ["Excelente", T.success];
      return ["Superior", T.success];
    } else if (idade < 70) {
      if (vo2 < 17.5) return ["Muito Fraco", T.danger];
      if (vo2 < 20.2) return ["Abaixo da Média", T.danger];
      if (vo2 < 24.5) return ["Média", T.warning];
      if (vo2 < 30.3) return ["Acima da Média", T.success];
      if (vo2 < 31.5) return ["Bom", T.success];
      if (vo2 < 37.0) return ["Excelente", T.success];
      return ["Superior", T.success];
    } else {
      if (vo2 < 16.5) return ["Muito Fraco", T.danger];
      if (vo2 < 19.8) return ["Abaixo da Média", T.danger];
      if (vo2 < 22.8) return ["Média", T.warning];
      if (vo2 < 26.1) return ["Acima da Média", T.success];
      if (vo2 < 29.1) return ["Bom", T.success];
      if (vo2 < 33.0) return ["Excelente", T.success];
      return ["Superior", T.success];
    }
  }
}
function imcClass(v) {
  const n = parseFloat(v);
  if (n < 18.5) return ["Abaixo do Peso", T.blue];
  if (n < 25)   return ["Peso Normal", T.success];
  if (n < 30)   return ["Sobrepeso", T.warning];
  if (n < 35)   return ["Obesidade Grau I", T.danger];
  if (n < 40)   return ["Obesidade Grau II", T.danger];
  return ["Obesidade Grau III", T.danger];
}
function calcRCQ(c, q) { return (c && q) ? (parseFloat(c) / parseFloat(q)).toFixed(2) : null; }
function rcqRisk(sexo, rcq, idade) {
  const v = parseFloat(rcq), a = parseInt(idade);
  if (!v || !a) return null;
  const tM = a < 30 ? [0.83,0.88,0.95] : a < 40 ? [0.84,0.91,0.96] : [0.85,0.92,0.98];
  const tF = a < 30 ? [0.71,0.77,0.82] : a < 40 ? [0.72,0.78,0.84] : [0.73,0.79,0.86];
  const t = sexo === "M" ? tM : tF;
  if (v < t[0]) return ["Baixo", T.success];
  if (v < t[1]) return ["Moderado", T.warning];
  if (v < t[2]) return ["Alto", T.danger];
  return ["Muito Alto", T.danger];
}
function gordMarinha(sexo, cintura, pescoco, altura, quadril) {
  if (!cintura || !pescoco || !altura) return null;
  const c = parseFloat(cintura);
  const p = parseFloat(pescoco);
  const a = parseFloat(altura);
  
  if (sexo === "M") {
    if (c <= p) return "0.0";
    const logC_P = Math.log10(c - p);
    const logA = Math.log10(a);
    const dc = 1.0324 - 0.19077 * logC_P + 0.15456 * logA;
    if (dc <= 0) return "0.0";
    const bf = (4.95 / dc - 4.5) * 100;
    return Math.max(0, bf).toFixed(1);
  }
  
  if (!quadril) return null;
  const q = parseFloat(quadril);
  if ((c + q) <= p) return "0.0";
  const logC_Q_P = Math.log10(c + q - p);
  const logA = Math.log10(a);
  const dc = 1.29579 - 0.35004 * logC_Q_P + 0.22100 * logA;
  if (dc <= 0) return "0.0";
  const bf = (4.95 / dc - 4.5) * 100;
  return Math.max(0, bf).toFixed(1);
}
function gordP7(sexo, idade, d) {
  if (!d) return null;
  const { tricipital: t, subescapular: se, peitoral: pe, axilarMedia: ax, suprailiaca: si, abdominal: ab, coxa: cx } = d;
  if ([t, se, pe, ax, si, ab, cx].some(function(x) { return !x; })) return null;
  const S = [t, se, pe, ax, si, ab, cx].reduce(function(a, b) { return a + parseFloat(b); }, 0);
  const dc = sexo === "M" ? 1.112 - 0.00043499*S + 0.00000055*S*S - 0.00028826*idade : 1.097 - 0.00046971*S + 0.00000056*S*S - 0.00012828*idade;
  return ((4.95 / dc - 4.5) * 100).toFixed(1);
}
function gordP3(sexo, idade, d) {
  if (!d) return null;
  if (sexo === "M") {
    if (!d.peitoral || !d.abdominal || !d.coxa) return null;
    const S = parseFloat(d.peitoral) + parseFloat(d.abdominal) + parseFloat(d.coxa);
    const dc = 1.10938 - 0.0008267*S + 0.0000016*S*S - 0.0002574*idade;
    return ((4.95 / dc - 4.5) * 100).toFixed(1);
  }
  if (!d.tricipital || !d.suprailiaca || !d.coxa) return null;
  const S = parseFloat(d.tricipital) + parseFloat(d.suprailiaca) + parseFloat(d.coxa);
  const dc = 1.0994921 - 0.0009929*S + 0.0000023*S*S - 0.0001392*idade;
  return ((4.95 / dc - 4.5) * 100).toFixed(1);
}
function gordFaulkner(d) {
  if (!d) return null;
  const { tricipital: t, subescapular: se, suprailiaca: si, abdominal: ab } = d;
  if ([t, se, si, ab].some(function(x) { return !x; })) return null;
  const S = parseFloat(t) + parseFloat(se) + parseFloat(si) + parseFloat(ab);
  return (S * 0.153 + 5.783).toFixed(1);
}
function gordPetroski(sexo, idade, d) {
  if (!d || !idade) return null;
  const age = parseInt(idade, 10);
  if (isNaN(age)) return null;
  if (sexo === "M") {
    const { subescapular: se, tricipital: t, suprailiaca: si, panturrilha: pm } = d;
    if ([se, t, si, pm].some(function(x) { return !x; })) return null;
    const S = parseFloat(se) + parseFloat(t) + parseFloat(si) + parseFloat(pm);
    const dc = 1.10726863 - 0.00081201 * S + 0.00000212 * S * S - 0.00041761 * age;
    return ((4.95 / dc - 4.5) * 100).toFixed(1);
  } else {
    const { axilarMedia: ax, suprailiaca: si, coxa: cx, panturrilha: pm } = d;
    if ([ax, si, cx, pm].some(function(x) { return !x; })) return null;
    const S = parseFloat(ax) + parseFloat(si) + parseFloat(cx) + parseFloat(pm);
    if (S <= 0) return null;
    const dc = 1.19547130 - 0.07513507 * Math.log10(S) - 0.00041072 * age;
    return ((4.95 / dc - 4.5) * 100).toFixed(1);
  }
}
function gordDurninWomersley(sexo, idade, d) {
  if (!d || !idade) return null;
  const age = parseInt(idade, 10);
  if (isNaN(age)) return null;
  const { tricipital: t, bicipital: bi, subescapular: se, suprailiaca: si } = d;
  if ([t, bi, se, si].some(function(x) { return !x; })) return null;
  const S = parseFloat(t) + parseFloat(bi) + parseFloat(se) + parseFloat(si);
  if (S <= 0) return null;
  const L = Math.log10(S);
  let c = 0, m = 0;
  if (sexo === "M") {
    if (age < 17)       { c = 1.1533; m = 0.0643; }
    else if (age <= 19) { c = 1.1620; m = 0.0630; }
    else if (age <= 29) { c = 1.1631; m = 0.0632; }
    else if (age <= 39) { c = 1.1422; m = 0.0544; }
    else if (age <= 49) { c = 1.1620; m = 0.0700; }
    else                { c = 1.1715; m = 0.0779; }
  } else {
    if (age < 17)       { c = 1.1369; m = 0.0598; }
    else if (age <= 19) { c = 1.1549; m = 0.0678; }
    else if (age <= 29) { c = 1.1599; m = 0.0717; }
    else if (age <= 39) { c = 1.1423; m = 0.0632; }
    else if (age <= 49) { c = 1.1333; m = 0.0612; }
    else                { c = 1.1339; m = 0.0645; }
  }
  const dc = c - m * L;
  return ((4.95 / dc - 4.5) * 100).toFixed(1);
}
function fmtDate(iso) {
  if (!iso) return "";
  const parts = iso.split("-");
  return parts[2] + "/" + parts[1] + "/" + parts[0];
}
function pctColor(v) { return parseFloat(v) < 20 ? T.success : parseFloat(v) < 30 ? T.warning : T.danger; }
function compResult(sexo, idade, perim, comp) {
  if (!comp) return null;
  if (comp.metodo === "marinha") return gordMarinha(sexo, perim.cintura, perim.pescoco, perim.altura, perim.quadril);
  if (comp.metodo === "pollock7") return gordP7(sexo, idade, comp.dobras);
  if (comp.metodo === "pollock3") return gordP3(sexo, idade, comp.dobras);
  if (comp.metodo === "faulkner") return gordFaulkner(comp.dobras);
  if (comp.metodo === "petroski") return gordPetroski(sexo, idade, comp.dobras);
  if (comp.metodo === "durnin_womersley") return gordDurninWomersley(sexo, idade, comp.dobras);
  if (comp.metodo === "bioimpedancia") return (comp.bioimpedancia && comp.bioimpedancia.gordura) ? comp.bioimpedancia.gordura : null;
  return null;
}

// ── DATA FACTORIES ────────────────────────────────────────────────────────────
function calcIdade(birthDateStr) {
  if (!birthDateStr) return "";
  const birth = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age.toString();
}

function emptyDobras() { return { tricipital:"", subescapular:"", peitoral:"", axilarMedia:"", suprailiaca:"", abdominal:"", coxa:"", bicipital:"", panturrilha:"" }; }
function emptyPerim()  { return { pescoco:"", ombros:"", peitoral:"", cintura:"", abdominal:"", quadril:"", bracoDireito:"", bracoEsquerdo:"", coxaDireita:"", coxaEsquerda:"", panturrilhaDireita:"", panturrilhaEsquerda:"" }; }
function emptyBio()    { return { gordura:"", massaMagra:"", massaGorda:"" }; }
function newComp()     { return { id: Date.now() + Math.random(), metodo: "", dobras: emptyDobras(), bioimpedancia: emptyBio() }; }
function newAval(nome, sexo, telefone, idade, settings) {
  const anamneseQuestions = settings ? settings.anamnesePerguntas : PERGUNTAS_PADRAO;
  const compMetodo = settings ? settings.defaultMetodo : "";
  const forceExercises = settings ? settings.exerciciosForca : [];

  const perim = {};
  if (settings && settings.perimetriaCampos) {
    settings.perimetriaCampos.forEach(function(f) {
      if (f.active) {
        perim[f.key] = "";
      }
    });
  } else {
    perim.pescoco = "";
    perim.ombros = "";
    perim.peitoral = "";
    perim.cintura = "";
    perim.abdominal = "";
    perim.quadril = "";
    perim.bracoDireito = "";
    perim.bracoEsquerdo = "";
    perim.coxaDireita = "";
    perim.coxaEsquerda = "";
    perim.panturrilhaDireita = "";
    perim.panturrilhaEsquerda = "";
  }

  return {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    data: new Date().toISOString().slice(0, 10),
    nome: nome || "",
    sexo: sexo || "M",
    idade: idade || "",
    telefone: telefone || "",
    objetivo: "",
    anamnese: anamneseQuestions.map(function(q, idx) {
      return { id: idx + 1, pergunta: q, resposta: "" };
    }),
    peso: "", altura: "",
    composicoes: [Object.assign(newComp(), { metodo: compMetodo })],
    perimetria: perim,
    testes: [{ id: 1, exercicio: "", reps: "", carga: "" }],
    flexibilidade: { wells: "", anguloPopliteo: "", thomas: "" },
    cardiovascular: { tipoTeste: "cooper", cooper: "", esteiraVelocidade: "", esteiraInclinacao: "", fcRepouso: "", fcRecuperacao: "", fcMax: "", pressaoArterial: "" },
    fotos: { frente: null, lado: null, costas: null },
    observacaoFotos: "",
    tipo: "presencial",
    status: "finalizada",
    config: {},
  };
}
const PERGUNTAS_PADRAO = [
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
];

function defaultAnamnese() {
  return PERGUNTAS_PADRAO.map(function(p, i) {
    return { id: i + 1, pergunta: p, resposta: "" };
  });
}

function migrateAval(av) {
  if (!av) return newAval();
  const base = newAval();
  const merged = Object.assign({}, base, av);
  
  if (av.anamnese && !Array.isArray(av.anamnese)) {
    const old = av.anamnese;
    const list = [];
    if ('jaTreinou' in old || 'tempoTreino' in old) {
      const mappings = [
        { key: 'jaTreinou', label: "Já treinou antes?" },
        { key: 'tempoTreino', label: "Treina há quanto tempo?" },
        { key: 'tempoSemAtividade', label: "Tempo sem atividade física?" },
        { key: 'objetivo', label: "Objetivo?" },
        { key: 'frequenciaSemanal', label: "Frequência semanal?" },
        { key: 'tempoTreinoDia', label: "Tempo de treino por dia?" },
        { key: 'doencaSaude', label: "Doença/Problema de saúde?" },
        { key: 'limitacaoMovimento', label: "Limitação de movimento?" },
        { key: 'dorMovimento', label: "Dor em algum movimento?" },
        { key: 'cirurgias', label: "Cirurgias?" },
        { key: 'medicamentoControlado', label: "Medicamento controlado?" },
        { key: 'estaDieta', label: "Está fazendo dieta?" },
        { key: 'consumoAlcool', label: "Consumo de alcool?" },
        { key: 'fuma', label: "Fuma?" },
        { key: 'obs', label: "Observações adicionais" }
      ];
      mappings.forEach(function(m, i) {
        if (old[m.key] !== undefined) {
          list.push({ id: i + 1, pergunta: m.label, resposta: old[m.key] });
        }
      });
    } else {
      const mappings = [
        { key: 'historico', label: "Histórico de saúde geral" },
        { key: 'doencas', label: "Doenças / condições" },
        { key: 'medicamentos', label: "Medicamentos" },
        { key: 'cirurgias', label: "Cirurgias / lesões" },
        { key: 'atividade', label: "Atividade física atual" },
        { key: 'obs', label: "Observações" }
      ];
      mappings.forEach(function(m, i) {
        if (old[m.key] !== undefined) {
          list.push({ id: i + 1, pergunta: m.label, resposta: old[m.key] });
        }
      });
    }
    merged.anamnese = list;
  }
  
  merged.perimetria = Object.assign({}, base.perimetria, av.perimetria || {});
  if (!merged.composicoes || merged.composicoes.length === 0) {
    merged.composicoes = [newComp()];
  }
  merged.flexibilidade = Object.assign({ wells: "", anguloPopliteo: "", thomas: "" }, av.flexibilidade || {});
  merged.cardiovascular = Object.assign({ tipoTeste: "cooper", cooper: "", esteiraVelocidade: "", esteiraInclinacao: "", fcRepouso: "", fcRecuperacao: "", fcMax: "", pressaoArterial: "" }, av.cardiovascular || {});
  return merged;
}

const METODOS = {
  marinha:       { label: "Marinha Americana", isBio: false, dobras: {} },
  pollock7:      { label: "Pollock 7 Dobras",  isBio: false, dobras: { M: ["peitoral","axilarMedia","tricipital","subescapular","abdominal","suprailiaca","coxa"], F: ["tricipital","subescapular","axilarMedia","suprailiaca","abdominal","coxa","peitoral"] } },
  pollock3:      { label: "Pollock 3 Dobras",  isBio: false, dobras: { M: ["peitoral","abdominal","coxa"], F: ["tricipital","suprailiaca","coxa"] } },
  faulkner:      { label: "Faulkner",          isBio: false, dobras: { M: ["tricipital","subescapular","suprailiaca","abdominal"], F: ["tricipital","subescapular","suprailiaca","abdominal"] } },
  petroski:      { label: "Petroski",          isBio: false, dobras: { M: ["subescapular","tricipital","suprailiaca","panturrilha"], F: ["axilarMedia","suprailiaca","coxa","panturrilha"] } },
  durnin_womersley: { label: "Durnin-Womersley", isBio: false, dobras: { M: ["bicipital","tricipital","subescapular","suprailiaca"], F: ["bicipital","tricipital","subescapular","suprailiaca"] } },
  bioimpedancia: { label: "Bioimpedância",      isBio: true,  dobras: {} },
};
const DOBRA_LABEL = { tricipital:"Tricipital", subescapular:"Subescapular", peitoral:"Peitoral", axilarMedia:"Axilar Média", suprailiaca:"Supra-ilíaca", abdominal:"Abdominal", coxa:"Coxa", bicipital:"Bicipital", panturrilha:"Panturrilha" };

const DEMO_ALUNOS = [
  { id: 1, nome: "Carlos Mendes", sexo: "M", foto: "", dataNascimento: "1997-06-06", telefone: "(11) 98888-7777", avaliacoes: [
    Object.assign(newAval("Carlos Mendes","M"), { id:101, data:"2026-06-06", idade:"28", peso:"85", altura:"178", perimetria:{ pescoco:"38",ombros:"120",peitoral:"100",cintura:"88",abdominal:"90",quadril:"98",bracoDireito:"36",bracoEsquerdo:"35",coxaDireita:"58",coxaEsquerda:"57",panturrilhaDireita:"38",panturrilhaEsquerda:"38" } }),
    Object.assign(newAval("Carlos Mendes","M"), { id:102, data:"2025-03-20", idade:"28", peso:"82", altura:"178", perimetria:{ pescoco:"37",ombros:"122",peitoral:"102",cintura:"84",abdominal:"86",quadril:"96",bracoDireito:"37",bracoEsquerdo:"37",coxaDireita:"59",coxaEsquerda:"58",panturrilhaDireita:"39",panturrilhaEsquerda:"39" } }),
    Object.assign(newAval("Carlos Mendes","M"), { id:103, data:"2025-05-10", idade:"28", peso:"79", altura:"178", perimetria:{ pescoco:"37",ombros:"124",peitoral:"104",cintura:"80",abdominal:"82",quadril:"94",bracoDireito:"38",bracoEsquerdo:"38",coxaDireita:"61",coxaEsquerda:"60",panturrilhaDireita:"40",panturrilhaEsquerda:"40" } }),
  ]},
  { id: 2, nome: "Ana Paula Rocha", sexo: "F", foto: "", avaliacoes: [] },
  { id: 3, nome: "Diego Ferreira",  sexo: "M", foto: "", dataNascimento: "1993-04-05", telefone: "(21) 97777-6666", avaliacoes: [
    Object.assign(newAval("Diego Ferreira","M"), { id:201, data:"2025-04-05", idade:"32", peso:"95", altura:"182", perimetria:{ pescoco:"42",ombros:"130",peitoral:"112",cintura:"98",abdominal:"102",quadril:"106",bracoDireito:"40",bracoEsquerdo:"39",coxaDireita:"62",coxaEsquerda:"62",panturrilhaDireita:"42",panturrilhaEsquerda:"41" } }),
  ]},
];

// ── PRIMITIVE UI COMPONENTS ───────────────────────────────────────────────────
function FInput({ label, value, onChange, type, placeholder, unit, required, helpText }) {
  const [focused, setFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  useEffect(function() {
    if (!focused) {
      setLocalValue(value);
    }
  }, [value, focused]);

  const tp = type || "text";
  const borderColor = focused ? ac() : T.border;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      {label && (
        <label style={{ fontSize:11, fontWeight:700, color:T.sub, letterSpacing:0.4, textTransform:"uppercase" }}>
          {label}{required && <span style={{ color:T.danger }}> *</span>}
        </label>
      )}
      <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
        <input
          type={tp}
          value={focused ? localValue : (value !== undefined && value !== null ? value : "")}
          onChange={function(e) {
            var val = e.target.value;
            setLocalValue(val);
            onChange(val);
          }}
          onFocus={function(e) {
            setFocused(true);
            setLocalValue(value);
            var inputEl = e.target;
            setTimeout(function() {
              if (inputEl) {
                try {
                  var len = inputEl.value.length;
                  inputEl.setSelectionRange(len, len);
                } catch (err) {
                  // Silencia erro se o tipo do input não suportar seleção
                }
              }
            }, 0);
          }}
          onBlur={function() {
            setFocused(false);
          }}
          placeholder={placeholder || ""}
          style={{ width:"100%", background:T.surface, border:"1.5px solid "+borderColor, borderRadius:10, color:T.text, padding: unit ? "12px 44px 12px 14px" : "12px 14px", fontSize:15, outline:"none", transition:"border-color 0.15s" }}
        />
        {unit && <span style={{ position:"absolute", right:12, fontSize:12, color:T.muted, fontWeight:600, pointerEvents:"none" }}>{unit}</span>}
      </div>
      {helpText && (
        <span style={{ fontSize:11, color:T.muted, fontStyle:"italic", marginTop:1, display:"block", marginLeft:4 }}>
          {helpText}
        </span>
      )}
    </div>
  );
}

function FSelect({ label, value, onChange, options }) {
  const [focused, setFocused] = useState(false);
  const borderColor = focused ? ac() : T.border;
  const bgImg = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")";
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      {label && <label style={{ fontSize:11, fontWeight:700, color:T.sub, letterSpacing:0.4, textTransform:"uppercase" }}>{label}</label>}
      <select
        value={value}
        onChange={function(e) { onChange(e.target.value); }}
        onFocus={function() { setFocused(true); }}
        onBlur={function() { setFocused(false); }}
        style={{ background:T.surface, border:"1.5px solid "+borderColor, borderRadius:10, color:T.text, padding:"12px 14px", fontSize:15, outline:"none", appearance:"none", WebkitAppearance:"none", backgroundImage:bgImg, backgroundRepeat:"no-repeat", backgroundPosition:"right 14px center" }}
      >
        {options.map(function(o) { return <option key={o.value} value={o.value}>{o.label}</option>; })}
      </select>
    </div>
  );
}

function FTextarea({ label, value, onChange, placeholder, rows }) {
  const [focused, setFocused] = useState(false);
  const borderColor = focused ? ac() : T.border;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      {label && <label style={{ fontSize:11, fontWeight:700, color:T.sub, letterSpacing:0.4, textTransform:"uppercase" }}>{label}</label>}
      <textarea
        value={value}
        onChange={function(e) { onChange(e.target.value); }}
        placeholder={placeholder || ""}
        rows={rows || 3}
        onFocus={function(e) {
          setFocused(true);
          var inputEl = e.target;
          setTimeout(function() {
            if (inputEl) {
              try {
                var len = inputEl.value.length;
                inputEl.setSelectionRange(len, len);
              } catch (err) {
                // Silencia
              }
            }
          }, 0);
        }}
        onBlur={function() { setFocused(false); }}
        style={{ background:T.surface, border:"1.5px solid "+borderColor, borderRadius:10, color:T.text, padding:"12px 14px", fontSize:15, outline:"none", resize:"vertical", fontFamily:"'Outfit', sans-serif", lineHeight:1.5 }}
      />
    </div>
  );
}

function ToggleGroup({ label, value, onChange, options, clearable }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      {label && <label style={{ fontSize:11, fontWeight:700, color:T.sub, letterSpacing:0.4, textTransform:"uppercase" }}>{label}</label>}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        {options.map(function(o) {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              onClick={function() { onChange(clearable && active ? "" : o.value); }}
              style={{ padding:"11px 8px", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:14, border:"1.5px solid "+(active ? ac() : T.border), background: active ? ac() : T.surface, color: active ? "#fff" : T.sub, transition:"all 0.15s" }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Btn({ children, onClick, variant, full, small, disabled, icon, style }) {
  const v = variant || "primary";
  const [hov, setHov] = useState(false);
  const styles = {
    primary: { background: hov ? ac() + "EE" : ac(), color: "#fff", boxShadow: "0 2px 10px " + ac() + "33", border: "none" },
    ghost:   { background: hov ? T.border : "transparent", color: T.sub, border: "1.5px solid " + T.border },
    outline: { background: hov ? acL() : "transparent", color: ac(), border: "1.5px solid " + ac() + "44" },
    danger:  { background: hov ? "#FEF2F2" : T.surface, color: T.danger, border: "1.5px solid #FCCACA" },
    success: { background: hov ? "#E6F9F1" : T.surface, color: T.success, border: "1.5px solid #B3ECD5" },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={function() { setHov(true); }}
      onMouseLeave={function() { setHov(false); }}
      style={Object.assign({ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:7, borderRadius:10, fontWeight:600, cursor: disabled ? "not-allowed" : "pointer", transition:"all 0.15s", fontFamily:"'Outfit', sans-serif", fontSize: small ? 13 : 15, padding: small ? "9px 16px" : "13px 22px", width: full ? "100%" : "auto", opacity: disabled ? 0.5 : 1, whiteSpace:"nowrap" }, styles[v], style || {})}
    >
      {icon && <span style={{ display:"flex", alignItems:"center" }}>{icon}</span>}
      {children}
    </button>
  );
}

function Card({ children, sx, onClick, hover, className }) {
  const [hov, setHov] = useState(false);
  const borderColor = hov ? ac() + "55" : T.border;
  return (
    <div
      className={className}
      onClick={onClick}
      onMouseEnter={function() { if (hover) setHov(true); }}
      onMouseLeave={function() { if (hover) setHov(false); }}
      style={Object.assign({ background: T.surface, border: "1px solid " + borderColor, borderRadius:16, boxShadow: hov ? T.shadowMd : T.shadow, transition:"all 0.18s", cursor: onClick ? "pointer" : "default", overflow:"hidden" }, sx || {})}
    >
      {children}
    </div>
  );
}

function Chip({ children, color }) {
  const c = color || ac();
  return <span style={{ background: c + "14", color: c, border: "1px solid " + c + "28", borderRadius:20, padding:"3px 10px", fontSize:12, fontWeight:600, whiteSpace:"nowrap" }}>{children}</span>;
}

function Avatar({ name, foto, size, color }) {
  const sz = size || 40;
  const bg = color || ac();
  if (foto) return <img src={foto} alt={name} style={{ width:sz, height:sz, borderRadius:"50%", objectFit:"cover", flexShrink:0 }}/>;
  return (
    <div style={{ width:sz, height:sz, borderRadius:"50%", background:"linear-gradient(135deg,"+bg+"22,"+bg+"44)", border:"1.5px solid "+bg+"33", display:"flex", alignItems:"center", justifyContent:"center", fontSize:sz*0.38, fontWeight:700, color:bg, flexShrink:0 }}>
      {name ? name.charAt(0).toUpperCase() : "?"}
    </div>
  );
}

function SecHead({ title, sub }) {
  return (
    <div style={{ marginBottom:18 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
        <div style={{ width:3, height:17, borderRadius:2, background:ac() }}/>
        <div style={{ fontSize:12, fontWeight:700, color:ac(), letterSpacing:1.2, textTransform:"uppercase" }}>{title}</div>
      </div>
      {sub && <div style={{ fontSize:12, color:T.muted, paddingLeft:11 }}>{sub}</div>}
    </div>
  );
}

function StatRow({ label, value, unit, color, note, className }) {
  return (
    <div className={className} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 0", borderBottom:"1px solid "+T.borderLight }}>
      <div>
        <div className="stat-label" style={{ fontSize:14, color:T.sub }}>{label}</div>
        {note && <div className="stat-note" style={{ fontSize:11, color:T.muted, marginTop:1 }}>{note}</div>}
      </div>
      <div style={{ textAlign:"right" }}>
        <span className="stat-val" style={{ fontSize:19, fontWeight:700, color: color || T.text }}>{value != null ? value : <span style={{ color:T.muted }}>—</span>}</span>
        {unit && value && <span className="stat-unit" style={{ fontSize:12, color:T.muted, marginLeft:4 }}>{unit}</span>}
      </div>
    </div>
  );
}

function Ring({ pct, size, stroke, color, label }) {
  const p = pct || 0;
  const sz = size || 72;
  const st = stroke || 6;
  const r = (sz - st * 2) / 2;
  const circ = 2 * Math.PI * r;
  const off = circ - (p / 100) * circ;
  const rot = "rotate(-90 " + (sz/2) + " " + (sz/2) + ")";
  return (
    <svg width={sz} height={sz}>
      <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={T.border} strokeWidth={st}/>
      <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={color || ac()} strokeWidth={st} strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" transform={rot} style={{ transition:"stroke-dashoffset 0.7s ease" }}/>
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill={T.text} fontSize={sz*0.2} fontWeight={700} fontFamily="Outfit,sans-serif">{label}</text>
    </svg>
  );
}

function TrashBtn({ onClick, size }) {
  return (
    <button onClick={onClick} style={{ background:"none", border:"none", cursor:"pointer", padding:"4px 6px", display:"flex", alignItems:"center", flexShrink:0 }}>
      <IcTrash c={T.danger} s={size || 17}/>
    </button>
  );
}

function compressImage(file, callback) {
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    var img = new Image();
    img.onload = function() {
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      var MAX_WIDTH = 800;
      var MAX_HEIGHT = 800;
      var width = img.width;
      var height = img.height;
      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      var compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
      callback(compressedDataUrl);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function FotoSlot({ label, foto, onSet }) {
  const ref = useRef();
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      <div style={{ fontSize:10, fontWeight:700, color:T.sub, textTransform:"uppercase", letterSpacing:0.4, textAlign:"center" }}>{label}</div>
      <div
        onClick={function() { ref.current.click(); }}
        style={{ aspectRatio:"3/4", borderRadius:12, overflow:"hidden", cursor:"pointer", border:"1.5px dashed "+(foto ? ac() : T.border), background: foto ? "transparent" : T.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", transition:"border-color 0.15s" }}
      >
        {foto ? (
          <>
            <img src={foto} alt={label} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
            <button
              onClick={function(e) { e.stopPropagation(); onSet(null); }}
              style={{ position:"absolute", top:5, right:5, background:"rgba(0,0,0,0.55)", border:"none", borderRadius:"50%", width:24, height:24, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:14 }}
            >x</button>
          </>
        ) : (
          <>
            <IcCamera c={T.muted} s={24}/>
            <span style={{ fontSize:10, color:T.muted, marginTop:5 }}>Adicionar</span>
          </>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        style={{ display:"none" }}
        onChange={function(e) {
          var f = e.target.files[0];
          if (!f) return;
          compressImage(f, function(compressedUrl) {
            onSet(compressedUrl);
          });
        }}
      />
    </div>
  );
}

// ── BOTTOM NAV ────────────────────────────────────────────────────────────────
function BottomNav({ active, onChange, trainer }) {
  const lang = (trainer && trainer.lang) || "pt";
  const tabs = [
    { id:"home",   label: t("inicio", lang),  Icon: IcHome },
    { id:"modelos", label: t("ajustes", lang), Icon: IcClipboard },
    { id:"perfil", label: t("perfil", lang),  Icon: IcSettings },
  ];
  return (
    <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:100, background:T.surface, borderTop:"1px solid "+T.border, display:"flex", padding:"8px 0 8px", boxShadow:"0 -4px 20px rgba(0,0,0,0.06)", maxWidth:640, margin:"0 auto" }}>
      {tabs.map(function(t) {
        const on = active === t.id;
        return (
          <button
            key={t.id}
            onClick={function() { onChange(t.id); }}
            style={{ flex:1, background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"4px 0" }}
          >
            <t.Icon c={on ? ac() : T.muted} s={22}/>
            <span style={{ fontSize:10, fontWeight: on ? 700 : 500, color: on ? ac() : T.muted }}>{t.label}</span>
            {on && <div style={{ width:18, height:2.5, borderRadius:2, background:ac(), marginTop:-2 }}/>}
          </button>
        );
      })}
    </div>
  );
}

// ── LOGO SHAPEMAP ─────────────────────────────────────────────────────────────
function LogoShapeMap({ size = 120, color = "#000000", showText = true, style }) {
  const viewBox = showText ? "120 180 1010 820" : "360 210 530 530";
  return (
    <svg
      width={size}
      height={showText ? size * (820 / 1010) : size}
      viewBox={viewBox}
      style={{ display: "block", ...style }}
    >
      <g transform="translate(0.000000,1254.000000) scale(0.100000,-0.100000)" fill={color} stroke="none">
        {/* Symbol Path 1 */}
        <path d="M5039 9934 c-387 -70 -713 -374 -814 -760 -34 -130 -36 -229 -33 -1419 l3 -1180 28 -100 c91 -332 327 -595 642 -713 49 -19 119 -40 155 -47 84 -18 872 -30 901 -15 18 10 19 26 19 433 0 232 -5 494 -10 582 -34 517 -151 799 -405 974 -94 66 -212 121 -440 210 -301 115 -440 181 -571 268 -49 32 -84 80 -84 115 0 32 40 77 78 89 43 12 25 16 402 -70 801 -182 1414 -215 2050 -111 356 58 752 161 1005 262 134 53 291 136 333 175 l34 33 -5 207 c-5 234 -24 333 -90 476 -76 164 -216 333 -352 424 -128 86 -288 151 -425 173 -42 6 -469 10 -1205 9 -922 -1 -1155 -3 -1216 -15z m1340 -665 c194 -44 361 -254 361 -455 0 -212 -154 -416 -355 -468 -202 -53 -416 33 -529 212 -95 151 -93 351 4 503 113 174 312 255 519 208z"/>
        {/* Symbol Path 2 */}
        <path d="M8255 8308 c-151 -129 -354 -234 -705 -368 -333 -127 -462 -194 -593 -310 -199 -176 -318 -492 -346 -917 -15 -231 -24 -985 -12 -1003 9 -13 54 -16 280 -18 369 -4 590 9 704 42 92 27 221 87 297 139 237 161 403 428 439 712 9 64 11 334 9 936 l-3 846 -70 -59z"/>
        
        {showText && (
          <>
            {/* S */}
            <path d="M1965 5096 c-245 -48 -386 -189 -402 -402 -14 -182 79 -331 249 -402 40 -17 150 -49 243 -72 238 -59 288 -91 288 -185 0 -112 -128 -181 -291 -156 -114 17 -183 62 -216 143 -9 20 -20 39 -25 42 -8 5 -210 -45 -258 -65 -32 -12 -29 -43 9 -120 59 -119 173 -205 328 -246 94 -25 342 -25 425 1 143 43 242 121 298 235 30 62 32 71 32 181 -1 132 -15 177 -82 251 -78 87 -176 132 -426 195 -222 56 -276 97 -265 198 20 178 365 199 442 28 23 -52 33 -52 175 -12 142 40 143 41 98 134 -60 120 -167 203 -313 241 -85 22 -227 27 -309 11z"/>
            {/* h */}
            <path d="M2802 5078 c-19 -19 -17 -1421 2 -1437 9 -8 57 -11 147 -9 l134 3 5 305 c6 326 9 351 61 407 38 40 116 66 181 60 72 -6 116 -33 148 -89 25 -43 25 -46 30 -363 l5 -320 134 -3 c94 -2 138 1 148 10 23 19 14 680 -11 758 -49 153 -166 247 -332 265 -112 13 -271 -38 -328 -105 -13 -17 -27 -30 -30 -30 -3 0 -7 125 -8 278 l-3 277 -135 3 c-97 2 -139 -1 -148 -10z"/>
            {/* a */}
            <path d="M4301 4655 c-137 -31 -243 -111 -281 -212 -11 -30 -20 -60 -20 -69 0 -21 32 -30 130 -38 47 -4 93 -9 102 -12 12 -3 25 7 43 34 33 51 80 72 158 72 106 0 166 -46 170 -130 l2 -45 -185 -6 c-204 -7 -259 -18 -343 -71 -50 -32 -96 -90 -115 -147 -7 -19 -12 -68 -12 -110 0 -152 85 -257 240 -297 129 -33 292 -2 377 71 23 19 43 35 45 35 3 0 3 -13 0 -29 -2 -16 1 -38 7 -50 11 -20 20 -21 135 -21 96 0 126 3 136 14 9 11 11 105 8 373 -4 342 -5 360 -26 414 -59 147 -194 225 -407 235 -66 2 -122 -1 -164 -11z m305 -632 c-13 -99 -73 -162 -175 -183 -63 -14 -133 0 -168 32 -45 42 -38 129 12 162 40 26 88 34 214 35 l124 1 -7 -47z"/>
            {/* p */}
            <path d="M5552 4654 c-73 -19 -110 -40 -159 -87 l-43 -41 0 51 c0 31 -5 55 -14 62 -9 8 -56 11 -142 9 l-129 -3 0 -705 0 -705 140 0 140 0 3 248 c1 136 5 247 8 247 3 0 17 -11 32 -25 144 -135 436 -121 586 28 59 59 103 142 128 238 17 70 20 103 15 199 -10 220 -93 368 -250 445 -112 55 -212 67 -315 39z m146 -266 c92 -43 137 -138 130 -272 -5 -96 -28 -147 -88 -198 -118 -101 -303 -63 -365 76 -62 137 -29 300 77 379 37 27 116 47 163 41 22 -3 59 -15 83 -26z"/>
            {/* e */}
            <path d="M6644 4655 c-181 -39 -325 -174 -376 -353 -30 -105 -28 -246 6 -345 31 -93 58 -138 121 -200 89 -90 197 -135 340 -144 149 -9 281 30 381 113 46 37 104 118 104 145 0 12 -30 28 -115 60 l-116 42 -42 -41 c-53 -52 -101 -72 -175 -72 -111 0 -213 77 -229 173 l-6 37 350 0 c302 0 352 2 363 15 17 20 7 146 -18 237 -69 248 -321 391 -588 333z m211 -244 c60 -28 115 -96 115 -142 0 -5 -88 -9 -215 -9 l-215 0 15 38 c35 82 112 132 205 132 32 0 71 -8 95 -19z"/>
            {/* M */}
            <path d="M7410 5071 c-7 -13 -10 -256 -10 -719 0 -584 2 -701 14 -711 9 -8 59 -11 152 -9 l139 3 5 455 5 455 23 -40 c13 -22 92 -159 176 -305 l152 -265 88 0 88 0 95 165 c52 91 132 228 177 305 l81 139 3 -443 c1 -308 6 -448 13 -458 15 -18 269 -19 287 -1 17 17 17 1419 0 1436 -19 19 -282 17 -301 -2 -8 -8 -85 -138 -172 -288 -87 -150 -183 -315 -212 -366 l-55 -93 -210 368 c-115 202 -215 374 -220 381 -8 8 -52 12 -159 12 -136 0 -149 -2 -159 -19z"/>
            {/* a */}
            <path d="M9425 4659 c-152 -25 -275 -118 -312 -235 -23 -74 -15 -80 105 -89 53 -3 106 -9 118 -12 16 -3 26 4 42 31 32 54 75 76 151 76 115 0 187 -57 179 -143 l-3 -32 -185 -6 c-203 -7 -249 -16 -340 -71 -60 -36 -102 -91 -121 -155 -17 -63 -7 -188 19 -240 61 -118 196 -182 362 -170 95 6 175 37 233 88 l46 40 3 -53 3 -53 115 -3 c63 -1 125 0 138 3 l23 6 -3 372 -3 372 -28 61 c-34 72 -92 133 -162 168 -97 47 -254 66 -380 45z m285 -626 c-1 -86 -61 -161 -152 -188 -68 -20 -104 -19 -156 5 -73 33 -92 119 -37 170 40 38 91 49 223 50 l122 0 0 -37z"/>
            {/* p */}
            <path d="M10655 4656 c-69 -17 -115 -41 -160 -81 -21 -19 -39 -35 -41 -35 -2 0 -4 19 -4 43 0 24 -5 48 -12 55 -18 18 -252 17 -267 -2 -8 -9 -10 -203 -9 -707 l3 -694 134 -3 c90 -2 138 1 147 9 11 9 14 59 14 252 l0 241 33 -31 c106 -104 316 -122 475 -42 232 116 323 479 191 756 -89 186 -305 288 -504 239z m140 -265 c149 -65 187 -326 67 -455 -38 -41 -118 -76 -172 -75 -175 1 -284 169 -236 360 42 161 190 235 341 170z"/>
          </>
        )}
      </g>
    </svg>
  );
}

// ── LANGUAGE SELECTOR DROPDOWN ────────────────────────────────────────────────
function LanguageSelector({ lang, onChange, align = "right" }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const langs = [
    { value: "pt", label: "Português", flag: "🇧🇷" },
    { value: "en", label: "English", flag: "🇺🇸" },
    { value: "es", label: "Español", flag: "🇪🇸" }
  ];
  
  const current = langs.find(function(l) { return l.value === lang; }) || langs[0];
  
  useEffect(function() {
    if (!isOpen) return;
    function handleOutsideClick() {
      setIsOpen(false);
    }
    document.addEventListener("click", handleOutsideClick);
    return function() {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <div style={{ position: "relative", display: "inline-block" }} onClick={function(e) { e.stopPropagation(); }}>
      <button
        onClick={function() { setIsOpen(!isOpen); }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: T.surface,
          border: "1.5px solid " + (isOpen ? ac() : T.border),
          borderRadius: 10,
          padding: "8px 12px",
          fontSize: 13,
          fontWeight: 600,
          color: T.text,
          cursor: "pointer",
          transition: "all 0.15s",
          boxShadow: isOpen ? "0 4px 12px rgba(0,0,0,0.05)" : "none"
        }}
      >
        <span style={{ fontSize: 15 }}>{current.flag}</span>
        <span style={{ fontSize: 13 }}>{current.label}</span>
        <span style={{ fontSize: 8, color: T.muted, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>▼</span>
      </button>
      
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: align === "right" ? 0 : "auto",
            left: align === "left" ? 0 : align === "center" ? "50%" : "auto",
            transform: align === "center" ? "translateX(-50%)" : "none",
            background: T.surface,
            border: "1.5px solid " + T.border,
            borderRadius: 12,
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            padding: 6,
            minWidth: 140,
            zIndex: 999,
            display: "flex",
            flexDirection: "column",
            gap: 2
          }}
        >
          {langs.map(function(o) {
            const active = o.value === lang;
            return (
              <button
                key={o.value}
                onClick={function() {
                  onChange(o.value);
                  setIsOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "8px 12px",
                  border: "none",
                  borderRadius: 8,
                  background: active ? ac() + "12" : "transparent",
                  color: active ? ac() : T.text,
                  fontWeight: active ? 700 : 500,
                  fontSize: 13,
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.1s"
                }}
              >
                <span style={{ fontSize: 15 }}>{o.flag}</span>
                <span>{o.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LoginScreen({ onLogin, trainer, onUpdateTrainer }) {
  const lang = (trainer && trainer.lang) || "pt";
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [isSignUp, setIsSignUp] = useState(function() {
    const search = window.location.search;
    const hash = window.location.hash;
    return search.includes("signup=true") || 
           search.includes("cadastro=true") || 
           search.includes("register=true") ||
           hash === "#signup" || 
           hash === "#cadastro" || 
           hash === "#register";
  });
  const [isResetMode, setIsResetMode] = useState(false);
  const [recoveryEmailSent, setRecoveryEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  async function go() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !senha || (isSignUp && (!nome || !confirmEmail))) {
      setErrorMsg(lang === "pt" ? "Preencha todos os campos" : "Please fill in all fields");
      return;
    }
    if (isSignUp && trimmedEmail.toLowerCase() !== confirmEmail.trim().toLowerCase()) {
      setErrorMsg(lang === "pt" ? "Os e-mails informados não coincidem" : lang === "es" ? "Los correos electrónicos no coinciden" : "The emails entered do not match");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    
    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: senha,
        options: {
          data: {
            nome: nome
          }
        }
      });
      if (error) {
        setErrorMsg(translateAuthError(error.message, lang));
        setLoading(false);
      } else {
        setLoading(false);
        if (typeof window.fbq === 'function') {
          window.fbq('track', 'CompleteRegistration');
        }
        if (data.session) {
          localStorage.setItem("avaliapro_remember_me", rememberMe ? "true" : "false");
          sessionStorage.setItem("avaliapro_session_active", "true");
          sessionStorage.setItem("just_signed_up", "true");
          onLogin();
        } else {
          alert(lang === "pt" 
            ? "Cadastro realizado! Verifique seu e-mail para confirmar a conta." 
            : "Registration successful! Please check your email to verify your account.");
          setIsSignUp(false);
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: senha
      });
      if (error) {
        setErrorMsg(translateAuthError(error.message, lang));
        setLoading(false);
      } else {
        localStorage.setItem("avaliapro_remember_me", rememberMe ? "true" : "false");
        sessionStorage.setItem("avaliapro_session_active", "true");
        setLoading(false);
        onLogin();
      }
    }
  }

  async function handleSendRecovery() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg(lang === "pt" ? "Preencha o campo de e-mail" : lang === "es" ? "Por favor ingrese su correo electrónico" : "Please enter your email");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: window.location.origin
      });
      if (error) {
        setErrorMsg(translateAuthError(error.message, lang));
      } else {
        setRecoveryEmailSent(true);
        setErrorMsg("");
      }
    } catch (err) {
      setErrorMsg(translateAuthError(err.message || err, lang));
    } finally {
      setLoading(false);
    }
  }

  const titleText = isResetMode 
    ? (lang === "pt" ? "Recuperar senha" : lang === "es" ? "Recuperar contraseña" : "Recover password")
    : (isSignUp 
        ? (lang === "pt" ? "Criar conta" : lang === "es" ? "Crear cuenta" : "Create account")
        : t("entrar_conta", lang));

  const subtitleText = isResetMode
    ? (lang === "pt" ? "Insira seu e-mail para receber o link de redefinição" : lang === "es" ? "Ingrese su correo para recibir el enlace de restablecimiento" : "Enter your email to receive the reset link")
    : (isSignUp
        ? (lang === "pt" ? "Cadastre-se para começar" : lang === "es" ? "Regístrese para comenzar" : "Sign up to get started")
        : t("acesse_sua_area", lang));

  const buttonText = loading 
    ? (isResetMode
        ? (lang === "pt" ? "Enviando..." : lang === "es" ? "Enviando..." : "Sending...")
        : t("entrando", lang)) 
    : (isResetMode
        ? (lang === "pt" ? "Enviar Link de Recuperação" : lang === "es" ? "Enviar enlace" : "Send Recovery Link")
        : (isSignUp 
            ? (lang === "pt" ? "Criar Conta" : lang === "es" ? "Crear Cuenta" : "Create Account")
            : t("entrar", lang)));

  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, position: "relative" }}>
      <div className="fu" style={{ textAlign:"center", marginBottom:20, display:"flex", flexDirection:"column", alignItems:"center" }}>
        <LogoShapeMap size={180} color={ac()} showText={true} style={{ marginBottom: 4 }} />
        <div style={{ fontSize:13, color:T.muted, marginTop:3 }}>{t("plataforma_av", lang)}</div>
      </div>

      <div style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
        <LanguageSelector
          lang={lang}
          onChange={function(newLang) {
            if (onUpdateTrainer && trainer) {
              onUpdateTrainer(Object.assign({}, trainer, { lang: newLang }));
            }
          }}
          align="center"
        />
      </div>

      <Card sx={{ width:"100%", maxWidth:380, padding:28 }}>
        <div style={{ fontSize:17, fontWeight:700, marginBottom:4 }}>{titleText}</div>
        <div style={{ fontSize:13, color:T.muted, marginBottom:22 }}>{subtitleText}</div>
        
        {errorMsg && (
          <div style={{ background:"#FEE2E2", color:"#991B1B", padding:10, borderRadius:8, fontSize:13, marginBottom:16 }}>
            {errorMsg}
          </div>
        )}

        {isResetMode && recoveryEmailSent ? (
          <div style={{ background: "#DCFCE7", color: "#166534", padding: 16, borderRadius: 12, fontSize: 14, textAlign: "center", lineHeight: 1.5 }}>
            {lang === "pt"
              ? "Link de recuperação enviado com sucesso! Verifique sua caixa de entrada."
              : lang === "es"
                ? "¡Enlace de recuperación enviado con éxito! Revise su bandeja de entrada."
                : "Recovery link sent successfully! Please check your inbox."}
            <Btn full variant="ghost" onClick={function() { setIsResetMode(false); setRecoveryEmailSent(false); }} style={{ marginTop: 14 }}>
              {lang === "pt" ? "Voltar ao Login" : lang === "es" ? "Volver al Login" : "Back to Login"}
            </Btn>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {isResetMode ? (
              <>
                <FInput label={t("email", lang)} value={email} onChange={setEmail} type="email" placeholder="seu@email.com"/>
                <Btn full onClick={handleSendRecovery} disabled={loading}>{buttonText}</Btn>
                <div style={{ textAlign: "center", marginTop: 4 }}>
                  <span 
                    style={{ fontSize:13, color:ac(), cursor:"pointer", fontWeight:600 }}
                    onClick={function() { setIsResetMode(false); setErrorMsg(""); }}
                  >
                    {lang === "pt" ? "Voltar ao Login" : lang === "es" ? "Volver al Login" : "Back to Login"}
                  </span>
                </div>
              </>
            ) : (
              <>
                {isSignUp && (
                  <FInput label={lang === "pt" ? "Nome Completo" : lang === "es" ? "Nombre Completo" : "Full Name"} value={nome} onChange={setNome} placeholder={lang === "pt" ? "Seu nome completo" : lang === "es" ? "Su nombre completo" : "Your full name"}/>
                )}
                <FInput label={t("email", lang)} value={email} onChange={setEmail} type="email" placeholder="seu@email.com"/>
                {isSignUp && (
                  <FInput label={lang === "pt" ? "Confirmar E-mail" : lang === "es" ? "Confirmar Correo Electrónico" : "Confirm Email"} value={confirmEmail} onChange={setConfirmEmail} type="email" placeholder="seu@email.com"/>
                )}
                <FInput label={t("senha", lang)} value={senha} onChange={setSenha} type="password" placeholder="••••••••"/>
                
                {!isSignUp && (
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -6 }}>
                    <span 
                      style={{ fontSize: 12, color: ac(), cursor: "pointer", fontWeight: 500 }}
                      onClick={function() { setIsResetMode(true); setErrorMsg(""); }}
                    >
                      {lang === "pt" ? "Esqueci minha senha" : lang === "es" ? "Olvidé mi contraseña" : "Forgot my password"}
                    </span>
                  </div>
                )}

                <div 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 8, 
                    userSelect: "none", 
                    cursor: "pointer",
                    padding: "2px 0",
                    marginTop: -2,
                    marginBottom: 4
                  }}
                  onClick={function() { setRememberMe(!rememberMe); }}
                >
                  <div style={{
                    width: 18,
                    height: 18,
                    borderRadius: 6,
                    border: "1.5px solid " + (rememberMe ? ac() : T.border),
                    background: rememberMe ? ac() : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s ease",
                    boxShadow: rememberMe ? "0 2px 8px " + ac() + "33" : "none"
                  }}>
                    {rememberMe && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1.5 4L3.75 6.25L8.5 1.5" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>
                    {t("mantenha_me_conectado", lang)}
                  </span>
                </div>

                <Btn full onClick={go} disabled={loading}>{buttonText}</Btn>
              </>
            )}
          </div>
        )}
      </Card>
      
      {!isResetMode && (
        <div style={{ marginTop:28, textAlign:"center" }}>
          <span style={{ fontSize:13, color:T.muted }}>
            {isSignUp 
              ? (lang === "pt" ? "Já tem uma conta?" : lang === "es" ? "¿Ya tienes una cuenta?" : "Already have an account?")
              : t("nao_tem_conta", lang)}{" "}
          </span>
          <span 
            style={{ fontSize:13, color:ac(), cursor:"pointer", fontWeight:600 }}
            onClick={function() { setIsSignUp(!isSignUp); setErrorMsg(""); }}
          >
            {isSignUp 
              ? (lang === "pt" ? "Entrar" : lang === "es" ? "Entrar" : "Log in")
              : t("criar_conta_gratis", lang)}
          </span>
        </div>
      )}
    </div>
  );
}

// ── RESET PASSWORD SCREEN ──────────────────────────────────────────────────────
function ResetPasswordScreen({ trainer, onSaved, onCancel }) {
  const lang = (trainer && trainer.lang) || "pt";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleReset() {
    const pwd = newPassword.trim();
    const conf = confirmPassword.trim();
    if (!pwd || !conf) {
      setErrorMsg(lang === "pt" ? "Preencha todos os campos" : lang === "es" ? "Por favor complete todos los campos" : "Please fill in all fields");
      return;
    }
    if (pwd !== conf) {
      setErrorMsg(lang === "pt" ? "As senhas não coincidem" : lang === "es" ? "Las contraseñas no coinciden" : "Passwords do not match");
      return;
    }
    if (pwd.length < 6) {
      setErrorMsg(lang === "pt" ? "A senha deve ter pelo menos 6 caracteres" : lang === "es" ? "La contraseña debe tener al menos 6 caracteres" : "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.updateUser({ password: pwd });
      if (error) {
        setErrorMsg(translateAuthError(error.message, lang));
      } else {
        alert(lang === "pt" ? "Senha alterada com sucesso!" : lang === "es" ? "¡Contraseña cambiada con éxito!" : "Password changed successfully!");
        onSaved();
      }
    } catch (err) {
      setErrorMsg(translateAuthError(err.message || err, lang));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div className="fu" style={{ textAlign:"center", marginBottom:30, display:"flex", flexDirection:"column", alignItems:"center" }}>
        <LogoShapeMap size={180} color={ac()} showText={true} style={{ marginBottom: 4 }} />
        <div style={{ fontSize:13, color:T.muted, marginTop:3 }}>{t("plataforma_av", lang)}</div>
      </div>

      <Card sx={{ width:"100%", maxWidth:380, padding:28 }}>
        <div style={{ fontSize:17, fontWeight:700, marginBottom:4 }}>
          {lang === "pt" ? "Redefinir senha" : lang === "es" ? "Restablecer contraseña" : "Reset password"}
        </div>
        <div style={{ fontSize:13, color:T.muted, marginBottom:22 }}>
          {lang === "pt" ? "Defina sua nova senha de acesso" : lang === "es" ? "Defina su nueva contraseña de acesso" : "Set your new access password"}
        </div>

        {errorMsg && (
          <div style={{ background:"#FEE2E2", color:"#991B1B", padding:10, borderRadius:8, fontSize:13, marginBottom:16 }}>
            {errorMsg}
          </div>
        )}

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <FInput 
            label={lang === "pt" ? "Nova Senha" : lang === "es" ? "Nueva Contraseña" : "New Password"} 
            value={newPassword} 
            onChange={setNewPassword} 
            type="password" 
            placeholder="••••••••"
          />
          <FInput 
            label={lang === "pt" ? "Confirmar Senha" : lang === "es" ? "Confirmar Contraseña" : "Confirm Password"} 
            value={confirmPassword} 
            onChange={setConfirmPassword} 
            type="password" 
            placeholder="••••••••"
          />

          <Btn full onClick={handleReset} disabled={loading}>
            {loading 
              ? (lang === "pt" ? "Salvando..." : lang === "es" ? "Guardando..." : "Saving...") 
              : (lang === "pt" ? "Salvar Senha" : lang === "es" ? "Guardar Contraseña" : "Save Password")}
          </Btn>

          <Btn full variant="ghost" onClick={onCancel} disabled={loading}>
            {lang === "pt" ? "Cancelar" : lang === "es" ? "Cancelar" : "Cancel"}
          </Btn>
        </div>
      </Card>
    </div>
  );
}

// ── CONFIRM DELETE ────────────────────────────────────────────────────────────
function ConfirmDelete({ nome, onConfirm, onCancel, lang = "pt" }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:400, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ background:T.surface, borderRadius:20, padding:"28px 24px", width:"100%", maxWidth:340, boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}>
          <div style={{ width:52, height:52, borderRadius:14, background:"#FEF2F2", border:"1.5px solid #FCCACA", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <IcTrash c={T.danger} s={26}/>
          </div>
        </div>
        <div style={{ fontSize:17, fontWeight:700, textAlign:"center", marginBottom:8 }}>{t("confirmar_exclusao", lang)}</div>
        <div style={{ fontSize:14, color:T.muted, textAlign:"center", marginBottom:24, lineHeight:1.5 }}>
          {t("realmente_deseja_excluir", lang)} <strong style={{ color:T.text }}>{nome}</strong>?<br/>{t("acao_nao_desfeita", lang)}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <Btn full variant="ghost" onClick={onCancel}>{t("nao_cancelar", lang)}</Btn>
          <Btn full variant="danger" onClick={onConfirm}>{t("sim_excluir", lang)}</Btn>
        </div>
      </div>
    </div>
  );
}

// ── CONFIRM LEAVE ─────────────────────────────────────────────────────────────
function ConfirmLeave({ onConfirm, onCancel, lang = "pt" }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:400, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ background:T.surface, borderRadius:20, padding:"28px 24px", width:"100%", maxWidth:340, boxShadow:"0 20px 60px rgba(0,0,0,0.2)", animation:"popIn 0.25s ease" }}>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}>
          <div style={{ width:52, height:52, borderRadius:14, background:"#FFFBEB", border:"1.5px solid #FDE68A", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
        </div>
        <div style={{ fontSize:17, fontWeight:700, textAlign:"center", marginBottom:8, color:T.text }}>{t("alteracoes_nao_salvas", lang)}</div>
        <div style={{ fontSize:14, color:T.muted, textAlign:"center", marginBottom:24, lineHeight:1.5 }}>
          {t("se_sair_agora", lang)}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <Btn variant="ghost" full onClick={onCancel}>{t("cancelar", lang)}</Btn>
          <Btn full onClick={onConfirm} style={{ background:"#D97706", borderColor:"#D97706", color:"#fff" }}>{t("sair_sem_salvar", lang)}</Btn>
        </div>
      </div>
    </div>
  );
}

// ── HOME ──────────────────────────────────────────────────────────────────────
function HomeScreen({ alunos, trainer, onSelectAluno, onDeleteAluno, onAddAluno, onSelectPerfil }) {
  const lang = (trainer && trainer.lang) || "pt";
  const [showModal, setShowModal] = useState(false);
  const [newNome, setNewNome] = useState("");
  const [newSexo, setNewSexo] = useState("");
  const [newTelefone, setNewTelefone] = useState("");
  const [newIdade, setNewIdade] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [busca, setBusca] = useState("");

  const toDelete = alunos.find(function(a) { return a.id === confirmId; });
  const total = alunos.reduce(function(s, a) { return s + (a.avaliacoes ? a.avaliacoes.length : 0); }, 0);
  const mes = new Date().toISOString().slice(0, 7);
  const avMes = alunos.reduce(function(s, a) { return s + (a.avaliacoes ? a.avaliacoes.filter(function(v) { return v.data && v.data.indexOf(mes) === 0; }).length : 0); }, 0);

  const filtered = alunos.filter(function(a) {
    return a.nome.toLowerCase().indexOf(busca.toLowerCase()) >= 0;
  });

  const stats = [
    { l: t("alunos", lang),    v: alunos.length, Icon: IcStat1 },
    { l: t("avaliacoes", lang), v: total,         Icon: IcStat2 },
    { l: t("este_mes", lang),  v: avMes,         Icon: IcStat3 },
  ];
  return (
    <div style={{ padding:"24px 16px 100px" }}>
      {confirmId && <ConfirmDelete nome={toDelete ? toDelete.nome : ""} onCancel={function() { setConfirmId(null); }} onConfirm={function() { onDeleteAluno(confirmId); setConfirmId(null); }} lang={lang}/>}
      {showModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:200, display:"flex", alignItems:"flex-end" }} onClick={function() { setShowModal(false); setNewNome(""); setNewSexo(""); setNewIdade(""); }}>
          <div onClick={function(e) { e.stopPropagation(); }} style={{ background:T.surface, borderRadius:"20px 20px 0 0", padding:"22px 20px 38px", width:"100%", boxShadow:T.shadowMd }}>
            <div style={{ width:34, height:4, borderRadius:2, background:T.border, margin:"0 auto 18px" }}/>
            <div style={{ fontSize:17, fontWeight:700, marginBottom:16 }}>{t("novo_aluno", lang)}</div>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <FInput label={t("nome_completo", lang)} value={newNome} onChange={function(v) { setNewNome(v); }} placeholder={t("nome_completo_placeholder", lang)} required/>
              <ToggleGroup label={<span style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}><span>{t("genero", lang)}</span>{!newSexo && <span style={{ color:T.danger, fontSize:10, textTransform:"none", fontWeight:500 }}>{lang === "en" ? "(select gender before proceeding)" : lang === "es" ? "(selecciona género antes de continuar)" : "(selecione o gênero antes de prosseguir)"}</span>}</span>} value={newSexo} onChange={function(v) { setNewSexo(v); }} options={[{value:"M",label:t("masculino", lang)},{value:"F",label:t("feminino", lang)}]}/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <FInput label={t("telefone", lang)} value={newTelefone} onChange={setNewTelefone} placeholder="(11) 99999-9999"/>
                <FInput label={lang === "en" ? "Age (years)" : lang === "es" ? "Edad (años)" : "Idade (anos)"} value={newIdade} onChange={setNewIdade} type="number" required placeholder={lang === "en" ? "e.g. 28" : "Ex: 28"}/>
              </div>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:20 }}>
              <Btn variant="ghost" full onClick={function() { setShowModal(false); setNewNome(""); setNewSexo(""); setNewTelefone(""); setNewIdade(""); }}>{t("cancelar", lang)}</Btn>
              <Btn full onClick={function() { if(!newNome.trim() || !newSexo || !newIdade) return; const anoNasc = new Date().getFullYear() - parseInt(newIdade); const dataNascimento = `${anoNasc}-01-01`; onAddAluno(newNome.trim(), newSexo, newTelefone, dataNascimento); setShowModal(false); setNewNome(""); setNewSexo(""); setNewTelefone(""); setNewIdade(""); }} disabled={!newNome.trim() || !newSexo || !newIdade}>{t("cadastrar", lang)}</Btn>
            </div>
          </div>
        </div>
      )}



      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, cursor:"pointer" }} onClick={onSelectPerfil}>
          <Avatar name={trainer.nome} foto={trainer.foto} size={44} color={ac()}/>
          <div>
            <div style={{ fontSize:22, fontWeight:800, color:T.text, letterSpacing:-0.5 }}>{trainer.nome}</div>
            <div style={{ fontSize:12, color:T.muted, fontWeight:500 }}>{t("bem_vindo", lang)}</div>
          </div>
        </div>
        <Btn small onClick={function() { setShowModal(true); }} icon={<IcPlus c="#fff" s={15}/>}>{t("novo_aluno", lang)}</Btn>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:24 }}>
        {stats.map(function(s) {
          return (
            <Card key={s.l} sx={{ padding:"14px 10px", textAlign:"center" }}>
              <div style={{ display:"flex", justifyContent:"center", marginBottom:6 }}><s.Icon c={ac()} s={26}/></div>
              <div style={{ fontSize:24, fontWeight:800, color:ac() }}>{s.v}</div>
              <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>{s.l}</div>
            </Card>
          );
        })}
      </div>

      <div style={{ position:"relative", marginBottom:18 }}>
        <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", display:"flex", alignItems:"center" }}><IcSearch c={T.muted} s={17}/></span>
        <input value={busca} onChange={function(e) { setBusca(e.target.value); }} placeholder={t("pesquisar_aluno", lang)} style={{ width:"100%", background:T.surface, border:"1.5px solid "+T.border, borderRadius:10, color:T.text, padding:"11px 14px 11px 42px", fontSize:14, outline:"none" }}/>
      </div>

      {alunos.length === 0 ? (
        <Card sx={{ padding:40, textAlign:"center" }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}><IcUsers c={T.muted} s={40}/></div>
          <div style={{ fontWeight:600 }}>{t("nenhum_aluno_cadastrado", lang)}</div>
          <div style={{ color:T.muted, fontSize:13, marginTop:5 }}>{t("clique_novo_aluno", lang)}</div>
        </Card>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:"center", color:T.muted, padding:44, fontSize:14 }}>{t("nenhum_aluno_busca", lang)}</div>
      ) : (
        <>
          <div style={{ fontSize:12, fontWeight:700, color:T.sub, letterSpacing:0.5, textTransform:"uppercase", marginBottom:10 }}>{t("todos_alunos", lang)}</div>
          <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
            {filtered.map(function(a) {
              var u = a.avaliacoes[a.avaliacoes.length - 1];
              return (
                <Card key={a.id} sx={{ padding:"13px 15px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ cursor:"pointer", display:"flex", alignItems:"center", gap:12, flex:1, minWidth:0 }} onClick={function() { onSelectAluno(a.id); }}>
                      <Avatar name={a.nome} foto={a.foto} size={40} color={ac()}/>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:600, fontSize:15 }}>{a.nome}</div>
                        <div style={{ fontSize:12, color:T.muted, marginTop:1, display:"flex", alignItems:"center", gap:4 }}>
                          {a.sexo === "F" ? <IcFemale c={T.muted} s={13}/> : <IcMale c={T.muted} s={13}/>}
                          {(a.avaliacoes ? a.avaliacoes.length : 0) === 0 ? t("sem_avaliacoes", lang) : (a.avaliacoes ? a.avaliacoes.length : 0) + " " + (lang === "en" ? "evals." : lang === "es" ? "eval." : "aval.") + " · " + t("ultima_aval", lang) + fmtDate(u ? u.data : "")}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ── ALUNOS LIST ───────────────────────────────────────────────────────────────
// ── AJUSTES SCREEN ───────────────────────────────────────────────────────────
function AjustesScreen({ settings, onUpdateSettings, trainer, onUpdateTrainer }) {
  const lang = (trainer && trainer.lang) || "pt";
  const [newQuestion, setNewQuestion] = useState("");
  const [newExercise, setNewExercise] = useState("");
  const [newPerimLabel, setNewPerimLabel] = useState("");
  const pickerRef = useRef();

  const [draggedQuestionIdx, setDraggedQuestionIdx] = useState(null);
  const [draggedExerciseIdx, setDraggedExerciseIdx] = useState(null);
  const [draggedPerimIdx, setDraggedPerimIdx] = useState(null);

  const [activeOnlineTab, setActiveOnlineTab] = useState("");
  function toggleOnlineAccordion(tabName) {
    setActiveOnlineTab(function(current) {
      return current === tabName ? "" : tabName;
    });
  }

  const defaultAnamnese = (settings && settings.defaultOnlineConfig && settings.defaultOnlineConfig.anamneseQuestions) 
    || (settings && settings.anamnesePerguntas) 
    || PERGUNTAS_PADRAO;
  
  const defaultPerim = (settings && settings.defaultOnlineConfig && settings.defaultOnlineConfig.perimetriaFields) 
    || ((settings && settings.perimetriaCampos) || []).filter(function(x) { return x.active; }).map(function(x) { return { key: x.key, label: x.label }; });

  const defaultForce = (settings && settings.defaultOnlineConfig && settings.defaultOnlineConfig.testesExercises) 
    || (settings && settings.exerciciosForca) 
    || [];

  const defaultCardio = (settings && settings.defaultOnlineConfig && settings.defaultOnlineConfig.cardioFields) 
    || [
      { key: "cooper", label: lang === "es" ? "Teste de Cooper (Metros)" : lang === "en" ? "Cooper Test (Meters)" : "Teste de Cooper (Metros)" },
      { key: "fcRepouso", label: lang === "es" ? "Frecuencia Cardíaca de Reposo" : lang === "en" ? "Resting Heart Rate" : "Frequência Cardíaca de Repouso" },
      { key: "fcRecuperacao", label: lang === "es" ? "Frecuencia Cardíaca de Recuperación" : lang === "en" ? "Recovery Heart Rate" : "Frequência Cardíaca de Recuperação" },
      { key: "fcMax", label: lang === "es" ? "Frecuencia Cardíaca Máxima (Medida)" : lang === "en" ? "Max Heart Rate (Measured)" : "Frequência Cardíaca Máxima (Medida)" },
      { key: "pressaoArterial", label: lang === "es" ? "Presión Arterial" : lang === "en" ? "Blood Pressure" : "Pressão Arterial" }
    ];

  const onlineConfig = (settings && settings.defaultOnlineConfig) || {
    sections: {
      anamnese: true,
      composicao: true,
      perimetria: true,
      testes: true,
      cardiovascular: true,
      fotos: true
    },
    composicaoMethod: "marinha",
    fotosTypes: {
      frente: true,
      lado: true,
      costas: true
    },
    anamneseQuestions: defaultAnamnese,
    perimetriaFields: defaultPerim,
    testesExercises: defaultForce,
    cardioFields: defaultCardio
  };

  function updateOnlineConfig(key, value) {
    const nextConfig = Object.assign({}, onlineConfig);
    if (key.startsWith("sections.")) {
      const secKey = key.split(".")[1];
      nextConfig.sections = Object.assign({}, onlineConfig.sections, { [secKey]: value });
    } else if (key.startsWith("fotosTypes.")) {
      const fotoKey = key.split(".")[1];
      nextConfig.fotosTypes = Object.assign({}, onlineConfig.fotosTypes, { [fotoKey]: value });
    } else {
      nextConfig[key] = value;
    }
    onUpdateSettings(Object.assign({}, settings, { defaultOnlineConfig: nextConfig }));
  }

  function toggleOnlineQuestion(qText) {
    const currentList = onlineConfig.anamneseQuestions || [];
    let nextList;
    if (currentList.includes(qText)) {
      nextList = currentList.filter(function(x) { return x !== qText; });
    } else {
      nextList = currentList.concat([qText]);
    }
    updateOnlineConfig("anamneseQuestions", nextList);
  }

  function toggleOnlinePerim(fKey, fLabel) {
    const currentList = onlineConfig.perimetriaFields || [];
    let nextList;
    if (currentList.some(function(x) { return x.key === fKey; })) {
      nextList = currentList.filter(function(x) { return x.key !== fKey; });
    } else {
      nextList = currentList.concat([{ key: fKey, label: fLabel }]);
    }
    updateOnlineConfig("perimetriaFields", nextList);
  }

  function toggleOnlineExercise(exText) {
    const currentList = onlineConfig.testesExercises || [];
    let nextList;
    if (currentList.includes(exText)) {
      nextList = currentList.filter(function(x) { return x !== exText; });
    } else {
      nextList = currentList.concat([exText]);
    }
    updateOnlineConfig("testesExercises", nextList);
  }

  function toggleOnlineCardio(fKey, fLabel) {
    const currentList = onlineConfig.cardioFields || [];
    let nextList;
    if (currentList.some(function(x) { return x.key === fKey; })) {
      nextList = currentList.filter(function(x) { return x.key !== fKey; });
    } else {
      nextList = currentList.concat([{ key: fKey, label: fLabel }]);
    }
    updateOnlineConfig("cardioFields", nextList);
  }

  function togglePerim(key) {
    var nextFields = settings.perimetriaCampos.map(function(f) {
      if (f.key === key) return Object.assign({}, f, { active: !f.active });
      return f;
    });
    onUpdateSettings(Object.assign({}, settings, { perimetriaCampos: nextFields }));
  }

  function addPerim() {
    if (!newPerimLabel.trim()) return;
    var key = "custom_" + Date.now();
    var nextFields = [{
      label: newPerimLabel.trim(),
      key: key,
      active: true,
      isCustom: true
    }].concat(settings.perimetriaCampos);
    onUpdateSettings(Object.assign({}, settings, { perimetriaCampos: nextFields }));
    setNewPerimLabel("");
  }

  function deletePerim(key) {
    var nextFields = settings.perimetriaCampos.filter(function(f) { return f.key !== key; });
    onUpdateSettings(Object.assign({}, settings, { perimetriaCampos: nextFields }));
  }

  function setDefaultMetodo(metodo) {
    onUpdateSettings(Object.assign({}, settings, { defaultMetodo: metodo }));
  }

  function addQuestion() {
    if (!newQuestion.trim()) return;
    var nextQs = [newQuestion.trim()].concat(settings.anamnesePerguntas);
    onUpdateSettings(Object.assign({}, settings, { anamnesePerguntas: nextQs }));
    setNewQuestion("");
  }

  function deleteQuestion(index) {
    var nextQs = settings.anamnesePerguntas.filter(function(_, idx) { return idx !== index; });
    onUpdateSettings(Object.assign({}, settings, { anamnesePerguntas: nextQs }));
  }

  function moveQuestion(fromIdx, toIdx) {
    var nextQs = settings.anamnesePerguntas.slice();
    var draggedItem = nextQs[fromIdx];
    nextQs.splice(fromIdx, 1);
    nextQs.splice(toIdx, 0, draggedItem);
    onUpdateSettings(Object.assign({}, settings, { anamnesePerguntas: nextQs }));
  }

  function addExercise() {
    if (!newExercise.trim()) return;
    var nextExs = [newExercise.trim()].concat(settings.exerciciosForca);
    onUpdateSettings(Object.assign({}, settings, { exerciciosForca: nextExs }));
    setNewExercise("");
  }

  function deleteExercise(index) {
    var nextExs = settings.exerciciosForca.filter(function(_, idx) { return idx !== index; });
    onUpdateSettings(Object.assign({}, settings, { exerciciosForca: nextExs }));
  }

  function moveExercise(fromIdx, toIdx) {
    var nextExs = settings.exerciciosForca.slice();
    var draggedItem = nextExs[fromIdx];
    nextExs.splice(fromIdx, 1);
    nextExs.splice(toIdx, 0, draggedItem);
    onUpdateSettings(Object.assign({}, settings, { exerciciosForca: nextExs }));
  }

  function movePerim(fromIdx, toIdx) {
    var nextFields = settings.perimetriaCampos.slice();
    var draggedItem = nextFields[fromIdx];
    nextFields.splice(fromIdx, 1);
    nextFields.splice(toIdx, 0, draggedItem);
    onUpdateSettings(Object.assign({}, settings, { perimetriaCampos: nextFields }));
  }  return (
    <div style={{ padding: "24px 16px 100px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, color: T.text, letterSpacing: -0.5 }}>{t("ajustes", lang)}</div>
          <div style={{ fontSize: 13, color: T.muted }}>
            {t("ajustes_sub", lang)}
          </div>
        </div>
        <div style={{ fontSize: 11, color: T.success, display: "flex", alignItems: "center", gap: 5, fontWeight: 700, background: T.success + "14", padding: "6px 12px", borderRadius: 20, whiteSpace: "nowrap" }}>
          <IcCheck c={T.success} s={12} /> {t("salvo_automaticamente", lang)}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        
        {/* 1. PERSONALIZAÇÃO (CORES) */}
        <div>
          <SecHead title={t("aparencia", lang)} sub={t("cor_principal_sub", lang)} />
          <Card sx={{ padding: 16 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
              {CORES.map(function(c) {
                return (
                  <button
                    key={c}
                    onClick={function() {
                      var nextTrainer = Object.assign({}, trainer, { corPrimaria: c });
                      _ACC = c;
                      onUpdateTrainer(nextTrainer);
                    }}
                    style={{ width: 36, height: 36, borderRadius: "50%", background: c, border: "3px solid " + (trainer.corPrimaria === c ? "#000" : "transparent"), cursor: "pointer", transform: trainer.corPrimaria === c ? "scale(1.18)" : "scale(1)", transition: "all 0.12s" }}
                  />
                );
              })}
              <div style={{ position: "relative", width: 36, height: 36 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: !CORES.includes(trainer.corPrimaria) ? trainer.corPrimaria : "linear-gradient(45deg, red, orange, yellow, green, blue, purple)",
                    border: "3px solid " + (!CORES.includes(trainer.corPrimaria) ? "#000" : "transparent"),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: !CORES.includes(trainer.corPrimaria) ? "scale(1.18)" : "scale(1)",
                    transition: "all 0.12s",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
                    pointerEvents: "none"
                  }}
                >
                  <span style={{ fontSize: 18, color: "#fff", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>+</span>
                </div>
                <input
                  type="color"
                  value={trainer.corPrimaria && trainer.corPrimaria.startsWith("#") && trainer.corPrimaria.length === 7 ? trainer.corPrimaria : "#1A1A2E"}
                  onChange={function(e) {
                    var nextTrainer = Object.assign({}, trainer, { corPrimaria: e.target.value });
                    _ACC = e.target.value;
                    onUpdateTrainer(nextTrainer);
                  }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    opacity: 0,
                    width: "100%",
                    height: "100%",
                    cursor: "pointer",
                    pointerEvents: "auto",
                    borderRadius: "50%"
                  }}
                  title={t("cor_personalizada", lang)}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* 2. ANAMNESE TEMPLATE */}
        <div>
          <SecHead title={t("anamnese", lang)} sub={t("anamnese_modelo_sub", lang)} />
          <Card sx={{ padding: 16 }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <input 
                value={newQuestion} 
                onChange={function(e) { setNewQuestion(e.target.value); }} 
                placeholder={t("placeholder_cirurgia", lang)} 
                style={{ flex: 1, background: T.bg, border: "1.5px solid " + T.border, borderRadius: 10, padding: "11px 14px", fontSize: 14, outline: "none", color: T.text }}
              />
              <Btn small onClick={addQuestion} icon={<IcPlus c="#fff" s={14} />}>{t("add", lang)}</Btn>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 220, overflowY: "auto", paddingRight: 4 }}>
              {settings.anamnesePerguntas.map(function(q, idx) {
                return (
                  <div 
                    key={idx} 
                    draggable
                    data-drag-idx={idx}
                    data-drag-type="question"
                    onDragStart={function(e) { handleQuestionDragStart(e, idx); }}
                    onDragOver={handleQuestionDragOver}
                    onDrop={function(e) { handleQuestionDrop(e, idx); }}
                    onDragEnd={handleQuestionDragEnd}
                    style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center", 
                      padding: "10px 12px", 
                      background: T.bg, 
                      borderRadius: 8,
                      border: draggedQuestionIdx === idx ? "1.5px dashed " + ac() : "1.5px solid transparent",
                      opacity: draggedQuestionIdx === idx ? 0.4 : 1,
                      transition: "all 0.15s"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                      <span 
                        onTouchStart={function(e) { handleTouchStart(e, idx, "question"); }}
                        onTouchMove={function(e) { handleTouchMove(e, "question", settings.anamnesePerguntas, function(list) { onUpdateSettings(Object.assign({}, settings, { anamnesePerguntas: list })); }); }}
                        onTouchEnd={handleTouchEnd}
                        style={{ cursor: "grab", color: T.muted, fontSize: 16, userSelect: "none", touchAction: "none" }} 
                        title={t("arrastar_reordenar", lang)}
                      >
                        ☰
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t(q, lang)}</span>
                    </div>
                    <TrashBtn onClick={function() { deleteQuestion(idx); }} size={15} />
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* 3. COMPOSIÇÃO CORPORAL TEMPLATE */}
        <div>
          <SecHead title={t("composicao", lang)} sub={t("metodo_preferencial_sub", lang)} />
          <Card sx={{ padding: 16 }}>
            <FSelect
              label={t("metodo_padrao", lang)}
              value={settings.defaultMetodo}
              onChange={setDefaultMetodo}
              options={[
                { value: "", label: t("Nenhum (selecionar na hora)", lang) },
                { value: "pollock7", label: t("Pollock 7 Dobras", lang) },
                { value: "pollock3", label: t("Pollock 3 Dobras", lang) },
                { value: "faulkner", label: t("Faulkner", lang) },
                { value: "petroski", label: t("Petroski", lang) },
                { value: "durnin_womersley", label: t("Durnin-Womersley", lang) },
                { value: "marinha", label: t("Marinha Americana", lang) },
                { value: "bioimpedancia", label: t("Bioimpedância", lang) }
              ]}
            />
          </Card>
        </div>

        {/* 4. PERIMETRIA TEMPLATE */}
        <div>
          <SecHead title={t("perimetria", lang)} sub={t("perimetria_modelo_sub", lang)} />
          <Card sx={{ padding: 16 }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <input 
                value={newPerimLabel} 
                onChange={function(e) { setNewPerimLabel(e.target.value); }} 
                placeholder={t("placeholder_antebraco", lang)} 
                style={{ flex: 1, background: T.bg, border: "1.5px solid " + T.border, borderRadius: 10, padding: "11px 14px", fontSize: 14, outline: "none", color: T.text }}
              />
              <Btn small onClick={addPerim} icon={<IcPlus c="#fff" s={14} />}>{t("add", lang)}</Btn>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 300, overflowY: "auto", paddingRight: 4 }}>
              {settings.perimetriaCampos.map(function(f, idx) {
                return (
                  <div 
                    key={f.key} 
                    draggable
                    data-drag-idx={idx}
                    data-drag-type="perim"
                    onDragStart={function(e) { handlePerimDragStart(e, idx); }}
                    onDragOver={handlePerimDragOver}
                    onDrop={function(e) { handlePerimDrop(e, idx); }}
                    onDragEnd={handlePerimDragEnd}
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "space-between", 
                      padding: "10px 12px", 
                      background: f.active ? acL() : T.bg, 
                      border: draggedPerimIdx === idx ? "1.5px dashed " + ac() : "1.5px solid " + (f.active ? ac() + "33" : T.border), 
                      borderRadius: 8, 
                      opacity: draggedPerimIdx === idx ? 0.4 : 1,
                      transition: "all 0.15s" 
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                      <span 
                        onTouchStart={function(e) { handleTouchStart(e, idx, "perim"); }}
                        onTouchMove={function(e) { handleTouchMove(e, "perim", settings.perimetriaCampos, function(list) { onUpdateSettings(Object.assign({}, settings, { perimetriaCampos: list })); }); }}
                        onTouchEnd={handleTouchEnd}
                        style={{ cursor: "grab", color: T.muted, fontSize: 16, userSelect: "none", touchAction: "none" }} 
                        title={t("arrastar_reordenar", lang)}
                      >
                        ☰
                      </span>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: f.active ? ac() : T.text, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <input 
                           type="checkbox" 
                          checked={f.active} 
                          onChange={function() { togglePerim(f.key); }} 
                          style={{ accentColor: ac(), width: 16, height: 16 }} 
                        />
                        {t(f.label, lang)}
                      </label>
                    </div>
                    {f.isCustom && <TrashBtn onClick={function() { deletePerim(f.key); }} size={14} />}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* 5. EXERCÍCIOS DE FORÇA TEMPLATE */}
        <div>
          <SecHead title={t("forca", lang)} sub={t("forca_modelo_sub", lang)} />
          <Card sx={{ padding: 16 }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <input 
                value={newExercise} 
                onChange={function(e) { setNewExercise(e.target.value); }} 
                placeholder={t("placeholder_supino", lang)} 
                style={{ flex: 1, background: T.bg, border: "1.5px solid " + T.border, borderRadius: 10, padding: "11px 14px", fontSize: 14, outline: "none", color: T.text }}
              />
              <Btn small onClick={addExercise} icon={<IcPlus c="#fff" s={14} />}>{t("add", lang)}</Btn>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 220, overflowY: "auto", paddingRight: 4 }}>
              {settings.exerciciosForca.map(function(ex, idx) {
                return (
                  <div 
                    key={idx} 
                    draggable
                    data-drag-idx={idx}
                    data-drag-type="exercise"
                    onDragStart={function(e) { handleExerciseDragStart(e, idx); }}
                    onDragOver={handleExerciseDragOver}
                    onDrop={function(e) { handleExerciseDrop(e, idx); }}
                    onDragEnd={handleExerciseDragEnd}
                    style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center", 
                      padding: "10px 12px", 
                      background: T.bg, 
                      borderRadius: 8,
                      border: draggedExerciseIdx === idx ? "1.5px dashed " + ac() : "1.5px solid transparent",
                      opacity: draggedExerciseIdx === idx ? 0.4 : 1,
                      transition: "all 0.15s"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                      <span 
                        onTouchStart={function(e) { handleTouchStart(e, idx, "exercise"); }}
                        onTouchMove={function(e) { handleTouchMove(e, "exercise", settings.exerciciosForca, function(list) { onUpdateSettings(Object.assign({}, settings, { exerciciosForca: list })); }); }}
                        onTouchEnd={handleTouchEnd}
                        style={{ cursor: "grab", color: T.muted, fontSize: 16, userSelect: "none", touchAction: "none" }} 
                        title={t("arrastar_reordenar", lang)}
                      >
                        ☰
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: T.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t(ex, lang)}</span>
                    </div>
                    <TrashBtn onClick={function() { deleteExercise(idx); }} size={15} />
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* 6. MODELO DE AVALIAÇÃO ONLINE */}
        <div>
          <SecHead 
            title={lang === "es" ? "Modelo de Evaluación Online" : lang === "en" ? "Online Evaluation Template" : "Modelo de Avaliação Online"} 
            sub={lang === "es" ? "Defina qué secciones y campos vendrán marcados por defecto al enviar una evaluación online." : lang === "en" ? "Define which sections and fields will be checked by default when sending an online evaluation." : "Defina quais seções e campos virão marcados por padrão ao enviar uma avaliação online."} 
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            
            {/* Bloco 1: Anamnese */}
            <Card sx={{ border: "1.5px solid " + T.border, overflow: "hidden" }}>
              <div onClick={function() { toggleOnlineAccordion("anamnese"); }} style={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: activeOnlineTab === "anamnese" ? T.bg : "transparent" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 700 }} onClick={function(e) { e.stopPropagation(); }}>
                  <input type="checkbox" checked={onlineConfig.sections.anamnese} onChange={function(e) { updateOnlineConfig("sections.anamnese", e.target.checked); }} style={{ accentColor: ac(), width: 18, height: 18 }} />
                  <span style={{ color: onlineConfig.sections.anamnese ? T.text : T.muted }}>{lang === "es" ? "Anamnesis" : lang === "en" ? "Anamnesis" : "Anamnese"}</span>
                </label>
                <IcChevron c={T.muted} s={16} rotate={activeOnlineTab === "anamnese" ? 90 : 0} />
              </div>
              {activeOnlineTab === "anamnese" && (
                <div style={{ padding: "0 16px 16px", borderTop: "1px solid " + T.borderLight, maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                  {((settings && settings.anamnesePerguntas) || PERGUNTAS_PADRAO).map(function(q, idx) {
                    const isChecked = (onlineConfig.anamneseQuestions || []).includes(q);
                    return (
                      <label key={idx} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: isChecked ? T.text : T.sub }}>
                        <input type="checkbox" checked={isChecked} onChange={function() { toggleOnlineQuestion(q); }} style={{ accentColor: ac(), width: 16, height: 16 }} disabled={!onlineConfig.sections.anamnese} />
                        {q}
                      </label>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Bloco 2: Composição Corporal */}
            <Card sx={{ border: "1.5px solid " + T.border, overflow: "hidden" }}>
              <div onClick={function() { toggleOnlineAccordion("composicao"); }} style={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: activeOnlineTab === "composicao" ? T.bg : "transparent" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 700 }} onClick={function(e) { e.stopPropagation(); }}>
                  <input type="checkbox" checked={onlineConfig.sections.composicao} onChange={function(e) { updateOnlineConfig("sections.composicao", e.target.checked); }} style={{ accentColor: ac(), width: 18, height: 18 }} />
                  <span style={{ color: onlineConfig.sections.composicao ? T.text : T.muted }}>{lang === "es" ? "Composición Corporal" : lang === "en" ? "Body Composition" : "Composição Corporal"}</span>
                </label>
                <IcChevron c={T.muted} s={16} rotate={activeOnlineTab === "composicao" ? 90 : 0} />
              </div>
              {activeOnlineTab === "composicao" && (
                <div style={{ padding: "16px", borderTop: "1px solid " + T.borderLight, display: "flex", flexDirection: "column", gap: 12 }}>
                  <FSelect
                    label={lang === "es" ? "Método de composición corporal" : lang === "en" ? "Composition Method" : "Método de composição corporal"}
                    value={onlineConfig.composicaoMethod}
                    onChange={function(v) { updateOnlineConfig("composicaoMethod", v); }}
                    disabled={!onlineConfig.sections.composicao}
                    options={[
                      { value: "", label: lang === "es" ? "Ninguno (solo Peso/Altura)" : lang === "en" ? "None (Weight/Height only)" : "Nenhum (apenas Peso/Altura)" },
                      { value: "marinha", label: "Marinha Americana" },
                      { value: "bioimpedancia", label: "Bioimpedância" }
                    ]}
                  />
                  
                  <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, color: (onlineConfig.composicaoFields || { peso: true }).peso ? T.text : T.sub }}>
                      <input 
                        type="checkbox" 
                        checked={(onlineConfig.composicaoFields || { peso: true }).peso} 
                        onChange={function(e) { updateOnlineConfig("composicaoFields.peso", e.target.checked); }} 
                        style={{ accentColor: ac(), width: 16, height: 16 }} 
                        disabled={!onlineConfig.sections.composicao} 
                      />
                      {lang === "es" ? "Peso" : lang === "en" ? "Weight" : "Peso"}
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, color: (onlineConfig.composicaoFields || { altura: true }).altura ? T.text : T.sub }}>
                      <input 
                        type="checkbox" 
                        checked={(onlineConfig.composicaoFields || { altura: true }).altura} 
                        onChange={function(e) { updateOnlineConfig("composicaoFields.altura", e.target.checked); }} 
                        style={{ accentColor: ac(), width: 16, height: 16 }} 
                        disabled={!onlineConfig.sections.composicao} 
                      />
                      {lang === "es" ? "Altura" : lang === "en" ? "Height" : "Altura"}
                    </label>
                  </div>
                </div>
              )}
            </Card>

            {/* Bloco 3: Perimetria */}
            <Card sx={{ border: "1.5px solid " + T.border, overflow: "hidden" }}>
              <div onClick={function() { toggleOnlineAccordion("perimetria"); }} style={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: activeOnlineTab === "perimetria" ? T.bg : "transparent" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 700 }} onClick={function(e) { e.stopPropagation(); }}>
                  <input type="checkbox" checked={onlineConfig.sections.perimetria} onChange={function(e) { updateOnlineConfig("sections.perimetria", e.target.checked); }} style={{ accentColor: ac(), width: 18, height: 18 }} />
                  <span style={{ color: onlineConfig.sections.perimetria ? T.text : T.muted }}>{lang === "es" ? "Perimetría (Medidas)" : lang === "en" ? "Perimetry (Measurements)" : "Perimetria (Medidas)"}</span>
                </label>
                <IcChevron c={T.muted} s={16} rotate={activeOnlineTab === "perimetria" ? 90 : 0} />
              </div>
              {activeOnlineTab === "perimetria" && (
                <div style={{ padding: "0 16px 16px", borderTop: "1px solid " + T.borderLight, maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                  {((settings && settings.perimetriaCampos) || []).filter(function(x) { return x.active; }).map(function(f) {
                    const isChecked = (onlineConfig.perimetriaFields || []).some(function(x) { return x.key === f.key; });
                    return (
                      <label key={f.key} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: isChecked ? T.text : T.sub }}>
                        <input type="checkbox" checked={isChecked} onChange={function() { toggleOnlinePerim(f.key, f.label); }} style={{ accentColor: ac(), width: 16, height: 16 }} disabled={!onlineConfig.sections.perimetria} />
                        {f.label}
                      </label>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Bloco 4: Testes de Força */}
            <Card sx={{ border: "1.5px solid " + T.border, overflow: "hidden" }}>
              <div onClick={function() { toggleOnlineAccordion("testes"); }} style={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: activeOnlineTab === "testes" ? T.bg : "transparent" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 700 }} onClick={function(e) { e.stopPropagation(); }}>
                  <input type="checkbox" checked={onlineConfig.sections.testes} onChange={function(e) { updateOnlineConfig("sections.testes", e.target.checked); }} style={{ accentColor: ac(), width: 18, height: 18 }} />
                  <span style={{ color: onlineConfig.sections.testes ? T.text : T.muted }}>{lang === "es" ? "Testes de Fuerza" : lang === "en" ? "Strength Tests" : "Testes de Força"}</span>
                </label>
                <IcChevron c={T.muted} s={16} rotate={activeOnlineTab === "testes" ? 90 : 0} />
              </div>
              {activeOnlineTab === "testes" && (
                <div style={{ padding: "0 16px 16px", borderTop: "1px solid " + T.borderLight, maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                  {((settings && settings.exerciciosForca) || []).map(function(ex, idx) {
                    const isChecked = (onlineConfig.testesExercises || []).includes(ex);
                    return (
                      <label key={idx} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: isChecked ? T.text : T.sub }}>
                        <input type="checkbox" checked={isChecked} onChange={function() { toggleOnlineExercise(ex); }} style={{ accentColor: ac(), width: 16, height: 16 }} disabled={!onlineConfig.sections.testes} />
                        {ex}
                      </label>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Bloco 5: Cardiovascular */}
            <Card sx={{ border: "1.5px solid " + T.border, overflow: "hidden" }}>
              <div onClick={function() { toggleOnlineAccordion("cardiovascular"); }} style={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: activeOnlineTab === "cardiovascular" ? T.bg : "transparent" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 700 }} onClick={function(e) { e.stopPropagation(); }}>
                  <input type="checkbox" checked={onlineConfig.sections.cardiovascular} onChange={function(e) { updateOnlineConfig("sections.cardiovascular", e.target.checked); }} style={{ accentColor: ac(), width: 18, height: 18 }} />
                  <span style={{ color: onlineConfig.sections.cardiovascular ? T.text : T.muted }}>{lang === "es" ? "Cardiovascular & VO2" : lang === "en" ? "Cardiovascular & VO2" : "Cardiovascular & VO2"}</span>
                </label>
                <IcChevron c={T.muted} s={16} rotate={activeOnlineTab === "cardiovascular" ? 90 : 0} />
              </div>
              {activeOnlineTab === "cardiovascular" && (
                <div style={{ padding: "0 16px 16px", borderTop: "1px solid " + T.borderLight, maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                  {[
                    { key: "cooper", label: lang === "es" ? "Teste de Cooper (Metros)" : lang === "en" ? "Cooper Test (Meters)" : "Teste de Cooper (Metros)" },
                    { key: "fcRepouso", label: lang === "es" ? "Frecuencia Cardíaca de Reposo" : lang === "en" ? "Resting Heart Rate" : "Frequência Cardíaca de Repouso" },
                    { key: "fcRecuperacao", label: lang === "es" ? "Frecuencia Cardíaca de Recuperación" : lang === "en" ? "Recovery Heart Rate" : "Frequência Cardíaca de Recuperação" },
                    { key: "fcMax", label: lang === "es" ? "Frecuencia Cardíaca Máxima (Medida)" : lang === "en" ? "Max Heart Rate (Measured)" : "Frequência Cardíaca Máxima (Medida)" },
                    { key: "pressaoArterial", label: lang === "es" ? "Presión Arterial" : lang === "en" ? "Blood Pressure" : "Pressão Arterial" }
                  ].map(function(f) {
                    const isChecked = (onlineConfig.cardioFields || []).some(function(x) { return x.key === f.key; });
                    return (
                      <label key={f.key} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: isChecked ? T.text : T.sub }}>
                        <input type="checkbox" checked={isChecked} onChange={function() { toggleOnlineCardio(f.key, f.label); }} style={{ accentColor: ac(), width: 16, height: 16 }} disabled={!onlineConfig.sections.cardiovascular} />
                        {f.label}
                      </label>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Bloco 6: Fotos */}
            <Card sx={{ border: "1.5px solid " + T.border, overflow: "hidden" }}>
              <div onClick={function() { toggleOnlineAccordion("fotos"); }} style={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: activeOnlineTab === "fotos" ? T.bg : "transparent" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 700 }} onClick={function(e) { e.stopPropagation(); }}>
                  <input type="checkbox" checked={onlineConfig.sections.fotos} onChange={function(e) { updateOnlineConfig("sections.fotos", e.target.checked); }} style={{ accentColor: ac(), width: 18, height: 18 }} />
                  <span style={{ color: onlineConfig.sections.fotos ? T.text : T.muted }}>{lang === "es" ? "Registro Fotográfico (Fotos)" : lang === "en" ? "Photos" : "Registro Fotográfico (Fotos)"}</span>
                </label>
                <IcChevron c={T.muted} s={16} rotate={activeOnlineTab === "fotos" ? 90 : 0} />
              </div>
              {activeOnlineTab === "fotos" && (
                <div style={{ padding: "16px", borderTop: "1px solid " + T.borderLight, display: "flex", gap: 16 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, color: onlineConfig.fotosTypes.frente ? T.text : T.sub }}>
                    <input type="checkbox" checked={onlineConfig.fotosTypes.frente} onChange={function(e) { updateOnlineConfig("fotosTypes.frente", e.target.checked); }} style={{ accentColor: ac(), width: 16, height: 16 }} disabled={!onlineConfig.sections.fotos} />
                    {lang === "es" ? "Frente" : lang === "en" ? "Front" : "Frente"}
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, color: onlineConfig.fotosTypes.lado ? T.text : T.sub }}>
                    <input type="checkbox" checked={onlineConfig.fotosTypes.lado} onChange={function(e) { updateOnlineConfig("fotosTypes.lado", e.target.checked); }} style={{ accentColor: ac(), width: 16, height: 16 }} disabled={!onlineConfig.sections.fotos} />
                    {lang === "es" ? "Perfil" : lang === "en" ? "Side" : "Lado"}
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, color: onlineConfig.fotosTypes.costas ? T.text : T.sub }}>
                    <input type="checkbox" checked={onlineConfig.fotosTypes.costas} onChange={function(e) { updateOnlineConfig("fotosTypes.costas", e.target.checked); }} style={{ accentColor: ac(), width: 16, height: 16 }} disabled={!onlineConfig.sections.fotos} />
                    {lang === "es" ? "Espalda" : lang === "en" ? "Back" : "Costas"}
                  </label>
                </div>
              )}
            </Card>

          </div>
        </div>

      </div>
    </div>
  );

  // Drag and drop helper functions (Desktop)
  function handleQuestionDragStart(e, index) {
    setDraggedQuestionIdx(index);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleQuestionDragOver(e) {
    e.preventDefault();
  }

  function handleQuestionDrop(e, index) {
    e.preventDefault();
    if (draggedQuestionIdx === null || draggedQuestionIdx === index) return;
    moveQuestion(draggedQuestionIdx, index);
  }

  function handleQuestionDragEnd() {
    setDraggedQuestionIdx(null);
  }

  function handleExerciseDragStart(e, index) {
    setDraggedExerciseIdx(index);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleExerciseDragOver(e) {
    e.preventDefault();
  }

  function handleExerciseDrop(e, index) {
    e.preventDefault();
    if (draggedExerciseIdx === null || draggedExerciseIdx === index) return;
    moveExercise(draggedExerciseIdx, index);
  }

  function handleExerciseDragEnd() {
    setDraggedExerciseIdx(null);
  }

  function handlePerimDragStart(e, index) {
    setDraggedPerimIdx(index);
    e.dataTransfer.effectAllowed = "move";
  }

  function handlePerimDragOver(e) {
    e.preventDefault();
  }

  function handlePerimDrop(e, index) {
    e.preventDefault();
    if (draggedPerimIdx === null || draggedPerimIdx === index) return;
    movePerim(draggedPerimIdx, index);
  }

  function handlePerimDragEnd() {
    setDraggedPerimIdx(null);
  }

  // Drag and drop helper functions (Mobile Touch)
  function handleTouchStart(e, index, type) {
    document.body.style.overflow = "hidden";
    if (type === "question") setDraggedQuestionIdx(index);
    if (type === "exercise") setDraggedExerciseIdx(index);
    if (type === "perim") setDraggedPerimIdx(index);
  }

  function handleTouchMove(e, type, list, onUpdateList) {
    if (e.touches.length === 0) return;
    var touch = e.touches[0];
    var elem = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!elem) return;
    
    var itemEl = elem.closest("[data-drag-idx]");
    if (!itemEl) return;
    
    if (itemEl.getAttribute("data-drag-type") !== type) return;
    
    var targetIdx = parseInt(itemEl.getAttribute("data-drag-idx"), 10);
    var draggedIdx = type === "question" ? draggedQuestionIdx : (type === "exercise" ? draggedExerciseIdx : draggedPerimIdx);
    
    if (draggedIdx !== null && targetIdx !== draggedIdx && !isNaN(targetIdx)) {
      var nextList = list.slice();
      var draggedItem = nextList[draggedIdx];
      nextList.splice(draggedIdx, 1);
      nextList.splice(targetIdx, 0, draggedItem);
      
      onUpdateList(nextList);
      
      if (type === "question") setDraggedQuestionIdx(targetIdx);
      if (type === "exercise") setDraggedExerciseIdx(targetIdx);
      if (type === "perim") setDraggedPerimIdx(targetIdx);
    }
  }

  function handleTouchEnd() {
    document.body.style.overflow = "";
    setDraggedQuestionIdx(null);
    setDraggedExerciseIdx(null);
    setDraggedPerimIdx(null);
  }
}

// ── ALUNO PROFILE ─────────────────────────────────────────────────────────────
function AlunoScreen({ aluno, onBack, onNewAval, onOpenAval, onDelete, onCompare, onDeleteAval, onUpdateAluno, onUpdateAlunoAvalStatus, trainer }) {
  const lang = (trainer && trainer.lang) || "pt";
  const [comparing, setComparing] = useState(false);
  const [sel, setSel] = useState([]);
  const [confirmDel, setConfirmDel] = useState(false);
  const [confirmDelAvalId, setConfirmDelAvalId] = useState(null);
  const [selectedPendingAval, setSelectedPendingAval] = useState(null);

  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editNome, setEditNome] = useState("");
  const [editSexo, setEditSexo] = useState("M");
  const [editTelefone, setEditTelefone] = useState("");
  const [editIdade, setEditIdade] = useState("");

  function toggleSel(id) {
    setSel(function(p) {
      if (p.indexOf(id) >= 0) return p.filter(function(x) { return x !== id; });
      if (p.length >= 5) return p;
      return p.concat([id]);
    });
  }
  function doCompare() {
    var avs = aluno.avaliacoes;
    var indices = sel.map(function(id) {
      return avs.findIndex(function(a) { return a.id === id; });
    }).filter(function(idx) { return idx >= 0; });
    indices.sort(function(x, y) { return x - y; });
    onCompare(indices);
  }

  function handleOpenEdit() {
    setEditNome(aluno.nome || "");
    setEditSexo(aluno.sexo || "M");
    setEditTelefone(aluno.telefone || "");
    setEditIdade(aluno.dataNascimento ? calcIdade(aluno.dataNascimento) : "");
    setShowEditModal(true);
  }

  function handleSaveEdit() {
    if (!editNome.trim() || !editIdade) return;
    const anoNasc = new Date().getFullYear() - parseInt(editIdade);
    const dataNascimento = `${anoNasc}-01-01`;
    onUpdateAluno(aluno.id, editNome.trim(), editSexo, editTelefone, dataNascimento);
    setShowEditModal(false);
  }

  var delAvalNome = "";
  if (confirmDelAvalId) {
    var found = aluno.avaliacoes.find(function(x) { return x.id === confirmDelAvalId; });
    var prefix = lang === "en" ? "the Evaluation of " : lang === "es" ? "la Evaluación de " : "a Avaliação de ";
    delAvalNome = prefix + fmtDate(found ? found.data : "");
  }

  return (
    <div style={{ padding:"16px 16px 100px" }}>
      {confirmDel && <ConfirmDelete nome={aluno.nome} onCancel={function() { setConfirmDel(false); }} onConfirm={function() { onDelete(); setConfirmDel(false); }} lang={lang}/>}
      {confirmDelAvalId && <ConfirmDelete nome={delAvalNome} onCancel={function() { setConfirmDelAvalId(null); }} onConfirm={function() { onDeleteAval(confirmDelAvalId); setConfirmDelAvalId(null); }} lang={lang}/>}
      
      {showEditModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:200, display:"flex", alignItems:"flex-end" }} onClick={function() { setShowEditModal(false); }}>
          <div onClick={function(e) { e.stopPropagation(); }} style={{ background:T.surface, borderRadius:"20px 20px 0 0", padding:"22px 20px 38px", width:"100%", boxShadow:T.shadowMd }}>
            <div style={{ width:34, height:4, borderRadius:2, background:T.border, margin:"0 auto 18px" }}/>
            <div style={{ fontSize:17, fontWeight:700, marginBottom:16 }}>{t("editar_aluno", lang)}</div>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <FInput label={t("nome_completo", lang)} value={editNome} onChange={setEditNome} placeholder={t("nome_completo_placeholder", lang)} required/>
              <ToggleGroup label={t("genero", lang)} value={editSexo} onChange={setEditSexo} options={[{value:"M",label:t("masculino", lang)},{value:"F",label:t("feminino", lang)}]}/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <FInput label={t("telefone", lang)} value={editTelefone} onChange={setEditTelefone} placeholder="(11) 99999-9999"/>
                <FInput label={lang === "en" ? "Age (years)" : lang === "es" ? "Edad (años)" : "Idade (anos)"} value={editIdade} onChange={setEditIdade} type="number" required placeholder="Ex: 28"/>
              </div>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:20 }}>
              <Btn variant="ghost" full onClick={function() { setShowEditModal(false); }}>{t("cancelar", lang)}</Btn>
              <Btn full onClick={handleSaveEdit} disabled={!editNome.trim() || !editIdade}>{t("salvar_alteracoes", lang)}</Btn>
            </div>
          </div>
        </div>
      )}

      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
        <button onClick={onBack} style={{ background:"none", border:"1.5px solid "+T.border, borderRadius:10, padding:"8px 10px", cursor:"pointer", display:"flex", alignItems:"center" }}>
          <IcBack c={T.sub} s={18}/>
        </button>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:18, fontWeight:800, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{aluno.nome}</div>
          <div style={{ fontSize:12, color:T.muted, display:"flex", alignItems:"center", gap:4, marginTop:1 }}>
            {aluno.sexo === "F" ? <IcFemale c={T.muted} s={13}/> : <IcMale c={T.muted} s={13}/>}
            {aluno.sexo === "F" ? t("feminino", lang) : t("masculino", lang)}
          </div>
        </div>
        
        <div style={{ position: "relative" }}>
          <button 
            onClick={function() { setShowMenu(true); }} 
            style={{ background:"none", border:"1.5px solid "+T.border, borderRadius:10, padding:"8px 10px", cursor:"pointer", display:"flex", alignItems:"center" }}
          >
            <IcDots c={T.sub} s={18}/>
          </button>
          
          {showMenu && (
            <>
              <div 
                onClick={function() { setShowMenu(false); }} 
                style={{ position: "fixed", inset: 0, zIndex: 100 }} 
              />
              <div style={{
                position: "absolute",
                top: 42,
                right: 0,
                background: T.surface,
                border: "1px solid " + T.border,
                borderRadius: 12,
                boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                zIndex: 101,
                minWidth: 150,
                overflow: "hidden"
              }}>
                <button 
                  onClick={function() { setShowMenu(false); handleOpenEdit(); }} 
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    width: "100%",
                    background: "none",
                    border: "none",
                    padding: "12px 16px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: T.text,
                    cursor: "pointer",
                    textAlign: "left"
                  }}
                  onMouseEnter={function(e) { e.currentTarget.style.background = T.bg; }}
                  onMouseLeave={function(e) { e.currentTarget.style.background = "none"; }}
                >
                  <IcEdit c={T.sub} s={14} />
                  {t("editar_aluno", lang)}
                </button>
                <button 
                  onClick={function() { setShowMenu(false); setConfirmDel(true); }} 
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    width: "100%",
                    background: "none",
                    border: "none",
                    borderTop: "1px solid " + T.borderLight,
                    padding: "12px 16px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: T.danger,
                    cursor: "pointer",
                    textAlign: "left"
                  }}
                  onMouseEnter={function(e) { e.currentTarget.style.background = T.bg; }}
                  onMouseLeave={function(e) { e.currentTarget.style.background = "none"; }}
                >
                  <IcTrash c={T.danger} s={14} />
                  {t("excluir_aluno", lang)}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns: (aluno.avaliacoes ? aluno.avaliacoes.length : 0) >= 2 ? "1fr 1fr" : "1fr", gap:10, marginBottom:12 }}>
        <Btn full onClick={onNewAval} icon={<IcPlus c="#fff" s={16}/>}>{t("nova_avaliacao", lang)}</Btn>
        {aluno.avaliacoes.length >= 2 && (
          <Btn full variant={comparing ? "primary" : "outline"} icon={comparing ? <IcCheck c={comparing?"#fff":ac()} s={16}/> : <IcCompare c={ac()} s={16}/>} onClick={function() { setComparing(function(c) { return !c; }); setSel([]); }}>
            {comparing ? t("cancelar", lang) : t("comparar", lang)}
          </Btn>
        )}
      </div>
      {comparing && (
        <div style={{ marginBottom:14, padding:"12px 14px", background:acL(), border:"1px solid "+ac()+"30", borderRadius:12 }}>
          <div style={{ fontSize:13, color:ac(), fontWeight:600, marginBottom: sel.length >= 2 ? 10 : 0 }}>
            {sel.length < 2 && t("selecione_2_a_5", lang) + " (" + (lang === "en" ? "selected" : lang === "es" ? "seleccionadas" : "selecionadas") + ": " + sel.length + ")"}
            {sel.length >= 2 && (lang === "en" ? "Ready! Tap to see analysis (" + sel.length + " selected)" : lang === "es" ? "¡Listo! Toca para ver el análisis (" + sel.length + " seleccionadas)" : "Pronto! Toque para ver a análise (" + sel.length + " selecionadas)")}
          </div>
          {sel.length >= 2 && <Btn full onClick={doCompare} icon={<IcCompare c="#fff" s={16}/>}>{lang === "en" ? "View Comparison" : lang === "es" ? "Ver Comparación" : "Ver Comparação"}</Btn>}
        </div>
      )}
      {(aluno.avaliacoes ? aluno.avaliacoes.length : 0) === 0 ? (
        <Card sx={{ padding:46, textAlign:"center" }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}><IcClipboard c={T.muted} s={40}/></div>
          <div style={{ fontWeight:600, fontSize:15 }}>{t("nenhuma_avaliacao", lang)}</div>
          <div style={{ color:T.muted, fontSize:13, marginTop:5, marginBottom:18 }}>{t("inicie_primeira_av", lang)}</div>
          <Btn onClick={onNewAval}>{t("iniciar_avaliacao", lang)}</Btn>
        </Card>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
          <div style={{ fontSize:12, fontWeight:700, color:T.sub, letterSpacing:0.5, textTransform:"uppercase", marginBottom:3 }}>{t("historico_av", lang)}</div>
          {[].concat(aluno.avaliacoes || []).reverse().map(function(av, i) {
            var isLatest = i === 0;
            var checked = sel.indexOf(av.id) >= 0;
            var num = (aluno.avaliacoes ? aluno.avaliacoes.length : 0) - i;
            return (
              <div key={av.id} onClick={function() { 
                if (comparing) {
                  toggleSel(av.id); 
                } else {
                  if (av.tipo === "online" && av.status === "aguardando_resposta") {
                    setSelectedPendingAval(av);
                  } else {
                    onOpenAval(av.id);
                  }
                }
              }}>
                <Card hover sx={{ padding:"15px", border:"1.5px solid "+(checked ? ac() : T.border), background: checked ? acL() : T.surface }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, flex:1, minWidth:0 }}>
                      {comparing && (
                        <div style={{ width:22, height:22, borderRadius:6, border:"2px solid "+(checked ? ac() : T.border), background: checked ? ac() : "transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          {checked && <IcCheck c="#fff" s={13}/>}
                        </div>
                      )}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:15, fontWeight:700, color:T.text }}>{fmtDate(av.data)}</div>
                        <div style={{ display:"flex", alignItems:"center", gap:7, marginTop:3, flexWrap: "wrap" }}>
                          <div style={{ fontSize:13, color:T.muted, fontWeight:400 }}>{t("avaliacao_num", lang) + num}</div>
                          {av.tipo === "online" ? (
                            av.status === "aguardando_resposta" ? (
                              <Chip color={T.warning}>{lang === "es" ? "Esperando respuesta" : lang === "en" ? "Waiting response" : "Aguardando resposta"}</Chip>
                            ) : (
                              <Chip color={T.success}>{lang === "es" ? "Respondida" : lang === "en" ? "Answered" : "Respondida"}</Chip>
                            )
                          ) : null}
                          {isLatest && <Chip color={T.success}>{lang === "en" ? "Recent" : lang === "es" ? "Reciente" : "Recente"}</Chip>}
                        </div>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:4, alignItems:"center", flexShrink:0 }}>
                      {!comparing && <IcChevron c={T.muted} s={18}/>}
                      {!comparing && (
                        <button onClick={function(e) { e.stopPropagation(); setConfirmDelAvalId(av.id); }} style={{ background:"none", border:"none", cursor:"pointer", padding:"4px 6px", display:"flex", alignItems:"center" }}>
                          <IcTrash c={T.danger} s={17}/>
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {selectedPendingAval && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", backdropFilter:"blur(4px)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={function() { setSelectedPendingAval(null); }}>
          <Card onClick={function(e) { e.stopPropagation(); }} sx={{ padding:24, width:"100%", maxWidth:380, border:"1px solid "+T.border, textAlign:"center", display:"flex", flexDirection:"column", gap:16, boxShadow:T.shadowLg }}>
            
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto" }}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>

            <div style={{ fontSize:17, fontWeight:800, color:T.text }}>
              {lang === "es" ? "Evaluación Online Pendiente" : lang === "en" ? "Pending Online Evaluation" : "Avaliação Online Pendente"}
            </div>
            <div style={{ fontSize:13, color:T.sub, lineHeight:1.5 }}>
              {lang === "es" ? "Esta evaluación fue enviada a " + aluno.nome + " y está esperando respuesta." : lang === "en" ? "This evaluation was sent to " + aluno.nome + " and is waiting for a response." : "Esta avaliação foi enviada para " + aluno.nome + " e está aguardando resposta."}
            </div>
            
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:8 }}>
              {/* Copiar Link */}
              <Btn full onClick={function() {
                const generatedUrl = window.location.origin + "/?responder=true&id=" + selectedPendingAval.id + "&lang=" + lang;
                navigator.clipboard.writeText(generatedUrl);
                alert(lang === "es" ? "¡Enlace copiado al portapapeles!" : lang === "en" ? "Link copied to clipboard!" : "Link copiado para a área de transferência!");
              }}>
                {lang === "es" ? "Copiar Enlace" : lang === "en" ? "Copy Link" : "Copiar Link"}
              </Btn>
              
              {/* Visualizar / Editar */}
              <Btn full variant="outline" onClick={function() {
                setSelectedPendingAval(null);
                onOpenAval(selectedPendingAval.id);
              }}>
                {lang === "es" ? "Visualizar / Editar" : lang === "en" ? "View / Edit" : "Visualizar / Editar"}
              </Btn>

              {/* Cancelar Link de Preenchimento */}
              <Btn full variant="ghost" onClick={async function() {
                try {
                  setSelectedPendingAval(null);
                  await onUpdateAlunoAvalStatus(aluno.id, selectedPendingAval.id, "presencial", "finalizada");
                  alert(lang === "es" ? "¡Enlace de llenado cancelado con éxito!" : lang === "en" ? "Fill link cancelled successfully!" : "Link de preenchimento cancelado com sucesso!");
                } catch(err) {
                  alert("Erro ao atualizar avaliação: " + err.message);
                }
              }} style={{ color: T.danger }}>
                {lang === "es" ? "Cancelar Enlace de Llenado" : lang === "en" ? "Cancel Fill Link" : "Cancelar Link de Preenchimento"}
              </Btn>

              {/* Fechar */}
              <button 
                onClick={function() { setSelectedPendingAval(null); }}
                style={{ background:"none", border:"none", color:T.muted, fontSize:13, fontWeight:600, cursor:"pointer", textDecoration:"underline", padding:"8px 0" }}
              >
                {lang === "es" ? "Volver" : lang === "en" ? "Back" : "Voltar"}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ── COMPLETION OVERLAY ────────────────────────────────────────────────────────
function CompletionOverlay({ onPDF, onClose, lang = "pt" }) {
  const [pieces] = useState(function() {
    var COLS = ["#FF6B6B","#FFD93D","#6BCB77","#4ECDC4","#A78BFA","#F97316","#EC4899"];
    var list = [];
    for (var i = 0; i < 20; i++) {
      list.push({ id:i, x: 5 + Math.random()*90, delay: (Math.random()*0.7).toFixed(2), color: COLS[i % COLS.length], size: 5 + Math.floor(Math.random()*8) });
    }
    return list;
  });
  return (
    <div className="no-print" style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(247,247,248,0.94)", backdropFilter:"blur(8px)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
        {pieces.map(function(p) {
          return <div key={p.id} style={{ position:"absolute", left:p.x+"%", top:"-15px", width:p.size, height:p.size, borderRadius:p.size/3, background:p.color, animation:"fall 1.5s ease-in "+p.delay+"s both" }}/>;
        })}
      </div>
      <div style={{ animation:"popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both", marginBottom:26 }}>
        <svg width={96} height={96} viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="44" fill={ac()+"18"} stroke={ac()} strokeWidth="3"/>
          <polyline points="28,50 42,64 68,34" fill="none" stroke={ac()} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="60" style={{ animation:"checkDraw 0.45s ease 0.45s both", strokeDashoffset:60 }}/>
        </svg>
      </div>
      <div style={{ textAlign:"center", animation:"slideUp 0.4s ease 0.3s both" }}>
        <div style={{ fontSize:25, fontWeight:800, color:T.text, marginBottom:7 }}>{t("concluida", lang)}</div>
        <div style={{ fontSize:14, color:T.muted, marginBottom:30, lineHeight:1.5 }}>{t("todos_dados_registrados", lang)}</div>
        <div style={{ display:"flex", flexDirection:"column", gap:11, width:"100%", maxWidth:300 }}>
          <Btn full onClick={onPDF} icon={<IcPdf c="#fff" s={16}/>}>{t("salvar_pdf", lang)}</Btn>
          <Btn full variant="ghost" onClick={onClose}>{t("continuar_sem_pdf", lang)}</Btn>
        </div>
      </div>
    </div>
  );
}

// ── ASSESSMENT FORM ───────────────────────────────────────────────────────────
var FORM_TABS = ["Dados", "Anamnese", "Composição", "Perímetros", "Força", "Flexibilidade", "Cardiovascular", "Metabolismo", "Fotos", "Resultados"];

function AvalForm({ av: init, alunoNome, isNew, onSave, onBack, settings, trainer, prevAval, onSendToStudent }) {
  const lang = (trainer && trainer.lang) || "pt";
  const firstName = alunoNome ? alunoNome.split(" ")[0] : (lang === "en" ? "Student" : lang === "es" ? "Alumno" : "Aluno");
  const unitSystem = (trainer && trainer.unitSystem) || "metric";
  const [av, setAv] = useState(function() { return migrateAval(init); });
  const [tab, setTab] = useState(0);
  const [done, setDone] = useState(false);
  const [customActive, setCustomActive] = useState({});
  const tabsRef = useRef(null);
  
  const [saveState, setSaveState] = useState("saved"); // 'saved', 'saving', 'unsaved', 'error'

  const upd = useCallback(function(path, val) {
    setAv(function(prev) {
      var n = JSON.parse(JSON.stringify(prev));
      var keys = path.split(".");
      var cur = n;
      for (var i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      cur[keys[keys.length - 1]] = val;
      return n;
    });
  }, []);

  // Debounced auto-save effect
  useEffect(function() {
    const hasChanges = JSON.stringify(av) !== JSON.stringify(init);
    if (!hasChanges || done) {
      setSaveState("saved");
      return;
    }

    setSaveState("unsaved");

    const handler = setTimeout(async function() {
      setSaveState("saving");
      try {
        await onSave(av);
        setSaveState("saved");
      } catch (err) {
        console.error("Erro no salvamento automático:", err);
        setSaveState("error");
      }
    }, 1200); // 1.2s debounce

    return function() {
      clearTimeout(handler);
    };
  }, [av, init, done, onSave]);

  // Prevent browser close with unsaved changes
  useEffect(function() {
    function handleBeforeUnload(e) {
      if (saveState === "unsaved" || saveState === "saving") {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return function() {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [saveState]);

  useEffect(function() {
    if (tabsRef.current) {
      var el = tabsRef.current.children[tab];
      if (el) el.scrollIntoView({ behavior:"smooth", block:"nearest", inline:"center" });
    }
  }, [tab]);

  var imc = calcIMC(av.peso, av.altura);
  var imcArr = imc ? imcClass(imc) : ["", ""];
  var imcLbl = imcArr[0], imcCol = imcArr[1];
  var rcqVal = calcRCQ(av.perimetria.cintura, av.perimetria.quadril);
  var rcqData = rcqVal ? rcqRisk(av.sexo, rcqVal, av.idade) : null;
  var perimForComp = Object.assign({}, av.perimetria, { altura: av.altura });
  var tmb = calcTMB(av.sexo, av.peso, av.altura, av.idade);

  function addTeste() { setAv(function(p) { return Object.assign({}, p, { testes: p.testes.concat([{ id: Date.now(), exercicio:"", reps:"", carga:"" }]) }); }); }
  function delTeste(id) { setAv(function(p) { return Object.assign({}, p, { testes: p.testes.filter(function(t) { return t.id !== id; }) }); }); }
  function setTeste(id, k, v) { setAv(function(p) { return Object.assign({}, p, { testes: p.testes.map(function(t) { return t.id === id ? Object.assign({}, t, { [k]: v }) : t; }) }); }); }
  function addComp() { setAv(function(p) { return Object.assign({}, p, { composicoes: p.composicoes.concat([newComp()]) }); }); }
  function delComp(idx) { setAv(function(p) { return Object.assign({}, p, { composicoes: p.composicoes.filter(function(_, i) { return i !== idx; }) }); }); }
  function updComp(idx, field, val) {
    setAv(function(p) {
      var n = JSON.parse(JSON.stringify(p));
      if (field.indexOf(".") >= 0) {
        var parts = field.split(".");
        n.composicoes[idx][parts[0]][parts[1]] = val;
      } else {
        n.composicoes[idx][field] = val;
      }
      return n;
    });
  }

  async function finalizar() { 
    setSaveState("saving"); 
    try {
      await onSave(av);
      setSaveState("saved");
    } catch (err) {
      console.error("Erro ao finalizar:", err);
    }
    setTab(9); 
    setDone(true); 
  }

  async function enviarAluno() {
    setSaveState("saving");
    try {
      await onSave(av);
      setSaveState("saved");
      if (onSendToStudent) {
        await onSendToStudent(av);
      }
    } catch (err) {
      console.error("Erro ao salvar para enviar ao aluno:", err);
    }
  }

  async function handleBack() {
    const hasChanges = JSON.stringify(av) !== JSON.stringify(init);
    if (hasChanges && !done) {
      setSaveState("saving");
      try {
        await onSave(av);
      } catch (err) {
        console.error("Erro ao salvar ao voltar:", err);
      }
    }
    onBack();
  }

  const saveLabel = saveState === "saving" 
    ? (lang === "pt" ? "Salvando..." : lang === "es" ? "Guardando..." : "Saving...")
    : saveState === "unsaved"
      ? (lang === "pt" ? "Modificado" : lang === "es" ? "Modificado" : "Unsaved")
      : saveState === "error"
        ? (lang === "pt" ? "Erro ao salvar" : lang === "es" ? "Error al guardar" : "Save error")
        : (lang === "pt" ? "Salvo" : lang === "es" ? "Guardado" : "Saved");

  const saveColor = saveState === "saving"
    ? "#3B82F6" 
    : saveState === "unsaved"
      ? "#F59E0B" 
      : saveState === "error"
        ? "#EF4444" 
        : "#10B981";

  return (
    <div style={{ paddingBottom:80 }}>
      {done && <CompletionOverlay onPDF={function() { window.print(); }} onClose={onBack} lang={lang}/>}
      <div className="no-print" style={{ position:"sticky", top:0, zIndex:60, background:T.bg, borderBottom:"1px solid "+T.border, padding:"11px 16px 0" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:11 }}>
          <button onClick={handleBack} style={{ background:"none", border:"1.5px solid "+T.border, borderRadius:8, padding:"7px 10px", cursor:"pointer", display:"flex", alignItems:"center" }}>
            <IcBack c={T.sub} s={18}/>
          </button>
          <div style={{ flex:1, fontSize:13, color:T.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {isNew ? t("nova_avaliacao", lang) : (lang === "en" ? "Edit" : lang === "es" ? "Editar" : "Editar")} · {alunoNome}
          </div>
          <Btn small variant="outline" onClick={enviarAluno} style={{ borderColor: ac(), color: ac(), padding: "6px 8px" }}>
            {lang === "en" ? "Send Online Form" : lang === "es" ? "Enviar Formulario Online" : "Enviar Formulário Online"}
          </Btn>
          <Btn small onClick={finalizar} icon={<IcCheck c="#fff" s={15}/>}>{lang === "en" ? "Finish" : lang === "es" ? "Finalizar" : "Finalizar"}</Btn>
        </div>
        <div ref={tabsRef} style={{ display:"flex", gap:5, overflowX:"auto", paddingBottom:11, scrollbarWidth:"none" }}>
          {FORM_TABS.map(function(tName, i) {
            const tabKeys = {
              "Dados": "dados",
              "Anamnese": "anamnese",
              "Composição": "composicao",
              "Perímetros": "perimetria",
              "Força": "forca",
              "Flexibilidade": "flexibilidade",
              "Cardiovascular": "cardiovascular",
              "Metabolismo": "metabolismo",
              "Fotos": "fotos",
              "Resultados": "resultados"
            };
            const label = t(tabKeys[tName] || tName.toLowerCase(), lang);
            return (
              <button
                key={tName}
                onClick={function() { setTab(i); }}
                style={{ background: tab===i ? ac() : T.surface, color: tab===i ? "#fff" : T.muted, border:"1.5px solid "+(tab===i ? ac() : T.border), borderRadius:20, padding:"7px 14px", fontSize:12, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0, transition:"all 0.15s" }}
              >
                {(i+1) + ". " + label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="fu" style={{ padding:"18px 16px" }}>

        {tab === 0 && (
          <div style={{ display:"flex", flexDirection:"column", gap:15 }}>
            <SecHead title={lang === "en" ? "Identification" : lang === "es" ? "Identificación" : "Identificação"} sub={lang === "en" ? "Personal data of the evaluated student" : lang === "es" ? "Datos personales del evaluado" : "Dados pessoais do avaliado"}/>
            <FInput label={t("nome_completo", lang)} value={av.nome} onChange={function(v) { upd("nome", v); }} placeholder={lang === "en" ? "Student name" : lang === "es" ? "Nombre del alumno" : "Nome do aluno"} required/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <FInput label={lang === "en" ? "Date" : lang === "es" ? "Fecha" : "Data"} value={av.data} onChange={function(v) { upd("data", v); }} type="date"/>
              <FInput label={t("idade", lang)} value={av.idade} onChange={function(v) { upd("idade", v); }} type="number" unit={lang === "en" ? "years" : lang === "es" ? "años" : "anos"}/>
            </div>
            <ToggleGroup label={lang === "en" ? "Biological sex" : lang === "es" ? "Sexo biológico" : "Sexo biológico"} value={av.sexo} onChange={function(v) { upd("sexo", v); }} options={[{value:"M",label:t("masculino", lang)},{value:"F",label:t("feminino", lang)}]}/>
            <FInput label={t("telefone", lang)} value={av.telefone} onChange={function(v) { upd("telefone", v); }} placeholder="(11) 99999-9999"/>
            <FInput label={lang === "en" ? "Goal" : lang === "es" ? "Objetivo" : "Objetivo"} value={av.objetivo} onChange={function(v) { upd("objetivo", v); }} placeholder={lang === "en" ? "e.g., Hypertrophy, weight loss..." : lang === "es" ? "Ej: Hipertrofia, pérdida de peso..." : "Ex: Hipertrofia, emagrecimento..."}/>
          </div>
        )}

        {tab === 1 && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <SecHead title={t("anamnese", lang)} sub={lang === "en" ? "Health history and habits of the student" : lang === "es" ? "Historial de salud y hábitos del evaluado" : "Histórico de saúde e hábitos do avaliado"}/>
            
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {av.anamnese.map(function(q) {
                return (
                  <Card key={q.id} sx={{ padding: 16, border: "1.5px solid "+T.borderLight }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      {q.isCustom ? (
                        <div style={{ flex: 1, marginRight: 12 }}>
                          <FInput
                            label={lang === "en" ? "New Question" : lang === "es" ? "Nueva Pregunta" : "Nova Pergunta"}
                            value={q.pergunta}
                            onChange={function(v) {
                              var newAnam = av.anamnese.map(function(item) {
                                return item.id === q.id ? Object.assign({}, item, { pergunta: v }) : item;
                              });
                              upd("anamnese", newAnam);
                            }}
                            placeholder={lang === "en" ? "Type the question..." : lang === "es" ? "Escribe la pregunta..." : "Digite a pergunta..."}
                            required
                          />
                        </div>
                      ) : (
                        <label style={{ fontSize:12, fontWeight:700, color:T.sub, letterSpacing:0.4, textTransform:"uppercase" }}>
                          {t(q.pergunta, lang)}
                        </label>
                      )}
                      <TrashBtn onClick={function() {
                        var newAnam = av.anamnese.filter(function(item) { return item.id !== q.id; });
                        upd("anamnese", newAnam);
                      }}/>
                    </div>
                    
                    {(q.pergunta === "Já treinou antes?" || q.pergunta === "Está fazendo dieta?" || q.pergunta === "Fuma?") ? (
                      <FSelect
                        value={q.resposta}
                        onChange={function(v) {
                          var newAnam = av.anamnese.map(function(item) {
                            return item.id === q.id ? Object.assign({}, item, { resposta: v }) : item;
                          });
                          upd("anamnese", newAnam);
                        }}
                        options={[{value:"",label:lang === "en" ? "Select..." : lang === "es" ? "Seleccione..." : "Selecione..."}, {value:"Sim",label:lang === "en" ? "Yes" : lang === "es" ? "Sí" : "Sim"}, {value:"Não",label:lang === "en" ? "No" : lang === "es" ? "No" : "Não"}]}
                      />
                    ) : q.pergunta === "Consumo de alcool?" ? (
                      <FSelect
                        value={q.resposta}
                        onChange={function(v) {
                          var newAnam = av.anamnese.map(function(item) {
                            return item.id === q.id ? Object.assign({}, item, { resposta: v }) : item;
                          });
                          upd("anamnese", newAnam);
                        }}
                        options={[{value:"",label:lang === "en" ? "Select..." : lang === "es" ? "Seleccione..." : "Selecione..."}, {value:"Não consome",label:lang === "en" ? "Does not consume" : lang === "es" ? "No consume" : "Não consome"}, {value:"Socialmente",label:lang === "en" ? "Socially" : lang === "es" ? "Socialmente" : "Socialmente"}, {value:"Frequente",label:lang === "en" ? "Frequently" : lang === "es" ? "Frecuente" : "Frequente"}]}
                      />
                    ) : (
                      <FTextarea
                        value={q.resposta}
                        onChange={function(v) {
                          var newAnam = av.anamnese.map(function(item) {
                            return item.id === q.id ? Object.assign({}, item, { resposta: v }) : item;
                          });
                          upd("anamnese", newAnam);
                        }}
                        placeholder={lang === "en" ? "Student's answer..." : lang === "es" ? "Respuesta del evaluado..." : "Resposta do avaliado..."}
                        rows={2}
                      />
                    )}
                  </Card>
                );
              })}
            </div>

            <button
              onClick={function() {
                var newAnam = av.anamnese.concat([{ id: Date.now() + Math.random(), pergunta: "", resposta: "", isCustom: true }]);
                upd("anamnese", newAnam);
              }}
              style={{ width:"100%", padding:"13px", borderRadius:12, border:"1.5px dashed "+ac()+"55", background:"transparent", cursor:"pointer", color:ac(), fontWeight:600, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:10 }}
            >
              <IcPlus c={ac()} s={18}/> {lang === "en" ? "Add Custom Question" : lang === "es" ? "Añadir Pregunta Personalizada" : "Adicionar Pergunta Personalizada"}
            </button>
          </div>
        )}

        {tab === 2 && (
          <div style={{ display:"flex", flexDirection:"column", gap:15 }}>
            <SecHead title={t("composicao", lang)} sub={lang === "en" ? "Weight, height, BMI and body fat %" : lang === "es" ? "Peso, altura, IMC y % de grasa" : "Peso, altura, IMC e % gordura"}/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <FInput label={t("peso", lang)} value={toSystemWeight(av.peso, unitSystem)} onChange={function(v) { upd("peso", fromSystemWeight(v, unitSystem)); }} type="number" unit={getWeightUnit(unitSystem)} placeholder={unitSystem === "imperial" ? "177.5" : "80.5"}/>
              {unitSystem === "imperial" ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <FInput
                    label={t("altura", lang) + " (ft)"}
                    value={cmToFtIn(av.altura).ft}
                    onChange={function(v) {
                      var curIn = cmToFtIn(av.altura).in;
                      upd("altura", ftInToCm(v, curIn));
                    }}
                    type="number"
                    unit="ft"
                    placeholder="5"
                  />
                  <FInput
                    label={t("altura", lang) + " (in)"}
                    value={cmToFtIn(av.altura).in}
                    onChange={function(v) {
                      var curFt = cmToFtIn(av.altura).ft;
                      upd("altura", ftInToCm(curFt, v));
                    }}
                    type="number"
                    unit="in"
                    placeholder="9"
                  />
                </div>
              ) : (
                <FInput
                  label={t("altura", lang)}
                  value={av.altura || ""}
                  onChange={function(v) { upd("altura", v); }}
                  type="number"
                  unit="cm"
                  placeholder="175"
                />
              )}
            </div>
            {imc && (
              <Card sx={{ padding:18 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontSize:11, color:T.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5 }}>IMC</div>
                    <div style={{ fontSize:36, fontWeight:800, color:imcCol, lineHeight:1, marginTop:3 }}>{imc}</div>
                    <div style={{ fontSize:13, color:imcCol, marginTop:4, fontWeight:600 }}>{t(imcLbl, lang)}</div>
                  </div>
                  <Ring pct={Math.min(100, ((parseFloat(imc)-10)/40)*100)} size={74} stroke={6} color={imcCol} label={imc}/>
                </div>
              </Card>
            )}
            <div style={{ borderTop:"1px solid "+T.border, paddingTop:15 }}>
              <div style={{ fontSize:11, fontWeight:700, color:T.sub, letterSpacing:0.5, textTransform:"uppercase", marginBottom:14 }}>{lang === "en" ? "Composition Evaluations" : lang === "es" ? "Evaluaciones de Composición" : "Avaliações de Composição"}</div>
              {av.composicoes.map(function(comp, ci) {
                var info = METODOS[comp.metodo];
                var res = compResult(av.sexo, av.idade, perimForComp, comp);
                var dkeys = (info && info.dobras && info.dobras[av.sexo]) ? info.dobras[av.sexo] : [];
                return (
                  <Card key={comp.id} sx={{ marginBottom:12, border:"1.5px solid "+ac()+"28" }}>
                    <div style={{ padding:"12px 14px", borderBottom:"1px solid "+T.border, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div style={{ fontSize:12, fontWeight:700, color:T.sub, textTransform:"uppercase", letterSpacing:0.5 }}>{(lang === "en" ? "Evaluation #" : lang === "es" ? "Evaluación #" : "Avaliação #") + (ci+1)}</div>
                      {av.composicoes.length > 1 && <TrashBtn onClick={function() { delComp(ci); }}/>}
                    </div>
                    <div style={{ padding:"12px 14px", borderBottom:"1px solid "+T.borderLight }}>
                      <FSelect
                        label={t("metodo_avaliacao", lang)}
                        value={comp.metodo}
                        onChange={function(v) { updComp(ci, "metodo", v); }}
                        options={[
                          { value: "", label: lang === "en" ? "Select a method..." : lang === "es" ? "Selecciona un método..." : "Selecione um método..." },
                          ...Object.keys(METODOS).map(function(k) {
                            return { value: k, label: t(METODOS[k].label, lang) };
                          })
                        ]}
                      />
                    </div>
                    <div style={{ padding:"12px 14px" }}>
                      {!comp.metodo ? (
                        <div style={{ textAlign:"center", padding:"20px 10px", color:T.muted, fontSize:13 }}>
                          {lang === "en" ? "Select a method above to enter measurements." : lang === "es" ? "Selecciona un método arriba para ingresar las medidas." : "Selecione um método acima para inserir as medidas."}
                        </div>
                      ) : info && info.isBio ? (
                        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                          {(function() {
                            var prevComp = prevAval && prevAval.composicoes && prevAval.composicoes.find(function(c) { return c.metodo === comp.metodo; });
                            var prevGord = (prevComp && prevComp.bioimpedancia) ? prevComp.bioimpedancia.gordura : "";
                            return (
                              <FInput
                                label={t("gordura_corporal", lang)}
                                value={comp.bioimpedancia.gordura}
                                onChange={function(v) { updComp(ci, "bioimpedancia.gordura", v); }}
                                type="number"
                                unit="%"
                                placeholder={prevGord ? String(prevGord) : "Ex: 15"}
                              />
                            );
                          })()}
                        </div>
                      ) : comp.metodo === "marinha" ? (
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                          {(function() {
                            var prevPescoco = prevAval && prevAval.perimetria ? prevAval.perimetria.pescoco : "";
                            var prevCintura = prevAval && prevAval.perimetria ? prevAval.perimetria.cintura : "";
                            var prevQuadril = prevAval && prevAval.perimetria ? prevAval.perimetria.quadril : "";
                            return (
                              <>
                                <FInput
                                  label={t("Pescoço", lang)}
                                  value={toSystemLength(av.perimetria.pescoco, unitSystem)}
                                  onChange={function(v) { upd("perimetria.pescoco", fromSystemLength(v, unitSystem)); }}
                                  type="number"
                                  unit={getLengthUnit(unitSystem)}
                                  placeholder={prevPescoco ? String(toSystemLength(prevPescoco, unitSystem)) : "Ex: 38"}
                                />
                                <FInput
                                  label={t("Cintura", lang)}
                                  value={toSystemLength(av.perimetria.cintura, unitSystem)}
                                  onChange={function(v) { upd("perimetria.cintura", fromSystemLength(v, unitSystem)); }}
                                  type="number"
                                  unit={getLengthUnit(unitSystem)}
                                  placeholder={prevCintura ? String(toSystemLength(prevCintura, unitSystem)) : "Ex: 80"}
                                />
                                {av.sexo === "F" && (
                                  <FInput
                                    label={t("Quadril", lang)}
                                    value={toSystemLength(av.perimetria.quadril, unitSystem)}
                                    onChange={function(v) { upd("perimetria.quadril", fromSystemLength(v, unitSystem)); }}
                                    type="number"
                                    unit={getLengthUnit(unitSystem)}
                                    placeholder={prevQuadril ? String(toSystemLength(prevQuadril, unitSystem)) : "Ex: 95"}
                                  />
                                )}
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                          {dkeys.map(function(k) {
                            var prevComp = prevAval && prevAval.composicoes && prevAval.composicoes.find(function(c) { return c.metodo === comp.metodo; });
                            var prevDobra = prevComp && prevComp.dobras ? prevComp.dobras[k] : "";
                            return (
                              <FInput
                                key={k}
                                label={t(DOBRA_LABEL[k], lang)}
                                value={comp.dobras[k]}
                                onChange={function(v) { updComp(ci, "dobras."+k, v); }}
                                type="number"
                                unit="mm"
                                placeholder={prevDobra ? String(prevDobra) : "Ex: 12"}
                              />
                            );
                          })}
                        </div>
                      )}
                      {res && (
                        <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:8 }}>
                          <div style={{ padding:"11px 14px", background:T.bg, borderRadius:10, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                            <span style={{ fontSize:13, color:T.sub }}>{lang === "en" ? "% Body Fat" : lang === "es" ? "% Grasa" : "% Gordura"}</span>
                            <span style={{ fontSize:22, fontWeight:800, color:pctColor(res) }}>{res + "%"}</span>
                          </div>
                          {av.peso && !isNaN(parseFloat(av.peso)) && (
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                              <div style={{ padding:"10px 12px", background:"#FEF2F2", borderRadius:10, textAlign:"center" }}>
                                <div style={{ fontSize:10, color:T.danger, fontWeight:700, textTransform:"uppercase" }}>{t("massa_gorda", lang)}</div>
                                <div style={{ fontSize:18, fontWeight:800, color:T.danger, marginTop:2 }}>
                                  {(parseFloat(av.peso) * (parseFloat(res)/100)).toFixed(1)} <span style={{ fontSize:11 }}>kg</span>
                                </div>
                              </div>
                              <div style={{ padding:"10px 12px", background:"#E6F9F1", borderRadius:10, textAlign:"center" }}>
                                <div style={{ fontSize:10, color:T.success, fontWeight:700, textTransform:"uppercase" }}>{t("massa_magra", lang)}</div>
                                <div style={{ fontSize:18, fontWeight:800, color:T.success, marginTop:2 }}>
                                  {(parseFloat(av.peso) * (1 - parseFloat(res)/100)).toFixed(1)} <span style={{ fontSize:11 }}>kg</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
              <button
                onClick={addComp}
                style={{ width:"100%", padding:"13px", borderRadius:12, border:"1.5px dashed "+ac()+"55", background:"transparent", cursor:"pointer", color:ac(), fontWeight:600, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:14 }}
              >
                <IcPlus c={ac()} s={18}/> {t("add_outra_comp", lang)}
              </button>
              {(function() {
                var vals = av.composicoes.map(function(c) { return compResult(av.sexo, av.idade, perimForComp, c); }).filter(function(v) { return v && !isNaN(parseFloat(v)); });
                if (vals.length < 2) return null;
                var sum = vals.reduce(function(s, v) { return s + parseFloat(v); }, 0);
                var media = (sum / vals.length).toFixed(1);
                var pct = parseFloat(media) / 100;
                var peso = parseFloat(av.peso);
                return (
                  <Card sx={{ padding:16, background:acL(), border:"1.5px solid "+ac()+"40" }}>
                    <div style={{ fontSize:11, fontWeight:700, color:ac(), textTransform:"uppercase", letterSpacing:0.8, marginBottom:12 }}>{t("media_de", lang) + vals.length + " " + t("avaliacoes", lang)}</div>
                    <div style={{ textAlign:"center", marginBottom:12 }}>
                      <div style={{ fontSize:44, fontWeight:800, color:pctColor(media), lineHeight:1 }}>{media}<span style={{ fontSize:20 }}>%</span></div>
                      <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>{lang === "en" ? "% Body Fat — average" : lang === "es" ? "% Grasa — promedio" : "% Gordura — média"}</div>
                    </div>
                    {peso && !isNaN(peso) && (
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                        <div style={{ textAlign:"center", padding:"12px 8px", background:"#FEF2F2", borderRadius:10 }}>
                          <div style={{ fontSize:10, color:T.danger, fontWeight:700, textTransform:"uppercase" }}>{t("massa_gorda", lang)}</div>
                          <div style={{ fontSize:22, fontWeight:800, color:T.danger, marginTop:2 }}>{(peso * pct).toFixed(1)}<span style={{ fontSize:11 }}> kg</span></div>
                        </div>
                        <div style={{ textAlign:"center", padding:"12px 8px", background:"#E6F9F1", borderRadius:10 }}>
                          <div style={{ fontSize:10, color:T.success, fontWeight:700, textTransform:"uppercase" }}>{t("massa_magra", lang)}</div>
                          <div style={{ fontSize:22, fontWeight:800, color:T.success, marginTop:2 }}>{(peso * (1 - pct)).toFixed(1)}<span style={{ fontSize:11 }}> kg</span></div>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })()}
            </div>
          </div>
        )}

        {tab === 3 && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <SecHead title={t("perimetria", lang)} sub={t("medidas_cm", lang)}/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {(function() {
                var defaultCampos = [
                  { label: "Pescoço", key: "pescoco", active: true },
                  { label: "Ombros", key: "ombros", active: true },
                  { label: "Peitoral", key: "peitoral", active: true },
                  { label: "Cintura", key: "cintura", active: true },
                  { label: "Abdominal", key: "abdominal", active: true },
                  { label: "Quadril", key: "quadril", active: true },
                  { label: "Braço Dir.", key: "bracoDireito", active: true },
                  { label: "Braço Esq.", key: "bracoEsquerdo", active: true },
                  { label: "Coxa Dir.", key: "coxaDireita", active: true },
                  { label: "Coxa Esq.", key: "coxaEsquerda", active: true },
                  { label: "Panturrilha Dir.", key: "panturrilhaDireita", active: true },
                  { label: "Panturrilha Esq.", key: "panturrilhaEsquerda", active: true }
                ];
                var campos = settings ? settings.perimetriaCampos : defaultCampos;
                return campos.filter(function(f) {
                  return f.active || (av.perimetria && av.perimetria[f.key] !== undefined && av.perimetria[f.key] !== "");
                }).map(function(f) {
                  var prevVal = (prevAval && prevAval.perimetria) ? prevAval.perimetria[f.key] : "";
                  return (
                    <FInput
                      key={f.key}
                      label={t(f.label, lang)}
                      value={toSystemLength(av.perimetria[f.key], unitSystem)}
                      onChange={function(v) { upd("perimetria."+f.key, fromSystemLength(v, unitSystem)); }}
                      type="number"
                      unit={getLengthUnit(unitSystem)}
                      placeholder={prevVal ? String(toSystemLength(prevVal, unitSystem)) : "0.0"}
                    />
                  );
                });
              })()}
            </div>
            <div style={{ borderTop:"1px solid "+T.border, paddingTop:14 }}>
              <SecHead title="RCQ" sub={t("calculado_auto_cintura_quadril", lang)}/>
              {rcqVal && rcqData ? (
                <Card sx={{ padding:16 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:36, fontWeight:800, color:rcqData[1], lineHeight:1 }}>{rcqVal}</div>
                      <div style={{ fontSize:12, color:T.muted, marginTop:4 }}>{t("cintura_lbl", lang) + " " + av.perimetria.cintura + " ÷ " + t("quadril_lbl", lang) + " " + av.perimetria.quadril}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <Chip color={rcqData[1]}>{t(rcqData[0], lang)}</Chip>
                      <div style={{ fontSize:11, color:T.muted, marginTop:5 }}>{t("risco_cardiovascular", lang)}</div>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card sx={{ padding:14 }}>
                  <div style={{ color:T.muted, fontSize:13 }}>{t("preencha_cintura_quadril", lang)}</div>
                </Card>
              )}
            </div>
          </div>
        )}

        {tab === 4 && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <SecHead title={t("forca", lang)} sub={t("personalize_exercicios", lang)}/>
            <Card sx={{ padding:13, background:acL(), border:"1px solid "+ac()+"20" }}>
              <div style={{ fontSize:12, color:ac(), fontWeight:600, display:"flex", alignItems:"center", gap:7 }}>
                <IcDumbbell c={ac()} s={16}/> {t("adicione_quantos_quiser", lang)}
              </div>
            </Card>
            {av.testes.map(function(tItem, i) {
              return (
                <Card key={tItem.id} sx={{ padding:15 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:0.5 }}>{t("teste_num", lang) + (i+1)}</div>
                    {av.testes.length > 1 && <TrashBtn onClick={function() { delTeste(tItem.id); }}/>}
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
                    {(function() {
                      var exerciciosPredefinidos = settings ? settings.exerciciosForca : [
                        "Supino Reto", "Agachamento", "Puxada Aberta", "Leg Press 45°", "Rosca Direta", "Puxada Pulley", "Tríceps Pulley"
                      ];
                      var isPredefined = exerciciosPredefinidos.indexOf(tItem.exercicio) >= 0;
                      var showCustom = customActive[tItem.id] || (!isPredefined && tItem.exercicio !== "");
                      
                      return (
                        <>
                          <FSelect
                            label={t("exercicio", lang)}
                            value={showCustom ? "outro" : (tItem.exercicio || "")}
                            onChange={function(val) {
                              if (val === "outro") {
                                setCustomActive(function(p) { return Object.assign({}, p, { [tItem.id]: true }); });
                                setTeste(tItem.id, "exercicio", "");
                              } else {
                                setCustomActive(function(p) { return Object.assign({}, p, { [tItem.id]: false }); });
                                setTeste(tItem.id, "exercicio", val);
                              }
                            }}
                            options={
                              [{ value: "", label: t("selecione_exercicio", lang) }]
                              .concat(exerciciosPredefinidos.map(function(ex) { return { value: ex, label: t(ex, lang) || ex }; }))
                              .concat([{ value: "outro", label: t("outro_digitar", lang) }])
                            }
                          />
                          {showCustom && (
                            <FInput
                              label={t("nome_exercicio_custom", lang)}
                              value={tItem.exercicio}
                              onChange={function(v) { setTeste(tItem.id, "exercicio", v); }}
                              placeholder={t("digite_nome_exercicio", lang)}
                            />
                          )}
                        </>
                      );
                    })()}
                    {(function() {
                      var prevTeste = (prevAval && prevAval.testes) ? prevAval.testes.find(function(pt) { return pt.exercicio === tItem.exercicio; }) : null;
                      var prevReps = prevTeste ? prevTeste.reps : "";
                      var prevCargaVal = prevTeste && prevTeste.carga ? toSystemWeight(prevTeste.carga, unitSystem) : "";
                      return (
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                          <FInput
                            label={t("repeticoes", lang)}
                            value={tItem.reps}
                            onChange={function(v) { setTeste(tItem.id, "reps", v); }}
                            type="number"
                            unit="reps"
                            placeholder={prevReps ? String(prevReps) : "Ex: 10"}
                          />
                          <FInput
                            label={t("carga", lang)}
                            value={toSystemWeight(tItem.carga, unitSystem)}
                            onChange={function(v) { setTeste(tItem.id, "carga", fromSystemWeight(v, unitSystem)); }}
                            type="number"
                            unit={getWeightUnit(unitSystem)}
                            placeholder={prevCargaVal ? String(prevCargaVal) : "Ex: 40"}
                          />
                        </div>
                      );
                    })()}
                  </div>
                </Card>
              );
            })}
            <Btn variant="outline" full onClick={addTeste} icon={<IcPlus c={ac()} s={16}/>}>{t("adicionar_exercicio_btn", lang)}</Btn>
          </div>
        )}

        {tab === 5 && (
          <div style={{ display:"flex", flexDirection:"column", gap:15 }}>
            <SecHead title={t("flexibilidade", lang)} sub={lang === "en" ? "Evaluation of flexibility and range of motion" : lang === "es" ? "Evaluación de la flexibilidad y rango de movimiento" : "Avaliação da flexibilidade e amplitude de movimento"}/>
            {(function() {
              var prevWells = prevAval && prevAval.flexibilidade && prevAval.flexibilidade.wells ? toSystemLength(prevAval.flexibilidade.wells, unitSystem) : "";
              var prevAngulo = prevAval && prevAval.flexibilidade && prevAval.flexibilidade.anguloPopliteo ? prevAval.flexibilidade.anguloPopliteo : "";
              return (
                <>
                  <FInput
                    label={t("sentar_alcancar_wells", lang)}
                    value={toSystemLength(av.flexibilidade.wells, unitSystem)}
                    onChange={function(v) { upd("flexibilidade.wells", fromSystemLength(v, unitSystem)); }}
                    type="number"
                    unit={getLengthUnit(unitSystem)}
                    placeholder={prevWells ? String(prevWells) : (unitSystem === "imperial" ? "Ex: 9.8" : "Ex: 25")}
                  />
                  <FInput
                    label={t("angulo_popliteo", lang)}
                    value={av.flexibilidade.anguloPopliteo || ""}
                    onChange={function(v) { upd("flexibilidade.anguloPopliteo", v); }}
                    type="number"
                    unit="°"
                    placeholder={prevAngulo ? String(prevAngulo) : "Ex: 160"}
                  />
                </>
              );
            })()}
            <ToggleGroup
              label={t("teste_thomas", lang)}
              value={av.flexibilidade.thomas || ""}
              onChange={function(v) { upd("flexibilidade.thomas", v); }}
              options={[{value:"Normal",label:t("normal", lang)},{value:"Encurtado",label:t("encurtado", lang)}]}
              clearable
            />
            {prevAval && prevAval.flexibilidade && prevAval.flexibilidade.thomas && (
              <span style={{ fontSize:11, color:T.muted, fontStyle:"italic", display:"block", marginTop:-6, marginBottom:10, marginLeft:4 }}>
                {t("anterior", lang)}: {t(prevAval.flexibilidade.thomas, lang)}
              </span>
            )}
          </div>
        )}

        {tab === 6 && (
          <div style={{ display:"flex", flexDirection:"column", gap:15 }}>
            <SecHead title={t("cardiovascular", lang)} sub={t("avaliacao_cardio_hemo", lang)}/>
            <div style={{ marginBottom: 12 }}>
              <FSelect
                label={t("tipo_teste_cardio", lang)}
                value={av.cardiovascular.tipoTeste || "cooper"}
                onChange={function(v) { upd("cardiovascular.tipoTeste", v); }}
                options={[
                  { value: "cooper", label: t("teste_cooper_12", lang) },
                  { value: "esteira", label: t("teste_esteira_inc", lang) }
                ]}
              />
            </div>
            {(av.cardiovascular.tipoTeste || "cooper") === "cooper" ? (
              <FInput
                label={t("teste_cooper_12", lang)}
                value={toSystemCooperDist(av.cardiovascular.cooper, unitSystem)}
                onChange={function(v) { upd("cardiovascular.cooper", fromSystemCooperDist(v, unitSystem)); }}
                type="number"
                unit={getCooperUnit(unitSystem)}
                placeholder={prevAval && prevAval.cardiovascular && prevAval.cardiovascular.cooper ? String(toSystemCooperDist(prevAval.cardiovascular.cooper, unitSystem)) : (unitSystem === "imperial" ? "Ex: 1.50" : "Ex: 2400")}
              />
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <FInput
                  label={t("velocidade_final", lang)}
                  value={toSystemSpeed(av.cardiovascular.esteiraVelocidade, unitSystem)}
                  onChange={function(v) { upd("cardiovascular.esteiraVelocidade", fromSystemSpeed(v, unitSystem)); }}
                  type="number"
                  unit={getSpeedUnit(unitSystem)}
                  placeholder={prevAval && prevAval.cardiovascular && prevAval.cardiovascular.esteiraVelocidade ? String(toSystemSpeed(prevAval.cardiovascular.esteiraVelocidade, unitSystem)) : (unitSystem === "imperial" ? "Ex: 7.5" : "Ex: 12")}
                />
                <FInput
                  label={t("inclinacao_final", lang)}
                  value={av.cardiovascular.esteiraInclinacao || ""}
                  onChange={function(v) { upd("cardiovascular.esteiraInclinacao", v); }}
                  type="number"
                  unit="%"
                  placeholder={prevAval && prevAval.cardiovascular && prevAval.cardiovascular.esteiraInclinacao ? String(prevAval.cardiovascular.esteiraInclinacao) : "Ex: 2"}
                />
              </div>
            )}
            {(function() {
              var isCooper = (av.cardiovascular.tipoTeste || "cooper") === "cooper";
              var vo2 = isCooper 
                ? calcVO2Cooper(av.cardiovascular.cooper) 
                : calcVO2Esteira(av.cardiovascular.esteiraVelocidade, av.cardiovascular.esteiraInclinacao);
              if (!vo2) return null;
              var classification = classificarVO2(av.sexo, av.idade, vo2);
              var classLabel = classification ? classification[0] : "";
              var classColor = classification ? classification[1] : ac();
              return (
                <Card sx={{ padding:14, background:acL(), border:"1px solid "+ac()+"20", marginTop:-5 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:13, color:T.sub, fontWeight:600 }}>{t("vo2_max_estimado", lang)}</span>
                    <strong style={{ fontSize:18, color:ac() }}>{vo2} <span style={{ fontSize:11, fontWeight:500 }}>ml/kg/min</span></strong>
                  </div>
                  {classLabel && (
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8, paddingTop:8, borderTop:"1px solid "+ac()+"14" }}>
                      <span style={{ fontSize:12, color:T.muted }}>{t("classificacao", lang)}</span>
                      <strong style={{ fontSize:13, color:classColor }}>{t(classLabel, lang)}</strong>
                    </div>
                  )}
                </Card>
              );
            })()}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <FInput
                label={t("fc_repouso", lang)}
                value={av.cardiovascular.fcRepouso || ""}
                onChange={function(v) { upd("cardiovascular.fcRepouso", v); }}
                type="number"
                unit="bpm"
                placeholder={prevAval && prevAval.cardiovascular && prevAval.cardiovascular.fcRepouso ? String(prevAval.cardiovascular.fcRepouso) : "Ex: 70"}
              />
              <FInput
                label={t("fc_recuperacao", lang)}
                value={av.cardiovascular.fcRecuperacao || ""}
                onChange={function(v) { upd("cardiovascular.fcRecuperacao", v); }}
                type="number"
                unit="bpm"
                placeholder={prevAval && prevAval.cardiovascular && prevAval.cardiovascular.fcRecuperacao ? String(prevAval.cardiovascular.fcRecuperacao) : "Ex: 110"}
              />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <FInput 
                label={t("fc_max_medida", lang)} 
                value={av.cardiovascular.fcMax || ""} 
                onChange={function(v) { upd("cardiovascular.fcMax", v); }} 
                type="number" 
                unit="bpm" 
                placeholder={prevAval && prevAval.cardiovascular && prevAval.cardiovascular.fcMax ? String(prevAval.cardiovascular.fcMax) : (av.idade ? (220 - parseInt(av.idade)).toString() : "Ex: 185")}
              />
              <FInput
                label={t("pressao_arterial", lang)}
                value={av.cardiovascular.pressaoArterial || ""}
                onChange={function(v) { upd("cardiovascular.pressaoArterial", v); }}
                placeholder={prevAval && prevAval.cardiovascular && prevAval.cardiovascular.pressaoArterial ? String(prevAval.cardiovascular.pressaoArterial) : "Ex: 120/80"}
                unit="mmHg"
              />
            </div>
            {(function() {
              if (!av.idade) return null;
              var fcMaxEst = 220 - parseInt(av.idade);
              return (
                <div style={{ fontSize:12, color:T.muted, display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:-8, padding:"0 4px" }}>
                  <span>{t("fc_max_estimada_lbl", lang)}</span>
                  <strong>{fcMaxEst} bpm</strong>
                </div>
              );
            })()}
          </div>
        )}

        {tab === 7 && (
          <div style={{ display:"flex", flexDirection:"column", gap:15 }}>
            <SecHead title={t("metabolismo", lang)} sub={t("metabolismo_sub", lang)}/>
            {tmb ? (
              <Card sx={{ padding:20, background:acL(), border:"1.5px solid "+ac()+"40" }}>
                <div style={{ display:"flex", flexDirection:"column", gap:10, alignItems:"center", textAlign:"center" }}>
                  <div style={{ fontSize:11, color:T.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8 }}>
                    {t("tmb_sub", lang)}
                  </div>
                  <div style={{ fontSize:42, fontWeight:800, color:ac(), lineHeight:1 }}>
                    {tmb} <span style={{ fontSize:20 }}>kcal</span>
                  </div>
                  <div style={{ fontSize:13, color:T.sub, marginTop:4 }}>
                    {t("gasto_energetico_minimo", lang)} <strong>Mifflin-St Jeor</strong>.
                  </div>
                  <div style={{ borderTop:"1px solid "+T.borderLight, width:"100%", paddingTop:12, marginTop:8, display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, fontSize:12, color:T.muted }}>
                    <div><strong>{t("peso", lang)}:</strong> {toSystemWeight(av.peso, unitSystem)} {getWeightUnit(unitSystem)}</div>
                    <div><strong>{t("altura", lang)}:</strong> {formatHeight(av.altura, unitSystem)}</div>
                    <div><strong>{t("idade", lang)}:</strong> {av.idade} {lang === "en" ? "years" : lang === "es" ? "años" : "anos"}</div>
                    <div><strong>{lang === "en" ? "Sex" : "Sexo"}:</strong> {av.sexo === "M" ? t("masculino", lang) : t("feminino", lang)}</div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card sx={{ padding:20, textAlign:"center" }}>
                <div style={{ color:T.muted, fontSize:13 }}>
                  {t("preencha_idade_sexo_peso", lang)}
                </div>
              </Card>
            )}
          </div>
        )}

        {tab === 8 && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            <SecHead title={t("registro_fotografico", lang)} sub={t("fotos_sub", lang)}/>
            <Card sx={{ padding:14, background:acL(), border:"1px solid "+ac()+"20" }}>
              <div style={{ fontSize:12, color:ac(), fontWeight:600 }}>{t("opcional_fotos", lang)}</div>
            </Card>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:T.sub, letterSpacing:0.5, textTransform:"uppercase", marginBottom:12 }}>{t("posicoes", lang)}</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
                {[["frente",t("frente", lang)],["lado",t("lado", lang)],["costas",t("costas", lang)]].map(function(pair) {
                  return <FotoSlot key={pair[0]} label={pair[1]} foto={(av.fotos && av.fotos[pair[0]]) || null} onSet={function(v) { upd("fotos."+pair[0], v); }}/>;
                })}
              </div>
            </div>
            <FTextarea label={t("observacoes_fotos", lang)} value={av.observacaoFotos || ""} onChange={function(v) { upd("observacaoFotos", v); }} placeholder={t("placeholder_obs_fotos", lang)} rows={5}/>
          </div>
        )}

        <div id="print-section" style={{ display: tab === 9 ? "flex" : "none", flexDirection:"column", gap:16 }}>
            
            {/* PÁGINA 1 - CAPA E IDENTIFICAÇÃO */}
            <div className="print-page-1">
              {/* Cabeçalho do Avaliador - Personalização */}
              <div className="eval-header-print print-full-width" style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "2.5px solid " + ac(),
                paddingBottom: 16,
                marginBottom: 10,
                gap: 16
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <Avatar name={trainer.nome} foto={trainer.foto} size={54} color={trainer.corPrimaria} />
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 0.8 }}>{t("avaliador", lang)}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: ac() }} className="eval-name">{trainer.nome}</div>
                    {trainer.email && <div style={{ fontSize: 12, color: T.sub, marginTop: 1 }} className="eval-email">{trainer.email}</div>}
                    {trainer.telefone && <div style={{ fontSize: 12, color: T.sub, marginTop: 1 }} className="eval-phone">{trainer.telefone}</div>}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: T.text, letterSpacing: -0.5 }} className="brand-name">ShapeMap</div>
                </div>
              </div>

              <div className="no-print">
                <SecHead title={t("resumo_geral", lang)} sub={lang === "en" ? "All results integrated on a single screen" : lang === "es" ? "Todos los resultados integrados en una sola pantalla" : "Todos os resultados integrados em uma única tela"}/>
              </div>
              
              {/* 1. Identificação & Índices Gerais */}
              <Card className="print-card print-full-width" sx={{ padding:18 }}>
                <div style={{ fontSize:12, fontWeight:700, color:T.sub, textTransform:"uppercase", letterSpacing:0.6, marginBottom:12, borderBottom:"1px solid "+T.borderLight, paddingBottom:6 }}>
                  {t("identificacao_indices_corp", lang)}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 20px", marginBottom:14 }}>
                  <StatRow className="stat-row" label={t("nome_avaliado", lang)} value={av.nome || alunoNome} color={ac()}/>
                  <StatRow className="stat-row" label={t("data_avaliacao", lang)} value={fmtDate(av.data)}/>
                  {av.idade && <StatRow className="stat-row" label={t("idade", lang)} value={av.idade} unit={lang === "en" ? "years" : lang === "es" ? "años" : "anos"}/>}
                  {av.objective || av.objetivo ? <StatRow className="stat-row" label={t("objetivo", lang)} value={av.objective || av.objetivo} color={ac()}/> : null}
                </div>
                
                {(av.peso || av.altura) && (
                  <div className="weight-height-container" style={{ borderTop:"1px solid "+T.borderLight, paddingTop:12, display:"grid", gridTemplateColumns:(av.peso && av.altura) ? "1fr 1fr" : "1fr", gap:10 }}>
                    {av.peso && (
                      <div className="weight-height-box" style={{ display:"flex", justifyContent:"space-between", padding:"6px 12px", background:T.bg, borderRadius:8 }}>
                        <span style={{ fontSize:12, color:T.sub }}>{t("peso", lang)}</span>
                        <span style={{ fontSize:14, fontWeight:700 }}>{toSystemWeight(av.peso, unitSystem)} {getWeightUnit(unitSystem)}</span>
                      </div>
                    )}
                    {av.altura && (
                      <div className="weight-height-box" style={{ display:"flex", justifyContent:"space-between", padding:"6px 12px", background:T.bg, borderRadius:8 }}>
                        <span style={{ fontSize:12, color:T.sub }}>{t("altura", lang)}</span>
                        <span style={{ fontSize:14, fontWeight:700 }}>{formatHeight(av.altura, unitSystem)}</span>
                      </div>
                    )}
                  </div>
                )}

                {(imc || rcqVal || tmb) && (
                  <div className="indices-container" style={{ display:"grid", gridTemplateColumns: [imc, rcqVal, tmb].filter(Boolean).length === 3 ? "1fr 1fr 1fr" : [imc, rcqVal, tmb].filter(Boolean).length === 2 ? "1fr 1fr" : "1fr", gap:10, marginTop:10 }}>
                    {imc && (
                      <Card className="indices-card" sx={{ padding:12, background:T.bg }}>
                        <div style={{ fontSize:10, color:T.muted, fontWeight:700, textTransform:"uppercase" }}>IMC</div>
                        <div style={{ fontSize:20, fontWeight:800, color:imcCol, marginTop:3 }}>{imc}</div>
                        {imcLbl && <div style={{ fontSize:11, color:imcCol, fontWeight:600, marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t(imcLbl, lang)}</div>}
                      </Card>
                    )}
                    {rcqVal && (
                      <Card className="indices-card" sx={{ padding:12, background:T.bg }}>
                        <div style={{ fontSize:10, color:T.muted, fontWeight:700, textTransform:"uppercase" }}>{lang === "en" ? "WHR" : lang === "es" ? "RCC" : "RCQ"}</div>
                        <div style={{ fontSize:20, fontWeight:800, color:rcqData ? rcqData[1] : T.text, marginTop:3 }}>{rcqVal}</div>
                        {rcqData && <div style={{ fontSize:11, color:rcqData[1], fontWeight:600, marginTop:2 }}>{t(rcqData[0], lang)}</div>}
                      </Card>
                    )}
                    {tmb && (
                      <Card className="indices-card" sx={{ padding:12, background:T.bg }}>
                        <div style={{ fontSize:10, color:T.muted, fontWeight:700, textTransform:"uppercase" }}>{lang === "en" ? "BMR (Mifflin)" : lang === "es" ? "TMB (Mifflin)" : "TMB (Mifflin)"}</div>
                        <div style={{ fontSize:20, fontWeight:800, color:ac(), marginTop:3 }}>{tmb} kcal</div>
                        <div style={{ fontSize:11, color:T.muted, fontWeight:600, marginTop:2 }}>{t("gasto_basal", lang)}</div>
                      </Card>
                    )}
                  </div>
                )}
              </Card>

              {/* 3. Composição Corporal & 4. Perimetria inside a grid if either is present */}
              {(function() {
                var comps = av.composicoes.map(function(comp, i) {
                  return { label: METODOS[comp.metodo] ? METODOS[comp.metodo].label : comp.metodo, v: compResult(av.sexo, av.idade, perimForComp, comp), i: i };
                });
                var vals = comps.filter(function(c) { return c.v && !isNaN(parseFloat(c.v)); });
                var hasComposicao = vals.length > 0;
                
                var defaultCampos = [
                  { label: "Pescoço", key: "pescoco" },
                  { label: "Ombros", key: "ombros" },
                  { label: "Peitoral", key: "peitoral" },
                  { label: "Cintura", key: "cintura" },
                  { label: "Abdominal", key: "abdominal" },
                  { label: "Quadril", key: "quadril" },
                  { label: "Braço Dir.", key: "bracoDireito" },
                  { label: "Braço Esq.", key: "bracoEsquerdo" },
                  { label: "Coxa Dir.", key: "coxaDireita" },
                  { label: "Coxa Esq.", key: "coxaEsquerda" },
                  { label: "Pant. Dir.", key: "panturrilhaDireita" },
                  { label: "Pant. Esq.", key: "panturrilhaEsquerda" }
                ];
                var campos = settings ? settings.perimetriaCampos : defaultCampos;
                var medidas = campos.filter(function(f) {
                  return av.perimetria && av.perimetria[f.key] && av.perimetria[f.key].trim() !== "";
                });
                var hasPerimetria = medidas.length > 0;
                
                if (!hasComposicao && !hasPerimetria) return null;
                
                var media = vals.length >= 2 ? (vals.reduce(function(s, c) { return s + parseFloat(c.v); }, 0) / vals.length).toFixed(1) : (vals.length === 1 ? vals[0].v : null);
                var pct = media ? parseFloat(media)/100 : null;
                var peso = parseFloat(av.peso);
                
                return (
                  <div className={(hasComposicao && hasPerimetria) ? "print-grid-2-col" : ""} style={{ marginTop: 20 }}>
                    {hasComposicao && (
                      <Card className="print-card" sx={{ padding:18 }}>
                        <div style={{ fontSize:12, fontWeight:700, color:T.sub, textTransform:"uppercase", letterSpacing:0.6, marginBottom:12, borderBottom:"1px solid "+T.borderLight, paddingBottom:6 }}>
                          {t("composicao", lang)}
                        </div>
                        {vals.length >= 2 && comps.map(function(item) {
                          if (!item.v) return null;
                          return (
                            <div key={item.i} style={{ padding:"8px 0", borderBottom:"1px solid "+T.borderLight, display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:13 }}>
                              <span style={{ color:T.sub }}>{(lang === "en" ? "Evaluation " : lang === "es" ? "Evaluación " : "Avaliação ") + (item.i+1) + " (" + t(item.label, lang) + ")"}</span>
                              <span style={{ fontWeight:700, color: pctColor(item.v) }}>{item.v + "%"}</span>
                            </div>
                          );
                        })}
                        {media && (
                          <div style={{ marginTop: vals.length >= 2 ? 12 : 0, background:acL(), border:"1px solid "+ac()+"20", borderRadius:10, padding:12 }}>
                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                              <strong style={{ fontSize:14 }}>
                                {(vals.length === 1 ? (t("gordura_corporal", lang) + " (" + t(vals[0].label, lang) + ")") : t("gordura_corporal", lang) + " (" + (lang === "en" ? "Average" : lang === "es" ? "Promedio" : "Média") + ")")}
                              </strong>
                              <strong style={{ fontSize:20, color:pctColor(media) }}>{media + "%"}</strong>
                            </div>
                            {peso && !isNaN(peso) && pct && (
                              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                                <div style={{ background:"#FEF2F2", padding:8, borderRadius:8, textAlign:"center" }}>
                                  <div style={{ fontSize:9, color:T.danger, fontWeight:700, textTransform:"uppercase" }}>{t("massa_gorda", lang)}</div>
                                  <div style={{ fontSize:16, fontWeight:800, color:T.danger, marginTop:2 }}>{toSystemWeight(peso * pct, unitSystem)} {getWeightUnit(unitSystem)}</div>
                                </div>
                                <div style={{ background:"#E6F9F1", padding:8, borderRadius:8, textAlign:"center" }}>
                                  <div style={{ fontSize:9, color:T.success, fontWeight:700, textTransform:"uppercase" }}>{t("massa_magra", lang)}</div>
                                  <div style={{ fontSize:16, fontWeight:800, color:T.success, marginTop:2 }}>{toSystemWeight(peso * (1 - pct), unitSystem)} {getWeightUnit(unitSystem)}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </Card>
                    )}
                    
                    {hasPerimetria && (
                      <Card className="print-card" sx={{ padding:18 }}>
                        <div style={{ fontSize:12, fontWeight:700, color:T.sub, textTransform:"uppercase", letterSpacing:0.6, marginBottom:12, borderBottom:"1px solid "+T.borderLight, paddingBottom:6 }}>
                          {t("perimetria_circunferencias", lang)}
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                          {medidas.map(function(f) {
                            var val = av.perimetria[f.key];
                            return (
                              <div key={f.key} style={{ background:T.bg, padding:"6px 8px", borderRadius:8, textAlign:"center" }}>
                                  <div style={{ fontSize:9, color:T.muted, fontWeight:600 }}>{t(f.label, lang)}</div>
                                  <div style={{ fontSize:14, fontWeight:700, color:T.text, marginTop:2 }}>{toSystemLength(val, unitSystem) + " " + getLengthUnit(unitSystem)}</div>
                                </div>
                            );
                          })}
                        </div>
                      </Card>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* PÁGINA 2 - HISTÓRICO & ANAMNESE */}
            {(function() {
              var respondidas = av.anamnese.filter(function(q) { return q.resposta && q.resposta.trim() !== ""; });
              if (respondidas.length === 0) return null;
              return (
                <div className="print-page-2">
                  <Card className={"print-card print-full-width anamnese-print-card " + (
                    respondidas.length <= 6 ? "anamnese-print-density-low" :
                    respondidas.length <= 12 ? "anamnese-print-density-medium" :
                    "anamnese-print-density-high"
                  )} sx={{ padding:18 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:T.sub, textTransform:"uppercase", letterSpacing:0.6, marginBottom:12, borderBottom:"1px solid "+T.borderLight, paddingBottom:6 }}>
                      {t("historico_anamnese", lang)}
                    </div>
                    <div className="print-anamnese-container">
                      {respondidas.map(function(q) {
                        return (
                           <div key={q.id} className="print-anamnese-row">
                             <strong style={{ color:T.sub, display: "block", marginBottom: 2 }}>{t(q.pergunta, lang) || (lang === "en" ? "Untitled question" : lang === "es" ? "Pregunta sin título" : "Pergunta sem título")}</strong>
                             <span style={{ color: T.text }}>{q.resposta === "Sim" ? (lang === "en" ? "Yes" : lang === "es" ? "Sí" : "Sim") : q.resposta === "Não" ? (lang === "en" ? "No" : lang === "es" ? "No" : "Não") : q.resposta}</span>
                           </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              );
            })()}

            {/* PÁGINA 3 - DESEMPENHO E ACOMPANHAMENTO VISUAL */}
            {(function() {
              var validTestes = av.testes.filter(function(tItem) { return tItem.exercicio && tItem.exercicio.trim() !== ""; });
              var hasForca = validTestes.length > 0;
              
              var flex = av.flexibilidade || {};
              var hasWells = flex.wells && flex.wells.trim() !== "";
              var hasAngulo = flex.anguloPopliteo && flex.anguloPopliteo.trim() !== "";
              var hasThomas = flex.thomas && flex.thomas.trim() !== "";
              var hasFlex = hasWells || hasAngulo || hasThomas;
              
              var card = av.cardiovascular || {};
              var isCooper = (card.tipoTeste || "cooper") === "cooper";
              var hasCooper = isCooper && card.cooper && card.cooper.trim() !== "";
              var hasEsteira = !isCooper && card.esteiraVelocidade && card.esteiraVelocidade.trim() !== "";
              var hasCardioTest = hasCooper || hasEsteira;
              var hasFCRep = card.fcRepouso && card.fcRepouso.trim() !== "";
              var hasFCRec = card.fcRecuperacao && card.fcRecuperacao.trim() !== "";
              var hasFCMax = card.fcMax && card.fcMax.trim() !== "";
              var hasPA = card.pressaoArterial && card.pressaoArterial.trim() !== "";
              var estFCMax = av.idade ? (220 - parseInt(av.idade)).toString() : "";
              var showFCMax = hasFCMax || estFCMax;
              var hasCardio = hasCardioTest || hasFCRep || hasFCRec || hasPA || hasFCMax;
              
              var hasFotos = av.fotos && (av.fotos.frente || av.fotos.lado || av.fotos.costas);
              
              if (!hasForca && !hasFlex && !hasCardio && !hasFotos) return null;
              
              var vo2 = isCooper 
                ? calcVO2Cooper(card.cooper) 
                : calcVO2Esteira(card.esteiraVelocidade, card.esteiraInclinacao);
              var vo2Class = vo2 ? classificarVO2(av.sexo, av.idade, vo2) : null;
              
              var fcFolds = [hasFCRep, hasFCRec, showFCMax].filter(Boolean);
              var fcColsStyle = fcFolds.length === 3 ? "1fr 1fr 1fr" : fcFolds.length === 2 ? "1fr 1fr" : "1fr";
              
              return (
                <div className="print-page-3">
                  {/* Grid de Força e Flexibilidade */}
                  {(hasForca || hasFlex) && (
                    <div className={(hasForca && hasFlex) ? "print-grid-2-col" : ""}>
                      {hasForca && (
                        <Card className="print-card" sx={{ padding:18 }}>
                          <div style={{ fontSize:12, fontWeight:700, color:T.sub, textTransform:"uppercase", letterSpacing:0.6, marginBottom:12, borderBottom:"1px solid "+T.borderLight, paddingBottom:6 }}>
                            {t("forca", lang)}
                          </div>
                          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                            {validTestes.map(function(tItem) {
                              return (
                                <div key={tItem.id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 10px", background:T.bg, borderRadius:8 }}>
                                  <span style={{ fontWeight:600, fontSize:13 }}>{t(tItem.exercicio, lang) || tItem.exercicio}</span>
                                  <span style={{ fontSize:13, fontWeight:700, color:ac() }}>
                                    {tItem.carga ? toSystemWeight(tItem.carga, unitSystem) + " " + getWeightUnit(unitSystem) : "—"} {tItem.reps ? '(' + tItem.reps + ' reps)' : ""}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </Card>
                      )}
                      
                      {hasFlex && (
                        <Card key="flexibilidade-res" className="print-card" sx={{ padding:18 }}>
                          <div style={{ fontSize:12, fontWeight:700, color:T.sub, textTransform:"uppercase", letterSpacing:0.6, marginBottom:12, borderBottom:"1px solid "+T.borderLight, paddingBottom:6 }}>
                            {t("flexibilidade", lang)}
                          </div>
                          <div style={{ display:"grid", gridTemplateColumns: [hasWells, hasAngulo, hasThomas].filter(Boolean).length === 3 ? "1fr 1fr 1fr" : [hasWells, hasAngulo, hasThomas].filter(Boolean).length === 2 ? "1fr 1fr" : "1fr", gap:10 }} className="flex-grid-container">
                            {hasWells && (
                              <div style={{ background:T.bg, padding:"6px 8px", borderRadius:8, textAlign:"center" }} className="flex-box">
                                <div style={{ fontSize:9, color:T.muted, fontWeight:600 }}>{t("sentar_alcancar_wells", lang)}</div>
                                <div style={{ fontSize:14, fontWeight:700, color:T.text, marginTop:2 }}>{flex.wells} cm</div>
                              </div>
                            )}
                            {hasAngulo && (
                              <div style={{ background:T.bg, padding:"6px 8px", borderRadius:8, textAlign:"center" }} className="flex-box">
                                <div style={{ fontSize:9, color:T.muted, fontWeight:600 }}>{t("angulo_popliteo", lang)}</div>
                                <div style={{ fontSize:14, fontWeight:700, color:T.text, marginTop:2 }}>{flex.anguloPopliteo}°</div>
                              </div>
                            )}
                            {hasThomas && (
                              <div style={{ background:T.bg, padding:"6px 8px", borderRadius:8, textAlign:"center" }} className="flex-box">
                                <div style={{ fontSize:9, color:T.muted, fontWeight:600 }}>{t("teste_thomas", lang)}</div>
                                <div style={{ fontSize:14, fontWeight:700, color:T.text, marginTop:2 }}>{t(flex.thomas, lang)}</div>
                              </div>
                            )}
                          </div>
                        </Card>
                      )}
                    </div>
                  )}

                  {/* Cardiovascular */}
                  {hasCardio && (
                    <Card key="cardiovascular-res" className="print-card print-full-width" sx={{ padding:18, marginTop: (hasForca || hasFlex) ? 20 : 0 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:T.sub, textTransform:"uppercase", letterSpacing:0.6, marginBottom:12, borderBottom:"1px solid "+T.borderLight, paddingBottom:6 }}>
                        {t("cardiovascular", lang)}
                      </div>
                      <div className="cardio-grid-container" style={{ display:"grid", gridTemplateColumns: (hasCardioTest || hasPA) ? "1fr 1fr" : "1fr", gap:10, marginBottom: (hasFCRep || hasFCRec || showFCMax) ? 10 : 0 }}>
                        {hasCooper && (
                          <div className="cardio-box" style={{ background:T.bg, padding:"6px 8px", borderRadius:8, textAlign:"center" }}>
                            <div style={{ fontSize:9, color:T.muted, fontWeight:600 }}>{t("teste_cooper_12", lang)}</div>
                            <div style={{ fontSize:14, fontWeight:700, color:T.text, marginTop:2 }}>{toSystemCooperDist(card.cooper, unitSystem)} {getCooperUnit(unitSystem)}</div>
                            {vo2 && (
                              <div style={{ fontSize:10, color:ac(), fontWeight:600, marginTop:3 }}>
                                {t("vo2_max_estimado", lang) + ": " + vo2 + " ml/kg/min" + (vo2Class ? " (" + t(vo2Class[0], lang) + ")" : "")}
                              </div>
                            )}
                          </div>
                        )}
                        {hasEsteira && (
                          <div className="cardio-box" style={{ background:T.bg, padding:"6px 8px", borderRadius:8, textAlign:"center" }}>
                            <div style={{ fontSize:9, color:T.muted, fontWeight:600 }}>{t("teste_esteira_inc", lang)}</div>
                            <div style={{ fontSize:14, fontWeight:700, color:T.text, marginTop:2 }}>
                              {toSystemSpeed(card.esteiraVelocidade, unitSystem)} {getSpeedUnit(unitSystem)} {card.esteiraInclinacao ? "· " + card.esteiraInclinacao + "%" : ""}
                            </div>
                            {vo2 && (
                              <div style={{ fontSize:10, color:ac(), fontWeight:600, marginTop:3 }}>
                                {t("vo2_max_estimado", lang) + ": " + vo2 + " ml/kg/min" + (vo2Class ? " (" + t(vo2Class[0], lang) + ")" : "")}
                              </div>
                            )}
                          </div>
                        )}
                        {hasPA && (
                          <div className="cardio-box" style={{ background:T.bg, padding:"6px 8px", borderRadius:8, textAlign:"center" }}>
                            <div style={{ fontSize:9, color:T.muted, fontWeight:600 }}>{t("pressao_arterial", lang)}</div>
                            <div style={{ fontSize:14, fontWeight:700, color:T.text, marginTop:2 }}>{card.pressaoArterial}</div>
                          </div>
                        )}
                      </div>
                      <div className="cardio-fc-container" style={{ display:"grid", gridTemplateColumns: fcColsStyle, gap:10 }}>
                        {hasFCRep && (
                          <div className="cardio-box" style={{ background:T.bg, padding:"6px 8px", borderRadius:8, textAlign:"center" }}>
                            <div style={{ fontSize:9, color:T.muted, fontWeight:600 }}>{t("fc_repouso", lang)}</div>
                            <div style={{ fontSize:14, fontWeight:700, color:T.text, marginTop:2 }}>{card.fcRepouso} bpm</div>
                          </div>
                        )}
                        {hasFCRec && (
                          <div className="cardio-box" style={{ background:T.bg, padding:"6px 8px", borderRadius:8, textAlign:"center" }}>
                            <div style={{ fontSize:9, color:T.muted, fontWeight:600 }}>{t("fc_recuperacao", lang)}</div>
                            <div style={{ fontSize:14, fontWeight:700, color:T.text, marginTop:2 }}>{card.fcRecuperacao} bpm</div>
                          </div>
                        )}
                        {showFCMax && (
                          <div className="cardio-box" style={{ background:T.bg, padding:"6px 8px", borderRadius:8, textAlign:"center" }}>
                            <div style={{ fontSize:9, color:T.muted, fontWeight:600 }}>{hasFCMax ? t("fc_max_medida", lang) : (lang === "en" ? "Est. Max HR" : "FC Máxima (Est.)")}</div>
                            <div style={{ fontSize:14, fontWeight:700, color:hasFCMax ? T.text : T.muted, marginTop:2 }}>{hasFCMax ? card.fcMax : estFCMax} bpm</div>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}
                  {/* 6. Fotos */}
                  {hasFotos && (
                    <Card className="print-card print-full-width" sx={{ padding:18, marginTop: 20 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:T.sub, textTransform:"uppercase", letterSpacing:0.6, marginBottom:12, borderBottom:"1px solid "+T.borderLight, paddingBottom:6 }}>
                        {t("acompanhamento_visual", lang)}
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:8 }}>
                        {av.fotos.frente && (
                          <div style={{ textAlign:"center" }}>
                            <div style={{ fontSize:10, color:T.muted, marginBottom:4 }}>{t("frente", lang)}</div>
                            <img src={av.fotos.frente} alt={t("frente", lang)} style={{ width:"100%", aspectRatio:"3/4", objectFit:"cover", borderRadius:8 }}/>
                          </div>
                        )}
                        {av.fotos.lado && (
                          <div style={{ textAlign:"center" }}>
                            <div style={{ fontSize:10, color:T.muted, marginBottom:4 }}>{t("lado", lang)}</div>
                            <img src={av.fotos.lado} alt={t("lado", lang)} style={{ width:"100%", aspectRatio:"3/4", objectFit:"cover", borderRadius:8 }}/>
                          </div>
                        )}
                        {av.fotos.costas && (
                          <div style={{ textAlign:"center" }}>
                            <div style={{ fontSize:10, color:T.muted, marginBottom:4 }}>{t("costas", lang)}</div>
                            <img src={av.fotos.costas} alt={t("costas", lang)} style={{ width:"100%", aspectRatio:"3/4", objectFit:"cover", borderRadius:8 }}/>
                          </div>
                        )}
                      </div>
                      {av.observacaoFotos && (
                        <div style={{ marginTop:10, padding:10, background:T.bg, borderRadius:8, fontSize:12, fontStyle:"italic", color:T.sub }}>
                          "{av.observacaoFotos}"
                        </div>
                      )}
                    </Card>
                  )}
                </div>
              );
            })()}

            <div className="no-print" style={{ display: "flex", gap: 12, width: "100%" }}>
              <div style={{ flex: 1 }}>
                <Btn full variant="outline" onClick={enviarAluno} style={{ borderColor: ac(), color: ac() }}>
                  {lang === "en" ? "Send Online Form" : lang === "es" ? "Enviar Formulario Online" : "Enviar Formulário Online"}
                </Btn>
              </div>
              <div style={{ flex: 1 }}>
                <Btn full onClick={finalizar} icon={<IcCheck c="#fff" s={16}/>}>{t("finalizar_avaliacao_btn", lang)}</Btn>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}

// ── COMPARAR ──────────────────────────────────────────────────────────────────
function CompararScreen({ aluno, initAv1, initAv2, initSelected, onBack, settings, trainer }) {
  const lang = (trainer && trainer.lang) || "pt";
  const unitSystem = (trainer && trainer.unitSystem) || "metric";
  var avs = (aluno && aluno.avaliacoes) ? aluno.avaliacoes : [];
  
  const [selectedIndexes, setSelectedIndexes] = useState(function() {
    if (initSelected && Array.isArray(initSelected) && initSelected.length >= 2) {
      return initSelected;
    }
    if (initAv1 !== undefined && initAv2 !== undefined) {
      return [initAv1, initAv2];
    }
    var indices = [];
    if (avs.length > 0) indices.push(0);
    if (avs.length > 1) indices.push(avs.length - 1);
    return indices;
  });

  var acc = ac();

  if (avs.length < 2) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button onClick={onBack} style={{ background: "none", border: "1.5px solid " + T.border, borderRadius: 10, padding: "8px 10px", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <IcBack c={T.sub} s={18}/>
          </button>
          <span style={{ fontWeight: 800, fontSize: 18 }}>{t("comparar", lang)}</span>
        </div>
        <div style={{ color: T.muted }}>{t("comparar_erro_duas_av", lang)}</div>
      </div>
    );
  }

  var sortedSelected = [...selectedIndexes].sort(function(a, b) { return a - b; });
  var av1 = avs[sortedSelected[0]];
  var av2 = avs[sortedSelected[sortedSelected.length - 1]];

  if (!av1 || !av2) return <div style={{ padding:40, textAlign:"center", color:T.muted }}>{t("avaliacoes_nao_encontradas", lang)}</div>;

  function delta(a, b) {
    if (!a || !b) return null;
    var d = (parseFloat(b) - parseFloat(a)).toFixed(1);
    return { val: d, neg: parseFloat(d) < 0 };
  }

  function renderDelta(v1, v2, goodDecreasing = true) {
    if (v1 === undefined || v1 === null || v1 === "" || v2 === undefined || v2 === null || v2 === "") return null;
    var d = (parseFloat(v2) - parseFloat(v1)).toFixed(1);
    var num = parseFloat(d);
    if (isNaN(num) || num === 0) return null;
    var isPositive = num > 0;
    var isGood = (isPositive && !goodDecreasing) || (!isPositive && goodDecreasing);
    
    var bgCol = isGood ? "#E6F9F1" : "#FEF2F2";
    var txtCol = isGood ? T.success : T.danger;
    var sign = isPositive ? "+" : "";
    return (
      <span style={{ fontSize:11, fontWeight:700, padding:"2px 6px", borderRadius:10, background: bgCol, color: txtCol, display:"inline-block" }}>
        {sign + d}
      </span>
    );
  }

  function renderChartDeltaMessage(val1, val2, labelKey, unit, goodDecreasing = true, customLabelStr) {
    var v1 = parseFloat(val1);
    var v2 = parseFloat(val2);
    if (isNaN(v1) || isNaN(v2)) return null;
    var d = v2 - v1;
    var absD = Math.abs(d).toFixed(1);
    
    var translatedLabel = customLabelStr || t(labelKey, lang);
    if (labelKey.startsWith("carga no ")) {
      const exName = labelKey.replace("carga no ", "");
      const translatedEx = t(exName, lang) || exName;
      if (lang === "en") translatedLabel = `load on ${translatedEx}`;
      else if (lang === "es") translatedLabel = `carga en ${translatedEx}`;
      else translatedLabel = `carga no ${translatedEx}`;
    }

    if (d === 0) {
      return (
        <div style={{ fontSize:12, color:T.sub, marginTop:8, display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ color:T.muted }}>●</span>
          <span>
            {lang === "en" ? <>There was no change in <strong>{translatedLabel}</strong> during this period.</> :
             lang === "es" ? <>No hubo cambios en <strong>{translatedLabel}</strong> en este período.</> :
             <>Não houve alteração no <strong>{translatedLabel}</strong> neste período.</>}
          </span>
        </div>
      );
    }
    
    var isIncrease = d > 0;
    var isGood = (isIncrease && !goodDecreasing) || (!isIncrease && goodDecreasing);
    
    var actionText = "";
    const isWeightOrMass = labelKey === "peso" || labelKey === "massaMagra" || labelKey === "massaGorda";
    if (isWeightOrMass) {
      if (isIncrease) {
        actionText = lang === "en" ? "gained" : lang === "es" ? "ganó" : "ganhou";
      } else {
        actionText = lang === "en" ? "lost" : lang === "es" ? "perdió" : "perdeu";
      }
    } else {
      if (isIncrease) {
        actionText = lang === "en" ? "increased" : lang === "es" ? "aumentó" : "aumentou";
      } else {
        actionText = lang === "en" ? "decreased" : lang === "es" ? "disminuyó" : "diminuiu";
      }
    }
    
    var color = isGood ? T.success : T.danger;
    var icon = isIncrease ? "▲" : "▼";
    
    return (
      <div style={{ fontSize:12, color:T.text, marginTop:8, padding:"8px 12px", background:T.bg, borderRadius:8, display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ color: color, fontWeight: 700, fontSize: 13 }}>{icon} {absD + unit}</span>
        <span>
          {lang === "en" ? <>During this period, you <strong>{actionText} {absD + unit}</strong> of {translatedLabel}.</> :
           lang === "es" ? <>En este período, usted <strong>{actionText} {absD + unit}</strong> de {translatedLabel}.</> :
           <>Neste período, você <strong>{actionText} {absD + unit}</strong> de {translatedLabel}.</>}
        </span>
      </div>
    );
  }

  function renderHistoryLineChart(title, data, dataKey, color, unit = "", label = "", goodDecreasing = true, val1 = null, val2 = null) {
    var filtered = data.filter(function(d) { return d[dataKey] !== null; });
    if (filtered.length < 1) return null;
    
    var v1 = (val1 !== null && val1 !== undefined && val1 !== "") ? val1 : (filtered.length >= 1 ? filtered[0][dataKey] : null);
    var v2 = (val2 !== null && val2 !== undefined && val2 !== "") ? val2 : (filtered.length >= 1 ? filtered[filtered.length - 1][dataKey] : null);
    
    var hasComparison = v1 !== null && v1 !== undefined && v1 !== "" && v2 !== null && v2 !== undefined && v2 !== "" && filtered.length >= 2;
    
    return (
      <Card className="print-card" sx={{ padding:15 }}>
        <div style={{ fontSize:10, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:0.5, marginBottom:10 }}>{title}</div>
        {filtered.length >= 1 && (
          <>
            {/* Bloco de Tela: usa ResponsiveContainer e some no print */}
            <div style={{ height:130, marginBottom:10 }} className="no-print">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filtered} margin={{ top:18, right:25, left:-22, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
                  <XAxis dataKey="shortName" tick={{ fontSize:9, fill:T.muted }} padding={{ left: 15, right: 20 }}/>
                  <YAxis tick={{ fontSize:9, fill:T.muted }} domain={["auto","auto"]} padding={{ top: 15 }}/>
                  <Tooltip cursor={false} formatter={function(value) { return [value + unit, title]; }} contentStyle={{ background:T.surface, border:"1px solid "+T.border, borderRadius:8, fontSize:11 }}/>
                  <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ fill:color, r:3 }} activeDot={{ r:5 }}>
                    <LabelList dataKey={dataKey} position="top" offset={10} style={{ fill:T.text, fontSize:10, fontWeight:700 }} formatter={function(v) { return v !== null && v !== undefined ? v + unit : ""; }} />
                  </Line>
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Bloco de Impressão: NÃO usa ResponsiveContainer, tem tamanho fixo e aparece apenas no print */}
            <div className="print-only" style={{ marginBottom:10 }}>
              <LineChart width={270} height={120} data={filtered} margin={{ top:18, right:20, left:-24, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
                <XAxis dataKey="shortName" tick={{ fontSize:9, fill:T.muted }} padding={{ left: 15, right: 20 }}/>
                <YAxis tick={{ fontSize:9, fill:T.muted }} domain={["auto","auto"]} padding={{ top: 15 }}/>
                <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ fill:color, r:3 }}>
                  <LabelList dataKey={dataKey} position="top" offset={10} style={{ fill:T.text, fontSize:9, fontWeight:700 }} formatter={function(v) { return v !== null && v !== undefined ? v + unit : ""; }} />
                </Line>
              </LineChart>
            </div>
          </>
        )}
        {hasComparison ? (
          renderChartDeltaMessage(v1, v2, label, unit, goodDecreasing)
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
            {filtered.map(function(pt) {
              return (
                <span key={pt.shortName} style={{ fontSize: 11, background: T.bg, padding: "4px 8px", borderRadius: 6, color: T.sub, display: "inline-block" }}>
                  {pt.shortName}: <strong>{pt[dataKey] + unit}</strong>
                </span>
              );
            })}
          </div>
        )}
      </Card>
    );
  }

  // Composição Corporal Calculations
  var perimForComp1 = Object.assign({}, av1.perimetria, { altura: av1.altura });
  var perimForComp2 = Object.assign({}, av2.perimetria, { altura: av2.altura });
  
  var comps1 = av1.composicoes ? av1.composicoes.map(function(comp, i) {
    return { label: METODOS[comp.metodo] ? METODOS[comp.metodo].label : comp.metodo, v: compResult(av1.sexo, av1.idade, perimForComp1, comp), i: i };
  }) : [];
  var vals1 = comps1.filter(function(c) { return c.v && !isNaN(parseFloat(c.v)); });
  var mediaGordura1 = vals1.length >= 2 ? (vals1.reduce(function(s, c) { return s + parseFloat(c.v); }, 0) / vals1.length).toFixed(1) : (vals1.length === 1 ? vals1[0].v : null);

  var comps2 = av2.composicoes ? av2.composicoes.map(function(comp, i) {
    return { label: METODOS[comp.metodo] ? METODOS[comp.metodo].label : comp.metodo, v: compResult(av2.sexo, av2.idade, perimForComp2, comp), i: i };
  }) : [];
  var vals2 = comps2.filter(function(c) { return c.v && !isNaN(parseFloat(c.v)); });
  var mediaGordura2 = vals2.length >= 2 ? (vals2.reduce(function(s, c) { return s + parseFloat(c.v); }, 0) / vals2.length).toFixed(1) : (vals2.length === 1 ? vals2[0].v : null);

  var peso1 = parseFloat(av1.peso);
  var peso2 = parseFloat(av2.peso);
  
  var fatPct1 = mediaGordura1 ? parseFloat(mediaGordura1) : null;
  var fatPct2 = mediaGordura2 ? parseFloat(mediaGordura2) : null;
  
  var massaGorda1 = (peso1 && fatPct1) ? (peso1 * (fatPct1 / 100)).toFixed(1) : null;
  var massaGorda2 = (peso2 && fatPct2) ? (peso2 * (fatPct2 / 100)).toFixed(1) : null;
  
  var massaMagra1 = (peso1 && fatPct1) ? (peso1 * (1 - fatPct1 / 100)).toFixed(1) : null;
  var massaMagra2 = (peso2 && fatPct2) ? (peso2 * (1 - fatPct2 / 100)).toFixed(1) : null;

  var peso1Converted = peso1 ? parseFloat(toSystemWeight(peso1, unitSystem)) : null;
  var peso2Converted = peso2 ? parseFloat(toSystemWeight(peso2, unitSystem)) : null;
  var massaGorda1Converted = massaGorda1 ? parseFloat(toSystemWeight(massaGorda1, unitSystem)) : null;
  var massaGorda2Converted = massaGorda2 ? parseFloat(toSystemWeight(massaGorda2, unitSystem)) : null;
  var massaMagra1Converted = massaMagra1 ? parseFloat(toSystemWeight(massaMagra1, unitSystem)) : null;
  var massaMagra2Converted = massaMagra2 ? parseFloat(toSystemWeight(massaMagra2, unitSystem)) : null;

  // Skinfolds
  var dobrasList = [
    ["Tríceps", "tricipital"],
    ["Subescapular", "subescapular"],
    ["Peitoral", "peitoral"],
    ["Axilar Média", "axilarMedia"],
    ["Suprailíaca", "suprailiaca"],
    ["Abdominal", "abdominal"],
    ["Coxa", "coxa"],
    ["Bíceps", "bicipital"],
    ["Panturrilha", "panturrilha"]
  ];
  
  function getDobraVal(av, key) {
    if (!av.composicoes) return null;
    for (var i = 0; i < av.composicoes.length; i++) {
      var c = av.composicoes[i];
      if (c.dobras && c.dobras[key] !== undefined && c.dobras[key] !== "") {
        return c.dobras[key];
      }
    }
    return null;
  }

  var activeDobras = dobrasList.filter(function(pair) {
    var key = pair[1];
    var v1 = getDobraVal(av1, key);
    var v2 = getDobraVal(av2, key);
    return (v1 !== null && v1 !== "") || (v2 !== null && v2 !== "");
  });

  // Perimetria
  var defaultCampos = [
    { label: "Pescoço", key: "pescoco" },
    { label: "Ombros", key: "ombros" },
    { label: "Peitoral", key: "peitoral" },
    { label: "Cintura", key: "cintura" },
    { label: "Abdominal", key: "abdominal" },
    { label: "Quadril", key: "quadril" },
    { label: "Braço Dir.", key: "bracoDireito" },
    { label: "Braço Esq.", key: "bracoEsquerdo" },
    { label: "Coxa Dir.", key: "coxaDireita" },
    { label: "Coxa Esq.", key: "coxaEsquerda" },
    { label: "Panturrilha Dir.", key: "panturrilhaDireita" },
    { label: "Panturrilha Esq.", key: "panturrilhaEsquerda" }
  ];
  var camposPerim = settings ? settings.perimetriaCampos : defaultCampos;
  var activePerims = camposPerim.filter(function(f) {
    var v1 = av1.perimetria && av1.perimetria[f.key];
    var v2 = av2.perimetria && av2.perimetria[f.key];
    return (v1 !== undefined && v1 !== "") || (v2 !== undefined && v2 !== "");
  });

  // RCQ Calculation
  var rcq1 = calcRCQ(av1.perimetria ? av1.perimetria.cintura : null, av1.perimetria ? av1.perimetria.quadril : null);
  var rcq2 = calcRCQ(av2.perimetria ? av2.perimetria.cintura : null, av2.perimetria ? av2.perimetria.quadril : null);
  var rcqHistory = sortedSelected.map(function(idx) {
    var a = avs[idx];
    if (!a || !a.perimetria) return { shortName: (idx + 1) + "º", rcq: null };
    var rcqVal = calcRCQ(a.perimetria.cintura, a.perimetria.quadril);
    return {
      shortName: (idx + 1) + "º",
      rcq: rcqVal ? parseFloat(rcqVal) : null
    };
  }).filter(function(pt) { return pt.rcq !== null; });

  // History Comp Data for unified line charts (only selected evaluations)
  var historyCompData = sortedSelected.map(function(idx) {
    var a = avs[idx];
    if (!a) return {};
    var pForComp = Object.assign({}, a.perimetria, { altura: a.altura });
    var comps = a.composicoes ? a.composicoes.map(function(comp, i) {
      return { label: METODOS[comp.metodo] ? METODOS[comp.metodo].label : comp.metodo, v: compResult(a.sexo, a.idade, pForComp, comp), i: i };
    }) : [];
    var vals = comps.filter(function(c) { return c.v && !isNaN(parseFloat(c.v)); });
    var fatPct = vals.length >= 2 ? parseFloat((vals.reduce(function(s, c) { return s + parseFloat(c.v); }, 0) / vals.length).toFixed(1)) : (vals.length === 1 ? parseFloat(vals[0].v) : null);
    
    var pesoVal = parseFloat(a.peso || 0);
    var leanMass = (pesoVal && fatPct) ? parseFloat((pesoVal * (1 - fatPct / 100)).toFixed(1)) : null;
    var fatMass = (pesoVal && fatPct) ? parseFloat((pesoVal * (fatPct / 100)).toFixed(1)) : null;
    
    var pesoConverted = pesoVal ? parseFloat(toSystemWeight(pesoVal, unitSystem)) : null;
    var leanMassConverted = leanMass ? parseFloat(toSystemWeight(leanMass, unitSystem)) : null;
    var fatMassConverted = fatMass ? parseFloat(toSystemWeight(fatMass, unitSystem)) : null;
    
    return {
      shortName: (idx + 1) + "º",
      name: (idx + 1) + "º (" + fmtDate(a.data) + ")",
      peso: pesoConverted,
      gordura: fatPct || null,
      massaMagra: leanMassConverted,
      massaGorda: fatMassConverted
    };
  });

  var pesoHistory = historyCompData.filter(function(pt) { return pt.peso !== null; });
  var fatHistory = historyCompData.filter(function(pt) { return pt.gordura !== null; });
  var leanHistory = historyCompData.filter(function(pt) { return pt.massaMagra !== null; });
  var fatMassHistory = historyCompData.filter(function(pt) { return pt.massaGorda !== null; });

  // Testes de força
  var allExercises = [];
  var testes1 = av1.testes || [];
  var testes2 = av2.testes || [];
  testes1.forEach(function(t) {
    if (t.exercicio && allExercises.indexOf(t.exercicio) < 0) allExercises.push(t.exercicio);
  });
  testes2.forEach(function(t) {
    if (t.exercicio && allExercises.indexOf(t.exercicio) < 0) allExercises.push(t.exercicio);
  });
  function findTeste(testes, ex) {
    return testes.find(function(t) { return t.exercicio === ex; });
  }

  function getExerciseHistory(exerciseName) {
    return sortedSelected.map(function(idx) {
      var a = avs[idx];
      if (!a) return { shortName: (idx + 1) + "º", carga: null, reps: null, data: null };
      var t = a.testes ? a.testes.find(function(item) { return item.exercicio === exerciseName; }) : null;
      var rawCarga = (t && t.carga && !isNaN(parseFloat(t.carga))) ? parseFloat(t.carga) : null;
      var convertedCarga = rawCarga ? parseFloat(toSystemWeight(rawCarga, unitSystem)) : null;
      return {
        shortName: (idx + 1) + "º",
        data: a.data,
        carga: convertedCarga,
        reps: (t && t.reps) ? t.reps : null
      };
    }).filter(function(pt) { return pt.carga !== null; });
  }

  // Flexibilidade
  var flex1 = av1.flexibilidade || {};
  var flex2 = av2.flexibilidade || {};
  var hasFlexCompare = flex1.wells || flex2.wells || flex1.anguloPopliteo || flex2.anguloPopliteo || flex1.thomas || flex2.thomas;

  // Cardiovascular
  var card1 = av1.cardiovascular || {};
  var card2 = av2.cardiovascular || {};
  var vo2_1 = (card1.tipoTeste === "cooper" && card1.cooper) ? calcVO2Cooper(card1.cooper) : ((card1.esteiraVelocidade) ? calcVO2Esteira(card1.esteiraVelocidade, card1.esteiraInclinacao) : null);
  var vo2_2 = (card2.tipoTeste === "cooper" && card2.cooper) ? calcVO2Cooper(card2.cooper) : ((card2.esteiraVelocidade) ? calcVO2Esteira(card2.esteiraVelocidade, card2.esteiraInclinacao) : null);
  
  var vo2History = sortedSelected.map(function(idx) {
    var a = avs[idx];
    if (!a) return { shortName: (idx + 1) + "º", vo2: null, data: null };
    var card = a.cardiovascular || {};
    var vo2 = (card.tipoTeste === "cooper" && card.cooper) ? calcVO2Cooper(card.cooper) : ((card.esteiraVelocidade) ? calcVO2Esteira(card.esteiraVelocidade, card.esteiraInclinacao) : null);
    return {
      shortName: (idx + 1) + "º",
      data: a.data,
      vo2: vo2 ? parseFloat(vo2) : null
    };
  }).filter(function(pt) { return pt.vo2 !== null; });

  var hasCardioParams = card1.fcRepouso || card2.fcRepouso || card1.fcRecuperacao || card2.fcRecuperacao || card1.fcMax || card2.fcMax || card1.pressaoArterial || card2.pressaoArterial;

  // Metabolism
  var tmb1 = calcTMB(av1.sexo, av1.peso, av1.altura, av1.idade);
  var tmb2 = calcTMB(av2.sexo, av2.peso, av2.altura, av2.idade);
  var hasMetabolismoCompare = tmb1 || tmb2;

  // Fotos
  var hasFotos1 = av1.fotos && (av1.fotos.frente || av1.fotos.lado || av1.fotos.costas);
  var hasFotos2 = av2.fotos && (av2.fotos.frente || av2.fotos.lado || av2.fotos.costas);
  var hasFotosCompare = hasFotos1 || hasFotos2;

  // Resumo metrics cards list
  const resumos = [
    { label: "Peso", val1: toSystemWeight(av1.peso, unitSystem), val2: toSystemWeight(av2.peso, unitSystem), unit: " " + getWeightUnit(unitSystem), goodDecreasing: true },
    { label: "IMC", val1: calcIMC(av1.peso, av1.altura), val2: calcIMC(av2.peso, av2.altura), unit: "", goodDecreasing: true },
    { label: "% Gordura", val1: mediaGordura1, val2: mediaGordura2, unit: " %", goodDecreasing: true },
    { label: "Massa Magra", val1: toSystemWeight(massaMagra1, unitSystem), val2: toSystemWeight(massaMagra2, unitSystem), unit: " " + getWeightUnit(unitSystem), goodDecreasing: false },
    { label: "Massa Gorda", val1: toSystemWeight(massaGorda1, unitSystem), val2: toSystemWeight(massaGorda2, unitSystem), unit: " " + getWeightUnit(unitSystem), goodDecreasing: true }
  ];

  return (
    <div style={{ padding:"16px 16px 100px" }}>
      {/* Top Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button className="no-print" onClick={onBack} style={{ background:"none", border:"1.5px solid "+T.border, borderRadius:10, padding:"8px 10px", cursor:"pointer", display:"flex", alignItems:"center" }}>
            <IcBack c={T.sub} s={18}/>
          </button>
          <div>
            <div style={{ fontSize:18, fontWeight:800 }}>{aluno ? aluno.nome : ""}</div>
            <div style={{ fontSize:12, color:T.muted }}>
              {lang === "en" ? "From " : lang === "es" ? "De " : "De "}<strong>{fmtDate(av1.data)}</strong> {lang === "en" ? "to" : lang === "es" ? "hasta" : "até"} <strong>{fmtDate(av2.data)}</strong>
            </div>
          </div>
        </div>
        <div className="no-print">
          <Btn onClick={function() { window.print(); }} icon={<IcPdf c="#fff" s={16}/>}>{t("salvar_pdf", lang)}</Btn>
        </div>
      </div>

      {/* Main Print Container */}
      <div id="print-compare-section" style={{ display:"flex", flexDirection:"column", gap:16 }}>
        {/* Title page header shown only on Print */}
        <div className="print-only" style={{ borderBottom:"2.5px solid "+acc, paddingBottom:16, marginBottom:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap: 16 }}>
            {/* Left side: Professional details */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Avatar name={trainer.nome} foto={trainer.foto} size={54} color={trainer.corPrimaria} />
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 0.8 }}>{t("avaliador", lang)}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: acc }} className="eval-name-print">{trainer.nome}</div>
                {trainer.email && <div style={{ fontSize: 11, color: T.sub, marginTop: 1 }}>{trainer.email}</div>}
                {trainer.telefone && <div style={{ fontSize: 11, color: T.sub, marginTop: 1 }}>{trainer.telefone}</div>}
              </div>
            </div>

            {/* Right side: Client/Report details */}
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.text, letterSpacing: -0.5, marginBottom: 4 }} className="compare-header-title">ShapeMap</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 0.8 }}>{t("relatorio_comparativo", lang)}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: acc, marginTop: 1 }} className="student-name-print">{aluno ? aluno.nome : ""}</div>
              <div style={{ fontSize: 11, color: T.sub, marginTop: 1 }}>
                {t("periodo", lang)} <strong>{fmtDate(av1.data)}</strong> {lang === "en" ? "to" : lang === "es" ? "a" : "a"} <strong>{fmtDate(av2.data)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Corporal Evolution Grids */}
        {(pesoHistory.length > 0 || fatHistory.length > 0) && (
          <div className={(pesoHistory.length > 0 && fatHistory.length > 0) ? "print-grid-2-col" : ""}>
            {renderHistoryLineChart(t("evolucao_peso", lang), historyCompData, "peso", acc, " " + getWeightUnit(unitSystem), "peso_lbl", true, peso1Converted, peso2Converted)}
            {renderHistoryLineChart(t("evolucao_gordura", lang), historyCompData, "gordura", T.blue, " %", "percentual_gordura_lbl", true, fatPct1, fatPct2)}
          </div>
        )}

        {(leanHistory.length > 0 || fatMassHistory.length > 0) && (
          <div className={(leanHistory.length > 0 && fatMassHistory.length > 0) ? "print-grid-2-col" : ""}>
            {renderHistoryLineChart(t("evolucao_massa_magra", lang), historyCompData, "massaMagra", T.success, " " + getWeightUnit(unitSystem), "massa_magra_lbl", false, massaMagra1Converted, massaMagra2Converted)}
            {renderHistoryLineChart(t("evolucao_massa_gorda", lang), historyCompData, "massaGorda", T.danger, " " + getWeightUnit(unitSystem), "massa_gorda_lbl", true, massaGorda1Converted, massaGorda2Converted)}
          </div>
        )}

        {/* 2. IMC & RCQ in a grid */}
        {(function() {
          var r = resumos.find(function(item) { return item.label === "IMC"; });
          var hasIMC = r && r.val1 !== undefined && r.val1 !== null && r.val1 !== "" && r.val2 !== undefined && r.val2 !== null && r.val2 !== "";
          var hasRCQ = rcqHistory.length > 0;

          if (!hasIMC && !hasRCQ) return null;

          return (
            <div className={(hasIMC && hasRCQ) ? "print-grid-2-col" : ""}>
              {hasIMC && (
                <Card className="print-card" key={r.label} sx={{ padding: 16, textAlign: "center", border: "1.5px solid " + T.border }}>
                  <div style={{ fontSize: 11, color: T.sub, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 }}>
                    {lang === "en" ? "Body Mass Index (BMI)" : lang === "es" ? "Índice de Masa Corporal (IMC)" : "Índice de Massa Corporal (IMC)"}
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", gap: 20, alignItems: "center", marginTop: 6 }}>
                    <div>
                      <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, textTransform: "uppercase" }}>{t("antes", lang)}</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: T.text }}>{r.val1}</div>
                    </div>
                    <div style={{ fontSize: 16, color: T.muted, fontWeight: 500 }}>→</div>
                    <div>
                      <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, textTransform: "uppercase" }}>{t("depois", lang)}</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: acc }}>{r.val2}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 10, display: "flex", justifyContent: "center", gap: 8, alignItems: "center" }}>
                    {renderDelta(r.val1, r.val2, r.goodDecreasing)}
                    <span style={{ fontSize: 11, fontWeight: 600, color: T.sub, background: T.bg, padding: "2px 8px", borderRadius: 10 }}>
                      {t(imcClass(r.val2)[0], lang)}
                    </span>
                  </div>
                </Card>
              )}

              {hasRCQ && (
                <Card className="print-card" sx={{ padding:15 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:0.5, marginBottom:12 }}>
                    {lang === "en" ? "Waist-to-Hip Ratio (WHR)" : lang === "es" ? "Relación Cintura-Cadera (RCC)" : "Relação Cintura-Quadril (RCQ)"}
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns: rcqHistory.length >= 2 ? "1fr 1.5fr" : "1fr", gap:14, alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:10, color:T.muted, fontWeight:600 }}>{t("calculo_rcq", lang)}</div>
                      <div style={{ fontSize:13, fontWeight:700, marginTop:4 }}>
                        {t("antes", lang)}: <strong>{rcq1 || "—"}</strong>
                      </div>
                      <div style={{ fontSize:13, fontWeight:700, marginTop:2 }}>
                        {t("depois", lang)}: <strong>{rcq2 || "—"}</strong>
                      </div>
                      <div style={{ marginTop:6 }}>
                        {rcq1 && rcq2 && renderDelta(rcq1, rcq2, true)}
                      </div>
                      {rcq2 && (function() {
                        var rsk = rcqRisk(av2.sexo, rcq2, av2.idade);
                        if (!rsk) return null;
                        return (
                          <div style={{ fontSize:11, color:T.sub, marginTop:6 }}>
                            {t("risco_pontos", lang)}<strong style={{ color: rsk[1] }}>{t(rsk[0], lang)}</strong>
                          </div>
                        );
                      })()}
                    </div>
                    {rcqHistory.length >= 2 && (
                      <>
                        {/* Bloco de Tela */}
                        <div style={{ height:110 }} className="no-print">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={rcqHistory} margin={{ top:18, right:25, left:-28, bottom:0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
                              <XAxis dataKey="shortName" tick={{ fontSize:9, fill:T.muted }} padding={{ left: 15, right: 20 }}/>
                              <YAxis tick={{ fontSize:9, fill:T.muted }} domain={["auto","auto"]} padding={{ top: 15 }}/>
                              <Tooltip cursor={false} contentStyle={{ background:T.surface, border:"1px solid "+T.border, borderRadius:8, fontSize:11 }}/>
                              <Line type="monotone" dataKey="rcq" stroke={T.warning} strokeWidth={2} dot={{ fill:T.warning, r:3 }}>
                                <LabelList dataKey="rcq" position="top" offset={10} style={{ fill:T.text, fontSize:10, fontWeight:700 }} />
                              </Line>
                            </LineChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Bloco de Impressão */}
                        <div className="print-only">
                          <LineChart width={160} height={100} data={rcqHistory} margin={{ top:18, right:15, left:-28, bottom:0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
                            <XAxis dataKey="shortName" tick={{ fontSize:9, fill:T.muted }} padding={{ left: 15, right: 20 }}/>
                            <YAxis tick={{ fontSize:9, fill:T.muted }} domain={["auto","auto"]} padding={{ top: 15 }}/>
                            <Line type="monotone" dataKey="rcq" stroke={T.warning} strokeWidth={2} dot={{ fill:T.warning, r:3 }}>
                              <LabelList dataKey="rcq" position="top" offset={10} style={{ fill:T.text, fontSize:9, fontWeight:700 }} />
                            </Line>
                          </LineChart>
                        </div>
                      </>
                    )}
                  </div>
                  {renderChartDeltaMessage(rcq1, rcq2, "rcq_lbl", "", true)}
                </Card>
              )}
            </div>
          );
        })()}

        {/* 3. Details Perimeters Table (Lado a Lado - Apenas dados) */}
        {activePerims.length > 0 && (
          <Card className="print-card" sx={{ padding:15 }}>
            <div style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:0.5, marginBottom:12 }}>
              {unitSystem === "imperial"
                ? (lang === "en" ? "Circumference Measurements (in inches)" : lang === "es" ? "Medidas de Perimetría (Circunferencias en in)" : "Medidas de Perimetria (Circunferências em in)")
                : t("medidas_perimetria_cm", lang)}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:"6px 16px" }}>
              {activePerims.map(function(f) {
                var rawV1 = av1.perimetria[f.key];
                var rawV2 = av2.perimetria[f.key];
                var v1 = rawV1 ? toSystemLength(rawV1, unitSystem) : "";
                var v2 = rawV2 ? toSystemLength(rawV2, unitSystem) : "";
                var unit = getLengthUnit(unitSystem);
                var bom = !(f.key === "cintura" || f.key === "abdominal" || f.key === "pescoco" || f.key === "quadril");
                return (
                  <div key={f.key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderBottom:"1px solid "+T.borderLight }}>
                    <span style={{ fontSize:13, color:T.sub }}>{t(f.label, lang)}</span>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:12, color:T.muted }}>
                        {(v1 ? `${v1} ${unit}` : "—") + " → " + (v2 ? `${v2} ${unit}` : "—")}
                      </span>
                      {renderDelta(v1, v2, !bom)}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* 4. Strength & VO2 in a grid */}
        {(allExercises.length > 0 || vo2History.length > 0) && (
          <div className="print-grid-2-col">
            {allExercises.map(function(ex) {
              var exHistory = getExerciseHistory(ex);
              var showChart = exHistory.length >= 1;
              var hasComparison = exHistory.length >= 2;
              
              var pt1 = hasComparison ? exHistory[0] : null;
              var pt2 = hasComparison ? exHistory[exHistory.length - 1] : null;
              
              var c1 = pt1 ? pt1.carga : null;
              var c2 = pt2 ? pt2.carga : null;
              var r1 = pt1 ? pt1.reps : null;
              var r2 = pt2 ? pt2.reps : null;
              var d1 = pt1 ? pt1.data : null;
              var d2 = pt2 ? pt2.data : null;
              
              return (
                <Card className="print-card" sx={{ padding:15 }} key={ex}>
                  <div style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:0.5, marginBottom:10 }}>{t("teste_forca_pontos", lang) + (t(ex, lang) || ex)}</div>
                  {showChart && (
                    <>
                      {/* Bloco de Tela */}
                      <div style={{ height:120, marginBottom:10 }} className="no-print">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={exHistory} margin={{ top:18, right:15, left:-22, bottom:0 }}>
                            <CartesianGrid strokeDasharray="2 2" stroke={T.border}/>
                            <XAxis dataKey="shortName" tick={{ fontSize:9, fill:T.muted }}/>
                            <YAxis tick={{ fontSize:9, fill:T.muted }} domain={[0, "auto"]}/>
                            <Tooltip
                              cursor={false}
                              formatter={function(value, name, props) {
                                var item = props.payload;
                                var repsStr = item && item.reps ? " (" + item.reps + " reps)" : "";
                                return [value + " " + getWeightUnit(unitSystem) + repsStr, t("carga", lang)];
                              }}
                              contentStyle={{ background:T.surface, border:"1px solid "+T.border, borderRadius:8, fontSize:11 }}
                            />
                            <Bar dataKey="carga" fill={acc} radius={[4, 4, 0, 0]} barSize={20}>
                              <LabelList dataKey="carga" position="top" offset={6} style={{ fill:T.text, fontSize:10, fontWeight:700 }} formatter={function(v) { return v || ""; }} />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Bloco de Impressão */}
                      <div className="print-only" style={{ marginBottom:10 }}>
                        <BarChart width={270} height={110} data={exHistory} margin={{ top:18, right:15, left:-24, bottom:0 }}>
                          <CartesianGrid strokeDasharray="2 2" stroke={T.border}/>
                          <XAxis dataKey="shortName" tick={{ fontSize:9, fill:T.muted }}/>
                          <YAxis tick={{ fontSize:9, fill:T.muted }} domain={[0, "auto"]}/>
                          <Bar dataKey="carga" fill={acc} radius={[4, 4, 0, 0]} barSize={18}>
                            <LabelList dataKey="carga" position="top" offset={6} style={{ fill:T.text, fontSize:9, fontWeight:700 }} formatter={function(v) { return v || ""; }} />
                          </Bar>
                        </BarChart>
                      </div>
                    </>
                  )}
                  {hasComparison ? (
                    <>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:12, background:T.bg, padding:"8px 12px", borderRadius:8, fontSize:12, color:T.text, marginBottom:4, marginTop:4 }}>
                        <div>
                          <span style={{ color:T.muted, fontWeight:600 }}>{t("antes", lang)} ({fmtDate(d1)}):</span>{" "}
                          <strong>{c1 ? c1 + " " + getWeightUnit(unitSystem) : "—"}</strong>{" "}
                          {r1 ? `(${r1} reps)` : ""}
                        </div>
                        <div style={{ color:T.border }}>|</div>
                        <div>
                          <span style={{ color:T.muted, fontWeight:600 }}>{t("depois", lang)} ({fmtDate(d2)}):</span>{" "}
                          <strong>{c2 ? c2 + " " + getWeightUnit(unitSystem) : "—"}</strong>{" "}
                          {r2 ? `(${r2} reps)` : ""}
                        </div>
                      </div>
                      {renderChartDeltaMessage(c1, c2, "carga no " + ex, " " + getWeightUnit(unitSystem), false)}
                    </>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                      {exHistory.map(function(pt) {
                        var numIdx = parseInt(pt.shortName) - 1;
                        var avItem = avs[numIdx];
                        var dateStr = avItem ? fmtDate(avItem.data) : "";
                        return (
                          <span key={pt.shortName} style={{ fontSize: 11, background: T.bg, padding: "4px 8px", borderRadius: 6, color: T.sub, display: "inline-block" }}>
                            {pt.shortName} ({dateStr}): <strong>{pt.carga} {getWeightUnit(unitSystem)}</strong> {pt.reps ? `(${pt.reps} reps)` : ""}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </Card>
              );
            })}

            {vo2History.length > 0 && (
              <Card className="print-card" sx={{ padding:15 }}>
                <div style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:0.5, marginBottom:12 }}>{t("condicionamento_vo2", lang)}</div>
                {vo2History.length >= 1 && (
                  <>
                    {/* Bloco de Tela */}
                    <div style={{ height:120, marginBottom:10 }} className="no-print">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={vo2History} margin={{ top:18, right:25, left:-22, bottom:0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
                          <XAxis dataKey="shortName" tick={{ fontSize:9, fill:T.muted }} padding={{ left: 15, right: 20 }}/>
                          <YAxis tick={{ fontSize:9, fill:T.muted }} domain={["auto","auto"]} padding={{ top: 15 }}/>
                          <Tooltip cursor={false} contentStyle={{ background:T.surface, border:"1px solid "+T.border, borderRadius:8, fontSize:11 }}/>
                          <Line type="monotone" dataKey="vo2" stroke={T.blue} strokeWidth={2} dot={{ fill:T.blue, r:3 }}>
                            <LabelList dataKey="vo2" position="top" offset={10} style={{ fill:T.text, fontSize:10, fontWeight:700 }} formatter={function(v) { return v ? parseFloat(v).toFixed(1) : ""; }} />
                          </Line>
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Bloco de Impressão */}
                    <div className="print-only" style={{ marginBottom:10 }}>
                      <LineChart width={270} height={110} data={vo2History} margin={{ top:18, right:20, left:-24, bottom:0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
                        <XAxis dataKey="shortName" tick={{ fontSize:9, fill:T.muted }} padding={{ left: 15, right: 20 }}/>
                        <YAxis tick={{ fontSize:9, fill:T.muted }} domain={["auto","auto"]} padding={{ top: 15 }}/>
                        <Line type="monotone" dataKey="vo2" stroke={T.blue} strokeWidth={2} dot={{ fill:T.blue, r:3 }}>
                          <LabelList dataKey="vo2" position="top" offset={10} style={{ fill:T.text, fontSize:9, fontWeight:700 }} formatter={function(v) { return v ? parseFloat(v).toFixed(1) : ""; }} />
                        </Line>
                      </LineChart>
                    </div>
                  </>
                )}
                {(function() {
                  var hasVO2Comparison = vo2History.length >= 2;
                  if (hasVO2Comparison) {
                    var pt1 = vo2History[0];
                    var pt2 = vo2History[vo2History.length - 1];
                    var v1 = pt1.vo2;
                    var v2 = pt2.vo2;
                    var d1 = pt1.data;
                    var d2 = pt2.data;
                    return (
                      <>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:12, background:T.bg, padding:"8px 12px", borderRadius:8, fontSize:12, color:T.text, marginBottom:4, marginTop:4 }}>
                          <div>
                            <span style={{ color:T.muted, fontWeight:600 }}>{t("antes", lang)} ({fmtDate(d1)}):</span>{" "}
                            <strong>{v1 ? v1.toFixed(1) + " ml/kg/min" : "—"}</strong>
                          </div>
                          <div style={{ color:T.border }}>|</div>
                          <div>
                            <span style={{ color:T.muted, fontWeight:600 }}>{t("depois", lang)} ({fmtDate(d2)}):</span>{" "}
                            <strong>{v2 ? v2.toFixed(1) + " ml/kg/min" : "—"}</strong>
                          </div>
                        </div>
                        {renderChartDeltaMessage(v1, v2, "vo2_lbl", " ml/kg/min", false)}
                      </>
                    );
                  } else {
                    return (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                        {vo2History.map(function(pt) {
                          var numIdx = parseInt(pt.shortName) - 1;
                          var avItem = avs[numIdx];
                          var dateStr = avItem ? fmtDate(avItem.data) : "";
                          return (
                            <span key={pt.shortName} style={{ fontSize: 11, background: T.bg, padding: "4px 8px", borderRadius: 6, color: T.sub, display: "inline-block" }}>
                              {pt.shortName} ({dateStr}): <strong>{pt.vo2} ml/kg/min</strong>
                            </span>
                          );
                        })}
                      </div>
                    );
                  }
                })()}
              </Card>
            )}
          </div>
        )}

        {/* 5. Flex, Cardio Params & Metabolism in grids */}
        {(hasFlexCompare || hasCardioParams || hasMetabolismoCompare) && (
          <div className={( (hasFlexCompare ? 1 : 0) + (hasCardioParams ? 1 : 0) + (hasMetabolismoCompare ? 1 : 0) >= 2 ) ? "print-grid-2-col" : ""}>
            {hasFlexCompare && (
              <Card className="print-card" sx={{ padding:15 }}>
                <div style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:0.5, marginBottom:12 }}>{t("flexibilidade", lang)}</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:10 }}>
                  {(flex1.wells || flex2.wells) && (
                    <div style={{ background:T.bg, padding:"8px 10px", borderRadius:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div>
                        <div style={{ fontSize:9, color:T.muted, fontWeight:600 }}>{t("sentar_alcancar_wells", lang)}</div>
                        <div style={{ fontSize:13, fontWeight:700, marginTop:1 }}>
                          {(flex1.wells ? toSystemLength(flex1.wells, unitSystem) : "—") + " " + getLengthUnit(unitSystem) + " → " + (flex2.wells ? toSystemLength(flex2.wells, unitSystem) : "—") + " " + getLengthUnit(unitSystem)}
                        </div>
                      </div>
                      {renderDelta(flex1.wells ? toSystemLength(flex1.wells, unitSystem) : "", flex2.wells ? toSystemLength(flex2.wells, unitSystem) : "", false)}
                    </div>
                  )}
                  {(flex1.anguloPopliteo || flex2.anguloPopliteo) && (
                    <div style={{ background:T.bg, padding:"8px 10px", borderRadius:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div>
                        <div style={{ fontSize:9, color:T.muted, fontWeight:600 }}>{t("angulo_popliteo", lang)}</div>
                        <div style={{ fontSize:13, fontWeight:700, marginTop:1 }}>{(flex1.anguloPopliteo||"—") + "° → " + (flex2.anguloPopliteo||"—") + "°"}</div>
                      </div>
                      {renderDelta(flex1.anguloPopliteo, flex2.anguloPopliteo, false)}
                    </div>
                  )}
                  {(flex1.thomas || flex2.thomas) && (
                    <div style={{ background:T.bg, padding:"8px 10px", borderRadius:8, display:"flex", flexDirection:"column", alignItems:"flex-start" }}>
                      <span style={{ fontSize:9, color:T.muted, fontWeight:600 }}>{t("teste_thomas", lang)}</span>
                      <span style={{ fontSize:13, fontWeight:700, marginTop:2 }}>{t("antes", lang)}: {t(flex1.thomas, lang) || "—"} | {t("depois", lang)}: {t(flex2.thomas, lang) || "—"}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {hasCardioParams && (
              <Card className="print-card" sx={{ padding:15 }}>
                <div style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:0.5, marginBottom:12 }}>{t("sinais_vitais_fc", lang)}</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:"6px 16px" }}>
                  {(card1.fcRepouso || card2.fcRepouso) && (
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderBottom:"1px solid "+T.borderLight }}>
                      <span style={{ fontSize:13, color:T.sub }}>{t("fc_repouso", lang)}</span>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontSize:12, color:T.muted }}>{(card1.fcRepouso||"—") + " → " + (card2.fcRepouso||"—") + " bpm"}</span>
                        {renderDelta(card1.fcRepouso, card2.fcRepouso, true)}
                      </div>
                    </div>
                  )}
                  {(card1.fcRecuperacao || card2.fcRecuperacao) && (
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderBottom:"1px solid "+T.borderLight }}>
                      <span style={{ fontSize:13, color:T.sub }}>{t("fc_recuperacao", lang)}</span>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontSize:12, color:T.muted }}>{(card1.fcRecuperacao||"—") + " → " + (card2.fcRecuperacao||"—") + " bpm"}</span>
                        {renderDelta(card1.fcRecuperacao, card2.fcRecuperacao, true)}
                      </div>
                    </div>
                  )}
                  {(card1.fcMax || card2.fcMax) && (
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderBottom:"1px solid "+T.borderLight }}>
                      <span style={{ fontSize:13, color:T.sub }}>{t("fc_max_medida", lang)}</span>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontSize:12, color:T.muted }}>{(card1.fcMax||"—") + " → " + (card2.fcMax||"—") + " bpm"}</span>
                        {renderDelta(card1.fcMax, card2.fcMax, true)}
                      </div>
                    </div>
                  )}
                  {(card1.pressaoArterial || card2.pressaoArterial) && (
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderBottom:"1px solid "+T.borderLight }}>
                      <span style={{ fontSize:13, color:T.sub }}>{t("pressao_arterial", lang)}</span>
                      <span style={{ fontSize:12, color:T.muted }}>{(card1.pressaoArterial||"—") + " → " + (card2.pressaoArterial||"")}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {hasMetabolismoCompare && (
              <Card className="print-card" sx={{ padding:15 }}>
                <div style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:0.5, marginBottom:12 }}>{t("metabolismo_sub", lang)}</div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0" }}>
                  <span style={{ fontSize:13, color:T.sub }}>{t("gasto_calorico_basal_tmb", lang)}</span>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:12, color:T.muted }}>{(tmb1 ? tmb1 + " kcal" : "—") + " → " + (tmb2 ? tmb2 + " kcal" : "—")}</span>
                    {renderDelta(tmb1, tmb2, false)}
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* 6. Visual comparison (Photos) */}
        {hasFotosCompare && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }} className="print-photos-container">
            {[["frente", t("frente", lang)], ["lado", t("lado", lang)], ["costas", t("costas", lang)]].map(function(pair) {
              var key = pair[0], label = pair[1];
              var f1 = av1.fotos && av1.fotos[key];
              var f2 = av2.fotos && av2.fotos[key];
              if (!f1 && !f2) return null;
              return (
                <Card className="print-card" sx={{ padding:15 }} key={key}>
                  <div style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:0.5, marginBottom:10 }}>
                    {t("acompanhamento_visual_menos", lang) + label}
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:10, color:T.muted, marginBottom:4 }}>{t("antes", lang)} ({fmtDate(av1.data)})</div>
                      {f1 ? (
                        <img src={f1} alt={"Antes "+label} style={{ width:"100%", maxHeight:300, objectFit:"contain", borderRadius:8, background:T.bg }}/>
                      ) : (
                        <div style={{ height:180, background:T.bg, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:T.muted, fontSize:12 }}>{t("sem_foto", lang)}</div>
                      )}
                    </div>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:10, color:T.muted, marginBottom:4 }}>{t("depois", lang)} ({fmtDate(av2.data)})</div>
                      {f2 ? (
                        <img src={f2} alt={"Depois "+label} style={{ width:"100%", maxHeight:300, objectFit:"contain", borderRadius:8, background:T.bg }}/>
                      ) : (
                        <div style={{ height:180, background:T.bg, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:T.muted, fontSize:12 }}>{t("sem_foto", lang)}</div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {(av1.observacaoFotos || av2.observacaoFotos) && (
          <Card className="print-card" sx={{ padding:15 }}>
            <div style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:0.5, marginBottom:10 }}>
              {t("observacoes_acomp_visual", lang)}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div>
                <div style={{ fontSize:9, color:T.muted, textTransform:"uppercase", fontWeight:700 }}>{t("antes", lang)}</div>
                <div style={{ fontSize:12, fontStyle:"italic", color:T.sub, marginTop:4 }}>
                  {av1.observacaoFotos ? `"${av1.observacaoFotos}"` : t("sem_observacoes", lang)}
                </div>
              </div>
              <div>
                <div style={{ fontSize:9, color:T.muted, textTransform:"uppercase", fontWeight:700 }}>{t("depois", lang)}</div>
                <div style={{ fontSize:12, fontStyle:"italic", color:T.sub, marginTop:4 }}>
                  {av2.observacaoFotos ? `"${av2.observacaoFotos}"` : "Sem observações"}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ── IMAGE CROPPER MODAL ──────────────────────────────────────────────────────
function ImageCropperModal({ imageSrc, onCrop, onCancel }) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [imgDims, setImgDims] = useState(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const imageRef = useRef(null);

  function handleStart(clientX, clientY) {
    setIsDragging(true);
    dragStart.current = { x: clientX - position.x, y: clientY - position.y };
  }

  function handleMove(clientX, clientY) {
    if (!isDragging) return;
    setPosition({
      x: clientX - dragStart.current.x,
      y: clientY - dragStart.current.y
    });
  }

  function handleEnd() {
    setIsDragging(false);
  }

  function handleSave() {
    if (!imageRef.current || !imgDims) return;
    const img = imageRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 400, 400);

    const W_vp = 250;
    const W_canvas = 400;
    const scale = W_canvas / W_vp;

    const imgRatio = imgDims.w / imgDims.h;
    let fitW, fitH;
    if (imgRatio > 1) {
      fitH = W_vp;
      fitW = W_vp * imgRatio;
    } else {
      fitW = W_vp;
      fitH = W_vp / imgRatio;
    }

    const renderW = fitW * zoom;
    const renderH = fitH * zoom;

    const imgX_vp = (W_vp / 2) - (renderW / 2) + position.x;
    const imgY_vp = (W_vp / 2) - (renderH / 2) + position.y;

    const destX = imgX_vp * scale;
    const destY = imgY_vp * scale;
    const destW = renderW * scale;
    const destH = renderH * scale;

    ctx.drawImage(img, destX, destY, destW, destH);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    onCrop(dataUrl);
  }

  let fitW = 250;
  let fitH = 250;
  if (imgDims) {
    const ratio = imgDims.w / imgDims.h;
    if (ratio > 1) {
      fitH = 250;
      fitW = 250 * ratio;
    } else {
      fitW = 250;
      fitH = 250 / ratio;
    }
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:T.surface, borderRadius:20, padding:24, width:"100%", maxWidth:360, boxShadow:T.shadowMd, display:"flex", flexDirection:"column", alignItems:"center" }}>
        <div style={{ fontSize:17, fontWeight:700, marginBottom:6, color:T.text }}>Ajustar Foto de Perfil</div>
        <div style={{ fontSize:13, color:T.muted, marginBottom:20, textAlign:"center", lineHeight:1.4 }}>
          Arraste a foto e use o controle de zoom para enquadrar perfeitamente no círculo.
        </div>

        <div
          onMouseDown={function(e) { handleStart(e.clientX, e.clientY); }}
          onMouseMove={function(e) { handleMove(e.clientX, e.clientY); }}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={function(e) { if(e.touches[0]) handleStart(e.touches[0].clientX, e.touches[0].clientY); }}
          onTouchMove={function(e) { if(e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY); }}
          onTouchEnd={handleEnd}
          style={{
            width: 250,
            height: 250,
            borderRadius: "50%",
            overflow: "hidden",
            position: "relative",
            background: "#eee",
            cursor: isDragging ? "grabbing" : "grab",
            border: "3px solid " + ac(),
            boxShadow: "0 0 0 10px rgba(255,255,255,0.15)",
            userSelect: "none",
            touchAction: "none"
          }}
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Original"
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: fitW,
              height: fitH,
              maxWidth: "none",
              maxHeight: "none",
              transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transformOrigin: "center",
              pointerEvents: "none",
              userSelect: "none"
            }}
            onLoad={function(e) {
              setImgDims({
                w: e.target.naturalWidth,
                h: e.target.naturalHeight
              });
            }}
          />
        </div>

        <div style={{ width:"100%", marginTop:24, display:"flex", flexDirection:"column", gap:8 }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, fontWeight:600, color:T.sub }}>
            <span>Zoom</span>
            <span>{Math.round(zoom * 100)}%</span>
          </div>
          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={zoom}
            onChange={function(e) { setZoom(parseFloat(e.target.value)); }}
            style={{
              width: "100%",
              accentColor: ac(),
              cursor: "pointer",
              height: 6,
              borderRadius: 3,
              background: T.border
            }}
          />
        </div>

        <div style={{ display:"flex", gap:10, width:"100%", marginTop:24 }}>
          <Btn full variant="ghost" onClick={onCancel}>Cancelar</Btn>
          <Btn full onClick={handleSave}>Confirmar</Btn>
        </div>
      </div>
    </div>
  );
}

// ── PERFIL ────────────────────────────────────────────────────────────────────
function PerfilScreen({ trainer, onUpdate, onLogout }) {
  const lang = trainer.lang || "pt";
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const fileRef = useRef();

  // Novos states para alteração de credenciais
  const [showEditCredentials, setShowEditCredentials] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingCredentials, setLoadingCredentials] = useState(false);
  const [errorCredentials, setErrorCredentials] = useState("");

  async function saveCredentials() {
    const emailTrimmed = newEmail.trim();
    if (!emailTrimmed) {
      setErrorCredentials(lang === "pt" ? "O e-mail não pode ficar em branco" : "Email cannot be empty");
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setErrorCredentials(lang === "pt" ? "A senha deve ter no mínimo 6 caracteres" : "Password must be at least 6 characters");
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorCredentials(lang === "pt" ? "As senhas não coincidem" : "Passwords do not match");
        return;
      }
    }

    setLoadingCredentials(true);
    setErrorCredentials("");

    try {
      const emailChanged = emailTrimmed.toLowerCase() !== trainer.email.toLowerCase();
      
      if (emailChanged) {
        // Atualizar auth do Supabase
        const { error: authError } = await supabase.auth.updateUser({ email: emailTrimmed });
        if (authError) throw authError;

        // Atualizar tabela trainers
        const { error: dbError } = await supabase
          .from('trainers')
          .update({ email: emailTrimmed })
          .eq('id', trainer.id);
        if (dbError) throw dbError;

        // Atualizar na Stripe
        if (trainer.stripeCustomerId) {
          const stripeRes = await fetch("/api/update-stripe-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customerId: trainer.stripeCustomerId, email: emailTrimmed })
          });
          const stripeData = await stripeRes.json();
          if (!stripeRes.ok) {
            console.error("Erro ao sincronizar e-mail na Stripe:", stripeData.error);
          }
        }

        // Atualizar local state
        onUpdate(Object.assign({}, trainer, { email: emailTrimmed }));
      }

      if (newPassword) {
        const { error: pwdError } = await supabase.auth.updateUser({ password: newPassword });
        if (pwdError) throw pwdError;
      }

      alert(lang === "pt" 
        ? "Alterações salvas com sucesso!" + (emailChanged ? " Verifique sua caixa de entrada para confirmar o novo e-mail." : "")
        : "Changes saved successfully!" + (emailChanged ? " Please verify your inbox to confirm the new email." : "")
      );
      setShowEditCredentials(false);
    } catch (err) {
      console.error("Erro ao atualizar credenciais:", err);
      setErrorCredentials(translateAuthError(err.message, lang) || "Erro desconhecido");
    } finally {
      setLoadingCredentials(false);
    }
  }

  function handleFoto(e) {
    var f = e.target.files[0];
    if (!f) return;
    var reader = new FileReader();
    reader.onload = function(evt) {
      setCropImageSrc(evt.target.result);
    };
    reader.readAsDataURL(f);
    e.target.value = "";
  }

  return (
    <div style={{ padding:"24px 16px 100px" }}>
      {cropImageSrc && (
        <ImageCropperModal
          imageSrc={cropImageSrc}
          onCrop={function(croppedUrl) {
            onUpdate(Object.assign({}, trainer, { foto: croppedUrl }));
            setCropImageSrc(null);
          }}
          onCancel={function() {
            setCropImageSrc(null);
          }}
        />
      )}
      {showEditCredentials && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:400, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div style={{ background:T.surface, borderRadius:20, padding:"28px 24px", width:"100%", maxWidth:360, boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize:17, fontWeight:700, marginBottom:4 }}>
              {lang === "pt" ? "Alterar login e senha" : lang === "es" ? "Cambiar login y contraseña" : "Change login and password"}
            </div>
            <div style={{ fontSize:13, color:T.muted, marginBottom:18 }}>
              {lang === "pt" 
                ? "Atualize seu e-mail de acesso ou altere a sua senha." 
                : lang === "es" 
                  ? "Actualice su correo de acceso o cambie su contraseña." 
                  : "Update your login email or change your password."}
            </div>

            {errorCredentials && (
              <div style={{ background:"#FEE2E2", color:"#991B1B", padding:10, borderRadius:8, fontSize:13, marginBottom:16 }}>
                {errorCredentials}
              </div>
            )}

            <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:22 }}>
              <FInput 
                label={lang === "pt" ? "Novo E-mail" : "New Email"} 
                value={newEmail} 
                onChange={setNewEmail} 
                type="email"
              />
              <FInput 
                label={lang === "pt" ? "Nova Senha" : "New Password"} 
                value={newPassword} 
                onChange={setNewPassword} 
                type="password" 
                placeholder={lang === "pt" ? "Preencha para alterar" : "Fill to change"}
              />
              {newPassword && (
                <FInput 
                  label={lang === "pt" ? "Confirmar Nova Senha" : "Confirm New Password"} 
                  value={confirmPassword} 
                  onChange={setConfirmPassword} 
                  type="password"
                />
              )}
            </div>

            <div style={{ display:"flex", gap:10 }}>
              <Btn full variant="ghost" onClick={function() { setShowEditCredentials(false); }} disabled={loadingCredentials}>
                {lang === "pt" ? "Cancelar" : "Cancel"}
              </Btn>
              <Btn full onClick={saveCredentials} disabled={loadingCredentials}>
                {loadingCredentials ? (lang === "pt" ? "Salvando..." : "Saving...") : (lang === "pt" ? "Salvar" : "Save")}
              </Btn>
            </div>
          </div>
        </div>
      )}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ fontSize:22, fontWeight:800 }}>{t("meu_perfil", lang)}</div>
          <div style={{ fontSize: 10, color: T.success, display: "flex", alignItems: "center", gap: 4, fontWeight: 700, background: T.success + "14", padding: "4px 8px", borderRadius: 20 }}>
            <IcCheck c={T.success} s={10} /> {t("salvo_automaticamente", lang)}
          </div>
        </div>
        <Btn small variant="ghost" onClick={onLogout} icon={<IcLogout c={T.sub} s={16}/>}>{t("sair", lang)}</Btn>
      </div>
      <Card sx={{ padding:18, marginBottom:14 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ position:"relative" }}>
            <Avatar name={trainer.nome} foto={trainer.foto} size={68} color={trainer.corPrimaria}/>
            <button onClick={function() { fileRef.current.click(); }} style={{ position:"absolute", bottom:0, right:0, width:24, height:24, background:ac(), border:"2px solid white", borderRadius:"50%", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <IcEdit c="#fff" s={12}/>
            </button>
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:16 }}>{trainer.nome || "—"}</div>
            <div style={{ fontSize:13, color:T.muted, marginTop:1, display:"flex", alignItems:"center", gap:8 }}>
              <span>{trainer.email}</span>
              <button 
                onClick={function() { 
                  setNewEmail(trainer.email);
                  setNewPassword("");
                  setConfirmPassword("");
                  setErrorCredentials("");
                  setShowEditCredentials(true); 
                }} 
                style={{ background: "none", border: "none", color: ac(), fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0, textDecoration: "underline" }}
              >
                {lang === "pt" ? "Alterar" : lang === "es" ? "Cambiar" : "Change"}
              </button>
            </div>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFoto} style={{ display:"none" }}/>
      </Card>

      {/* Assinatura Card */}
      <Card sx={{ padding:18, marginBottom:14 }}>
        <div style={{ display: "flex", flexDirection:"column", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:3, height:17, borderRadius:2, background:ac() }}/>
            <div style={{ fontSize:12, fontWeight:700, color:ac(), letterSpacing:1.2, textTransform:"uppercase" }}>
              {lang === "pt" ? "Assinatura" : "Subscription"}
            </div>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:4 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:T.text }}>
                {lang === "pt" ? "Status do Plano" : "Plan Status"}:{" "}
                <span style={{ color: (trainer.subscriptionStatus === "active" || trainer.subscriptionStatus === "trialing") ? T.success : T.danger, textTransform:"uppercase", fontWeight:700 }}>
                  {trainer.subscriptionStatus || "INATIVO"}
                </span>
              </div>
              {trainer.currentPeriodEnd && (
                <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>
                  {lang === "pt" ? "Vence em" : "Expires on"}: {new Date(trainer.currentPeriodEnd).toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US")}
                </div>
              )}
            </div>
            {trainer.stripeCustomerId ? (
              <Btn 
                small 
                variant="outline" 
                onClick={async function() {
                  try {
                    const res = await fetch("/api/create-portal-session", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ customerId: trainer.stripeCustomerId })
                    });
                    const data = await res.json();
                    if (data.url) {
                      window.location.href = data.url;
                    } else {
                      alert(lang === "pt" ? "Erro ao redirecionar para o portal da Stripe." : "Error redirecting to Stripe portal.");
                    }
                  } catch (err) {
                    console.error(err);
                    alert(lang === "pt" ? "Erro ao acessar gerenciamento." : "Error accessing subscription management.");
                  }
                }}
              >
                {lang === "pt" ? "Gerenciar" : "Manage"}
              </Btn>
            ) : (
              <Btn 
                small 
                onClick={async function() {
                  if (typeof window.fbq === 'function') {
                    window.fbq('track', 'InitiateCheckout');
                  }
                  try {
                    const res = await fetch("/api/create-checkout-session", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ trainerId: trainer.id, email: trainer.email })
                    });
                    const data = await res.json();
                    if (data.url) {
                      window.location.href = data.url;
                    } else {
                      alert(lang === "pt" ? "Erro ao redirecionar para o checkout." : "Error redirecting to checkout.");
                    }
                  } catch (err) {
                    console.error(err);
                    alert(lang === "pt" ? "Erro ao iniciar assinatura." : "Error starting subscription.");
                  }
                }}
              >
                {lang === "pt" ? "Assinar" : "Subscribe"}
              </Btn>
            )}
          </div>
        </div>
      </Card>
      
      {/* Idioma Card */}
      <Card sx={{ padding:18, marginBottom:14, overflow:"visible", position:"relative", zIndex:50 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:3, height:17, borderRadius:2, background:ac() }}/>
            <div style={{ fontSize:12, fontWeight:700, color:ac(), letterSpacing:1.2, textTransform:"uppercase" }}>{t("idioma", lang)}</div>
          </div>
          <LanguageSelector
            lang={lang}
            onChange={function(newLang) {
              onUpdate(Object.assign({}, trainer, { lang: newLang }));
            }}
            align="right"
          />
        </div>
      </Card>

      {/* Sistema de Medidas Card */}
      <Card sx={{ padding:18, marginBottom:14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:3, height:17, borderRadius:2, background:ac() }}/>
            <div style={{ fontSize:12, fontWeight:700, color:ac(), letterSpacing:1.2, textTransform:"uppercase" }}>{t("sistema_medidas", lang)}</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[
              { value: "metric", label: t("metrico", lang) },
              { value: "imperial", label: t("imperial", lang) }
            ].map(function(o) {
              const active = (trainer.unitSystem || "metric") === o.value;
              return (
                <button
                  key={o.value}
                  onClick={function() { onUpdate(Object.assign({}, trainer, { unitSystem: o.value })); }}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 12,
                    border: "1.5px solid " + (active ? ac() : T.border),
                    background: active ? ac() : T.surface,
                    color: active ? "#fff" : T.sub,
                    transition: "all 0.15s"
                  }}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Dados Pessoais Card */}
      <Card sx={{ padding:18, marginBottom:14 }}>
        <SecHead title={t("dados_pessoais", lang)}/>
        <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
          <FInput label={t("nome", lang)} value={trainer.nome} onChange={function(v) { onUpdate(Object.assign({}, trainer, { nome: v })); }} placeholder="Seu nome completo"/>
          <FInput label={t("email_insta", lang)} value={trainer.email} onChange={function(v) { onUpdate(Object.assign({}, trainer, { email: v })); }}/>
          <FInput label={t("telefone", lang)} value={trainer.telefone || ""} onChange={function(v) { onUpdate(Object.assign({}, trainer, { telefone: v })); }} placeholder="(11) 99999-9999"/>
        </div>
      </Card>

      {/* Suporte Card */}
      <Card sx={{ padding:18, marginBottom:14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:3, height:17, borderRadius:2, background:ac() }}/>
            <div style={{ fontSize:12, fontWeight:700, color:ac(), letterSpacing:1.2, textTransform:"uppercase" }}>
              {lang === "pt" ? "Suporte" : lang === "es" ? "Soporte" : "Support"}
            </div>
          </div>
          <Btn 
            small 
            variant="outline" 
            onClick={function() {
              window.open("https://wa.me/5516993419103?text=ShapeMap", "_blank");
            }}
            icon={
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
              </svg>
            }
          >
            WhatsApp
          </Btn>
        </div>
      </Card>

    </div>
  );
}

function PaywallScreen({ trainer, onLogout }) {
  const lang = (trainer && trainer.lang) || "pt";
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isExpired = trainer && trainer.stripeCustomerId && (
    trainer.subscriptionStatus === "past_due" || 
    trainer.subscriptionStatus === "unpaid" || 
    trainer.subscriptionStatus === "canceled"
  );

  const titleText = isExpired 
    ? (lang === "pt" ? "Assinatura Expirada ou Pendente" : "Subscription Expired or Pending")
    : (lang === "pt" ? "Ativação Necessária" : "Activation Required");

  const descText = isExpired
    ? (lang === "pt" 
        ? "Identificamos um problema no processamento do pagamento da sua última mensalidade. Regularize sua assinatura para continuar acessando seus alunos e avaliações." 
        : "We detected an issue processing your latest payment. Please update your payment details to continue accessing your dashboard.")
    : (lang === "pt" 
        ? "Para liberar o acesso total ao painel e criar novas avaliações, ative a sua assinatura profissional." 
        : "To unlock full dashboard access and create new physical evaluations, activate your professional subscription.");

  const buttonText = loading
    ? (lang === "pt" ? "Processando..." : "Processing...")
    : (isExpired 
        ? (lang === "pt" ? "Regularizar Assinatura" : "Update Subscription & Pay") 
        : (lang === "pt" ? "Assinar Plano Profissional" : "Subscribe to Pro Plan"));

  async function handleCheckout() {
    setLoading(true);
    setErrorMsg("");
    try {
      const shouldGoToPortal = trainer.stripeCustomerId && (
        trainer.subscriptionStatus === "active" || 
        trainer.subscriptionStatus === "trialing" ||
        trainer.subscriptionStatus === "past_due" ||
        trainer.subscriptionStatus === "unpaid"
      );
      const endpoint = shouldGoToPortal ? "/api/create-portal-session" : "/api/create-checkout-session";
      if (endpoint === "/api/create-checkout-session") {
        if (typeof window.fbq === 'function') {
          window.fbq('track', 'InitiateCheckout');
        }
      }
      const body = shouldGoToPortal 
        ? { customerId: trainer.stripeCustomerId }
        : { trainerId: trainer.id, email: trainer.email, nome: trainer.nome };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao conectar com Stripe.");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("URL não retornada.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(lang === "pt" ? "Erro ao redirecionar. Tente novamente mais tarde." : "Error redirecting. Please try again later.");
      setLoading(false);
    }
  }

  const [isAutoRedirecting, setIsAutoRedirecting] = useState(function() {
    return sessionStorage.getItem("just_signed_up") === "true" && !isExpired;
  });

  useEffect(function() {
    if (isAutoRedirecting) {
      sessionStorage.removeItem("just_signed_up");
      handleCheckout();
    }
  }, [isAutoRedirecting]);

  if (isAutoRedirecting) {
    return (
      <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"'Outfit', sans-serif" }}>
        <GlobalStyle />
        <div style={{ width:"100%", maxWidth:420, textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center" }}>
          
          {errorMsg ? (
            <div style={{ width: "100%" }}>
              <LogoShapeMap size={140} color={ac()} showText={true} style={{ marginBottom: 24, marginLeft: "auto", marginRight: "auto" }} />
              <div style={{ background:"#FEE2E2", color:"#991B1B", padding:16, borderRadius:12, fontSize:14, marginBottom:16, textAlign:"center", border: "1px solid #FCA5A5" }}>
                {errorMsg}
              </div>
              <Btn full onClick={handleCheckout} disabled={loading}>
                {lang === "pt" ? "Tentar Novamente" : "Try Again"}
              </Btn>
              <button 
                onClick={onLogout}
                style={{ 
                  background: "transparent", 
                  border: "none", 
                  color: T.muted, 
                  fontSize: 13, 
                  marginTop: 16, 
                  cursor: "pointer",
                  textDecoration: "underline"
                }}
              >
                {lang === "pt" ? "Sair da conta" : "Log out"}
              </button>
            </div>
          ) : (
            <>
              <div style={{
                position: "relative",
                width: 80,
                height: 80,
                animation: "logoPulse 2s ease-in-out infinite",
                marginBottom: 20
              }}>
                <div 
                  style={{ 
                    width: "100%", 
                    height: "100%", 
                    backgroundColor: ac(), 
                    opacity: 0.1, 
                    WebkitMaskImage: "url(/logo_transparent.png)",
                    maskImage: "url(/logo_transparent.png)",
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    display: "block"
                  }} 
                />
                <div style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "0%",
                  overflow: "hidden",
                  animation: "logoFill 2.5s ease-in-out infinite"
                }}>
                  <div 
                    style={{ 
                      position: "absolute", 
                      bottom: 0, 
                      left: 0, 
                      width: 80, 
                      height: 80, 
                      backgroundColor: ac(), 
                      WebkitMaskImage: "url(/logo_transparent.png)",
                      maskImage: "url(/logo_transparent.png)",
                      WebkitMaskSize: "contain",
                      maskSize: "contain",
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat",
                      display: "block"
                    }} 
                  />
                </div>
              </div>
              <div style={{ fontSize: 15, color: T.text, fontWeight: 600 }}>
                {lang === "pt" ? "Redirecionando para o pagamento seguro..." : "Redirecting to secure checkout..."}
              </div>
              <div style={{ fontSize: 13, color: T.muted, marginTop: 6 }}>
                {lang === "pt" ? "Conectando com a Stripe..." : "Connecting to Stripe..."}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"'Outfit', sans-serif" }}>
      <div style={{ width:"100%", maxWidth:420, textAlign:"center", marginBottom:24, display:"flex", flexDirection:"column", alignItems:"center" }}>
        <LogoShapeMap size={140} color={ac()} showText={true} style={{ marginBottom: 12, marginLeft: "auto", marginRight: "auto" }} />
        <div style={{ fontSize: 13, color: T.muted }}>{t("plataforma_av", lang)}</div>
      </div>

      <Card sx={{ width:"100%", maxWidth:420, padding:28, border:"1.5px solid " + (isExpired ? "#FCCACA" : T.border), position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:120, height:120, borderRadius:"50%", background:isExpired ? "rgba(239, 68, 68, 0.08)" : ac() + "12", filter:"blur(20px)" }} />
        
        <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
          <div style={{ 
            width: 56, 
            height: 56, 
            borderRadius: 16, 
            background: isExpired ? "rgba(239, 68, 68, 0.15)" : ac() + "18", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center" 
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={isExpired ? "#EF4444" : ac()} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {isExpired ? (
                <>
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </>
              ) : (
                <>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </>
              )}
            </svg>
          </div>
        </div>

        <div style={{ fontSize:18, fontWeight:700, textAlign:"center", marginBottom:8, color:isExpired ? "#B91C1C" : T.text }}>
          {titleText}
        </div>
        
        <p style={{ fontSize:14, color:T.muted, textAlign:"center", marginBottom:16, lineHeight:1.5 }}>
          {descText}
        </p>

        {errorMsg && (
          <div style={{ background:"#FEE2E2", color:"#991B1B", padding:12, borderRadius:8, fontSize:13, marginBottom:16, textAlign:"center" }}>
            {errorMsg}
          </div>
        )}

        <Btn full onClick={handleCheckout} disabled={loading} style={{ marginBottom: 16 }}>
          {buttonText}
        </Btn>

        <div style={{ background:T.bg, borderRadius:12, padding:16, border:"1px solid " + (isExpired ? "#FEE2E2" : T.borderLight) }}>
          <div style={{ fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:0.5, color:T.muted, marginBottom:12 }}>
            {lang === "pt" ? "O que está incluso no Plano Pro:" : "What's included in the Pro Plan:"}
          </div>
          
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[
              lang === "pt" ? "Alunos e Avaliações ilimitadas" : "Unlimited Students and Evaluations",
              lang === "pt" ? "Métodos de composição corporal" : "Body composition methods",
              lang === "pt" ? "Perimetria e Teste de Força" : "Perimetry & Strength tests",
              lang === "pt" ? "Teste de Flexibilidade e VO2 Máx" : "Flexibility & VO2 Max tests",
              lang === "pt" ? "Cálculo de TMB (Taxa Metabólica Basal)" : "BMR calculation",
              lang === "pt" ? "Fotos comparativas de evolução" : "Comparative progress photos",
              lang === "pt" ? "Gráficos de evolução física" : "Physical progress & evolution charts",
              lang === "pt" ? "Exportação de PDFs personalizados" : "Premium customizable PDF reports",
              lang === "pt" ? "Anamnese flexível e reordenável" : "Flexible and reorderable anamnesis"
            ].map(function(item, idx) {
              return (
                <div key={idx} style={{ display:"flex", alignItems:"center", gap:10, fontSize:13, color:T.text }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isExpired ? "#EF4444" : ac()} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>{item}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <div style={{ marginTop:24, display:"flex", gap:16 }}>
        <button 
          onClick={onLogout} 
          style={{ background:"none", border:"none", color:T.muted, fontSize:13, cursor:"pointer", fontWeight:600, textDecoration:"underline" }}
        >
          {lang === "pt" ? "Sair da conta" : "Sign out"}
        </button>
      </div>
    </div>
  );
}

// ── COMPONENTES DE AVALIAÇÃO ONLINE ──────────────────────────────────────────

// 1. TELA DE ESCOLHA DE TIPO
function EscolhaTipoAvaliacaoScreen({ aluno, onBack, onSelectPresencial, onSelectOnline, trainer }) {
  const lang = (trainer && trainer.lang) || "pt";
  return (
    <div style={{ padding: "24px 16px 100px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: "none", border: "1.5px solid " + T.border, borderRadius: 10, padding: "8px 10px", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <IcBack c={T.sub} s={18} />
        </button>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>
            {lang === "es" ? "Nueva Evaluación" : lang === "en" ? "New Evaluation" : "Nova Avaliação"}
          </div>
          <div style={{ fontSize: 12, color: T.muted }}>{aluno.nome}</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        
        {/* Opção 1: Presencial */}
        <Card hover onClick={onSelectPresencial} sx={{ padding: 20, cursor: "pointer", border: "1.5px solid " + T.border, display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={{ background: ac() + "14", padding: 12, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ac()} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              <line x1="9" y1="12" x2="15" y2="12"></line>
              <line x1="9" y1="16" x2="15" y2="16"></line>
              <line x1="9" y1="8" x2="10" y2="8"></line>
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 4 }}>
              {lang === "es" ? "Presencial (En el Consultorio)" : lang === "en" ? "In-Person (Office)" : "Presencial (No Consultório)"}
            </div>
            <div style={{ fontSize: 13, color: T.sub, lineHeight: 1.5, marginBottom: 12 }}>
              {lang === "es" ? "Usted realiza las mediciones físicas e ingresa los datos en tiempo real junto con el evaluado." : lang === "en" ? "You perform the physical measurements and enter the data in real-time with the student." : "Você realiza as medições físicas e insere os dados em tempo real junto com o aluno."}
            </div>
            <Btn small onClick={onSelectPresencial}>{lang === "es" ? "Iniciar Presencial" : lang === "en" ? "Start In-Person" : "Iniciar Presencial"}</Btn>
          </div>
        </Card>

        {/* Opção 2: Online */}
        <Card hover onClick={onSelectOnline} sx={{ padding: 20, cursor: "pointer", border: "1.5px solid " + T.border, display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={{ background: ac() + "14", padding: 12, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ac()} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
              <line x1="12" y1="18" x2="12.01" y2="18"></line>
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 4 }}>
              {lang === "es" ? "A Distancia (Online)" : lang === "en" ? "Remote (Online)" : "À Distância (Online)"}
            </div>
            <div style={{ fontSize: 13, color: T.sub, lineHeight: 1.5, marginBottom: 12 }}>
              {lang === "es" ? "Envíe un enlace para que el aluno responda la anamnesis, peso, altura, medidas y suba fotos desde su celular." : lang === "en" ? "Send a link for the student to answer anamnesis, weight, height, measurements, and upload photos from their phone." : "Envie um link para o aluno responder a anamnese, peso, altura, medidas e enviar fotos diretamente pelo celular."}
            </div>
            <Btn small onClick={onSelectOnline}>{lang === "es" ? "Configurar e Enviar" : lang === "en" ? "Configure & Send" : "Configurar e Enviar"}</Btn>
          </div>
        </Card>

      </div>
    </div>
  );
}

// 2. TELA DE CONFIGURAÇÃO DE ENVIO ONLINE
function ConfigurarOnlineScreen({ aluno, onBack, onSend, settings, trainer }) {
  const lang = (trainer && trainer.lang) || "pt";
  const firstName = aluno.nome ? aluno.nome.split(" ")[0] : (lang === "en" ? "Student" : lang === "es" ? "Alumno" : "Aluno");
  const [activeTab, setActiveTab] = useState("");

  const defaultOnlineConfig = (settings && settings.defaultOnlineConfig) || {
    sections: {
      anamnese: true,
      composicao: true,
      perimetria: true,
      testes: true,
      cardiovascular: true,
      fotos: true
    },
    composicaoMethod: "marinha",
    composicaoFields: { peso: true, altura: true },
    fotosTypes: {
      frente: true,
      lado: true,
      costas: true
    }
  };

  const [sections, setSections] = useState(Object.assign({}, defaultOnlineConfig.sections));
  const [composicaoMethod, setComposicaoMethod] = useState(defaultOnlineConfig.composicaoMethod);
  const [composicaoFields, setComposicaoFields] = useState(Object.assign({}, (settings && settings.defaultOnlineConfig && settings.defaultOnlineConfig.composicaoFields) || { peso: true, altura: true }));
  const [fotosTypes, setFotosTypes] = useState(Object.assign({}, defaultOnlineConfig.fotosTypes));

  const qList = (settings && settings.anamnesePerguntas) || PERGUNTAS_PADRAO;
  const [selectedQuestions, setSelectedQuestions] = useState(qList.map(function(q) {
    const isChecked = (settings && settings.defaultOnlineConfig && settings.defaultOnlineConfig.anamneseQuestions)
      ? settings.defaultOnlineConfig.anamneseQuestions.includes(q)
      : true;
    return { question: q, checked: isChecked };
  }));
  const [newQuestionText, setNewQuestionText] = useState("");

  const pFields = (settings && settings.perimetriaCampos) || [
    { label: "Pescoço", key: "pescoco", active: true },
    { label: "Ombros", key: "ombros", active: true },
    { label: "Peitoral", key: "peitoral", active: true },
    { label: "Cintura", key: "cintura", active: true },
    { label: "Abdominal", key: "abdominal", active: true },
    { label: "Quadril", key: "quadril", active: true },
    { label: "Braço Dir.", key: "bracoDireito", active: true },
    { label: "Braço Esq.", key: "bracoEsquerdo", active: true },
    { label: "Coxa Dir.", key: "coxaDireita", active: true },
    { label: "Coxa Esq.", key: "coxaEsquerda", active: true },
    { label: "Panturrilha Dir.", key: "panturrilhaDireita", active: true },
    { label: "Panturrilha Esq.", key: "panturrilhaEsquerda", active: true }
  ];
  const pCheckedKeys = ["ombros", "cintura", "quadril", "bracoDireito", "bracoEsquerdo", "coxaDireita", "coxaEsquerda"];
  const [selectedPerim, setSelectedPerim] = useState(pFields.map(function(f) {
    const isChecked = (settings && settings.defaultOnlineConfig && settings.defaultOnlineConfig.perimetriaFields)
      ? settings.defaultOnlineConfig.perimetriaFields.some(function(x) { return x.key === f.key; })
      : pCheckedKeys.includes(f.key);
    return { key: f.key, label: f.label, checked: isChecked };
  }));

  const eList = (settings && settings.exerciciosForca && settings.exerciciosForca.length > 0)
    ? settings.exerciciosForca
    : ["Supino Reto"];
  const [selectedForce, setSelectedForce] = useState(eList.map(function(ex) {
    const isChecked = (settings && settings.defaultOnlineConfig && settings.defaultOnlineConfig.testesExercises)
      ? settings.defaultOnlineConfig.testesExercises.includes(ex)
      : ["Supino Reto", "Agachamento"].includes(ex);
    return { exercise: ex, checked: isChecked };
  }));
  const [newExerciseText, setNewExerciseText] = useState("");

  const [cardioFields, setCardioFields] = useState([
    { key: "cooper", label: lang === "es" ? "Teste de Cooper (Metros)" : lang === "en" ? "Cooper Test (Meters)" : "Teste de Cooper (Metros)" },
    { key: "fcRepouso", label: lang === "es" ? "Frecuencia Cardíaca de Reposo" : lang === "en" ? "Resting Heart Rate" : "Frequência Cardíaca de Repouso" },
    { key: "fcRecuperacao", label: lang === "es" ? "Frecuencia Cardíaca de Recuperación" : lang === "en" ? "Recovery Heart Rate" : "Frequência Cardíaca de Recuperação" },
    { key: "fcMax", label: lang === "es" ? "Frecuencia Cardíaca Máxima (Medida)" : lang === "en" ? "Max Heart Rate (Measured)" : "Frequência Cardíaca Máxima (Medida)" },
    { key: "pressaoArterial", label: lang === "es" ? "Presión Arterial" : lang === "en" ? "Blood Pressure" : "Pressão Arterial" }
  ].map(function(f) {
    const isChecked = (settings && settings.defaultOnlineConfig && settings.defaultOnlineConfig.cardioFields)
      ? settings.defaultOnlineConfig.cardioFields.some(function(x) { return x.key === f.key; })
      : ["cooper", "fcRepouso"].includes(f.key);
    return Object.assign({}, f, { checked: isChecked });
  }));

  function addCustomQuestion() {
    if (!newQuestionText.trim()) return;
    setSelectedQuestions(function(prev) {
      return prev.concat([{ question: newQuestionText.trim(), checked: true }]);
    });
    setNewQuestionText("");
  }

  function addCustomExercise() {
    if (!newExerciseText.trim()) return;
    setSelectedForce(function(prev) {
      return prev.concat([{ exercise: newExerciseText.trim(), checked: true }]);
    });
    setNewExerciseText("");
  }

  function toggleCardioField(key) {
    setCardioFields(function(prev) {
      return prev.map(function(f) {
        if (f.key === key) return Object.assign({}, f, { checked: !f.checked });
        return f;
      });
    });
  }

  function handleSend() {
    const finalConfig = {
      sections: sections,
      anamneseQuestions: selectedQuestions.filter(function(x) { return x.checked; }).map(function(x) { return x.question; }),
      composicaoMethod: composicaoMethod,
      composicaoFields: composicaoFields,
      perimetriaFields: selectedPerim.filter(function(x) { return x.checked; }).map(function(x) { return { key: x.key, label: x.label }; }),
      testesExercises: selectedForce.filter(function(x) { return x.checked; }).map(function(x) { return x.exercise; }),
      cardioFields: cardioFields.filter(function(x) { return x.checked; }).map(function(x) { return { key: x.key, label: x.label }; }),
      fotosTypes: fotosTypes,
      trainerNome: trainer.nome || "Prof. ShapeMap",
      trainerCor: trainer.corPrimaria || "#1A1A2E",
      studentNome: aluno.nome || ""
    };
    onSend(finalConfig);
  }

  function toggleQuestion(idx) {
    setSelectedQuestions(function(prev) {
      return prev.map(function(q, i) {
        if (i === idx) return Object.assign({}, q, { checked: !q.checked });
        return q;
      });
    });
  }

  function togglePerim(key) {
    setSelectedPerim(function(prev) {
      return prev.map(function(f) {
        if (f.key === key) return Object.assign({}, f, { checked: !f.checked });
        return f;
      });
    });
  }

  function toggleForce(idx) {
    setSelectedForce(function(prev) {
      return prev.map(function(ex, i) {
        if (i === idx) return Object.assign({}, ex, { checked: !ex.checked });
        return ex;
      });
    });
  }

  function toggleSection(key) {
    setSections(function(prev) {
      return Object.assign({}, prev, { [key]: !prev[key] });
    });
  }

  function toggleFotoType(key) {
    setFotosTypes(function(prev) {
      return Object.assign({}, prev, { [key]: !prev[key] });
    });
  }

  function toggleAccordion(tabName) {
    setActiveTab(function(current) {
      return current === tabName ? "" : tabName;
    });
  }

  return (
    <div style={{ padding: "24px 16px 100px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: "none", border: "1.5px solid " + T.border, borderRadius: 10, padding: "8px 10px", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <IcBack c={T.sub} s={18} />
        </button>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>
            {lang === "es" ? "Configurar Envío" : lang === "en" ? "Configure Online" : "Configurar Envio Online"}
          </div>
          <div style={{ fontSize: 12, color: T.muted }}>{aluno.nome}</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 30 }}>
        
        {/* Bloco 1: Anamnese */}
        <Card sx={{ border: "1.5px solid " + T.border, overflow: "hidden" }}>
          <div onClick={function() { toggleAccordion("anamnese"); }} style={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: activeTab === "anamnese" ? T.bg : "transparent" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 700 }} onClick={function(e) { e.stopPropagation(); }}>
              <input type="checkbox" checked={sections.anamnese} onChange={function(e) { toggleSection("anamnese"); }} style={{ accentColor: ac(), width: 18, height: 18 }} />
              <span style={{ color: sections.anamnese ? T.text : T.muted }}>{lang === "es" ? "Anamnesis" : lang === "en" ? "Anamnesis" : "Anamnese"}</span>
            </label>
            <IcChevron c={T.muted} s={16} rotate={activeTab === "anamnese" ? 90 : 0} />
          </div>
          {activeTab === "anamnese" && (
            <div style={{ padding: "0 16px 16px", borderTop: "1px solid " + T.borderLight, marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={newQuestionText}
                  onChange={function(e) { setNewQuestionText(e.target.value); }}
                  placeholder={lang === "es" ? "Añadir pregunta..." : lang === "en" ? "Add question..." : "Adicionar pergunta..."}
                  style={{ flex: 1, background: T.bg, border: "1.5px solid " + T.border, borderRadius: 10, padding: "8px 12px", fontSize: 13, color: T.text, outline: "none" }}
                />
                <Btn small onClick={addCustomQuestion}>{lang === "es" ? "Añadir" : lang === "en" ? "Add" : "Adicionar"}</Btn>
              </div>
              <div style={{ maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                {selectedQuestions.map(function(q, idx) {
                  return (
                    <label key={idx} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: q.checked ? T.text : T.sub }}>
                      <input type="checkbox" checked={q.checked} onChange={function() { toggleQuestion(idx); }} style={{ accentColor: ac(), width: 16, height: 16 }} disabled={!sections.anamnese} />
                      {q.question}
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </Card>

        {/* Bloco 2: Composição Corporal */}
        <Card sx={{ border: "1.5px solid " + T.border, overflow: "hidden" }}>
          <div onClick={function() { toggleAccordion("composicao"); }} style={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: activeTab === "composicao" ? T.bg : "transparent" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 700 }} onClick={function(e) { e.stopPropagation(); }}>
              <input type="checkbox" checked={sections.composicao} onChange={function(e) { toggleSection("composicao"); }} style={{ accentColor: ac(), width: 18, height: 18 }} />
              <span style={{ color: sections.composicao ? T.text : T.muted }}>{lang === "es" ? "Composición Corporal" : lang === "en" ? "Body Composition" : "Composição Corporal"}</span>
            </label>
            <IcChevron c={T.muted} s={16} rotate={activeTab === "composicao" ? 90 : 0} />
          </div>
          {activeTab === "composicao" && (
            <div style={{ padding: "16px", borderTop: "1px solid " + T.borderLight, display: "flex", flexDirection: "column", gap: 12 }}>
              <FSelect
                label={lang === "es" ? "Método de composición corporal" : lang === "en" ? "Composition Method" : "Método de composição corporal"}
                value={composicaoMethod}
                onChange={setComposicaoMethod}
                disabled={!sections.composicao}
                options={[
                  { value: "", label: lang === "es" ? "Ninguno (solo Peso/Altura)" : lang === "en" ? "None (Weight/Height only)" : "Nenhum (apenas Peso/Altura)" },
                  { value: "marinha", label: "Marinha Americana" },
                  { value: "bioimpedancia", label: "Bioimpedância" }
                ]}
              />
              
              <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, color: (composicaoFields || { peso: true }).peso ? T.text : T.sub }}>
                  <input 
                    type="checkbox" 
                    checked={(composicaoFields || { peso: true }).peso} 
                    onChange={function(e) { setComposicaoFields(Object.assign({}, composicaoFields, { peso: e.target.checked })); }} 
                    style={{ accentColor: ac(), width: 16, height: 16 }} 
                    disabled={!sections.composicao} 
                  />
                  {lang === "es" ? "Peso" : lang === "en" ? "Weight" : "Peso"}
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, color: (composicaoFields || { altura: true }).altura ? T.text : T.sub }}>
                  <input 
                    type="checkbox" 
                    checked={(composicaoFields || { altura: true }).altura} 
                    onChange={function(e) { setComposicaoFields(Object.assign({}, composicaoFields, { altura: e.target.checked })); }} 
                    style={{ accentColor: ac(), width: 16, height: 16 }} 
                    disabled={!sections.composicao} 
                  />
                  {lang === "es" ? "Altura" : lang === "en" ? "Height" : "Altura"}
                </label>
              </div>
            </div>
          )}
        </Card>

        {/* Bloco 3: Perimetria */}
        <Card sx={{ border: "1.5px solid " + T.border, overflow: "hidden" }}>
          <div onClick={function() { toggleAccordion("perimetria"); }} style={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: activeTab === "perimetria" ? T.bg : "transparent" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 700 }} onClick={function(e) { e.stopPropagation(); }}>
              <input type="checkbox" checked={sections.perimetria} onChange={function(e) { toggleSection("perimetria"); }} style={{ accentColor: ac(), width: 18, height: 18 }} />
              <span style={{ color: sections.perimetria ? T.text : T.muted }}>{lang === "es" ? "Perimetría (Medidas)" : lang === "en" ? "Perimetry (Measurements)" : "Perimetria (Medidas)"}</span>
            </label>
            <IcChevron c={T.muted} s={16} rotate={activeTab === "perimetria" ? 90 : 0} />
          </div>
          {activeTab === "perimetria" && (
            <div style={{ padding: "0 16px 16px", borderTop: "1px solid " + T.borderLight, maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
              {selectedPerim.map(function(f) {
                return (
                  <label key={f.key} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: f.checked ? T.text : T.sub }} onClick={function(e) { e.stopPropagation(); }}>
                    <input type="checkbox" checked={f.checked} onChange={function() { togglePerim(f.key); }} style={{ accentColor: ac(), width: 16, height: 16 }} disabled={!sections.perimetria} />
                    {f.label}
                  </label>
                );
              })}
            </div>
          )}
        </Card>

        {/* Bloco 4: Testes de Força */}
        <Card sx={{ border: "1.5px solid " + T.border, overflow: "hidden" }}>
          <div onClick={function() { toggleAccordion("testes"); }} style={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: activeTab === "testes" ? T.bg : "transparent" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 700 }} onClick={function(e) { e.stopPropagation(); }}>
              <input type="checkbox" checked={sections.testes} onChange={function(e) { toggleSection("testes"); }} style={{ accentColor: ac(), width: 18, height: 18 }} />
              <span style={{ color: sections.testes ? T.text : T.muted }}>{lang === "es" ? "Testes de Fuerza" : lang === "en" ? "Strength Tests" : "Testes de Força"}</span>
            </label>
            <IcChevron c={T.muted} s={16} rotate={activeTab === "testes" ? 90 : 0} />
          </div>
          {activeTab === "testes" && (
            <div style={{ padding: "0 16px 16px", borderTop: "1px solid " + T.borderLight, marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={newExerciseText}
                  onChange={function(e) { setNewExerciseText(e.target.value); }}
                  placeholder={lang === "es" ? "Añadir ejercicio..." : lang === "en" ? "Add exercise..." : "Adicionar exercício..."}
                  style={{ flex: 1, background: T.bg, border: "1.5px solid " + T.border, borderRadius: 10, padding: "8px 12px", fontSize: 13, color: T.text, outline: "none" }}
                />
                <Btn small onClick={addCustomExercise}>{lang === "es" ? "Añadir" : lang === "en" ? "Add" : "Adicionar"}</Btn>
              </div>
              <div style={{ maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                {selectedForce.map(function(ex, idx) {
                  return (
                    <label key={idx} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: ex.checked ? T.text : T.sub }}>
                      <input type="checkbox" checked={ex.checked} onChange={function() { toggleForce(idx); }} style={{ accentColor: ac(), width: 16, height: 16 }} disabled={!sections.testes} />
                      {ex.exercise}
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </Card>

        {/* Bloco 5: Cardiovascular */}
        <Card sx={{ border: "1.5px solid " + T.border, overflow: "hidden" }}>
          <div onClick={function() { toggleAccordion("cardiovascular"); }} style={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: activeTab === "cardiovascular" ? T.bg : "transparent" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 700 }} onClick={function(e) { e.stopPropagation(); }}>
              <input type="checkbox" checked={sections.cardiovascular} onChange={function(e) { toggleSection("cardiovascular"); }} style={{ accentColor: ac(), width: 18, height: 18 }} />
              <span style={{ color: sections.cardiovascular ? T.text : T.muted }}>{lang === "es" ? "Cardiovascular & VO2" : lang === "en" ? "Cardiovascular & VO2" : "Cardiovascular & VO2"}</span>
            </label>
            <IcChevron c={T.muted} s={16} rotate={activeTab === "cardiovascular" ? 90 : 0} />
          </div>
          {activeTab === "cardiovascular" && (
            <div style={{ padding: "0 16px 16px", borderTop: "1px solid " + T.borderLight, maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
              {cardioFields.map(function(f) {
                return (
                  <label key={f.key} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: f.checked ? T.text : T.sub }}>
                    <input type="checkbox" checked={f.checked} onChange={function() { toggleCardioField(f.key); }} style={{ accentColor: ac(), width: 16, height: 16 }} disabled={!sections.cardiovascular} />
                    {f.label}
                  </label>
                );
              })}
            </div>
          )}
        </Card>

        {/* Bloco 6: Fotos */}
        <Card sx={{ border: "1.5px solid " + T.border, overflow: "hidden" }}>
          <div onClick={function() { toggleAccordion("fotos"); }} style={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: activeTab === "fotos" ? T.bg : "transparent" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 700 }} onClick={function(e) { e.stopPropagation(); }}>
              <input type="checkbox" checked={sections.fotos} onChange={function(e) { toggleSection("fotos"); }} style={{ accentColor: ac(), width: 18, height: 18 }} />
              <span style={{ color: sections.fotos ? T.text : T.muted }}>{lang === "es" ? "Registro Fotográfico (Fotos)" : lang === "en" ? "Photos" : "Registro Fotográfico (Fotos)"}</span>
            </label>
            <IcChevron c={T.muted} s={16} rotate={activeTab === "fotos" ? 90 : 0} />
          </div>
          {activeTab === "fotos" && (
            <div style={{ padding: "16px", borderTop: "1px solid " + T.borderLight, display: "flex", gap: 16 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, color: fotosTypes.frente ? T.text : T.sub }}>
                <input type="checkbox" checked={fotosTypes.frente} onChange={function() { toggleFotoType("frente"); }} style={{ accentColor: ac(), width: 16, height: 16 }} disabled={!sections.fotos} />
                {lang === "es" ? "Frente" : lang === "en" ? "Front" : "Frente"}
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, color: fotosTypes.lado ? T.text : T.sub }}>
                <input type="checkbox" checked={fotosTypes.lado} onChange={function() { toggleFotoType("lado"); }} style={{ accentColor: ac(), width: 16, height: 16 }} disabled={!sections.fotos} />
                {lang === "es" ? "Perfil" : lang === "en" ? "Side" : "Lado"}
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, color: fotosTypes.costas ? T.text : T.sub }}>
                <input type="checkbox" checked={fotosTypes.costas} onChange={function() { toggleFotoType("costas"); }} style={{ accentColor: ac(), width: 16, height: 16 }} disabled={!sections.fotos} />
                {lang === "es" ? "Espalda" : lang === "en" ? "Back" : "Costas"}
              </label>
            </div>
          )}
        </Card>

      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <Btn variant="outline" full onClick={onBack}>{lang === "es" ? "Cancelar" : lang === "en" ? "Cancel" : "Cancelar"}</Btn>
        <Btn full onClick={handleSend} disabled={!sections.anamnese && !sections.composicao && !sections.perimetria && !sections.testes && !sections.cardiovascular && !sections.fotos}>
          {lang === "en" ? "Send to " + firstName : lang === "es" ? "Enviar a " + firstName : "Enviar para " + firstName}
        </Btn>
      </div>
    </div>
  );
}

// 3. MODAL DE LINK GERADO
function LinkGeradoModal({ url, onSendWhatsApp, onClose, trainer, alunoNome }) {
  const lang = (trainer && trainer.lang) || "pt";
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(function() { setCopied(false); }, 2000);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <Card sx={{ padding: 24, width: "100%", maxWidth: 400, border: "1px solid " + T.border, textAlign: "center", display: "flex", flexDirection: "column", gap: 16, boxShadow: T.shadowLg }}>
        
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={ac()} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 8px" }}>
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" />
        </svg>
        <div style={{ fontSize: 18, fontWeight: 800, color: T.text, letterSpacing: -0.4 }}>
          {lang === "es" ? "¡Enlace de Evaluación Creado!" : lang === "en" ? "Evaluation Link Created!" : "Link de Avaliação Criado!"}
        </div>
        <div style={{ fontSize: 13, color: T.sub, lineHeight: 1.5 }}>
          {lang === "es" ? "Copie el siguiente enlace y envíelo a " + alunoNome + " para que complete sus datos físicos y fotos:" : lang === "en" ? "Copy the link below and send it to " + alunoNome + " for them to fill out their physical data and photos:" : "Copie o link abaixo e envie para " + alunoNome + " preencher os dados físicos e fotos:"}
        </div>

        <div style={{ display: "flex", background: T.bg, border: "1.5px solid " + T.border, borderRadius: 10, padding: 4, alignItems: "center" }}>
          <input 
            type="text" 
            readOnly 
            value={url} 
            style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 13, color: T.text, padding: "8px 10px", textOverflow: "ellipsis" }}
          />
          <button 
            onClick={handleCopy}
            style={{ background: copied ? T.success : ac(), border: "none", borderRadius: 8, color: "#fff", padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", minWidth: 80, transition: "background-color 0.15s" }}
          >
            {copied ? (lang === "es" ? "Copiado" : lang === "en" ? "Copied" : "Copiado") : (lang === "es" ? "Copiar" : lang === "en" ? "Copy" : "Copiar")}
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
          <Btn full onClick={onClose}>
            {lang === "es" ? "Cerrar" : lang === "en" ? "Close" : "Fechar"}
          </Btn>
        </div>

      </Card>
    </div>
  );
}

// 4. SLOT DE FOTO DO ALUNO (AUXILIAR)
function StudentFotoSlot({ label, foto, onSet, lang }) {
  const ref = useRef();
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6, flex: 1, minWidth: 0 }}>
      <div style={{ fontSize:10, fontWeight:700, color:T.sub, textTransform:"uppercase", letterSpacing:0.4, textAlign:"center" }}>{label}</div>
      <div
        onClick={function() { ref.current.click(); }}
        style={{ aspectRatio:"3/4", borderRadius:12, overflow:"hidden", cursor:"pointer", border:"1.5px dashed "+(foto ? ac() : T.border), background: foto ? "transparent" : T.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", transition:"border-color 0.15s" }}
      >
        {foto ? (
          <>
            <img src={foto} alt={label} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
            <button
              onClick={function(e) { e.stopPropagation(); onSet(null); }}
              style={{ position:"absolute", top:5, right:5, background:"rgba(0,0,0,0.55)", border:"none", borderRadius:"50%", width:24, height:24, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:14 }}
            >x</button>
          </>
        ) : (
          <>
            <IcCamera c={T.muted} s={24}/>
            <span style={{ fontSize:10, color:T.muted, marginTop:5 }}>
              {lang === "es" ? "Añadir" : lang === "en" ? "Add" : "Adicionar"}
            </span>
          </>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        style={{ display:"none" }}
        onChange={function(e) {
          var f = e.target.files[0];
          if (!f) return;
          compressImage(f, function(compressedUrl) {
            onSet(compressedUrl);
          });
        }}
      />
    </div>
  );
}

// 5. PORTAL DE RESPOSTA DO ALUNO (PÁGINA PÚBLICA)
function StudentResponseScreen({ evalId }) {
  const search = window.location.search;
  let lang = "pt";
  if (search) {
    const params = new URLSearchParams(search);
    lang = params.get("lang") || params.get("locale") || "pt";
  }

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [config, setConfig] = useState(null);

  // Form states
  const [anamneseAnswers, setAnamneseAnswers] = useState({});
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [gorduraBio, setGorduraBio] = useState("");
  const [perimetria, setPerimetria] = useState({});
  const [testes, setTestes] = useState({});
  const [cardiovascular, setCardiovascular] = useState({ fcRepouso: "", fcRecuperacao: "", fcMax: "", pressaoArterial: "", cooper: "" });
  const [fotos, setFotos] = useState({ frente: null, lado: null, costas: null });
  const [submitting, setSubmitting] = useState(false);
  const [showPhotoGuide, setShowPhotoGuide] = useState(false);
  const [unansweredList, setUnansweredList] = useState([]);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [pieces] = useState(function() {
    var COLS = ["#FF6B6B","#FFD93D","#6BCB77","#4ECDC4","#A78BFA","#F97316","#EC4899"];
    var list = [];
    for (var i = 0; i < 35; i++) {
      list.push({ id:i, x: 5 + Math.random()*90, delay: (Math.random()*0.7).toFixed(2), color: COLS[i % COLS.length], size: 6 + Math.floor(Math.random()*8) });
    }
    return list;
  });

  const activePhotosCount = config && config.fotosTypes ? Math.max(1,
    (config.fotosTypes.frente ? 1 : 0) +
    (config.fotosTypes.lado ? 1 : 0) +
    (config.fotosTypes.costas ? 1 : 0)
  ) : 3;

  useEffect(function() {
    async function loadData() {
      try {
        const { data: ev, error: evError } = await supabase
          .from('evaluations')
          .select('*')
          .eq('id', evalId)
          .single();

        if (evError || !ev) {
          throw new Error(lang === "es" ? "Evaluación no encontrada." : lang === "en" ? "Evaluation not found." : "Avaliação não encontrada.");
        }

        if (ev.status === "respondida" || ev.status === "finalizada") {
          setSuccess(true);
          setLoading(false);
          return;
        }

        setEvaluation(ev);
        const evConfig = ev.config || {};
        setConfig(evConfig);

        // Apply trainer's branding dynamically
        if (evConfig.trainerCor) {
          _ACC = evConfig.trainerCor;
        }

        // Initialize Anamnese Answers
        if (evConfig.anamneseQuestions) {
          const initialAns = {};
          evConfig.anamneseQuestions.forEach(function(q) {
            initialAns[q] = "";
          });
          setAnamneseAnswers(initialAns);
        }

        // Initialize Perimetria
        if (evConfig.perimetriaFields) {
          const initialPerim = {};
          evConfig.perimetriaFields.forEach(function(f) {
            initialPerim[f.key] = "";
          });
          setPerimetria(initialPerim);
        }

        // Initialize Testes
        if (evConfig.testesExercises) {
          const initialTestes = {};
          evConfig.testesExercises.forEach(function(ex) {
            initialTestes[ex] = { reps: "", carga: "" };
          });
          setTestes(initialTestes);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [evalId]);

  async function performSubmit() {
    setSubmitting(true);
    setShowConfirmSubmit(false);

    try {
      // 1. Format Anamnese
      const formattedAnamnese = Object.keys(anamneseAnswers).map(function(q, idx) {
        return { id: idx + 1, pergunta: q, resposta: anamneseAnswers[q] };
      });

      // 2. Format Testes
      const formattedTestes = Object.keys(testes).map(function(ex, idx) {
        return { id: idx + 1, exercicio: ex, reps: testes[ex].reps, carga: testes[ex].carga };
      });

      // 3. Format Composition Slot if enabled
      let formattedComposicoes = [];
      if (config.sections.composicao) {
        formattedComposicoes = [{
          id: Date.now(),
          metodo: config.composicaoMethod || "",
          dobras: { tricipital:"", subescapular:"", peitoral:"", axilarMedia:"", suprailiaca:"", abdominal:"", coxa:"", bicipital:"", panturrilha:"" },
          bioimpedancia: { gordura: config.composicaoMethod === "bioimpedancia" ? String(gorduraBio || "") : "", massaMagra: "", massaGorda: "" }
        }];
      }

      // 4. Update Database
      const { error: updateError } = await supabase
        .from('evaluations')
        .update({
          status: 'respondida',
          anamnese: formattedAnamnese,
          peso: String(peso),
          altura: String(altura),
          perimetria: perimetria,
          testes: formattedTestes,
          cardiovascular: {
            tipoTeste: "cooper",
            cooper: cardiovascular.cooper || "",
            esteiraVelocidade: "",
            esteiraInclinacao: "",
            fcRepouso: cardiovascular.fcRepouso || "",
            fcRecuperacao: cardiovascular.fcRecuperacao || "",
            fcMax: cardiovascular.fcMax || "",
            pressaoArterial: cardiovascular.pressaoArterial || ""
          },
          fotos: fotos,
          composicoes: formattedComposicoes
        })
        .eq('id', evalId);

      if (updateError) throw updateError;
      setSuccess(true);
    } catch (err) {
      alert("Erro ao enviar avaliação: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault();

    const unanswered = [];
    
    // 1. Anamnese
    if (config.sections.anamnese && config.anamneseQuestions) {
      let anyEmptyAnamnese = false;
      config.anamneseQuestions.forEach(function(q) {
        if (!anamneseAnswers[q] || !anamneseAnswers[q].trim()) {
          anyEmptyAnamnese = true;
        }
      });
      if (anyEmptyAnamnese) {
        unanswered.push(lang === "es" ? "Preguntas de Anamnesis" : lang === "en" ? "Anamnesis Questions" : "Perguntas da Anamnese");
      }
    }

    // 2. Composição
    if (config.sections.composicao) {
      const isPesoReq = !config.composicaoFields || config.composicaoFields.peso !== false;
      const isAlturaReq = !config.composicaoFields || config.composicaoFields.altura !== false;
      let compUnanswered = [];
      if (isPesoReq && !peso) compUnanswered.push(lang === "es" ? "Peso" : lang === "en" ? "Weight" : "Peso");
      if (isAlturaReq && !altura) compUnanswered.push(lang === "es" ? "Altura" : lang === "en" ? "Height" : "Altura");
      if (config.composicaoMethod === "marinha") {
        if (!perimetria.pescoco || !perimetria.cintura || ((config.alunoSexo === "F" || config.alunoSexo === "f") && !perimetria.quadril)) {
          compUnanswered.push(lang === "es" ? "Medidas de la Marítima" : lang === "en" ? "Navy Circumferences" : "Medidas de Protocolo");
        }
      } else if (config.composicaoMethod === "bioimpedancia") {
        if (!gorduraBio) compUnanswered.push(lang === "es" ? "Grasa (%)" : lang === "en" ? "Body Fat (%)" : "Percentual de Gordura");
      }
      if (compUnanswered.length > 0) {
        unanswered.push(lang === "es" ? "Composición Corporal (" + compUnanswered.join(", ") + ")" : lang === "en" ? "Body Composition (" + compUnanswered.join(", ") + ")" : "Composição Corporal (" + compUnanswered.join(", ") + ")");
      }
    }

    // 3. Perimetria
    if (config.sections.perimetria && config.perimetriaFields) {
      let anyPerimEmpty = false;
      config.perimetriaFields.forEach(function(f) {
        if (!perimetria[f.key]) anyPerimEmpty = true;
      });
      if (anyPerimEmpty) {
        unanswered.push(lang === "es" ? "Medidas de Perimetría" : lang === "en" ? "Circumference Measurements" : "Medidas de Perimetria");
      }
    }

    // 4. Testes
    if (config.sections.testes && config.testesExercises) {
      let anyTestEmpty = false;
      config.testesExercises.forEach(function(ex) {
        if (!testes[ex] || !testes[ex].reps || !testes[ex].carga) anyTestEmpty = true;
      });
      if (anyTestEmpty) {
        unanswered.push(lang === "es" ? "Testes de Fuerza" : lang === "en" ? "Strength Tests" : "Testes de Força");
      }
    }

    // 5. Cardiovascular
    if (config.sections.cardiovascular && config.cardioFields) {
      let anyCardioEmpty = false;
      config.cardioFields.forEach(function(f) {
        if (!cardiovascular[f.key]) anyCardioEmpty = true;
      });
      if (anyCardioEmpty) {
        unanswered.push(lang === "es" ? "Datos Cardiovasculares" : lang === "en" ? "Cardiovascular Data" : "Dados Cardiovasculares");
      }
    }

    // 6. Fotos
    if (config.sections.fotos && config.fotosTypes) {
      let anyFotoEmpty = false;
      if (config.fotosTypes.frente && !fotos.frente) anyFotoEmpty = true;
      if (config.fotosTypes.lado && !fotos.lado) anyFotoEmpty = true;
      if (config.fotosTypes.costas && !fotos.costas) anyFotoEmpty = true;
      if (anyFotoEmpty) {
        unanswered.push(lang === "es" ? "Fotos de Evolución" : lang === "en" ? "Progress Photos" : "Fotos de Evolução");
      }
    }

    setUnansweredList(unanswered);
    setShowConfirmSubmit(true);
  }

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap: 20 }}>
        <div style={{ width: 40, height: 40, border: "3px solid " + T.border, borderTopColor: ac(), borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight:"100vh", padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: T.bg, textAlign: "center" }}>
        <Card sx={{ padding: 32, maxWidth: 380, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, border: "1px solid " + T.border }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={T.danger} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 8px" }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>{lang === "es" ? "Enlace Inválido" : lang === "en" ? "Invalid Link" : "Link Inválido"}</div>
          <div style={{ fontSize: 13, color: T.sub, lineHeight: 1.5 }}>{error}</div>
        </Card>
      </div>
    );
  }

    if (success) {
    return (
      <div style={{ minHeight:"100vh", padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: T.bg, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
          {pieces.map(function(p) {
            return <div key={p.id} style={{ position:"absolute", left:p.x+"%", top:"-15px", width:p.size, height:p.size, borderRadius:p.size/3, background:p.color, animation:"confettiFall 2s ease-in "+p.delay+"s both" }}/>;
          })}
          <style>{`
            @keyframes confettiFall {
              0% { transform: translateY(0) rotate(0deg); opacity: 1; }
              100% { transform: translateY(105vh) rotate(360deg); opacity: 0.3; }
            }
          `}</style>
        </div>
        <Card sx={{ padding: 32, maxWidth: 380, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, border: "1px solid " + T.border, boxShadow: T.shadowLg, position: "relative", zIndex: 10 }}>
          <div style={{ animation:"popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both", marginBottom: 12 }}>
            <svg width={96} height={96} viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="44" fill={ac()+"18"} stroke={ac()} strokeWidth="3"/>
              <polyline points="28,50 42,64 68,34" fill="none" stroke={ac()} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="60" style={{ animation:"checkDraw 0.45s ease 0.45s both", strokeDashoffset:60 }}/>
            </svg>
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>
            {lang === "es" ? "¡Evaluación Enviada!" : lang === "en" ? "Evaluation Sent!" : "Avaliação Enviada!"}
          </div>
          <div style={{ fontSize: 13, color: T.sub, lineHeight: 1.5 }}>
            {lang === "es" ? "Sus datos fueron enviados con éxito. ¡Ya puede cerrar esta pestaña!" : lang === "en" ? "Your data has been submitted successfully. You can now close this tab!" : "Seus dados foram enviados com sucesso. Você já pode fechar esta aba!"}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 16px 80px", display: "flex", flexDirection: "column", gap: 20 }}>
      <Card sx={{ padding: 20, border: "1.5px solid " + T.border, background: "linear-gradient(135deg, " + ac() + "0a, " + ac() + "18)", textAlign: "center" }}>
        <div style={{ width: 50, height: 50, borderRadius: "50%", background: ac(), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, margin: "0 auto 12px" }}>
          {config.trainerNome ? config.trainerNome.charAt(0).toUpperCase() : "T"}
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>
          {lang === "es" ? "Evaluación Física Online" : lang === "en" ? "Online Physical Evaluation" : "Avaliação Física Online"}
        </div>
        <div style={{ fontSize: 13, color: T.sub, marginTop: 4, lineHeight: 1.4 }}>
          {lang === "es" ? `Hola ${config.studentNome || ""}, por favor completa los datos físicos solicitados por ${config.trainerNome}:` : lang === "en" ? `Hello ${config.studentNome || ""}, please fill in the physical data requested by ${config.trainerNome}:` : `Olá ${config.studentNome || ""}, por favor preencha os dados físicos solicitados por ${config.trainerNome}:`}
        </div>
      </Card>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        
        {/* SEÇÃO: ANAMNESE */}
        {config.sections.anamnese && config.anamneseQuestions && config.anamneseQuestions.length > 0 && (
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:T.sub, letterSpacing:0.5, textTransform: "uppercase", marginBottom: 8, paddingLeft: 4 }}>
              {lang === "es" ? "Anamnesis" : lang === "en" ? "Anamnesis" : "Anamnese"}
            </div>
            <Card sx={{ padding: 16, display: "flex", flexDirection: "column", gap: 14, border: "1.5px solid " + T.border }}>
              {config.anamneseQuestions.map(function(q, idx) {
                return (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{q}</div>
                    <textarea
                      value={anamneseAnswers[q] || ""}
                      onChange={function(e) {
                        const next = Object.assign({}, anamneseAnswers, { [q]: e.target.value });
                        setAnamneseAnswers(next);
                      }}
                      rows={2}
                      style={{ width: "100%", background: T.bg, border: "1.5px solid " + T.border, borderRadius: 10, padding: "10px 12px", fontSize: 13, outline: "none", color: T.text, fontFamily: "inherit", resize: "vertical" }}
                      placeholder={lang === "es" ? "Escriba su respuesta aquí..." : lang === "en" ? "Write your answer here..." : "Escreva sua resposta aqui..."}
                    />
                  </div>
                );
              })}
            </Card>
          </div>
        )}

        {/* SEÇÃO: COMPOSIÇÃO (PESO & ALTURA) */}
        {config.sections.composicao && (
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:T.sub, letterSpacing:0.5, textTransform: "uppercase", marginBottom: 8, paddingLeft: 4 }}>
              {lang === "es" ? "Composición Corporal" : lang === "en" ? "Body Composition" : "Composição Corporal"}
            </div>
            <Card sx={{ padding: 16, display: "flex", flexDirection: "column", gap: 14, border: "1.5px solid " + T.border }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {(!config.composicaoFields || config.composicaoFields.peso !== false) && (
                  <FInput 
                    label={lang === "es" ? "Peso (kg)" : lang === "en" ? "Weight (kg)" : "Peso (kg)"}
                    value={peso}
                    onChange={setPeso}
                    type="number"
                    step="0.1"
                    placeholder="Ex: 75.5" 
                  />
                )}
                {(!config.composicaoFields || config.composicaoFields.altura !== false) && (
                  <FInput 
                    label={lang === "es" ? "Altura (cm)" : lang === "en" ? "Height (cm)" : "Altura (cm)"}
                    value={altura}
                    onChange={setAltura}
                    type="number"
                    placeholder="Ex: 175" 
                  />
                )}
                
                {/* Se o método for Marinha Americana, solicitar as medidas necessárias diretamente aqui! */}
                {config.composicaoMethod === "marinha" && (
                  <>
                    <div style={{ gridColumn: "span 2", borderTop: "1px solid " + T.borderLight, paddingTop: 12, marginTop: 4, fontSize: 11, fontWeight: 700, color: T.sub, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {lang === "es" ? "Medidas para la Ecuación" : lang === "en" ? "Navy Circumferences" : "Medidas para Protocolo"}
                    </div>
                    <FInput
                      label={lang === "es" ? "Cuello (cm)" : lang === "en" ? "Neck (cm)" : "Pescoço (cm)"}
                      value={perimetria.pescoco || ""}
                      onChange={function(v) { setPerimetria(Object.assign({}, perimetria, { pescoco: v })); }}
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                    />
                    <FInput
                      label={lang === "es" ? "Cintura (cm)" : lang === "en" ? "Waist (cm)" : "Cintura (cm)"}
                      value={perimetria.cintura || ""}
                      onChange={function(v) { setPerimetria(Object.assign({}, perimetria, { cintura: v })); }}
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                    />
                    {config && (config.alunoSexo === "F" || config.alunoSexo === "f") && (
                      <div style={{ gridColumn: "span 2" }}>
                        <FInput
                          label={lang === "es" ? "Cadera (cm)" : lang === "en" ? "Hip (cm)" : "Quadril (cm)"}
                          value={perimetria.quadril || ""}
                          onChange={function(v) { setPerimetria(Object.assign({}, perimetria, { quadril: v })); }}
                          type="number"
                          step="0.1"
                          placeholder="0.0"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Se o método for Bioimpedância, solicitar o percentual de gordura diretamente aqui! */}
                {config.composicaoMethod === "bioimpedancia" && (
                  <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ borderTop: "1px solid " + T.borderLight, paddingTop: 12, marginTop: 4, fontSize: 11, fontWeight: 700, color: T.sub, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {lang === "es" ? "Datos de Bioimpedancia" : lang === "en" ? "Bioimpedance Data" : "Dados de Bioimpedância"}
                    </div>
                    <FInput
                      label={lang === "es" ? "Porcentaje de Grasa (%)" : lang === "en" ? "Body Fat (%)" : "Percentual de Gordura (%)"}
                      value={gorduraBio}
                      onChange={setGorduraBio}
                      type="number"
                      step="0.1"
                      placeholder="Ex: 18.5"
                    />
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* SEÇÃO: PERIMETRIA */}
        {config.sections.perimetria && config.perimetriaFields && config.perimetriaFields.length > 0 && (
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:T.sub, letterSpacing:0.5, textTransform: "uppercase", marginBottom: 8, paddingLeft: 4 }}>
              {lang === "es" ? "Medidas Corporal (cm)" : lang === "en" ? "Body Measurements (cm)" : "Medidas Corporais (cm)"}
            </div>
            <Card sx={{ padding: 16, border: "1.5px solid " + T.border }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {config.perimetriaFields.map(function(f) {
                  return (
                    <FInput
                      key={f.key}
                      label={f.label}
                      value={perimetria[f.key] || ""}
                      onChange={function(v) {
                        const next = Object.assign({}, perimetria, { [f.key]: v });
                        setPerimetria(next);
                      }}
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                    />
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* SEÇÃO: TESTES DE FORÇA */}
        {config.sections.testes && config.testesExercises && config.testesExercises.length > 0 && (
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:T.sub, letterSpacing:0.5, textTransform: "uppercase", marginBottom: 8, paddingLeft: 4 }}>
              {lang === "es" ? "Testes de Fuerza" : lang === "en" ? "Strength Tests" : "Testes de Força"}
            </div>
            <Card sx={{ padding: 16, display: "flex", flexDirection: "column", gap: 16, border: "1.5px solid " + T.border }}>
              {config.testesExercises.map(function(ex) {
                return (
                  <div key={ex} style={{ display: "flex", flexDirection: "column", gap: 6, borderBottom: "1px solid " + T.borderLight, paddingBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{ex}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <FInput
                        label={lang === "es" ? "Carga (kg)" : lang === "en" ? "Load (kg)" : "Carga (kg)"}
                        value={testes[ex]?.carga || ""}
                        onChange={function(v) {
                          const nextVal = Object.assign({}, testes[ex], { carga: v });
                          const next = Object.assign({}, testes, { [ex]: nextVal });
                          setTestes(next);
                        }}
                        type="number"
                        placeholder="Ex: 50"
                      />
                      <FInput
                        label={lang === "es" ? "Repeticiones" : lang === "en" ? "Reps" : "Repetições"}
                        value={testes[ex]?.reps || ""}
                        onChange={function(v) {
                          const nextVal = Object.assign({}, testes[ex], { reps: v });
                          const next = Object.assign({}, testes, { [ex]: nextVal });
                          setTestes(next);
                        }}
                        type="number"
                        placeholder="Ex: 12"
                      />
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>
        )}

        {/* SEÇÃO: CARDIOVASCULAR */}
        {config.sections.cardiovascular && config.cardioFields && config.cardioFields.length > 0 && (
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:T.sub, letterSpacing:0.5, textTransform: "uppercase", marginBottom: 8, paddingLeft: 4 }}>
              {lang === "es" ? "Cardiovascular" : lang === "en" ? "Cardiovascular" : "Cardiovascular"}
            </div>
            <Card sx={{ padding: 16, display: "flex", flexDirection: "column", gap: 14, border: "1.5px solid " + T.border }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {config.cardioFields.some(function(f) { return f.key === "cooper"; }) && (
                  <div style={{ gridColumn: "span 2" }}>
                    <FInput
                      label={lang === "es" ? "Teste de Cooper (Distancia en metros)" : lang === "en" ? "Cooper Test (Distance in meters)" : "Teste de Cooper (Distância em metros)"}
                      value={cardiovascular.cooper}
                      onChange={function(v) { setCardiovascular(Object.assign({}, cardiovascular, { cooper: v })); }}
                      type="number"
                      placeholder="Ex: 2400"
                    />
                  </div>
                )}
                {config.cardioFields.some(function(f) { return f.key === "fcRepouso"; }) && (
                  <FInput
                    label={lang === "es" ? "Frec. Cardíaca Reposo (bpm)" : lang === "en" ? "Resting Heart Rate (bpm)" : "Frec. Cardíaca Repouso (bpm)"}
                    value={cardiovascular.fcRepouso}
                    onChange={function(v) { setCardiovascular(Object.assign({}, cardiovascular, { fcRepouso: v })); }}
                    type="number"
                    placeholder="Ex: 70"
                  />
                )}
                {config.cardioFields.some(function(f) { return f.key === "fcRecuperacao"; }) && (
                  <FInput
                    label={lang === "es" ? "Frec. Cardíaca Recuperación (bpm)" : lang === "en" ? "Recovery Heart Rate (bpm)" : "Frec. Cardíaca Recuperação (bpm)"}
                    value={cardiovascular.fcRecuperacao}
                    onChange={function(v) { setCardiovascular(Object.assign({}, cardiovascular, { fcRecuperacao: v })); }}
                    type="number"
                    placeholder="Ex: 120"
                  />
                )}
                {config.cardioFields.some(function(f) { return f.key === "fcMax"; }) && (
                  <FInput
                    label={lang === "es" ? "Frec. Cardíaca Máxima (bpm)" : lang === "en" ? "Max Heart Rate (bpm)" : "Frec. Cardíaca Máxima (bpm)"}
                    value={cardiovascular.fcMax}
                    onChange={function(v) { setCardiovascular(Object.assign({}, cardiovascular, { fcMax: v })); }}
                    type="number"
                    placeholder="Ex: 185"
                  />
                )}
                {config.cardioFields.some(function(f) { return f.key === "pressaoArterial"; }) && (
                  <FInput
                    label={lang === "es" ? "Presión Arterial" : lang === "en" ? "Blood Pressure" : "Pressão Arterial"}
                    value={cardiovascular.pressaoArterial}
                    onChange={function(v) { setCardiovascular(Object.assign({}, cardiovascular, { pressaoArterial: v })); }}
                    placeholder="Ex: 12/8"
                  />
                )}
              </div>
            </Card>
          </div>
        )}

        {/* SEÇÃO: FOTOS */}
        {config.sections.fotos && config.fotosTypes && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, paddingLeft: 4 }}>
              <span style={{ fontSize:12, fontWeight:700, color:T.sub, letterSpacing:0.5, textTransform: "uppercase" }}>
                {lang === "es" ? "Fotos de Acompañamiento" : lang === "en" ? "Follow-up Photos" : "Fotos de Acompanhamento"}
              </span>
              <button
                type="button"
                onClick={function() { setShowPhotoGuide(true); }}
                style={{ background: "none", border: "none", color: ac(), fontSize: 12, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
              >
                {lang === "es" ? "Ver Guía de Fotos" : lang === "en" ? "View Photo Guide" : "Ver Guia de Fotos"}
              </button>
            </div>
            <Card sx={{ padding: 16, border: "1.5px solid " + T.border }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(" + activePhotosCount + ", 1fr)", gap: 12 }}>
                {config.fotosTypes.frente && (
                  <StudentFotoSlot
                    label={lang === "es" ? "Frente" : lang === "en" ? "Front" : "Frente"}
                    foto={fotos.frente}
                    onSet={function(v) { setFotos(Object.assign({}, fotos, { frente: v })); }}
                    lang={lang}
                  />
                )}
                {config.fotosTypes.lado && (
                  <StudentFotoSlot
                    label={lang === "es" ? "Perfil" : lang === "en" ? "Side" : "Lado"}
                    foto={fotos.lado}
                    onSet={function(v) { setFotos(Object.assign({}, fotos, { lado: v })); }}
                    lang={lang}
                  />
                )}
                {config.fotosTypes.costas && (
                  <StudentFotoSlot
                    label={lang === "es" ? "Espalda" : lang === "en" ? "Back" : "Costas"}
                    foto={fotos.costas}
                    onSet={function(v) { setFotos(Object.assign({}, fotos, { costas: v })); }}
                    lang={lang}
                  />
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Submit Button */}
        <Btn full type="submit" disabled={submitting} className="btn-pulse" style={{ marginTop: 10, height: 48 }}>
          {submitting 
            ? (lang === "es" ? "Comprimiendo y Enviando..." : lang === "en" ? "Compressing & Sending..." : "Comprimindo e Enviando...") 
            : (lang === "es" ? "Enviar Evaluación Física" : lang === "en" ? "Submit Physical Evaluation" : "Enviar Avaliação Física")}
        </Btn>

      </form>

      {/* GUIA DE FOTOS MODAL */}
      {showPhotoGuide && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={function() { setShowPhotoGuide(false); }}>
          <Card onClick={function(e) { e.stopPropagation(); }} sx={{ padding: 24, width: "100%", maxWidth: 380, border: "1px solid " + T.border, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid " + T.borderLight, paddingBottom: 10 }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>
                {lang === "es" ? "Guía de Fotos" : lang === "en" ? "Photo Guide" : "Guia de Fotos"}
              </div>
              <button onClick={function() { setShowPhotoGuide(false); }} style={{ background: "none", border: "none", fontSize: 16, fontWeight: "bold", cursor: "pointer", color: T.muted }}>✕</button>
            </div>
            
            <div style={{ fontSize: 13, color: T.sub, lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <strong>1. {lang === "es" ? "Ángulo de la Cámara:" : lang === "en" ? "Camera Angle:" : "Ângulo da Câmera:"}</strong>
                <div>{lang === "es" ? "Posicione el celular en línea recta, idealmente a la altura del ombligo." : lang === "en" ? "Position the phone in a straight line, ideally at belly button height." : "Posicione o celular em linha reta, idealmente na altura do umbigo."}</div>
              </div>
              <div>
                <strong>2. {lang === "es" ? "Distancia:" : lang === "en" ? "Distance:" : "Distância:"}</strong>
                <div>{lang === "es" ? "Párese a unos 2 metros de distancia para encuadrar todo su cuerpo." : lang === "en" ? "Stand about 2 meters away to frame your entire body." : "Fique a cerca de 2 metros de distância para enquadrar o corpo inteiro."}</div>
              </div>
              <div>
                <strong>3. {lang === "es" ? "Iluminación y Fondo:" : lang === "en" ? "Lighting & Background:" : "Iluminação e Fundo:"}</strong>
                <div>{lang === "es" ? "Tómese las fotos en un lugar bien iluminado frente a una pared neutra o lisa." : lang === "en" ? "Take photos in a well-lit place facing a neutral or solid wall." : "Tire as fotos em um local bem iluminado de frente para uma parede neutra ou lisa."}</div>
              </div>
              <div>
                <strong>4. {lang === "es" ? "Vestimenta Recomendada:" : lang === "en" ? "Recommended Clothing:" : "Vestimenta Recomendada:"}</strong>
                <div>{lang === "es" ? "Use ropa deportiva cómoda (por ejemplo, shorts y top/camiseta sin mangas) para facilitar la evaluación postural." : lang === "en" ? "Wear comfortable athletic clothing (e.g., shorts and sports bra/tank top) to facilitate postural evaluation." : "Use roupas de treino curtas (ex: shorts e top/regata) para facilitar a visualização postural e de composição."}</div>
              </div>
            </div>

            <Btn full onClick={function() { setShowPhotoGuide(false); }}>
              {lang === "es" ? "Entendido" : lang === "en" ? "Understood" : "Entendi"}
            </Btn>
          </Card>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE ENVIO */}
      {showConfirmSubmit && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <Card sx={{ padding: 24, width: "100%", maxWidth: 400, border: "1px solid " + T.border, display: "flex", flexDirection: "column", gap: 16, boxShadow: T.shadowLg }}>
            
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: unansweredList.length > 0 ? T.warning + "15" : ac() + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {unansweredList.length > 0 ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T.warning} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ac()} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.text, letterSpacing: -0.4 }}>
                {unansweredList.length > 0 
                  ? (lang === "es" ? "Campos sin Responder" : lang === "en" ? "Unanswered Fields" : "Campos sem Resposta")
                  : (lang === "es" ? "Confirmar Envío" : lang === "en" ? "Confirm Submission" : "Confirmar Envio")}
              </div>
            </div>

            <div style={{ fontSize: 13, color: T.sub, lineHeight: 1.5 }}>
              {unansweredList.length > 0 ? (
                <>
                  {lang === "es" ? "Identificamos que las siguientes secciones no fueron completadas por completo:" : lang === "en" ? "We noticed that the following sections are not fully completed:" : "Identificamos que as seguintes seções não foram preenchidas por completo:"}
                  <ul style={{ margin: "10px 0", paddingLeft: 20, color: T.text, fontWeight: 500, display: "flex", flexDirection: "column", gap: 4 }}>
                    {unansweredList.map(function(item, idx) {
                      return <li key={idx}>{item}</li>;
                    })}
                  </ul>
                  {lang === "es" ? "¿Desea enviar sus respuestas de todas formas? Después de enviar, no podrá editarlas." : lang === "en" ? "Do you want to submit your responses anyway? After submitting, you won't be able to edit them." : "Deseja enviar as suas respostas assim mesmo? Após o envio, não será mais possível editá-las."}
                </>
              ) : (
                lang === "es" ? "¿Está seguro de que desea enviar sus respuestas ahora? Después de enviar, no será posible editarlas." : lang === "en" ? "Are you sure you want to submit your responses now? Once submitted, you won't be able to edit them." : "Tem certeza que deseja enviar as suas respostas agora? Após o envio, não será mais possível editá-las."
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
              <Btn full onClick={performSubmit} disabled={submitting}>
                {submitting 
                  ? (lang === "es" ? "Enviando..." : lang === "en" ? "Sending..." : "Enviando...") 
                  : (lang === "es" ? "Confirmar" : lang === "en" ? "Confirm" : "Confirmar e Enviar")}
              </Btn>
              <Btn variant="outline" full onClick={function() { setShowConfirmSubmit(false); }} disabled={submitting}>
                {lang === "es" ? "Cancelar" : lang === "en" ? "Cancel" : "Voltar e Preencher"}
              </Btn>
            </div>

          </Card>
        </div>
      )}

    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [logged, setLogged] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(function() {
    return localStorage.getItem("avaliapro_hide_install_prompt") !== "true";
  });
  const [tab, setTab] = useState("home");
  const [hasAccess, setHasAccess] = useState(true);
  const [user, setUser] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  
  const [trainer, setTrainer] = useState(function() {
    const saved = localStorage.getItem("avaliapro_trainer");
    let initialTrainer = { nome:"Prof. Jefferson", email:"prof@shapemap.com", foto:"", telefone:"", corPrimaria:"#1A1A2E", lang:"pt" };
    if (saved) {
      try { 
        initialTrainer = JSON.parse(saved); 
      } catch(err) { 
        console.warn(err); 
      }
    }
    
    // Check URL parameters for language override
    const search = window.location.search;
    if (search) {
      const params = new URLSearchParams(search);
      const urlLang = params.get("lang") || params.get("locale");
      if (urlLang === "es" || urlLang === "en" || urlLang === "pt") {
        initialTrainer.lang = urlLang;
      }
    }
    return initialTrainer;
  });

  const [alunos, setAlunos] = useState(function() {
    const saved = localStorage.getItem("avaliapro_alunos");
    if (saved) {
      try { return JSON.parse(saved); } catch(err) { console.warn(err); }
    }
    return DEMO_ALUNOS;
  });

  const [settings, setSettings] = useState(function() {
    const saved = localStorage.getItem("avaliapro_settings");
    if (saved) {
      try { 
        var parsed = JSON.parse(saved); 
        var oldOrderStr = JSON.stringify(["Puxada Aberta", "Supino Reto", "Agachamento", "Leg Press 45\u00B0", "Rosca Direta", "Puxada Pulley", "Tr\u00EDceps Pulley"]);
        var oldOrderStrAccentFix = JSON.stringify(["Puxada Aberta", "Supino Reto", "Agachamento", "Leg Press 45°", "Rosca Direta", "Puxada Pulley", "Tríceps Pulley"]);
        if (parsed && parsed.exerciciosForca) {
          var currentOrderStr = JSON.stringify(parsed.exerciciosForca);
          if (currentOrderStr === oldOrderStr || currentOrderStr === oldOrderStrAccentFix) {
            parsed.exerciciosForca = ["Supino Reto", "Agachamento", "Puxada Aberta", "Leg Press 45°", "Rosca Direta", "Puxada Pulley", "Tríceps Pulley"];
          }
        }
        return parsed; 
      } catch(err) { console.warn(err); }
    }
    return {
      defaultMetodo: "pollock7",
      anamnesePerguntas: PERGUNTAS_PADRAO.slice(),
      perimetriaCampos: [
        { label: "Pescoço", key: "pescoco", active: true },
        { label: "Ombros", key: "ombros", active: true },
        { label: "Peitoral", key: "peitoral", active: true },
        { label: "Cintura", key: "cintura", active: true },
        { label: "Abdominal", key: "abdominal", active: true },
        { label: "Quadril", key: "quadril", active: true },
        { label: "Braço Dir.", key: "bracoDireito", active: true },
        { label: "Braço Esq.", key: "bracoEsquerdo", active: true },
        { label: "Coxa Dir.", key: "coxaDireita", active: true },
        { label: "Coxa Esq.", key: "coxaEsquerda", active: true },
        { label: "Panturrilha Dir.", key: "panturrilhaDireita", active: true },
        { label: "Panturrilha Esq.", key: "panturrilhaEsquerda", active: true }
      ],
      exerciciosForca: ["Supino Reto", "Agachamento", "Puxada Aberta", "Leg Press 45°", "Rosca Direta", "Puxada Pulley", "Tríceps Pulley"]
    };
  });

  const [stack, setStack] = useState([]);

  // Load session and onAuthStateChange
  useEffect(function() {
    const search = window.location.search;
    if (search && search.includes("success=true")) {
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Purchase', {
          value: 99.00,
          currency: 'BRL'
        });
      }
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete("success");
        window.history.replaceState({}, document.title, url.pathname + url.search);
      } catch (e) {
        console.warn(e);
      }
    }

    const rememberMe = localStorage.getItem("avaliapro_remember_me");
    const sessionActive = sessionStorage.getItem("avaliapro_session_active");

    if (rememberMe === "false" && !sessionActive) {
      supabase.auth.signOut().then(function() {
        setLoadingSession(false);
      });
    } else {
      supabase.auth.getSession().then(function({ data: { session } }) {
        if (session) {
          sessionStorage.setItem("avaliapro_session_active", "true");
          setUser(session.user);
          setLogged(true);
          loadUserData(session.user);
        } else {
          setLoadingSession(false);
        }
      });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(function(event, session) {
      if (event === "PASSWORD_RECOVERY") {
        setIsResettingPassword(true);
        if (session) {
          setUser(session.user);
          setLogged(true);
        }
      } else if (session) {
        sessionStorage.setItem("avaliapro_session_active", "true");
        setUser(session.user);
        setLogged(true);
        loadUserData(session.user);
      } else {
        setUser(null);
        setLogged(false);
        setLoadingSession(false);
        setTrainer(function(prev) {
          return { nome:"Prof. Jefferson", email:"", foto:"", telefone:"", corPrimaria:"#1A1A2E", lang: prev?.lang || "pt" };
        });
        setAlunos([]);
      }
    });

    return function() {
      subscription.unsubscribe();
    };
  }, []);

  async function loadUserData(sessionUser) {
    setLoadingSession(true);
    try {
      let { data: trainerData, error: trainerError } = await supabase
        .from('trainers')
        .select('*')
        .eq('id', sessionUser.id)
        .maybeSingle();

      if (trainerError) throw trainerError;

      if (!trainerData) {
        const defaultSettings = {
          defaultMetodo: "pollock7",
          anamnesePerguntas: PERGUNTAS_PADRAO.slice(),
          perimetriaCampos: [
            { label: "Pescoço", key: "pescoco", active: true },
            { label: "Ombros", key: "ombros", active: true },
            { label: "Peitoral", key: "peitoral", active: true },
            { label: "Cintura", key: "cintura", active: true },
            { label: "Abdominal", key: "abdominal", active: true },
            { label: "Quadril", key: "quadril", active: true },
            { label: "Braço Dir.", key: "bracoDireito", active: true },
            { label: "Braço Esq.", key: "bracoEsquerdo", active: true },
            { label: "Coxa Dir.", key: "coxaDireita", active: true },
            { label: "Coxa Esq.", key: "coxaEsquerda", active: true },
            { label: "Panturrilha Dir.", key: "panturrilhaDireita", active: true },
            { label: "Panturrilha Esq.", key: "panturrilhaEsquerda", active: true }
          ],
          exerciciosForca: ["Supino Reto", "Agachamento", "Puxada Aberta", "Leg Press 45°", "Rosca Direta", "Puxada Pulley", "Tríceps Pulley"]
        };
        
        const newTrainer = {
          id: sessionUser.id,
          nome: sessionUser.user_metadata?.nome || "Prof. Novo",
          email: sessionUser.email,
          foto: "",
          telefone: sessionUser.user_metadata?.telefone || "",
          cor_primaria: "#1A1A2E",
          lang: trainer.lang || "pt",
          settings: defaultSettings
        };

        const { data: inserted, error: insertError } = await supabase
          .from('trainers')
          .insert([newTrainer])
          .select()
          .single();

        if (insertError) throw insertError;
        trainerData = inserted;
      }

      const mappedTrainer = {
        id: trainerData.id,
        nome: trainerData.nome || "",
        email: trainerData.email || "",
        foto: trainerData.foto || "",
        telefone: trainerData.telefone || "",
        corPrimaria: trainerData.cor_primaria || "#1A1A2E",
        lang: trainerData.lang || "pt",
        stripeCustomerId: trainerData.stripe_customer_id || "",
        subscriptionStatus: trainerData.subscription_status || "inactive",
        subscriptionId: trainerData.subscription_id || "",
        currentPeriodEnd: trainerData.current_period_end || null
      };

      setTrainer(mappedTrainer);

      const status = trainerData.subscription_status || "inactive";
      const periodEndStr = trainerData.current_period_end;
      
      let access = false;
      if (status === "active") {
        access = true;
      }
      if (status === "trialing" && periodEndStr) {
        const periodEnd = new Date(periodEndStr);
        if (periodEnd > new Date()) {
          access = true;
        }
      }
      setHasAccess(access);
      if (trainerData.settings) {
        var userSettings = trainerData.settings;
        var oldOrderStr = JSON.stringify(["Puxada Aberta", "Supino Reto", "Agachamento", "Leg Press 45\u00B0", "Rosca Direta", "Puxada Pulley", "Tr\u00EDceps Pulley"]);
        var oldOrderStrAccentFix = JSON.stringify(["Puxada Aberta", "Supino Reto", "Agachamento", "Leg Press 45°", "Rosca Direta", "Puxada Pulley", "Tríceps Pulley"]);
        if (userSettings && userSettings.exerciciosForca) {
          var currentOrderStr = JSON.stringify(userSettings.exerciciosForca);
          if (currentOrderStr === oldOrderStr || currentOrderStr === oldOrderStrAccentFix) {
            userSettings = Object.assign({}, userSettings, {
              exerciciosForca: ["Supino Reto", "Agachamento", "Puxada Aberta", "Leg Press 45°", "Rosca Direta", "Puxada Pulley", "Tríceps Pulley"]
            });
            setSettings(userSettings);
            handleUpdateSettings(userSettings);
          } else {
            setSettings(userSettings);
          }
        } else {
          setSettings(userSettings);
        }
      }

      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*, evaluations(*)')
        .eq('trainer_id', sessionUser.id)
        .order('nome');

      if (studentsError) throw studentsError;

      const mappedStudents = (studentsData || []).map(function(s) {
        return {
          id: s.id,
          nome: s.nome,
          sexo: s.sexo,
          foto: s.foto || "",
          telefone: s.telefone || "",
          dataNascimento: s.data_nascimento || "",
          avaliacoes: (s.evaluations || []).map(function(e) {
            return {
              id: e.id,
              data: e.data,
              nome: e.nome || s.nome,
              sexo: e.sexo || s.sexo,
              idade: e.idade || "",
              telefone: e.telefone || s.telefone || "",
              objetivo: e.objetivo || "",
              anamnese: e.anamnese || [],
              peso: e.peso || "",
              altura: e.altura || "",
              composicoes: e.composicoes || [],
              perimetria: e.perimetria || {},
              testes: e.testes || [],
              flexibilidade: e.flexibilidade || {},
              cardiovascular: e.cardiovascular || {},
              fotos: e.fotos || { frente: null, lado: null, costas: null },
              observacaoFotos: e.observacao_fotos || "",
              tipo: e.tipo || "presencial",
              status: e.status || "finalizada",
              config: e.config || {}
            };
          }).sort(function(a, b) {
            return a.data.localeCompare(b.data);
          })
        };
      });

      setAlunos(mappedStudents);
    } catch (err) {
      console.error("Erro ao carregar dados do usuário:", err);
      alert("Erro ao sincronizar com Supabase: " + err.message);
    } finally {
      setLoadingSession(false);
    }
  }

  // Local storage caching effects
  useEffect(function() {
    try {
      localStorage.setItem("avaliapro_trainer", JSON.stringify(trainer));
    } catch (err) {
      console.error("Erro ao salvar trainer:", err);
    }
  }, [trainer]);

  useEffect(function() {
    try {
      localStorage.setItem("avaliapro_alunos", JSON.stringify(alunos));
    } catch (err) {
      console.error("Erro ao salvar alunos:", err);
    }
  }, [alunos]);

  useEffect(function() {
    try {
      localStorage.setItem("avaliapro_settings", JSON.stringify(settings));
    } catch (err) {
      console.error("Erro ao salvar settings:", err);
    }
  }, [settings]);

  var cur = stack[stack.length - 1];

  useEffect(function() {
    _ACC = trainer.corPrimaria;
    document.documentElement.style.setProperty('--primary-color', trainer.corPrimaria);
    document.documentElement.style.setProperty('--primary-color-light', trainer.corPrimaria + "14");
  }, [trainer.corPrimaria]);

  function push(s) { setStack(function(p) { return p.concat([s]); }); }
  function pop()   { setStack(function(p) { return p.slice(0, -1); }); }
  function resetStack() { setStack([]); }

  async function handleUpdateSettings(newSettings) {
    setSettings(newSettings);
    if (logged && user) {
      const { error } = await supabase
        .from('trainers')
        .update({ settings: newSettings })
        .eq('id', user.id);
      if (error) {
        console.error("Erro ao salvar settings no Supabase:", error);
      }
    }
  }

  async function handleUpdateTrainer(newTrainer) {
    setTrainer(newTrainer);
    _ACC = newTrainer.corPrimaria;
    if (logged && user) {
      const { error } = await supabase
        .from('trainers')
        .update({
          nome: newTrainer.nome,
          telefone: newTrainer.telefone,
          foto: newTrainer.foto,
          cor_primaria: newTrainer.corPrimaria,
          lang: newTrainer.lang
        })
        .eq('id', user.id);
      if (error) {
        console.error("Erro ao salvar perfil no Supabase:", error);
      }
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    localStorage.removeItem("avaliapro_remember_me");
    sessionStorage.removeItem("avaliapro_session_active");
    setLogged(false);
    setHasAccess(true);
    resetStack();
  }

  async function addAluno(nome, sexo, telefone, dataNascimento) {
    if (logged && user) {
      const newStudentDb = {
        trainer_id: user.id,
        nome: nome,
        sexo: sexo || "M",
        foto: "",
        telefone: telefone || "",
        data_nascimento: dataNascimento || ""
      };
      const { data, error } = await supabase
        .from('students')
        .insert([newStudentDb])
        .select()
        .single();
      if (error) {
        alert("Erro ao cadastrar aluno: " + error.message);
        return;
      }
      const newStudent = {
        id: data.id,
        nome: data.nome,
        sexo: data.sexo,
        foto: data.foto || "",
        telefone: data.telefone || "",
        dataNascimento: data.data_nascimento || "",
        avaliacoes: []
      };
      setAlunos(function(p) { return p.concat([newStudent]); });
      push({ type:"aluno", id: data.id });
    } else {
      var a = { id: Date.now(), nome: nome, sexo: sexo || "M", foto: "", telefone: telefone || "", dataNascimento: dataNascimento || "", avaliacoes: [] };
      setAlunos(function(p) { return p.concat([a]); });
      push({ type:"aluno", id: a.id });
    }
  }

  async function updateAluno(id, nome, sexo, telefone, dataNascimento) {
    setAlunos(function(p) {
      return p.map(function(a) {
        if (String(a.id) !== String(id)) return a;
        var updatedAvs = (a.avaliacoes || []).map(function(av) {
          var newAge = dataNascimento ? calcIdade(dataNascimento) : av.idade;
          return Object.assign({}, av, {
            nome: nome,
            sexo: sexo || "M",
            telefone: telefone || "",
            idade: newAge
          });
        });
        return Object.assign({}, a, {
          nome: nome,
          sexo: sexo || "M",
          telefone: telefone || "",
          dataNascimento: dataNascimento || "",
          avaliacoes: updatedAvs
        });
      });
    });

    if (logged && user) {
      const { error } = await supabase
        .from('students')
        .update({
          nome: nome,
          sexo: sexo || "M",
          telefone: telefone || "",
          data_nascimento: dataNascimento || ""
        })
        .eq('id', id);
      if (error) {
        console.error("Erro ao atualizar aluno no Supabase:", error);
      }
    }
  }

  async function saveAval(alunoId, av) {
    setAlunos(function(p) {
      return p.map(function(a) {
        if (String(a.id) !== String(alunoId)) return a;
        var avList = a.avaliacoes || [];
        var ex = avList.find(function(x) { return String(x.id) === String(av.id); });
        var newAvs = ex ? avList.map(function(x) { return String(x.id) === String(av.id) ? av : x; }) : avList.concat([av]);
        return Object.assign({}, a, { avaliacoes: newAvs });
      });
    });

    if (logged && user) {
      const dbAval = {
        id: av.id,
        student_id: alunoId,
        data: av.data,
        idade: String(av.idade || ""),
        objetivo: av.objetivo || "",
        peso: String(av.peso || ""),
        altura: String(av.altura || ""),
        anamnese: av.anamnese || [],
        composicoes: av.composicoes || [],
        perimetria: av.perimetria || {},
        testes: av.testes || [],
        flexibilidade: av.flexibilidade || {},
        cardiovascular: av.cardiovascular || {},
        fotos: av.fotos || { frente: null, lado: null, costas: null },
        observacao_fotos: av.observacaoFotos || "",
        tipo: av.tipo || "presencial",
        status: av.status || "finalizada",
        config: av.config || {}
      };

      const { error } = await supabase
        .from('evaluations')
        .upsert(dbAval);
      
      if (error) {
        console.error("Erro ao salvar avaliação no Supabase:", error);
        throw error;
      }
    }
  }

  async function deleteAluno(id) { 
    setAlunos(function(p) { return p.filter(function(a) { return String(a.id) !== String(id); }); }); 
    resetStack(); 

    if (logged && user) {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);
      if (error) {
        console.error("Erro ao excluir aluno do Supabase:", error);
      }
    }
  }

  async function deleteAval(alunoId, avalId) {
    setAlunos(function(p) {
      return p.map(function(a) {
        if (String(a.id) !== String(alunoId)) return a;
        var avList = a.avaliacoes || [];
        return Object.assign({}, a, { avaliacoes: avList.filter(function(v) { return String(v.id) !== String(avalId); }) });
      });
    });

    if (logged && user) {
      const { error } = await supabase
        .from('evaluations')
        .delete()
        .eq('id', avalId);
      if (error) {
        console.error("Erro ao excluir avaliação do Supabase:", error);
      }
    }
  }

  async function updateAlunoAvalStatus(alunoId, avalId, tipo, status) {
    setAlunos(function(p) {
      return p.map(function(a) {
        if (String(a.id) !== String(alunoId)) return a;
        var avList = a.avaliacoes || [];
        var newAvs = avList.map(function(av) {
          if (String(av.id) !== String(avalId)) return av;
          return Object.assign({}, av, { tipo: tipo, status: status });
        });
        return Object.assign({}, a, { avaliacoes: newAvs });
      });
    });

    if (logged && user) {
      const { error } = await supabase
        .from('evaluations')
        .update({ tipo: tipo, status: status })
        .eq('id', avalId);
      if (error) {
        console.error("Erro ao atualizar status da avaliação no Supabase:", error);
      }
    }
  }

  if (loadingSession) {
    return (
      <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap: 20 }}>
        <GlobalStyle />
        <div style={{
          position: "relative",
          width: 80,
          height: 80,
          animation: "logoPulse 2s ease-in-out infinite"
        }}>
          {/* Background logo (faint/empty state dynamically colored) */}
          <div 
            style={{ 
              width: "100%", 
              height: "100%", 
              backgroundColor: ac(), 
              opacity: 0.1, 
              WebkitMaskImage: "url(/logo_transparent.png)",
              maskImage: "url(/logo_transparent.png)",
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              display: "block"
            }} 
          />
          {/* Foreground logo (animating fill state dynamically colored) */}
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "0%",
            overflow: "hidden",
            animation: "logoFill 2.5s ease-in-out infinite"
          }}>
            <div 
              style={{ 
                position: "absolute", 
                bottom: 0, 
                left: 0, 
                width: 80, 
                height: 80, 
                backgroundColor: ac(), 
                WebkitMaskImage: "url(/logo_transparent.png)",
                maskImage: "url(/logo_transparent.png)",
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                display: "block"
              }} 
            />
          </div>
        </div>
      </div>
    );
  }

  if (isResettingPassword) {
    return (
      <>
        <GlobalStyle />
        <ResetPasswordScreen 
          trainer={trainer} 
          onSaved={function() {
            setIsResettingPassword(false);
            if (user) {
              loadUserData(user);
            }
          }}
          onCancel={function() {
            setIsResettingPassword(false);
            handleLogout();
          }}
        />
      </>
    );
  }

  const searchParams = new URLSearchParams(window.location.search);
  const isResponder = searchParams.get("responder") === "true";
  const evalId = searchParams.get("id");

  if (isResponder && evalId) {
    return (
      <>
        <GlobalStyle />
        <StudentResponseScreen evalId={evalId} />
      </>
    );
  }

  if (!logged) return <><GlobalStyle/><LoginScreen onLogin={function() { setLogged(true); }} trainer={trainer} onUpdateTrainer={handleUpdateTrainer}/></>;

  if (!hasAccess) {
    return (
      <>
        <GlobalStyle />
        <PaywallScreen trainer={trainer} onLogout={handleLogout} />
      </>
    );
  }

  var content;
  if (cur && cur.type === "avaliacao") {
    var alunoAv = alunos.find(function(a) { return String(a.id) === String(cur.alunoId); });
    var age = "";
    if (alunoAv && alunoAv.dataNascimento) {
      age = calcIdade(alunoAv.dataNascimento);
    }
    var avList = alunoAv ? (alunoAv.avaliacoes || []) : [];
    var prevAval = null;
    var avalData = null;
    if (cur.isNew) {
      prevAval = avList.length > 0 ? avList[avList.length - 1] : null;
      var baseNew = newAval(alunoAv ? alunoAv.nome : "", alunoAv ? (alunoAv.sexo || "M") : "M", alunoAv ? alunoAv.telefone : "", age, settings);
      if (prevAval) {
        baseNew.peso = prevAval.peso || "";
        baseNew.altura = prevAval.altura || "";
        baseNew.objetivo = prevAval.objetivo || "";
        
        if (prevAval.anamnese && Array.isArray(prevAval.anamnese) && prevAval.anamnese.length > 0) {
          const prevAnswers = {};
          prevAval.anamnese.forEach(function(item) {
            if (item && item.pergunta) {
              prevAnswers[item.pergunta.trim()] = item.resposta;
            }
          });
          
          baseNew.anamnese = baseNew.anamnese.map(function(item) {
            const cleanQ = item.pergunta ? item.pergunta.trim() : "";
            const prevAns = prevAnswers[cleanQ];
            return {
              id: item.id,
              pergunta: item.pergunta,
              resposta: prevAns !== undefined ? prevAns : ""
            };
          });
        }
      }
      avalData = baseNew;
    } else {
      var curIdx = avList.findIndex(function(x) { return String(x.id) === String(cur.avalId); });
      if (curIdx > 0) {
        prevAval = avList[curIdx - 1];
      }
      avalData = alunoAv ? avList[curIdx] : null;
    }
    content = (
      <AvalForm 
        av={avalData || newAval(null, null, null, null, settings)} 
        alunoNome={alunoAv ? alunoAv.nome : ""} 
        isNew={cur.isNew} 
        onSave={async function(av) { if (alunoAv) await saveAval(alunoAv.id, av); }} 
        onBack={pop} 
        settings={settings} 
        trainer={trainer} 
        prevAval={prevAval}
        onSendToStudent={async function(av) {
          if (alunoAv) {
            push({ type: "configurar_online", alunoId: alunoAv.id, avalId: av.id });
          }
        }}
      />
    );
  } else if (cur && cur.type === "aluno") {
    var alunoProf = alunos.find(function(a) { return String(a.id) === String(cur.id); });
    content = (
      <AlunoScreen
        aluno={alunoProf}
        onBack={pop}
        onNewAval={function() { if (alunoProf) push({ type: "avaliacao", alunoId: alunoProf.id, isNew: true }); }}
        onOpenAval={function(id) { if (alunoProf) push({ type: "avaliacao", alunoId: alunoProf.id, avalId: id, isNew: false }); }}
        onDelete={function() { if (alunoProf) deleteAluno(alunoProf.id); }}
        onDeleteAval={function(id) { if (alunoProf) deleteAval(alunoProf.id, id); }}
        onCompare={function(indices) { if (alunoProf) push({ type: "comparar", alunoId: alunoProf.id, selectedIndices: indices }); }}
        onUpdateAluno={updateAluno}
        onUpdateAlunoAvalStatus={updateAlunoAvalStatus}
        trainer={trainer}
      />
    );
  } else if (cur && cur.type === "configurar_online") {
    var alunoProf = alunos.find(function(a) { return String(a.id) === String(cur.alunoId); });
    content = (
      <ConfigurarOnlineScreen
        aluno={alunoProf}
        settings={settings}
        trainer={trainer}
        onBack={pop}
        onSend={async function(onlineConfig) {
          const configJson = Object.assign({}, onlineConfig, {
            trainerColor: trainer.corPrimaria || "#1A1A2E",
            trainerNome: trainer.nome || "Prof. Jefferson",
            alunoNome: alunoProf.nome,
            alunoSexo: alunoProf.sexo || "M"
          });

          // 1. Update existing evaluation in local state
          setAlunos(function(p) {
            return p.map(function(a) {
              if (String(a.id) !== String(alunoProf.id)) return a;
              var avList = a.avaliacoes || [];
              var nextAvs = avList.map(function(x) {
                if (String(x.id) === String(cur.avalId)) {
                  return Object.assign({}, x, {
                    tipo: "online",
                    status: "aguardando_resposta",
                    config: configJson
                  });
                }
                return x;
              });
              return Object.assign({}, a, { avaliacoes: nextAvs });
            });
          });

          // 2. Update existing evaluation in Supabase
          if (logged && user) {
            try {
              const { data: existingEv } = await supabase
                .from('evaluations')
                .select('*')
                .eq('id', cur.avalId)
                .single();

              const updatedEv = Object.assign({}, existingEv, {
                tipo: "online",
                status: "aguardando_resposta",
                config: configJson
              });

              const { error } = await supabase
                .from('evaluations')
                .upsert(updatedEv);
                
              if (error) {
                console.error("Erro ao salvar no Supabase:", error);
                alert("Erro ao salvar no Supabase: " + error.message);
                return;
              }
            } catch (err) {
              console.error("Erro ao atualizar avaliação online:", err);
            }
          }

          const generatedUrl = window.location.origin + "/?responder=true&id=" + cur.avalId + "&lang=" + (trainer.lang || "pt");
          
          setStack(function(p) {
            return p.slice(0, -1).concat([{ type: "link_gerado", alunoId: alunoProf.id, url: generatedUrl }]);
          });
        }}
      />
    );
  } else if (cur && cur.type === "link_gerado") {
    var alunoProf = alunos.find(function(a) { return String(a.id) === String(cur.alunoId); });
    content = (
      <LinkGeradoModal
        url={cur.url}
        alunoNome={alunoProf.nome}
        onClose={function() {
          pop();
        }}
        trainer={trainer}
      />
    );
  } else if (cur && cur.type === "comparar") {
    var alunoComp = alunos.find(function(a) { return String(a.id) === String(cur.alunoId); });
    content = <CompararScreen aluno={alunoComp} initAv1={cur.av1} initAv2={cur.av2} initSelected={cur.selectedIndices} onBack={pop} settings={settings} trainer={trainer}/>;
  } else {
    content = (
      <>
        {tab === "home"    && <HomeScreen alunos={alunos} trainer={trainer} onSelectAluno={function(id) { push({ type:"aluno", id: id }); }} onDeleteAluno={deleteAluno} onAddAluno={addAluno} onSelectPerfil={function() { setTab("perfil"); }}/>}
        {tab === "modelos" && <AjustesScreen settings={settings} onUpdateSettings={handleUpdateSettings} trainer={trainer} onUpdateTrainer={handleUpdateTrainer} />}
        {tab === "perfil"  && <PerfilScreen trainer={trainer} onUpdate={handleUpdateTrainer} onLogout={handleLogout}/>}
      </>
    );
  }

  const lang = (trainer && trainer.lang) || "pt";

  return (
    <div className="app-container" style={{ minHeight:"100vh", background:T.bg, fontFamily:"'Outfit', sans-serif", maxWidth:640, margin:"0 auto", position:"relative" }}>
      <GlobalStyle/>
      {content}
      {!cur && <BottomNav active={tab} onChange={function(t) { setTab(t); resetStack(); }} trainer={trainer}/>}

      {showInstallModal && logged && hasAccess && !isResettingPassword && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(4px)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }} onClick={function() { setShowInstallModal(false); }}>
          <div onClick={function(e) { e.stopPropagation(); }} style={{ background:T.surface, borderRadius:20, padding:24, width:"100%", maxWidth:360, boxShadow:"0 20px 40px rgba(0,0,0,0.15)", position:"relative", border:"1px solid "+T.border }}>
            <div style={{ position: "absolute", top: 16, right: 18, cursor: "pointer", fontSize: 16, color: T.muted, fontWeight: "bold" }} onClick={function() { setShowInstallModal(false); }}>✕</div>
            
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 24 }}>📱</span>
              <div style={{ fontWeight: 800, fontSize: 16, color: T.text }}>
                {lang === "pt" ? "Instalar o ShapeMap no Celular" : "Install ShapeMap on your Phone"}
              </div>
            </div>
            
            <div style={{ fontSize: 14, color: T.sub, lineHeight: 1.6, marginBottom: 20 }}>
              {lang === "pt" ? (
                <>
                  Acesse mais rápido e use em tela cheia como se fosse um aplicativo de verdade:
                  <div style={{ marginTop: 12, paddingLeft: 2 }}>
                    1. <strong>iPhone:</strong> toque nos <strong>três pontinhos (...)</strong> no canto inferior direito, selecione <strong>Compartilhar</strong>, role a tela para baixo e clique em <strong>"Adicionar à Tela de Início"</strong>.
                  </div>
                  <div style={{ marginTop: 10, paddingLeft: 2 }}>
                    2. <strong>Android (Chrome):</strong> toque no menu de <strong>três pontinhos (⋮)</strong> no topo, role e selecione <strong>"Adicionar à tela inicial"</strong> ou <strong>"Instalar aplicativo"</strong>.
                  </div>
                </>
              ) : (
                <>
                  Access faster and use in full-screen mode like a native app:
                  <div style={{ marginTop: 12, paddingLeft: 2 }}>
                    1. <strong>iPhone:</strong> tap the <strong>three dots (...)</strong> in the bottom right corner, select <strong>Share</strong>, scroll down and tap <strong>"Add to Home Screen"</strong>.
                  </div>
                  <div style={{ marginTop: 10, paddingLeft: 2 }}>
                    2. <strong>Android (Chrome):</strong> tap the <strong>three dots (⋮)</strong> menu at the top, scroll and select <strong>"Add to Home Screen"</strong> or <strong>"Install app"</strong>.
                </div>
              </>
            )}
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Btn full onClick={function() { setShowInstallModal(false); }}>
              {lang === "pt" ? "Entendi, vou seguir o passo a passo" : "Got it, I'll follow the steps"}
            </Btn>
            <button 
              onClick={function() {
                localStorage.setItem("avaliapro_hide_install_prompt", "true");
                setShowInstallModal(false);
              }}
              style={{
                background: "none",
                border: "none",
                color: ac(),
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                padding: "8px 0",
                textDecoration: "underline",
                textAlign: "center"
              }}
            >
              {lang === "pt" ? "Não me avisar novamente" : "Don't show this again"}
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}