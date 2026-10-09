# Documento de Requisitos de Sistema — Aptus
**Versão 1.0** · Especificação de requisitos de software

---

### 1. Introdução
O Aptus é um sistema web voltado à conexão entre usuários e nutricionistas, com o objetivo de facilitar o acesso a informações sobre alimentação e permitir que os usuários encontrem profissionais da área de nutrição.

O sistema disponibiliza funcionalidades de cadastro e login, gerenciamento de perfil, visualização de publicações em um feed e contato com nutricionistas.

---

### 2. Objetivo do sistema
Desenvolver uma plataforma web que facilite a interação entre usuários e nutricionistas, permitindo o acesso a conteúdos relacionados à nutrição e a consulta de informações dos profissionais cadastrados.

---

### 3. Requisitos funcionais (RF)
Os requisitos funcionais descrevem as ações e funcionalidades que o sistema deve oferecer.

| Código | Requisito |
| :--- | :--- |
| **RF01** | O sistema deve permitir que usuários realizem cadastro na plataforma. |
| **RF02** | O sistema deve permitir o login de usuários cadastrados. |
| **RF03** | O sistema deve permitir o acesso às funcionalidades conforme o tipo de usuário. |
| **RF04** | O sistema deve permitir a visualização e a edição das informações do perfil. |
| **RF05** | O sistema deve disponibilizar um feed de publicações relacionadas à nutrição. |
| **RF06** | O sistema deve permitir a visualização dos conteúdos publicados no feed. |
| **RF07** | O sistema deve disponibilizar informações dos nutricionistas cadastrados. |
| **RF08** | O sistema deve permitir que os usuários entrem em contato com nutricionistas por meio dos recursos disponíveis. |
| **RF09** | O sistema deve permitir o acesso às funcionalidades de acordo com as permissões de cada tipo de usuário. |

---

### 4. Requisitos não funcionais (RNF)
Os requisitos não funcionais definem critérios de qualidade, segurança e funcionamento do sistema.

| Código | Requisito |
| :--- | :--- |
| **RNF01** | O sistema deve possuir uma interface intuitiva e de fácil utilização. |
| **RNF02** | O sistema deve apresentar compatibilidade com navegadores web modernos. |
| **RNF03** | O sistema deve possuir layout adaptável a diferentes tamanhos de tela. |
| **RNF04** | O sistema deve proteger as credenciais e os dados pessoais dos usuários. |
| **RNF05** | O sistema deve validar os dados inseridos nos formulários. |
| **RNF06** | O sistema deve apresentar mensagens claras em caso de erro ou operação concluída. |
| **RNF07** | O sistema deve organizar os dados de forma consistente, evitando inconsistências nas informações armazenadas. |
| **RNF08** | O sistema deve apresentar tempo de resposta adequado durante a navegação e a execução das funcionalidades. |

---

### 5. Tipos de usuários
* **Usuário:** pode acessar sua conta, gerenciar o perfil, visualizar publicações e consultar ou contatar nutricionistas.
* **Nutricionista:** possui acesso às funcionalidades destinadas ao profissional, conforme as permissões implementadas no sistema.

---

### 6. Requisitos de interface
O sistema deve disponibilizar as seguintes interfaces principais:
* **Tela de login:** acesso à plataforma por meio das credenciais do usuário.
* **Tela de cadastro:** registro de novos usuários.
* **Perfil:** exibição e edição das informações pessoais.
* **Feed:** apresentação de publicações em formato de conteúdo social.
* **Área de contato:** acesso às informações e aos meios de contato dos nutricionistas.

---

### 7. Restrições do sistema
* O acesso às funcionalidades privadas deve depender da autenticação do usuário.
* As permissões devem respeitar o tipo de conta cadastrado.
* O sistema depende de um navegador e de conexão com a internet para utilização.
* As funcionalidades disponíveis devem respeitar os recursos efetivamente implementados no projeto.

---

### 8. Critérios de aceitação
O sistema será considerado funcional quando:
* O cadastro e o login puderem ser realizados corretamente.
* Os usuários conseguirem visualizar e atualizar seus perfis.
* O feed apresentar as publicações disponíveis.
* As informações dos nutricionistas puderem ser consultadas.
* Os recursos de contato estiverem acessíveis.
* As interfaces funcionarem adequadamente em navegadores modernos e diferentes dispositivos.

> **Observação:** este documento é uma versão inicial baseada nas funcionalidades conhecidas do Aptus. Para garantir que cada requisito corresponda exatamente ao código e aos documentos da versão indicada do repositório, seria necessário consultar os arquivos da pasta `doc` e conferir as funcionalidades implementadas.