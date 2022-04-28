const fs = require("fs");
const { convertHour } = require("./convert.js");
const chalk = require("chalk");
const boxen = require("boxen");

const greeting = chalk.white.bold("Bienvenue sur osm2position!!!");

const boxenOptions = {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "#05BF95",
    backgroundColor: "#555555",
};
const msgBox = boxen(greeting, boxenOptions);




function addDataInDb(client, done) {
    console.log(msgBox);
    for (let i = 1; i <= 478; i++) {

        try {
            let osmData = JSON.parse(
                fs.readFileSync("./datas/osmdata/" + i + ".geojson")
            )["features"];



            for (let j = 0; j < osmData.length; j++) {
                let osm = osmData[j];
                let name = osm["properties"]["name"];
                let lon = osm["geometry"]["coordinates"][0];
                let lat = osm["geometry"]["coordinates"][1];
                let opening_hours = osm["properties"]["opening_hours"];
                let phone =
                    osm["properties"]["phone"] ?? osm["properties"]["contact:phone"];
                let website =
                    osm["properties"]["website"] ?? osm["properties"]["contact:website"];
                let addr_postcode = osm["properties"]["addr:postcode"];
                let id = osm["id"];
                let city = osm["properties"]["addr:city"];

                let batiment = {
                    nom: name,
                    nombreNiveau: 0,
                    codeBatiment: "BATIMENT_" + id,
                    longitude: lon,
                    latitude: lat,
                    ville: city ?? "UNDEFINED",
                    commune: "UNDEFINED",
                    quartier: "QUARTIER",
                    idCommercial: 1000,
                    idUser: 1000,
                    rue: "UNDEFINED",
                    image: "https://service.geo.sm/var/www/notfound.jpg",
                    createdAt: new Date().toISOString().
                        replace(/T/, ' ').
                        replace(/\..+/, ''),
                    updatedAt: new Date().toISOString().
                        replace(/T/, ' ').
                        replace(/\..+/, ''),

                };

                if (name != undefined) {
                    var replaceNameCaract = name.replace("'", "''");
                    var upperCaseName = replaceNameCaract.toUpperCase();
                    let query = `INSERT INTO batiments (nom, "nombreNiveau", "codeBatiment", longitude, latitude, ville, commune, quartier, "idCommercial", "idUser", rue,created_at,updated_at,image) VALUES ('${upperCaseName}', '${batiment.nombreNiveau}', '${batiment.codeBatiment}', '${batiment.longitude}', '${batiment.latitude}', '${batiment.ville}', '${batiment.commune}', '${batiment.quartier}', '${batiment.idCommercial}', '${batiment.idUser}', '${batiment.rue}', '${batiment.createdAt}', '${batiment.updatedAt}','${batiment.image}') RETURNING *`;
                    client.query(query, (err, result) => {
                        var replaceNameCaract = name.replace("'", "''");
                        var upperCaseName = replaceNameCaract.toUpperCase();

                        if (err) {
                            console.log(err);
                        }
                        console.log("Batiment " + name + " bien ajouté");

                        let etablissement = {
                            idBatiment: result.rows[0].id,
                            nom: upperCaseName,
                            codePostal: addr_postcode ?? null,
                            siteInternet: website ?? null,
                            idCommercial: 1000,
                            idUser: 1000,
                            etage: 0,
                            services: "NON DEFINI",
                            phone: phone ?? "000000000",
                            whatsapp1: "000000000",
                            osmId: id,
                            cover: "https://service.geo.sm/var/www/notfound.jpg",
                            createdAt: new Date().toISOString().
                                replace(/T/, ' ').
                                replace(/\..+/, ''),
                            updatedAt: new Date().toISOString().
                                replace(/T/, ' ').
                                replace(/\..+/, ''),
                        };

                        let query = `INSERT INTO etablissements ("idBatiment", nom, "codePostal", "siteInternet", "idCommercial", "idUser", etage, services, phone, whatsapp1, "osmId",created_at,updated_at,cover) VALUES ('${etablissement.idBatiment}', '${etablissement.nom}', '${etablissement.codePostal}', '${etablissement.siteInternet}', '${etablissement.idCommercial}', '${etablissement.idUser}', '${etablissement.etage}', '${etablissement.services}', '${etablissement.phone}', '${etablissement.whatsapp1}', '${etablissement.osmId}','${etablissement.createdAt}','${etablissement.updatedAt}','${etablissement.cover}' ) RETURNING *`;
                        client.query(query, (err, result) => {
                            if (err) {
                                console.log(err);
                            }
                            let query1 = `INSERT INTO sous_categories_etablissements ("idEtablissement", "idSousCategorie") VALUES ('${result.rows[0].id}', '${i}')`;
                            client.query(query1, (err, result) => {
                                if (err) {
                                    console.log(err);
                                }

                            }
                            );

                            let query2 = `INSERT INTO commodites_etablissements ("idEtablissement", "idCommodite") VALUES ('${result.rows[0].id}', '${4}')`;
                            client.query(query2, (err, result) => {
                                if (err) {
                                    console.log(err);
                                }
                            }
                            );

                            if (opening_hours != undefined) {
                                obj = convertHour(opening_hours);
                                if ("mo" in obj && obj.mo[0] && obj.mo[1]) {
                                    let lundi = {
                                        idEtablissement: result.rows[0].id,
                                        jour: "Lundi",
                                        plageHoraire: obj.mo[0] + "-" + obj.mo[1],
                                        createdAt: new Date().toISOString().
                                            replace(/T/, ' ').
                                            replace(/\..+/, ''),
                                        updatedAt: new Date().toISOString().
                                            replace(/T/, ' ').
                                            replace(/\..+/, ''),
                                    };
                                    let query = `INSERT INTO horaires ("idEtablissement", jour, "plageHoraire",created_at,updated_at) VALUES ('${lundi.idEtablissement}', '${lundi.jour}', '${lundi.plageHoraire}', '${lundi.createdAt}', '${lundi.updatedAt}')`;
                                    client.query(query, (err, result) => {

                                        if (err) {
                                            console.log(err);
                                        }
                                    });
                                }
                                if ("tu" in obj && obj.tu[0] && obj.tu[1]) {
                                    let mardi = {
                                        idEtablissement: result.rows[0].id,
                                        jour: "Mardi",
                                        plageHoraire: obj.tu[0] + "-" + obj.tu[1],
                                        createdAt: new Date().toISOString().
                                            replace(/T/, ' ').
                                            replace(/\..+/, ''),
                                        updatedAt: new Date().toISOString().
                                            replace(/T/, ' ').
                                            replace(/\..+/, ''),
                                    };
                                    let query = `INSERT INTO horaires ("idEtablissement", jour, "plageHoraire",created_at,updated_at) VALUES ('${mardi.idEtablissement}', '${mardi.jour}', '${mardi.plageHoraire}', '${mardi.createdAt}', '${mardi.updatedAt}')`;
                                    client.query(query, (err, result) => {

                                        if (err) {
                                            console.log(err);
                                        }
                                    });
                                }

                                if ("we" in obj && obj.we[0] && obj.we[1]) {
                                    let mercredi = {
                                        idEtablissement: result.rows[0].id,
                                        jour: "Mercredi",
                                        plageHoraire: obj.we[0] + "-" + obj.we[1],
                                        createdAt: new Date().toISOString().
                                            replace(/T/, ' ').
                                            replace(/\..+/, ''),
                                        updatedAt: new Date().toISOString().
                                            replace(/T/, ' ').
                                            replace(/\..+/, ''),
                                    };
                                    let query = `INSERT INTO horaires ("idEtablissement", jour, "plageHoraire",created_at,updated_at) VALUES ('${mercredi.idEtablissement}', '${mercredi.jour}', '${mercredi.plageHoraire}', '${mercredi.createdAt}', '${mercredi.updatedAt}')`;
                                    client.query(query, (err, result) => {

                                        if (err) {
                                            console.log(err);
                                        }
                                    });
                                }

                                if ("th" in obj && obj.th[0] && obj.th[1]) {
                                    let jeudi = {
                                        idEtablissement: result.rows[0].id,
                                        jour: "Jeudi",
                                        plageHoraire: obj.th[0] + "-" + obj.th[1],
                                        createdAt: new Date().toISOString().
                                            replace(/T/, ' ').
                                            replace(/\..+/, ''),
                                        updatedAt: new Date().toISOString().
                                            replace(/T/, ' ').
                                            replace(/\..+/, ''),
                                    };
                                    let query = `INSERT INTO horaires ("idEtablissement", jour, "plageHoraire",created_at,updated_at) VALUES ('${jeudi.idEtablissement}', '${jeudi.jour}', '${jeudi.plageHoraire}', '${jeudi.createdAt}', '${jeudi.updatedAt}')`;
                                    client.query(query, (err, result) => {

                                        if (err) {
                                            console.log(err);
                                        }
                                    });
                                }

                                if ("fr" in obj && obj.fr[0] && obj.fr[1]) {
                                    let vendredi = {
                                        idEtablissement: result.rows[0].id,
                                        jour: "Vendredi",
                                        plageHoraire: obj.fr[0] + "-" + obj.fr[1],
                                        createdAt: new Date().toISOString().
                                            replace(/T/, ' ').
                                            replace(/\..+/, ''),
                                        updatedAt: new Date().toISOString().
                                            replace(/T/, ' ').
                                            replace(/\..+/, ''),
                                    };
                                    let query = `INSERT INTO horaires ("idEtablissement", jour, "plageHoraire",created_at,updated_at) VALUES ('${vendredi.idEtablissement}', '${vendredi.jour}', '${vendredi.plageHoraire}', '${vendredi.createdAt}', '${vendredi.updatedAt}')`;
                                    client.query(query, (err, result) => {

                                        if (err) {
                                            console.log(err);
                                        }
                                    });
                                }

                                if ("sa" in obj && obj.sa[0] && obj.sa[1]) {
                                    let samedi = {
                                        idEtablissement: result.rows[0].id,
                                        jour: "Samedi",
                                        plageHoraire: obj.sa[0] + "-" + obj.sa[1],
                                        createdAt: new Date().toISOString().
                                            replace(/T/, ' ').
                                            replace(/\..+/, ''),
                                        updatedAt: new Date().toISOString().
                                            replace(/T/, ' ').
                                            replace(/\..+/, ''),
                                    };
                                    let query = `INSERT INTO horaires ("idEtablissement", jour, "plageHoraire",created_at,updated_at) VALUES ('${samedi.idEtablissement}', '${samedi.jour}', '${samedi.plageHoraire}', '${samedi.createdAt}', '${samedi.updatedAt}')`;
                                    client.query(query, (err, result) => {

                                        if (err) {
                                            console.log(err);
                                        }
                                    });
                                }

                                if ("su" in obj && obj.su[0] && obj.su[1]) {
                                    let dimanche = {
                                        idEtablissement: result.rows[0].id,
                                        jour: "Dimanche",
                                        plageHoraire: obj.su[0] + "-" + obj.su[1],
                                        createdAt: new Date().toISOString().
                                            replace(/T/, ' ').
                                            replace(/\..+/, ''),
                                        updatedAt: new Date().toISOString().
                                            replace(/T/, ' ').
                                            replace(/\..+/, ''),
                                    };
                                    let query = `INSERT INTO horaires ("idEtablissement", jour, "plageHoraire",created_at,updated_at) VALUES ('${dimanche.idEtablissement}', '${dimanche.jour}', '${dimanche.plageHoraire}', '${dimanche.createdAt}', '${dimanche.updatedAt}')`;
                                    client.query(query, (err, result) => {

                                        if (err) {
                                            console.log(err);
                                        }
                                    });
                                }
                            }

                            console.log("Etablissement " + name + " Bien ajouté");


                        });
                    });
                }
            }


        } catch (error) {
        }
    }
}

module.exports = {
    addDataInDb,
};
