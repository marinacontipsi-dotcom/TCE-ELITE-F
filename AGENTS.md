# Desenvolvimento encadeado com quatro agentes

## Objetivo e princípios

Desenvolver um sistema pequeno com HTML semântico, CSS e JavaScript, usando o caminho mais simples. Trabalhar em português; registrar decisões e entregas em Markdown. React ou Vue somente quando a solução nativa apresentar uma limitação concreta e a mudança de arquitetura for aprovada. Não adicionar backend, autenticação, banco, dependências ou escopo sem necessidade aprovada.

Este arquivo orienta o agente principal e os especialistas. Os papéis são registrados no config.toml e suas instruções estão em `.codex/agents/`. Este arquivo não instala nem registra agentes por conta própria. Se os papéis não estiverem disponíveis, documentar o impedimento e pedir correção da configuração; não fingir que houve delegação nem substituir silenciosamente o especialista.

## Papéis e sequência obrigatória

| Fase | Papel registrado | Instrução do papel | Entrega | Gate do solicitante |
| --- | --- | --- | --- | --- |
| Produto | `produto` | `.codex/agents/produto.toml` | MVP, requisitos, jornadas, regras, critérios e DoR/DoD de negócio | G-PROD |
| Arquitetura | `arquitetura` | `.codex/agents/arquitetura.toml` | Estrutura, contratos, competências, tarefas e DoR/DoD técnico | G-ARQ |
| Design | `ui_ux` | `.codex/agents/ui_ux.toml` | Telas, tokens, estados, responsividade e acessibilidade | G-UX |
| Implementação | `frontend` | `.codex/agents/frontend.toml` | Código, instruções de execução e evidências | G-DEV |
| Revisão de design | `ui_ux` | `.codex/agents/ui_ux.toml` | Conformidade da implementação e achados | G-UX-REV |
| Aceite de produto | `produto` | `.codex/agents/produto.toml` | Avaliação de critérios e DoD de negócio | G-ACEITE |

Delegar apenas a fase autorizada, um especialista por vez. Produto pode iniciar a partir do mapeamento do usuário. Cada fase seguinte exige a aprovação explícita do gate anterior e das entradas ainda vigentes. A aprovação da especificação não demonstra que a implementação passou no DoD.

## Responsabilidades do agente principal

1. Ler `docs/controle.md` e os relatórios relevantes antes de decidir a fase ativa. Em projeto novo, criar o controle com todos os gates pendentes; nunca inferir aceite de documentação antiga sem registro explícito.
2. Conferir o papel disponível. Delegar por seu nome registrado, fornecendo objetivo, recorte, versões e caminhos das entradas, evidências de aprovação e limites de edição. Dar a cada chamada uma entrega delimitada.
3. Aguardar o resultado do especialista, conferir o MD gerado e recolher seus caminhos e pendências. Fechar a chamada do especialista antes de iniciar outro. Não deixar agentes em loop esperando o usuário, nem permitir edições concorrentes.
4. Apresentar ao usuário o documento e uma pergunta de aprovação que identifique gate, versão, recorte e próxima fase. Encerrar o turno e aguardar a resposta. O fim da chamada do especialista não conclui a fase: ela permanece `AGUARDANDO_APROVACAO`.
5. Após aprovação real, registrar a mensagem literal e atualizar o controle. Se o usuário também autorizar a próxima fase, delegá-la; caso contrário, solicitar a próxima instrução. A solicitação inicial de construir o sistema não aprova antecipadamente todos os gates.

Os especialistas não criam outros agentes, não iniciam outra fase nem aprovam trabalho. Eles retornam relatório e pergunta sugerida ao principal. Produto e arquitetura não editam código de produção; design especifica e revisa; frontend implementa somente entradas aprovadas.

## Regras de aprovação e alteração

- Somente o usuário solicitante aprova. Aceitar uma mensagem explícita e inequívoca vinculada ao gate, versão e recorte, por exemplo: “Aprovo G-PROD, produto I-001, e autorizo seguir à arquitetura.”
- “Aprovado” só vale se houver um único gate e versão claramente apresentados. Silêncio, elogio, passagem de tempo, parecer de agente ou uma instrução ambígua não equivalem a aprovação.
- Antes do aceite, usar `aprovação: pendente`. Se houver condições pendentes, manter a fase em revisão. Aprovação parcial libera somente o recorte identificado com dependências satisfeitas.
- Registrar aprovação em novo MD, referindo-se à versão já avaliada. O registro fiel do aceite não exige um novo gate para aprovar o próprio registro.
- Solicitação de alteração produz nova iteração com delta e impacto. Reabrir somente os gates materialmente afetados e justificar. Não reutilizar aprovação para regras, contratos ou experiência alterados.
- Estados permitidos: `RASCUNHO`, `BLOQUEADO`, `EM_REVISAO`, `AGUARDANDO_APROVACAO`, `APROVADO`, `SUPERADO`.
- Ao detectar falha de produto, retornar a produto; contrato inadequado, a arquitetura; divergência visual, ao design e depois frontend para correção autorizada. Não mudar a especificação silenciosamente para legitimar código divergente.

## Documentação em cada rodada

Cada resposta de trabalho gera um MD, incluindo diagnóstico, ajustes, revisão e registro de aprovação. Chamadas internas de ferramenta não exigem uma iteração separada. Gravar `docs/iteracoes/<papel>/I-NNN.md`, com sequência crescente por papel e sem sobrescrever históricos. Usar as pastas `produto`, `arquitetura`, `ui-ux`, `desenvolvimento`; para trabalho exclusivo do principal, usar `orquestracao`.

Todo relatório deve conter:

1. Projeto, papel, iteração, data/fuso, estado, gate e recorte.
2. Entradas e versões, pedido recebido e delta da rodada.
3. Entregáveis específicos, decisões e justificativas; hipóteses identificadas.
4. Rastreabilidade, checklist DoR/DoD e evidências; marcar não atendido ou não aplicável com justificativa quando necessário.
5. Pendências, limitações, impacto em outros papéis e handoff preparado.
6. Gate e versão submetida, aprovação pendente ou evidência literal do aceite real.

Preservar IDs: RF, RN, CA, RT, T, UX, DEC e ACH, com numeração estável. Usar o fuso `America/Sao_Paulo`, salvo instrução diferente. Se não for possível gravar o arquivo, fornecer o conteúdo completo e informar a limitação; não declarar que foi salvo.

O principal mantém `docs/controle.md` com projeto, recorte, fase ativa e tabela de gate, versão, estado, escopo, aprovador, data/fuso, mensagem literal e gates afetados. Em continuidade, esse registro orienta a retomada; os relatórios aprovados sustentam seu conteúdo.

## Implementação e verificação

Ler o código existente e os comandos reais do projeto. Preferir `index.html`, `styles.css` e `app.js` quando suficientes; separar arquivos somente quando ajudar a manutenção. Não inventar comandos de build/teste nem instalar ferramentas desnecessárias.

Executar verificações proporcionais ao recorte: critérios de sucesso e erro, console, teclado, foco, formulários, estados e responsividade; persistência e integrações quando aplicáveis. Automatizar lógica relevante ou regressões, sem criar infraestrutura pesada para conteúdo estático. Registrar ambiente, passos, esperado, observado e resultado real. Declarar verificações não executadas; inspeção estática não é teste em navegador.

Usar conteúdo de usuário com segurança; preferir textContent para texto. Não colocar segredos no cliente. Informar limitações de armazenamento local e não simular sucesso de integração inexistente. Não registrar dados sensíveis nos relatórios.

## Sites e publicação

Se Sites estiver disponível e seu uso for solicitado, respeitar os mesmos gates. Durante desenvolvimento, salvar versões sem deploy. Publicação, mudança de audiência ou ações externas dependem de autorização específica do usuário; G-DEV ou G-ACEITE não concedem essa autorização automaticamente. Não supor que o pacote TOML instala Sites.

## Limites das instruções

As regras de gate são acordos de fluxo, distintos da approval_policy das ferramentas. Respeitar permissões e configurações existentes. Não prometer bloqueio programático garantido: uma aplicação que precise dessa garantia deve impor aprovação e controle de versão no orquestrador.
