<?xml version="1.0" encoding="UTF-8"?>
<!--
  
  nom du SLD : aires_jeux_vdr
  
  couche source dans la base :  espace_public.gev_ajeu
  layer cible du style       :  espub_mob:gev_ajeu
  
  objet : surfaces des aires de jeux de la ville de Rennes
  
  Historique des versions :
  date        |  auteur              |  description
  20/01/2020  |  Cédric BRIAND         |  version initiale
  
-->
<StyledLayerDescriptor version="1.1.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" xmlns="http://www.opengis.net/sld" 
xmlns:ogc="http://www.opengis.net/ogc" xmlns:se="http://www.opengis.net/se" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <NamedLayer>
    <se:Name>espub_mob:gev_ajeu</se:Name>
    <UserStyle>
      <se:Name>aires_jeux_vdr</se:Name>
        <se:Description>
          <se:Title>Aires de jeux de la ville de Rennes</se:Title>
        </se:Description>
      <se:FeatureTypeStyle>
      
        <!-- picto de taille unique -->
        <se:Rule>
          <se:Name>Organisme</se:Name>
          <se:MinScaleDenominator>1</se:MinScaleDenominator>
          <se:MaxScaleDenominator>500000</se:MaxScaleDenominator>
          <se:PolygonSymbolizer>
            <se:Fill>
              <se:SvgParameter name="fill">#dd3627</se:SvgParameter>
              <se:SvgParameter name="fill-opacity">0.1</se:SvgParameter>
            </se:Fill>
            <se:Stroke>
              <se:SvgParameter name="stroke">#dd3627</se:SvgParameter>
              <se:SvgParameter name="stroke-width">0.8</se:SvgParameter>
              <se:SvgParameter name="stroke-opacity">1.0</se:SvgParameter>
            </se:Stroke>
          </se:PolygonSymbolizer>
        </se:Rule>
      
      </se:FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
