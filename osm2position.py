import pandas as pd
import requests
import json
import geojson
import codecs
import osm2geojson

j = 0

f = pd.read_csv('datas/sous_categories.csv', sep=";")
file = f[0:1]
for i in range(len(file)):

    overpass_url = "http://overpass-api.de/api/interpreter"
    overpass_query = """
    [out:json][timeout:300];
    area["ISO3166-1"="CM"][admin_level=2];
    (node["""+file['tag'][i]+"="+file['attribut'][i]+"""](area);
    );
    out center;
    """
    response = requests.get(overpass_url,
                            params={'data': overpass_query})
    data = response.json()

    with open("C:/Users/seren/position/A/doc.geojson", 'w') as ft:
        json.dump(data, ft, indent=4)

    with codecs.open('C:/Users/seren/position/A/doc.geojson', 'r', encoding='utf-8') as data:
        save = data.read()
    convert = osm2geojson.json2geojson(
        save, filter_used_refs=False, log_level='INFO')
    # >> { "type": "FeatureCollection", "features": [ ... ] }

    # Output to a file (GEOJSON serialization)
    print(file["name"][i])
    nom_fichier = str(file["id"][i])
    with open("C:/Users/seren/position/"+nom_fichier+".geojson", 'w') as stream:
        geojson.dump(convert, stream, indent=4)

    j = j+1

print(j)
