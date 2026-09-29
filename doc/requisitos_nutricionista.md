# Requisitos do Nutricionista — Aptus

## 1. Objetivo

Definir os requisitos funcionais relacionados ao perfil de **Nutricionista** no sistema Aptus, contemplando o gerenciamento de pacientes, consultas, avaliações, planos alimentares e acompanhamento da evolução nutricional.

## 2. Requisitos Funcionais

### RN-NUT-01 — Acesso do nutricionista
O sistema deve permitir que o nutricionista realize login e acesse as funcionalidades destinadas ao seu perfil.

### RN-NUT-02 — Gerenciamento do perfil profissional
O sistema deve permitir que o nutricionista visualize e edite seus dados profissionais.

### RN-NUT-03 — Cadastro de pacientes
O sistema deve permitir que o nutricionista cadastre novos pacientes, registrando seus dados pessoais e informações necessárias para o acompanhamento nutricional.

### RN-NUT-04 — Consulta de pacientes
O sistema deve permitir que o nutricionista visualize a lista de pacientes vinculados à sua conta e pesquise pacientes por informações cadastradas.

### RN-NUT-05 — Visualização do perfil do paciente
O sistema deve permitir que o nutricionista visualize os dados e informações nutricionais de um paciente.

### RN-NUT-06 — Registro de consultas
O sistema deve permitir que o nutricionista registre consultas realizadas, incluindo data, observações e informações relevantes do atendimento.

### RN-NUT-07 — Histórico de consultas
O sistema deve manter o histórico de consultas de cada paciente e permitir que o nutricionista o consulte.

### RN-NUT-08 — Registro de avaliação nutricional
O sistema deve permitir que o nutricionista registre avaliações nutricionais do paciente, incluindo, quando aplicável, peso, altura, IMC, medidas corporais e observações.

### RN-NUT-09 — Acompanhamento da evolução
O sistema deve permitir que o nutricionista acompanhe a evolução das informações nutricionais do paciente ao longo do tempo.

### RN-NUT-10 — Criação de plano alimentar
O sistema deve permitir que o nutricionista crie planos alimentares personalizados para seus pacientes.

### RN-NUT-11 — Edição de plano alimentar
O sistema deve permitir que o nutricionista altere um plano alimentar existente.

### RN-NUT-12 — Visualização de planos alimentares
O sistema deve permitir que o nutricionista consulte os planos alimentares cadastrados para cada paciente.

### RN-NUT-13 — Histórico de planos alimentares
O sistema deve manter o histórico dos planos alimentares do paciente, permitindo identificar planos anteriores e atuais.

### RN-NUT-14 — Registro de observações
O sistema deve permitir que o nutricionista registre observações relacionadas ao acompanhamento do paciente.

### RN-NUT-15 — Organização dos pacientes
O sistema deve apresentar as informações dos pacientes de forma organizada, facilitando a consulta e o acompanhamento dos atendimentos.

## 3. Requisitos de Segurança e Acesso

### RN-NUT-16 — Controle de acesso
O sistema deve garantir que o nutricionista tenha acesso somente às funcionalidades e informações permitidas para seu perfil.

### RN-NUT-17 — Privacidade dos dados
O sistema deve restringir o acesso às informações dos pacientes a usuários autorizados.

### RN-NUT-18 — Associação entre nutricionista e paciente
O sistema deve manter o vínculo entre o nutricionista e os pacientes que estão sob seu acompanhamento.

## 4. Regras Gerais

- As informações registradas pelo nutricionista devem permanecer associadas ao paciente correspondente.
- Alterações realizadas nos dados do acompanhamento devem ser refletidas no sistema de forma consistente.
- O sistema deve apresentar mensagens adequadas quando uma operação não puder ser concluída.
- Campos obrigatórios devem ser identificados e validados antes do salvamento.
