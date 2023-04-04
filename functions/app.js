const fs = require("fs");
const { convertHour } = require("./convert.js");
/*const  chalk  = require("chalk");
const boxen = require("boxen");

const greeting = chalk.white.bold("Bienvenue sur osm2position!!!");

const boxenOptions = {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "#05BF95",
    backgroundColor: "#555555",
};
const msgBox = boxen(greeting, boxenOptions);*/

const nominatim = require('nominatim-client');
const clientNominatim = nominatim.createClient({
    useragent: "Position",             // The name of your application
    referer: 'https://position.cm',  // The referer link
});


function addDataInDb(client, done) {
    //  console.log(msgBox);
    const data = [];
    const osmids = [];
    const data1 = [];
    const dataosm = [];

    for (let i = 1; i <= 478; i++) {


        try {
            let osmData = JSON.parse(
                fs.readFileSync("./datas/osmdata/Position/" + i + ".0" + ".geojson")
            )["features"];
            for (let j = 0; j < osmData.length; j++) {
                osmData[j]["souscategorie"] = i;
                data.push(osmData[j]);

            }

        } catch (error) {
        }
    }

    for (let i = 0; i < data.length; i++) {
        const osm = data[i];
        let name = osm["properties"]["name"];

        if (name != undefined) {
            data1.push(osm);
        }
    }




    for (let k = 0; k < data1.length; k++) {
        let osm = data1[k];
        let idosm = osm["id"];
        if (osmids.indexOf(idosm) !== -1) {

        } else {
            osmids.push(idosm);
            dataosm.push(osm);

        }
    }

    var time = 0;

    var interval = setInterval(function () {
        if (time < dataosm.length) {

            let osm = dataosm[time];
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
            let rue = osm["properties"]["addr:street"];
            let image = osm["properties"]["image"];
            let description = osm["properties"]["description"];

            let souscategorie = osm["souscategorie"];

            const requete = {
                lat: lat,
                lon: lon
            };


            clientNominatim.reverse(requete).then((nominatim) => {


                let batiment = {
                    nom: name,
                    nombreNiveau: 0,
                    codeBatiment: "BATIMENT_" + id,
                    longitude: lon,
                    latitude: lat,
                    ville: city ?? nominatim.address.city ?? nominatim.address.state ?? "Non Defini",
                    commune: nominatim.address.city_district ?? nominatim.address.municipality ?? "Non Defini",
                    quartier: nominatim.address.suburb ?? "Non Defini",
                    idUser: 1,
                    rue: rue ?? nominatim.address.road ?? "Non Defini",

                    image: image ?? "/images/notfound.png",
                    createdAt: new Date().toISOString().
                        replace(/T/, ' ').
                        replace(/\..+/, ''),
                    updatedAt: new Date().toISOString().
                        replace(/T/, ' ').
                        replace(/\..+/, ''),

                };

                var replaceNameCaract = name.replace("'", "''");
                var upperCaseName = replaceNameCaract;
                let query = `INSERT INTO batiments (nom,  "nombre_niveau", "code", longitude, latitude, ville, commune, quartier, "user_id", rue,created_at,updated_at,image) VALUES ('${upperCaseName}', '${batiment.nombreNiveau}', '${batiment.codeBatiment}', '${batiment.longitude}', '${batiment.latitude}', '${batiment.ville}', '${batiment.commune}', '${batiment.quartier}', '${batiment.idUser}', '${batiment.rue}', '${batiment.createdAt}', '${batiment.updatedAt}','${batiment.image}') RETURNING *`;

                client.query(query, (err, result) => {
                    var replaceNameCaract = name.replace("'", "''");
                    var upperCaseName = replaceNameCaract;

                    try {

                        let etablissement = {
                            idBatiment: result.rows[0].id,
                            nom: upperCaseName,
                            codePostal: addr_postcode ?? null,
                            siteInternet: website ?? null,
                            idUser: 1,
                            etage: 0,
                            services: "Non Defini",
                            commodites: "",
                            phone: phone ?? "000000000",
                            whatsapp1: "000000000",
                            osmId: id,
                            description: description ?? "Aucune Description",
                            cover: image ?? "/images/notfound.png",

                            createdAt: new Date().toISOString().
                                replace(/T/, ' ').
                                replace(/\..+/, ''),
                            updatedAt: new Date().toISOString().
                                replace(/T/, ' ').
                                replace(/\..+/, ''),
                        };

                        let query0 = `INSERT INTO etablissements ("batiment_id", description,  nom, "code_postal", "site_internet", "user_id", etage, services, commodites, phone, whatsapp1, "osm_id",created_at,updated_at,cover) VALUES ('${etablissement.idBatiment}', '${etablissement.description}',  '${etablissement.nom}', '${etablissement.codePostal}', '${etablissement.siteInternet}', '${etablissement.idUser}', '${etablissement.etage}', '${etablissement.services}',  '${etablissement.commodites}', '${etablissement.phone}', '${etablissement.whatsapp1}', '${etablissement.osmId}','${etablissement.createdAt}','${etablissement.updatedAt}','${etablissement.cover}' ) RETURNING *`;
                        client.query(query0, (err, result1) => {

                            if (result1) {
                                let query1 = `INSERT INTO sous_categories_etablissements ("etablissement_id", "sous_categorie_id") VALUES ('${result1.rows[0].id}', '${souscategorie}')`;
                                client.query(query1, (err, result) => {


                                }
                                );
                            }


                            if (opening_hours != undefined) {
                                obj = convertHour(opening_hours);
                                try {
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
                                        let query = `INSERT INTO horaires ("etablissement_id", jour, "plage_horaire",created_at,updated_at) VALUES ('${lundi.idEtablissement}', '${lundi.jour}', '${lundi.plageHoraire}', '${lundi.createdAt}', '${lundi.updatedAt}')`;
                                        client.query(query, (err, result) => {

                                            if (err) {

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
                                        let query = `INSERT INTO horaires ("etablissement_id", jour, "plage_horaire",created_at,updated_at) VALUES ('${mardi.idEtablissement}', '${mardi.jour}', '${mardi.plageHoraire}', '${mardi.createdAt}', '${mardi.updatedAt}')`;
                                        client.query(query, (err, result) => {

                                            if (err) {

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
                                        let query = `INSERT INTO horaires ("etablissement_id", jour, "plage_horaire",created_at,updated_at) VALUES ('${mercredi.idEtablissement}', '${mercredi.jour}', '${mercredi.plageHoraire}', '${mercredi.createdAt}', '${mercredi.updatedAt}')`;
                                        client.query(query, (err, result) => {

                                            if (err) {

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
                                        let query = `INSERT INTO horaires ("etablissement_id", jour, "plage_horaire",created_at,updated_at) VALUES ('${jeudi.idEtablissement}', '${jeudi.jour}', '${jeudi.plageHoraire}', '${jeudi.createdAt}', '${jeudi.updatedAt}')`;
                                        client.query(query, (err, result) => {

                                            if (err) {

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
                                        let query = `INSERT INTO horaires ("etablissement_id", jour, "plage_horaire",created_at,updated_at) VALUES ('${vendredi.idEtablissement}', '${vendredi.jour}', '${vendredi.plageHoraire}', '${vendredi.createdAt}', '${vendredi.updatedAt}')`;
                                        client.query(query, (err, result) => {

                                            if (err) {

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
                                        let query = `INSERT INTO horaires ("etablissement_id", jour, "plage_horaire",created_at,updated_at) VALUES ('${samedi.idEtablissement}', '${samedi.jour}', '${samedi.plageHoraire}', '${samedi.createdAt}', '${samedi.updatedAt}')`;
                                        client.query(query, (err, result) => {

                                            if (err) {

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
                                        let query = `INSERT INTO horaires ("etablissement_id", jour, "plage_horaire",created_at,updated_at) VALUES ('${dimanche.idEtablissement}', '${dimanche.jour}', '${dimanche.plageHoraire}', '${dimanche.createdAt}', '${dimanche.updatedAt}')`;
                                        client.query(query, (err, result) => {

                                            if (err) {

                                            }
                                        });
                                    }

                                } catch (error) {

                                }

                            }

                            console.log("Etablissement " + name + " Bien ajouté");



                        });

                    } catch (error) {
                    }

                });
            });

            time++;
        }
        else {
            clearInterval(interval);
        }
    }, 1500);





}



module.exports = {
    addDataInDb,
};
