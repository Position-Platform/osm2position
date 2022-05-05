# -*- coding: utf-8 -*-
"""
Spyder Editor

This is a temporary script file.
"""

import pandas as pd
import overpass
import numpy as np
import geojson
import time


def construction_requete(key, value):
    M = value.split(",")
    query = ""

    for i in range(len(M)):

        query += "node["+key+"="+M[i]+"](area);"

    # print(query)

    return query


def make_overpass_request(query, api):

    response = None
    while response is None:
        try:
            response = api.get(query, verbosity='geom')
            time.sleep(5)

        except:
            print("error")
            pass

    return response


def store_geojson_file(index, response, folder):

    # Convert to a GEOJSON string
    # dump as file, if you want to save it in file
    file = "datas/osmdata/"+folder+"/" + str(index)+".geojson"
    with open(file, mode="w") as result1:
        geojson.dump(response, result1)


def download_osm_data(fichier):

    f = pd.read_csv(fichier, sep=";")

    api = overpass.API(timeout=500)

    for i in range(len(f)):

        print("index ="+str(f['id'][i]))
        if(f['tags_osm'][i] is not np.nan):
            T = f['tags_osm'][i]

            # print(f.loc[i,"tags_osm"])
            if(f['tags_osm'][i] == str("end")):
                break
            tableau = T.split(",")
            if(len(tableau) == 1):
                # print(tableau)
                res = tableau[0].split("=")
                query = construction_requete(res[0], res[1])
                overpass_query = """
              area["ISO3166-1"="CM"][admin_level=2];
             ("""+query+"""
             );
             """

                print(query)
                print(overpass_query)
                response1 = make_overpass_request(overpass_query, api)
                store_geojson_file(f['id'][i], response1, f['catégorie'][i])

            else:
                query = ""
                for j in range(len(tableau)):

                    res = tableau[j].split("=")
                    # print(construction_requete(res[0],res[1]))
                    query += (construction_requete(res[0],
                              res[1]))

                    overpass_query = """
                 area["ISO3166-1"="CM"][admin_level=2];
              ("""+query+"""
              );
              """
                    print(query)
                    print(overpass_query)
                    response = make_overpass_request(overpass_query, api)
                    store_geojson_file(f['id'][i], response, f['catégorie'][i])


# exécution
download_osm_data('datas/data.csv')
