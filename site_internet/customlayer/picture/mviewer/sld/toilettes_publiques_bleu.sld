<?xml version="1.0" encoding="UTF-8"?>
<!--
  
  nom du SLD : toilettes_publiques
  
  couche source dans la base :  espace_publique.prop_event_toilette_publique
  layer cible du style       :  espub_dech:prop_event_toilette_publique
  
  objet : goutte bleue pour les cartes de la DG Comm mais taille unique car peu d'objets à afficher en même temps
  
  Historique des versions :
  date        |  auteur              |  description
  22/01/2020  |  Cédric BRIAND         |  version initiale
  
-->
<StyledLayerDescriptor version="1.1.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" xmlns="http://www.opengis.net/sld" 
xmlns:ogc="http://www.opengis.net/ogc" xmlns:se="http://www.opengis.net/se" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <NamedLayer>
    <se:Name>espub_dech:prop_event_toilette_publique</se:Name>
    <UserStyle>
      <se:Name>toilettes_publiques</se:Name>
        <se:Description>
          <se:Title>Toilettes publiques (picto bleu)</se:Title>
          <se:Abstract>Style simple : goutte d'eau bleue</se:Abstract>
        </se:Description>
      <se:FeatureTypeStyle>
      
        <!-- picto de taille unique -->
        <se:Rule>
          <se:Name>Toilettes</se:Name>
          <se:MinScaleDenominator>1</se:MinScaleDenominator>
          <se:MaxScaleDenominator>500000</se:MaxScaleDenominator>
          <se:PointSymbolizer>
            <se:Graphic>
              <se:ExternalGraphic>
                <se:OnlineResource  xlink:type="simple" xlink:href="https://public.sig.rennesmetropole.fr/ressources/img/mviewer/sldmarker.svg?fill=#33919d" />
                <se:Format>image/svg+xml</se:Format>
              </se:ExternalGraphic>
              <se:Size>25</se:Size>
              <se:Displacement>
                <se:DisplacementX>0</se:DisplacementX>
                <se:DisplacementY>-15</se:DisplacementY>
              </se:Displacement>
            </se:Graphic>
          </se:PointSymbolizer>
        </se:Rule>
      
      </se:FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
