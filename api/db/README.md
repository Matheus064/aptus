# Backup do banco

O banco local é SQLite e fica em `api/db/aptus.db`. O arquivo binário é ignorado pelo Git para evitar versionar dados locais diretamente.

Para exportar o schema em SQL, sem dados pessoais:

```bash
cd api
npm install
npm run backup:db
```

O dump será criado em `api/db/aptus-backup.sql` e pode ser versionado. Para gerar um backup completo local, incluindo registros, use o argumento explícito abaixo e não publique o arquivo:

```bash
npm run backup:db -- db/aptus-backup-completo.sql --incluir-dados
```

O schema pode ser restaurado com o cliente SQLite:

```bash
sqlite3 db/aptus.db < db/aptus-backup.sql
```

O backup completo pode conter dados pessoais e hashes de senha; mantenha-o fora do GitHub.