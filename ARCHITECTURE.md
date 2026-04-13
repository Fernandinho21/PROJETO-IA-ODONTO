# Arquitetura - Projeto IA Odonto

## Estrutura de Diretórios

```
src/
├── components/              # Componentes reutilizáveis
│   ├── Auth/
│   │   └── AuthForm.tsx
│   ├── Chat/
│   │   └── ChatContainer.tsx
│   ├── Header.tsx
│   └── Quiz/
│       └── QuizContainer.tsx
│
├── pages/                   # Páginas/Telas principais
│   ├── Login/
│   │   ├── LoginPage.tsx
│   │   └── Login.module.css
│   ├── Chat/
│   │   ├── ChatPage.tsx
│   │   └── ChatPage.module.css
│   ├── Quiz/
│   │   ├── QuizPage.tsx
│   │   └── QuizPage.module.css
│   └── MainApp/
│       ├── MainAppPage.tsx
│       └── MainAppPage.module.css
│
├── hooks/                   # Hooks customizados
│   ├── useChat.ts          # Gerencia estado do chat
│   ├── useQuiz.ts          # Gerencia estado do quiz
│   ├── useAutoScroll.ts    # Auto-scroll nas mensagens
│   └── index.ts            # Export centralizado
│
├── services/               # Serviços e lógica de negócio
│   ├── authService.ts      # Autenticação e localStorage
│   ├── aiService.ts        # Chamadas à API Anthropic Claude
│   └── index.ts            # Export centralizado
│
├── types/                  # Tipos TypeScript (para tipos compartilhados)
│   └── (vazio - pronto para expansão)
│
├── styles/                 # Estilos globais
│   └── globals.css
│
├── App.tsx                 # Componente raiz
├── main.tsx                # Entry point
├── global.d.ts             # Tipos globais e tipagem Vite
└── index.html              # HTML template
```

## Princípios de Organização

### 1. **Pages** - Telas principais do aplicativo
- `LoginPage.tsx`: Autenticação (login/registro)
- `MainAppPage.tsx`: Layout principal com navegação
- `ChatPage.tsx`: Página de chat com IA
- `QuizPage.tsx`: Página de quiz

### 2. **Components** - Componentes reutilizáveis
- Componentes que podem ser usados em múltiplas páginas
- Sem lógica de estado complexa
- Focados em apresentação

### 3. **Hooks** - Lógica de estado compartilhada
- `useChat()`: Gerencia mensagens, input, loading
- `useQuiz()`: Gerencia questões, score, seleções
- `useAutoScroll()`: Utilitário para scroll automático

### 4. **Services** - Camada de lógica de negócio
- `authService.ts`: Login/registro com localStorage
- `aiService.ts`: Integração com API Claude
- Chamadas de API e manipulação de dados

## Padrões de Importação

Use imports centralizados através de `index.ts`:

```typescript
// ✅ Preferred
import { useChat, useQuiz } from "../../hooks";
import { authService, type User } from "../../services";

// ❌ Avoid
import { useChat } from "../../hooks/useChat";
import { authService } from "../../services/authService";
```

## Tipos e Interfaces

Tipos são definidos nos respectivos serviços/hooks:

```typescript
// Em services/authService.ts
export interface User {
  email: string;
  name: string;
}

// Em hooks/useChat.ts
export interface Message {
  role: "user" | "assistant";
  content: string;
}

// Em hooks/useQuiz.ts
export interface QuizQuestion {
  pergunta: string;
  opcoes: string[];
  correta: number;
  explicacao: string;
}
```

## Fluxo de Dados

```
App.tsx (root)
├── LoginPage → authService.login/register
└── MainAppPage
    ├── ChatPage → useChat → aiService.sendChatMessage
    └── QuizPage → useQuiz → aiService.generateQuizQuestion
```

## Variáveis de Ambiente

Configure em `.env.local`:

```env
VITE_ANTHROPIC_API_KEY=seu_token_aqui
```

## Estilos

- CSS Modules para componentes (escopo local)
- `globals.css` para estilos globais
- Variáveis CSS para tema:
  - `--accent`, `--surface`, `--text`, `--border`, etc.

## Boas Práticas

1. **Separação de Responsabilidades**: Lógica em services/hooks, apresentação em pages/components
2. **Reutilização**: Use hooks para lógica compartilhada
3. **Type-Safety**: Sempre use TypeScript com tipagem explícita
4. **Imports Centralizados**: Use `index.ts` para reorganizar importações
5. **Nomes Descritivos**: `useChat()` vs `useC()`, `LoginPage.tsx` vs `Login.tsx`
