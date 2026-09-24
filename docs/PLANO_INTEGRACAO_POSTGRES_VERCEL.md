# Plano de integração PostgreSQL + Vercel

## Objetivo

Substituir o SQLite local por PostgreSQL gerenciado e publicar o frontend Angular e o backend FastAPI na Vercel sem perder os dados nem o comportamento atual da aplicação.

A recomendação é usar **Neon Postgres**. Supabase, Railway, Render PostgreSQL ou Prisma Postgres também são compatíveis com o backend atual.

## 1. Criar o banco

1. Criar um projeto PostgreSQL no Neon.
2. Criar uma branch ou banco para `development` e outro para `production`, quando possível.
3. Copiar a URL de conexão do banco.
4. Usar uma conexão com SSL e, para funções serverless, preferir a URL pooler quando o provedor disponibilizar.

Formato esperado:

```env
DATABASE_URL=postgresql+psycopg://usuario:senha@host/banco?sslmode=require
```

Nunca versionar essa URL no Git.

## 2. Preparar o backend

Adicionar o driver PostgreSQL em `backend/requirements.txt`:

```txt
psycopg[binary]
```

Atualizar `backend/app/core/database.py` para tratar PostgreSQL e SQLite local:

```python
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
    pool_recycle=300,
)
```

Confirmar que URLs antigas `postgres://` continuam sendo convertidas para `postgresql://` antes da criação do engine.

## 3. Adotar migrações

Não depender de `Base.metadata.create_all()` em produção. Instalar e configurar Alembic:

```bash
qguenv\\Scripts\\python.exe -m pip install alembic
qguenv\\Scripts\\alembic.exe init backend/alembic
```

Depois:

1. Configurar `alembic.ini` para usar `DATABASE_URL`.
2. Importar `Base.metadata` e todos os modelos em `alembic/env.py`.
3. Gerar a primeira migração:

```bash
qguenv\\Scripts\\alembic.exe revision --autogenerate -m "initial schema"
```

4. Aplicar no banco de desenvolvimento:

```bash
qguenv\\Scripts\\alembic.exe upgrade head
```

5. Só depois executar a seed, se a base de produção realmente precisar de dados iniciais.

## 4. Variáveis da Vercel

Configurar as variáveis no projeto do backend:

- `DATABASE_URL`: URL PostgreSQL com SSL.
- `ENVIRONMENT`: `production` ou `preview`.
- `CORS_ORIGINS`: domínio oficial do frontend.

Configurar valores diferentes para `Development`, `Preview` e `Production` quando os bancos forem separados.

Não usar `allow_origins=["*"]` em produção. Trocar por uma lista explícita de origens confiáveis.

## 5. Publicação recomendada

Usar dois projetos Vercel:

### Projeto frontend

- Root Directory: `frontend`
- Framework: Angular
- Build command: `npm run build`
- Output directory: conferir o diretório gerado pelo Angular

### Projeto backend

- Root Directory: `backend`
- Entrypoint: FastAPI conforme a configuração da Vercel
- Runtime: Python
- Variável `DATABASE_URL` configurada no ambiente

O frontend deve chamar a API por uma URL configurável, por exemplo:

```typescript
private apiUrl = '/api/v1';
```

Se frontend e backend ficarem em projetos separados, usar uma variável de build como `API_URL` ou configurar rewrite/proxy para o domínio da API.

Validar o `vercel.json` atual antes do deploy. A configuração com `services` deve ser confirmada na versão atual da Vercel; caso não seja aceita, manter os projetos separados.

## 6. Segurança antes da publicação

- Implementar autenticação real com sessão ou JWT.
- Não usar `X-User-Role` como mecanismo definitivo de autorização.
- Trocar o hash SHA-256 simples por `bcrypt` ou `argon2` para senhas.
- Nunca retornar senhas ou hashes pela API.
- Restringir CORS ao domínio real.
- Validar e-mails, códigos de núcleo e permissões no backend.
- Configurar rate limiting no onboarding público.
- Não executar seed destrutiva automaticamente em produção.

## 7. Ordem de execução amanhã

1. Criar o banco Neon de desenvolvimento.
2. Adicionar `psycopg[binary]` ao requirements.
3. Ajustar `database.py` e testar a conexão local usando `DATABASE_URL`.
4. Configurar Alembic e gerar a migração inicial.
5. Executar `alembic upgrade head`.
6. Executar seed em um banco vazio de desenvolvimento.
7. Rodar os testes do backend no `qguenv`:

```powershell
$python = 'c:/Users/esdra/.gemini/antigravity/scratch/qguenv/Scripts/python.exe'
Set-Location 'c:/Users/esdra/.gemini/antigravity/scratch/sistema-nucleos-ensino/backend'
& $python -m unittest test_backend_rules
```

8. Compilar o frontend:

```powershell
Set-Location 'c:/Users/esdra/.gemini/antigravity/scratch/sistema-nucleos-ensino/frontend'
npm run build
```

9. Publicar o backend em Preview na Vercel.
10. Testar endpoints públicos, onboarding, listagem de polos e filtros RBAC.
11. Publicar o frontend em Preview e validar chamadas para a API.
12. Configurar domínio, CORS e variáveis de produção.
13. Fazer backup e aplicar a migração no banco de produção.
14. Publicar produção somente após os testes de Preview passarem.

## 8. Checklist de aceite

- [ ] Aplicação conecta ao PostgreSQL sem SQLite em produção.
- [ ] Migrações executam em banco vazio.
- [ ] Seed não apaga dados existentes em produção.
- [ ] `GET /api/v1/` responde na URL publicada.
- [ ] Onboarding público cria usuário e núcleo uma única vez.
- [ ] Duplicidade de e-mail e código retorna erro controlado.
- [ ] Gestor vê somente seu núcleo.
- [ ] ADMIN vê os núcleos permitidos.
- [ ] Frontend publicado consegue acessar a API.
- [ ] CORS bloqueia origens não autorizadas.
- [ ] Logs não expõem senha ou `DATABASE_URL`.
- [ ] Backup e rollback foram definidos.
