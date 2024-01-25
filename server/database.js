import { createConnection } from 'mysql';

var con = createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "pokerunited"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Conectado a la base de datos 'pokerunited'!");
});

export default con;