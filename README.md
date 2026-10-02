# LabShare

Sistema de gestão de laboratórios e empréstimo de equipamentos. Trabalho da disciplina **Desenvolvimento Orientado a Reuso de Software** (PUCPR), equipe REUSO: Laura Guillarducci, João Davi e Camilla Uber.

```
labshare/
├── backend/   API REST em Java 17 + Spring Boot 3 + JdbcTemplate (SQL escrito à mão)
└── front/     React + Vite (as telas do protótipo, agora ligadas ao backend)
```

## Como rodar

### 1. Banco de dados (Neon / PostgreSQL)

1. Crie um projeto em [neon.tech](https://neon.tech). O banco padrão se chama `neondb`.
2. Em **Dashboard → Connect**, copie a connection string. Ela tem este formato:
   `postgresql://USUARIO:SENHA@ep-xxxx.sa-east-1.aws.neon.tech/neondb?sslmode=require`
3. Dentro de `backend/`, copie `db.properties.example` para `db.properties` e preencha:
   ```properties
   DB_URL=jdbc:postgresql://ep-xxxx.sa-east-1.aws.neon.tech/neondb?sslmode=require
   DB_USER=USUARIO
   DB_PASSWORD=SENHA
   ```
   Use só `?sslmode=require` no final, sem o `&channel_binding=require` que o Neon às vezes adiciona.
   O arquivo `db.properties` está no `.gitignore`, então a senha não vai para o GitHub.

Não é preciso criar tabelas. Ao iniciar, o backend roda `schema.sql` (cria as 13 tabelas) e `data.sql` (insere os dados de demonstração).

### 2. Backend (porta 8080)

Requisito: **JDK 17 ou superior**.

- **IntelliJ IDEA (recomendado):** abra a pasta `backend/`, espere o Maven baixar as dependências e rode `LabShareApplication`.
- **Terminal:** instale o Maven (`brew install maven`) e rode, dentro de `backend/`:
  ```bash
  mvn spring-boot:run
  ```

Se o console mostrar `Started LabShareApplication`, deu certo. Cada SQL executado aparece no console com o prefixo `[SQL]`.

### 3. Frontend (porta 5173)

```bash
cd front
npm install
npm run dev
```

Abra http://localhost:5173. O Vite repassa toda chamada `/api/...` para o backend em `localhost:8080` (veja `front/vite.config.js`).

## Usuários de demonstração (senha `123456`)

| Cliente | Perfil | E-mail |
|---|---|---|
| Universidade Padrão | Aluno | lucas@email.com |
| Universidade Padrão | Técnico | carlos@email.com |
| Universidade Padrão | Manutenção | fernanda@email.com |
| Universidade Padrão | Admin | roberto@email.com |
| Empresa Corporativa | Gestor | patricia@empresa.com |
| Empresa Corporativa | Colaborador | bruno@empresa.com |
| Escola Técnica | Admin | vera@escolatecnica.com |
| Escola Técnica | Técnico | paulo@escolatecnica.com |

A tela de login tem botões de acesso rápido para cada um.

## Para zerar os dados antes de uma apresentação

Rode `backend/reset.sql` no SQL Editor do Neon e reinicie o backend.
