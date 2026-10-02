# LabShare – Frontend (React + Vite)

Sistema de Gestão de Laboratórios e Empréstimo de Equipamentos.

## Executar

O backend precisa estar rodando em `localhost:8080` (veja o README da raiz do repositório).

```bash
npm install
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173).

- **Landing (Design Thinking):** `/`
- **Login:** `/login` (usuários de demonstração com senha `123456`)

Todos os dados vêm da API (`src/services/api.js`). O Vite repassa `/api` para o backend (`vite.config.js`).

## Fluxo principal (Lucas – Aluno)

1. **Login** → Entrar (ou acesso rápido "Aluno")
2. **Home** → Buscar "Arduino"
3. **Resultados** → Kit Arduino Uno
4. **Detalhes** → Ver disponibilidade
5. **Disponibilidade** → Continuar
6. **Confirmar reserva** → Confirmar
7. **Reserva realizada** → Minhas reservas

## Fluxo do Técnico (Carlos)

Login como "Técnico" → Painel → Registrar retirada → Empréstimo ativo → Devolução → Ocorrência

## Fluxo de Manutenção (Fernanda)

Login como "Manutenção" → Painel → Iniciar manutenção → Finalizar → Equipamento disponível

## CRUD de Equipamentos

Menu **Equipamentos** → Lista, Cadastrar, Editar

## Identidade visual

- Azul petróleo escuro, verde suave, branco e bege claro
- Interface minimalista e responsiva
