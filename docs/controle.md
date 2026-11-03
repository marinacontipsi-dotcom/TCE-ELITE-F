# Controle do projeto

- Projeto: Simulador patrimonial para acompanhamento de uma estratégia inicial de investimentos.
- Recorte vigente: RF-001..009 e RF-011..013; CA-001..013 e CA-015..021; T-001..007 e T-009..011. RF-010 permanece adiado por DEC-022; CA-014 histórico/inativo.
- Fase ativa: G-DEV I-001 em EM_REVISAO; verificações de navegador do DoD pendentes.
- Handoff de produto: Produto I-006 (baseline aprovada) + I-008 (aceite parcial de DEC-023, opção A).
- Arquitetura vigente: G-ARQ I-002 aprovado, registro em Arquitetura I-003; UI/UX vigente: G-UX I-001 aprovado.
- DEC-006 e sua fórmula permanecem intactas. DEC-023 opção A: caixa não reinvestido fica retido até o fim; caixas elegível e retido compõem o patrimônio, mas não a base da meta.
- G-UX-REV e G-ACEITE ainda não iniciados; dependem das fases anteriores.

## Histórico de gates, decisões e autorizações

| Gate/decisão | Versão | Estado | Escopo registrado | Aprovador e data/fuso | Mensagem literal ou referência |
|---|---|---|---|---|---|
| G-PROD | I-002 | SUPERADO | Revisão inicial; gate não submetido | — | Proposta sucedida por I-003 |
| G-PROD | I-003 | APROVADO | Visão, MVP, RF-001..011, jornadas, critérios e DEC-006 | Solicitante, 12/10/2026, America/Sao_Paulo | “aprovado” — Produto I-004 |
| DEC-006 | I-003/I-004 | APROVADA | Fórmula pedagógica do Número Mágico, conforme escopo aprovado | Solicitante, 12/10/2026, America/Sao_Paulo | “aprovo dec 06 e documento” |
| G-ARQ | I-001 | SUPERADO | Proposta parcial; não submetida, com pendências devolvidas a produto | — | Substituída pela revisão I-002 |
| G-PROD | I-005 | SUPERADO | Reabertura material de regras de cálculo e registros; não aprovada | — | Revisada em I-006 |
| G-PROD / DEC-022 | I-006 | APROVADO | Baseline de produto; RF-010 explicitamente adiado, CA-014 histórico, E-010 fora do MVP; regras DEC-014..021 | Solicitante, 12/10/2026, America/Sao_Paulo | “pode aprovar o relatório de produto” — Orquestração I-001 |
| G-ARQ | I-002 | APROVADO | Contratos, decisões técnicas, tarefas e DoR/DoD do recorte vigente | Solicitante, 12/10/2026, America/Sao_Paulo | “pode segui pela recomendada, também, aprovo o relatorio de arquitetura, pode seguir para a especificação de UI/UX com o [@ui_ux](subagent://ui_ux)” — Arquitetura I-003 |
| G-PROD | I-007 | SUPERADO | Reabertura parcial de DEC-016/017 e critérios afetados; respondida apenas quanto a DEC-023 | Solicitante, 12/10/2026, America/Sao_Paulo | “pode segui pela recomendada...” — Produto I-008 |
| DEC-023 | I-008 | APROVADA parcialmente | Opção A: parcela não reinvestida permanece retida até o fim do horizonte e não compra cotas | Solicitante, 12/10/2026, America/Sao_Paulo | “pode segui pela recomendada, também, aprovo o relatorio de arquitetura, pode seguir para a especificação de UI/UX com o [@ui_ux](subagent://ui_ux)” |
| G-UX | I-001 | APROVADO | Interface, estados, tokens, responsividade e acessibilidade para o recorte do MVP | Solicitante, 12/10/2026, America/Sao_Paulo | “aprovo, pode seguir para o desenvolvimento!” — Orquestração I-003 |
| G-DEV | I-001 | EM_REVISAO | Implementação RF-001..009/RF-011..013; sintaxe e quatro cenários de lógica verificados; verificações de navegador do DoD pendentes; RF-010 fora do escopo | — | “Manter em revisão” — solicitante, 12/10/2026; decisão de fluxo, sem aprovação de G-DEV |
| G-UX-REV | — | BLOQUEADO | Revisão de conformidade UI/UX | — | Depende de G-DEV aprovado |
| G-ACEITE | — | BLOQUEADO | Aceite de produto e DoD de negócio | — | Depende de G-UX-REV e evidências de implementação |

## Registro das mensagens e autorizações

- 12/10/2026 — DEC-006: “aprovo dec 06 e documento”.
- 12/10/2026 — G-PROD I-003: “aprovado”.
- 12/10/2026 — G-PROD I-006: “pode aprovar o relatório de produto”.
- 12/10/2026 — Autorização de arquitetura: “pode avançar para a revisão e reestruturação da arquiteutra”.
- 12/10/2026 — DEC-022: “em relação a complexidade, podemos remover o requisito de exportação, ele é desejavel mas entendo que por hora n é necessário, pode registrar explicitamente o postponed dele”.
- 12/10/2026 — DEC-023 opção A e G-ARQ I-002: “pode segui pela recomendada, também, aprovo o relatorio de arquitetura, pode seguir para a especificação de UI/UX com o [@ui_ux](subagent://ui_ux)”.
- 12/10/2026 — G-UX I-001 e autorização de G-DEV: “aprovo, pode seguir para o desenvolvimento!”.
- 12/10/2026 — Estado de G-DEV I-001: “Manter em revisão”. Decisão mantém o gate em EM_REVISAO e não constitui aprovação.

A implementação G-DEV I-001 permanece em revisão por decisão do solicitante, enquanto há pendências de verificação no navegador. Não há aceite de G-DEV, revisão UI/UX ou aceite final registrados.
