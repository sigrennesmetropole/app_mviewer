<?xml version="1.0" encoding="UTF-8"?>
<!--
  
  nom du SLD : jeux_enfants_vdr
  
  couche source dans la base :  espace_public.gev_jeu
  layer cible du style       :  espub_mob:gev_jeu
  
  objet : équipement des espaces de jeux de la ville de Rennes
  
  Historique des versions :
  date        |  auteur              |  description
  08/06/2021  |  Cédric BRIAND       |  version initiale
  
-->
<StyledLayerDescriptor version="1.1.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" xmlns="http://www.opengis.net/sld" 
xmlns:ogc="http://www.opengis.net/ogc" xmlns:se="http://www.opengis.net/se" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <NamedLayer>
    <se:Name>espub_mob:gev_jeu</se:Name>
    <UserStyle>
      <se:Name>jeux_enfants_vdr</se:Name>
        <se:Description>
          <se:Title>Equipements des aires de jeux de la ville de Rennes</se:Title>
          <se:Abstract>Affichage par tranche d'age</se:Abstract>
        </se:Description>
      <se:FeatureTypeStyle>
      
        <!-- picto de taille unique -->
        <se:Rule>
          <se:Name>Organisme</se:Name>
          <se:MinScaleDenominator>1</se:MinScaleDenominator>
          <se:MaxScaleDenominator>8000</se:MaxScaleDenominator>
          <se:PointSymbolizer>
            <se:Graphic>
             <se:Mark>
              <se:WellKnownName>circle</se:WellKnownName>
              <se:Fill>
               <se:SvgParameter name="fill">#aa0c8b</se:SvgParameter>
              </se:Fill>
             </se:Mark>
             <se:Size>10</se:Size>
            </se:Graphic>
          </se:PointSymbolizer>
        </se:Rule>
      </se:FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
