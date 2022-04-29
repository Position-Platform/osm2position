import pandas as pd
import requests
import json
import geojson
import codecs
#import osm2geojson
import overpass
import numpy as np
import time





class OsmtoPosition:

    def __init__(self, fichier):
        
        self.api = overpass.API(timeout=500)
        self.tag_file= pd.read_csv(fichier, sep=",")


    def construction_requete(key,value):
        M=value.split(",")
        query=""
    
        for i in range(len(M)):
            query+="node["+key+"="+M[i]+"](area);"
       
        
        #print(query)
   
        return query
    
    def make_overpass_request(query,api):
        response = None
        while response is None:
            try:
                response = api.get(query ,verbosity='geom')
                time.sleep(10)
           
            except:
                print("error")
                pass
    
        return response
    

    def store_geojson_file(index,response):
    
        # Convert to a GEOJSON string
        # dump as file, if you want to save it in file
        file="position/"+str(index)+".geojson"
        with open(file,mode="w") as result1:
            geojson.dump(response,result1)
    
   
    def download_osm_data(self):
        for i in range(len(self.tag_file)):
   
            print("index ="+str(i))
  
            if(self.tag_file['tags_osm'][i] is not np.nan):
                T=self.tag_file['tags_osm'][i]
                #print(f.loc[i,"tags_osm"])
                tableau=T.split(";")
                if(len(tableau)==1):
                    #print(tableau)
                    res=tableau[0].split("=")
                    query=self.construction_requete(res[0],res[1])
                    overpass_query = """
               area["ISO3166-1"="CM"][admin_level=2];
             ("""+query+"""
             );"""
                    print(query)
                    print(overpass_query)
                    response1 = make_overpass_request(overpass_query,self.api)
                    store_geojson_file(i+1,response1)
                
         
                else:
                    query=""
                    for j in range(len(tableau)):
                        res=tableau[j].split("=")
                        #print(construction_requete(res[0],res[1]))
                        query+=self.construction_requete(res[0],res[1])
                        overpass_query = """
                   area["ISO3166-1"="CM"][admin_level=2];
              ("""+query+"""
              );"""
                        print(query)
                        print(overpass_query)
                        response = make_overpass_request(overpass_query,self.api)
                        store_geojson_file(i+1,response)


#Exécution du code
OsmtoPosition=OsmtoPosition("datas/sous_categories.csv")
OsmtoPosition.download_osm_data()