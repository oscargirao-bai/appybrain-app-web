# AppyBrain - Copilot Instructions (STRICT)

## Project Layout
- `mobile/`: cópia do projeto original React Native (Expo Go). Não editar.
- `web/`: aplicação React pura (Vite). Sem React Native.

## Regras Obrigatórias
1) Endpoints de API: manter EXACTAMENTE iguais aos do projeto original.
  - Base URL: `https://appybrain.skillade.com/api/`
  - Exemplos: `auth/logon_user`, `app/learn_content_list`, etc. Nunca prefixar com `/api/` adicional.
  - Todas as chamadas têm que ser FEITAS EM SÉRIE (nunca em paralelo) por causa dos refresh tokens.
2) UI Web sem React Native:
  - SafeAreaView → div (remover safe areas)
  - View/Text/Image/Pressable → div/span/img/button/form inputs
  - Alert.alert → window.alert
  - Animated → CSS animations
  - Sem `@react-navigation` no web. Usar router por estado (`onNavigate`).
3) Ícones:
  - Usar apenas `lucide-react` e mapear 1:1 os ícones do projeto RN.
4) Traduções e conteúdo:
  - Manter pt/en em JSON. Todo texto estático passa pela função de tradução.
  - Conteúdo dinâmico vem de JSON/API tal como no RN.
5) Notificações:
  - Na versão web não há notificações. Funções RN correspondentes são no-op com logs.
6) Código limpo e pequeno:
  - Ideal: ≤ 200 linhas por ficheiro. Dividir em subcomponentes.

7) Port de lógica 1:1 do mobile:
  - Copiar SEMPRE toda a lógica e dados necessários do projeto RN (mobile/) ao criar componentes no web/.
  - O resultado visual e funcional TEM de ser exatamente igual ao mobile.
  - Para facilitar a paridade, todas as páginas web (incluindo Loading/Login) devem ocupar 50% da largura do ecrã e ficar centradas.

8) Commits e push SEMPRE:
  - Após qualquer alteração com build PASS (ou alterações apenas de docs/config sem impacto no build), fazer commit e push para a branch atual.
  - Mensagens de commit claras (pt) com prefixo semântico: feat, fix, chore, docs, style, refactor, perf, test.

## Fluxo de Arranque (igual ao RN)
1. Login: `POST auth/login` → guardar tokens (aceitar `expiresAt` ou `expiresIn`).
2. Validar sessão: `GET auth/logon_user` → obter user/organization.
3. Carregar dados sequencialmente:
  - `app/gamification_user_badges`
  - `app/learn_content_list`
  - `app/gamification_user_stars`
  - `app/tribes_list`
  - `app/gamification_user_chests`
  - `app/user_notifications`
  - `app/information_news`
  - `app/ranking`
  - `app/challenges_list`

## Build (web)
```bash
cd web
npm install
npm run build
```

Depois do build, publicar `web/dist/` no servidor. Ver logs no console do browser.
