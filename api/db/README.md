# Backup do banco

O banco local é SQLite e fica em `api/db/aptus.db`. O arquivo binário é ignorado pelo Git para evitar versionar dados locais diretamente.

Para exportar schema e todos os registros em SQL:

```bash
cd api
npm install
npm run backup:db
```

O dump será criado em `api/db/aptus-backup.sql`. Esse arquivo pode ser versionado e restaurado com o cliente SQLite:

```bash
sqlite3 db/aptus.db < db/aptus-backup.sql
```

Não há um banco preenchido neste checkout no momento; portanto, nenhum registro pôde ser salvo agora.