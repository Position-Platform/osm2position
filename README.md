# osm2position

## Installation

- ouvrir le fichier functions/db.js et ajouter les paramètres de connexion à la base de données

```
const config = {
    user: 'user_database',
    host: 'host',
    database: 'database_name',
    password: 'password',
    port: port_number,
}
```

- Creer les dossiers des categories dans le dossier data/

- Exécuter le script

```
$ npm install
$ python osm2position.py
$ node osm2position.js
```
