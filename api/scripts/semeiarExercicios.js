const { executar, buscar, inicializarBanco, banco } = require('../src/config/conexaoBanco');

const exercicios = [
  { nome: 'Agachamento livre', descricao: 'Fortalece pernas e glúteos usando apenas o peso do corpo.', tecnica: 'Mantenha o peito aberto, empurre o quadril para trás e desça com os joelhos alinhados aos pés.', musculos: ['perna', 'glúteo'], ambientes: ['casa'], dificuldade: 2, series: 3, repeticoes: 12, descanso: 60, video: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { nome: 'Flexão de braços', descricao: 'Exercício para peito, ombros e braços que pode ser adaptado em casa.', tecnica: 'Apoie as mãos abaixo dos ombros e desça o corpo mantendo o abdômen firme.', ambientes: ['casa'], musculos: ['peito', 'braço', 'ombro'], dificuldade: 3, series: 3, repeticoes: 10, descanso: 60, video: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { nome: 'Prancha frontal', descricao: 'Trabalha o core e ajuda a desenvolver estabilidade.', tecnica: 'Apoie os antebraços, contraia o abdômen e mantenha o corpo em linha reta.', ambientes: ['casa'], musculos: ['core'], dificuldade: 2, series: 3, repeticoes: 30, descanso: 45, video: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { nome: 'Remada com halteres', descricao: 'Movimento de academia para costas e braços.', tecnica: 'Incline o tronco com a coluna neutra e puxe os cotovelos para trás.', ambientes: ['academia'], musculos: ['costas', 'braço'], dificuldade: 3, series: 4, repeticoes: 10, descanso: 75, video: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { nome: 'Desenvolvimento de ombros', descricao: 'Fortalece os ombros com carga controlada.', tecnica: 'Empurre os pesos acima da cabeça sem compensar com a lombar.', ambientes: ['academia'], musculos: ['ombro', 'braço'], dificuldade: 3, series: 3, repeticoes: 12, descanso: 60, video: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { nome: 'Avanço alternado', descricao: 'Exercício unilateral para pernas e glúteos.', tecnica: 'Dê um passo à frente, desça controlando e retorne mantendo o equilíbrio.', ambientes: ['academia'], musculos: ['perna', 'glúteo'], dificuldade: 3, series: 3, repeticoes: 10, descanso: 60, video: 'https://www.w3schools.com/html/mov_bbb.mp4' },
];

(async () => {
  await inicializarBanco();
  const criador = await buscar("SELECT id FROM usuarios WHERE role IN ('nutricionista', 'admin') ORDER BY id LIMIT 1");
  if (!criador) throw new Error('Nenhum nutricionista ou admin encontrado.');
  for (const item of exercicios) {
    let exercicio = await buscar('SELECT id FROM exercicios WHERE nome = ?', [item.nome]);
    if (!exercicio) {
      const resultado = await executar(`INSERT INTO exercicios (nome, descricao, tecnica, criado_por, video_url, musculos_trabalhados, dificuldade, series_recomendadas, repeticoes_recomendadas, descanso_segundos, contraindicacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [item.nome, item.descricao, item.tecnica, criador.id, item.video, JSON.stringify(item.musculos), item.dificuldade, item.series, item.repeticoes, item.descanso, 'Pare se sentir dor aguda ou tontura.']);
      exercicio = { id: resultado.id };
    }
    await executar('UPDATE exercicios SET ambientes = ? WHERE id = ?', [JSON.stringify(item.ambientes), exercicio.id]);
    await executar(`INSERT OR IGNORE INTO exercicios_execucao (exercicio_id, execucao_estruturada, tempo_total_execucao_segundos, video_completo_url, video_curto_url, equipamento_necessario, dicas_seguranca) VALUES (?, ?, ?, ?, ?, ?, ?)`, [exercicio.id, JSON.stringify([{ passo: 1, descricao: item.tecnica, duracao_segundos: 30, dica: 'Faça o movimento sem pressa.' }]), 30, item.video, item.video, JSON.stringify([]), JSON.stringify(['Mantenha a respiração regular.', 'Interrompa se sentir dor.'])]);
  }
  console.log(`${exercicios.length} exercícios disponíveis no Aptus.`);
})().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => banco.close());
