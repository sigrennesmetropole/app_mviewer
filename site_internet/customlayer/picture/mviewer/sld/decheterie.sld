<?xml version="1.0" encoding="UTF-8"?>
<!--
  
  nom du SLD : [même nom que le style et le présent fichier SLD, cf les règles de nommage]
  
  couche source dans la base :  [schema].[couche]
  layer cible du style       :  eq_poi:v_sitorg_organisme
  
  objet :
  [objectifs du style, description et commentaires, etc]
  
  Historique des versions :
  date        |  auteur              |  description
  jj/mm/aaaa  |  Prénom NOM          |  version initiale
  
-->
<StyledLayerDescriptor version="1.1.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" xmlns="http://www.opengis.net/sld" 
xmlns:ogc="http://www.opengis.net/ogc" xmlns:se="http://www.opengis.net/se" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <NamedLayer>
    <se:Name>espub_dech:v_decheterie_pf_dv</se:Name>
    <UserStyle>
      <se:Name>[même nom que le fichier cf ligne 4]</se:Name>
        <se:Description>
          <se:Title>Titre court descriptif</se:Title>
          <se:Abstract>Explications plus détaillées sur le style</se:Abstract>
        </se:Description>
      <se:FeatureTypeStyle>
        <se:Rule>
          <se:Name>Déchèterie</se:Name>
          <ogc:Filter>
            <ogc:And>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>type</ogc:PropertyName>
                <ogc:Literal>Déchèterie</ogc:Literal>
              </ogc:PropertyIsEqualTo>
            </ogc:And>
          </ogc:Filter>
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
        <se:Rule>
          <se:Name>Plateforme végétaux </se:Name>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>type</ogc:PropertyName>
              <ogc:Literal>Plateforme végétaux</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <se:MinScaleDenominator>1</se:MinScaleDenominator>
          <se:MaxScaleDenominator>500000</se:MaxScaleDenominator>
          <se:PointSymbolizer>
            <se:Graphic>
              <se:ExternalGraphic>
                <se:OnlineResource  xlink:type="simple" xlink:href="https://public.sig.rennesmetropole.fr/ressources/img/mviewer/sldmarker.svg?fill=%238f9169" />
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
