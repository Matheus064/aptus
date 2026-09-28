# Histórias de Usuário — APTUS

## 1. Introdução

As histórias de usuário descrevem as principais necessidades dos usuários do APTUS e os comportamentos esperados da plataforma.

O formato utilizado é:

> **Como** [tipo de usuário]  
> **Quero** [ação ou funcionalidade]  
> **Para** [objetivo ou benefício]

---

## 2. Histórias de Usuário — Cliente/Usuário

### US01 — Cadastro

**Como** visitante  
**Quero** criar uma conta no APTUS  
**Para** poder utilizar os recursos da plataforma.

**Critérios de aceitação:**
- Deve ser possível informar os dados necessários para criar uma conta.
- O sistema deve validar os campos obrigatórios.
- Após o cadastro, o usuário deve conseguir acessar sua conta.

---

### US02 — Login do usuário

**Como** usuário  
**Quero** fazer login na plataforma  
**Para** acessar meu perfil e minhas funcionalidades.

**Critérios de aceitação:**
- Deve existir uma área de login específica para usuários.
- O sistema deve validar as credenciais.
- Credenciais inválidas devem gerar uma mensagem de erro.
- Após o login, o usuário deve ser direcionado à área principal.

---

### US03 — Visualizar perfil

**Como** usuário  
**Quero** visualizar meu perfil  
**Para** acompanhar minhas informações e minha atividade na plataforma.

**Critérios de aceitação:**
- O perfil deve apresentar nome e informações cadastradas.
- O usuário deve conseguir visualizar seus conteúdos publicados.
- A página deve apresentar informações relacionadas ao seu acompanhamento.

---

### US04 — Editar perfil

**Como** usuário  
**Quero** editar minhas informações pessoais  
**Para** manter meu perfil atualizado.

**Critérios de aceitação:**
- Deve ser possível alterar as informações permitidas.
- As alterações devem ser refletidas no perfil.
- O sistema deve validar os dados inseridos.

---

### US05 — Visualizar feed

**Como** usuário  
**Quero** visualizar um feed de conteúdos  
**Para** descobrir receitas, curiosidades e informações relacionadas à alimentação saudável.

**Critérios de aceitação:**
- O feed deve apresentar diferentes publicações.
- Cada publicação deve exibir autor e conteúdo.
- O usuário deve conseguir navegar entre as publicações.

---

### US06 — Publicar conteúdo

**Como** usuário  
**Quero** publicar conteúdos  
**Para** compartilhar receitas, experiências, dicas e informações com a comunidade.

**Critérios de aceitação:**
- O usuário deve conseguir criar uma publicação.
- A publicação deve permitir inserir conteúdo textual.
- A nova publicação deve aparecer no feed.

---

### US07 — Curtir publicação

**Como** usuário  
**Quero** curtir publicações  
**Para** demonstrar interesse pelo conteúdo.

**Critérios de aceitação:**
- Deve existir uma ação de curtir.
- O usuário deve conseguir alterar sua interação.
- A quantidade de curtidas deve ser atualizada na interface.

---

### US08 — Comentar publicação

**Como** usuário  
**Quero** comentar em uma publicação  
**Para** participar das discussões e interagir com outros usuários.

**Critérios de aceitação:**
- Deve ser possível escrever e enviar um comentário.
- O comentário deve aparecer associado à publicação.
- O sistema deve impedir o envio de comentários vazios.

---

### US09 — Seguir usuário

**Como** usuário  
**Quero** seguir outros usuários  
**Para** acompanhar seus conteúdos.

**Critérios de aceitação:**
- Deve existir uma opção para seguir.
- O usuário deve conseguir deixar de seguir.
- A relação deve ser refletida no perfil.

---

### US10 — Visualizar receitas

**Como** usuário  
**Quero** visualizar receitas  
**Para** encontrar ideias de refeições e aprender novas formas de preparo.

**Critérios de aceitação:**
- As receitas devem apresentar título e informações relevantes.
- O usuário deve conseguir visualizar os ingredientes.
- O usuário deve conseguir visualizar o modo de preparo.

---

### US11 — Interagir com receitas

**Como** usuário  
**Quero** interagir com receitas publicadas  
**Para** compartilhar e demonstrar interesse pelos conteúdos que considero úteis.

**Critérios de aceitação:**
- As receitas devem aparecer no feed quando apropriado.
- O usuário deve conseguir curtir e comentar receitas.
- O conteúdo deve identificar seu autor.

---

### US12 — Encontrar nutricionista

**Como** usuário  
**Quero** visualizar nutricionistas disponíveis  
**Para** encontrar um profissional com quem eu possa entrar em contato.

**Critérios de aceitação:**
- Deve existir uma área específica para nutricionistas.
- Cada profissional deve apresentar informações básicas.
- Deve existir uma ação para iniciar contato.

---

### US13 — Enviar mensagem ao nutricionista

**Como** usuário  
**Quero** enviar mensagens para um nutricionista  
**Para** entrar em contato e tirar dúvidas dentro da proposta da plataforma.

**Critérios de aceitação:**
- Deve ser possível selecionar um nutricionista.
- Deve ser possível enviar uma mensagem.
- A conversa deve apresentar as mensagens enviadas.

---

### US14 — Solicitar consulta

**Como** usuário  
**Quero** solicitar ou acompanhar uma consulta  
**Para** organizar meu acompanhamento com um nutricionista.

**Critérios de aceitação:**
- Deve existir uma opção relacionada a consultas.
- O usuário deve conseguir visualizar o status da solicitação.
- Informações da consulta devem ser apresentadas de forma clara.

---

## 3. Histórias de Usuário — Nutricionista

### US15 — Login do nutricionista

**Como** nutricionista  
**Quero** possuir uma área de login específica  
**Para** acessar as funcionalidades profissionais da plataforma.

**Critérios de aceitação:**
- Deve existir uma entrada de login separada para nutricionistas.
- O sistema deve validar as credenciais.
- O nutricionista deve ser direcionado ao painel profissional.

---

### US16 — Visualizar painel profissional

**Como** nutricionista  
**Quero** visualizar meu painel profissional  
**Para** acompanhar meus pacientes, mensagens e consultas.

**Critérios de aceitação:**
- O painel deve apresentar informações relevantes para o profissional.
- Deve ser possível acessar pacientes, mensagens e consultas.
- As informações devem ser organizadas de forma clara.

---

### US17 — Gerenciar perfil profissional

**Como** nutricionista  
**Quero** editar meu perfil profissional  
**Para** manter minhas informações atualizadas para os usuários.

**Critérios de aceitação:**
- Deve ser possível alterar informações profissionais permitidas.
- As alterações devem aparecer no perfil público.
- O sistema deve validar os campos necessários.

---

### US18 — Visualizar pacientes

**Como** nutricionista  
**Quero** visualizar os usuários que acompanho  
**Para** organizar meu atendimento dentro da plataforma.

**Critérios de aceitação:**
- O nutricionista deve ter acesso à sua lista de pacientes.
- Deve ser possível visualizar informações básicas de cada paciente.
- Os dados devem ser apresentados de forma organizada.

---

### US19 — Responder mensagens

**Como** nutricionista  
**Quero** responder mensagens dos usuários  
**Para** manter comunicação com as pessoas que utilizam meu atendimento.

**Critérios de aceitação:**
- O nutricionista deve conseguir visualizar conversas.
- Deve conseguir enviar respostas.
- As respostas devem aparecer na conversa correspondente.

---

### US20 — Gerenciar consultas

**Como** nutricionista  
**Quero** visualizar e gerenciar consultas  
**Para** organizar meus atendimentos.

**Critérios de aceitação:**
- O nutricionista deve conseguir visualizar consultas.
- Deve conseguir identificar o status das solicitações.
- As informações devem ser apresentadas de forma organizada.

---

### US21 — Publicar conteúdo profissional

**Como** nutricionista  
**Quero** publicar conteúdos sobre alimentação e nutrição  
**Para** compartilhar informações educativas com a comunidade.

**Critérios de aceitação:**
- O nutricionista deve conseguir criar uma publicação.
- A publicação deve identificar o profissional como autor.
- O conteúdo deve aparecer no feed.

---

### US22 — Publicar receitas

**Como** nutricionista  
**Quero** publicar receitas  
**Para** compartilhar sugestões de preparo e educação alimentar.

**Critérios de aceitação:**
- Deve ser possível informar título, ingredientes e modo de preparo.
- A receita deve ser identificada como conteúdo do nutricionista.
- A receita deve ficar disponível para os usuários.

---

## 4. Histórias de Usuário — Visitante

### US23 — Conhecer o APTUS

**Como** visitante  
**Quero** acessar a página inicial  
**Para** entender a proposta da plataforma antes de criar uma conta.

**Critérios de aceitação:**
- A página inicial deve apresentar o nome APTUS.
- Deve explicar de forma resumida a proposta da plataforma.
- Deve oferecer caminhos claros para login ou cadastro.

---

### US24 — Escolher tipo de acesso

**Como** visitante  
**Quero** escolher entre acesso de usuário e nutricionista  
**Para** entrar na área correspondente ao meu perfil.

**Critérios de aceitação:**
- As duas opções devem ser facilmente identificáveis.
- Cada opção deve levar à área correta.
- As interfaces devem informar claramente o tipo de acesso.

---

## 5. Regras gerais de experiência

As funcionalidades do APTUS devem buscar:

- navegação simples e intuitiva;
- interface responsiva;
- mensagens claras de erro e sucesso;
- diferenciação entre as permissões de usuário e nutricionista;
- facilidade para encontrar conteúdos e profissionais;
- experiência adequada para computadores e dispositivos móveis.

---

## 6. Resumo das histórias

| Código | Perfil | Funcionalidade |
|---|---|---|
| US01 | Visitante | Cadastro |
| US02 | Usuário | Login |
| US03 | Usuário | Visualizar perfil |
| US04 | Usuário | Editar perfil |
| US05 | Usuário | Visualizar feed |
| US06 | Usuário | Publicar conteúdo |
| US07 | Usuário | Curtir publicação |
| US08 | Usuário | Comentar publicação |
| US09 | Usuário | Seguir usuário |
| US10 | Usuário | Visualizar receitas |
| US11 | Usuário | Interagir com receitas |
| US12 | Usuário | Encontrar nutricionista |
| US13 | Usuário | Enviar mensagem |
| US14 | Usuário | Solicitar consulta |
| US15 | Nutricionista | Login |
| US16 | Nutricionista | Painel profissional |
| US17 | Nutricionista | Perfil profissional |
| US18 | Nutricionista | Visualizar pacientes |
| US19 | Nutricionista | Responder mensagens |
| US20 | Nutricionista | Gerenciar consultas |
| US21 | Nutricionista | Publicar conteúdo |
| US22 | Nutricionista | Publicar receitas |
| US23 | Visitante | Conhecer o APTUS |
| US24 | Visitante | Escolher tipo de acesso |
