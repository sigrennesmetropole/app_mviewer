<?xml version="1.0" encoding="UTF-8"?>
<!--

  nom du SLD : zac_contour

  couche source dans la base :  urba_foncier.zac
  layer cible du style       :  urba_fonc:zac

  objet : style avec contour des polygones de la ZAC + nom de la ZAC à partir du 1/35000

  Historique des versions :
  date        |  auteur              |  description
  28/09/2020  |  Cédric BRIAND       |  version initiale

-->
<StyledLayerDescriptor version="1.1.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" xmlns="http://www.opengis.net/sld"
xmlns:ogc="http://www.opengis.net/ogc" xmlns:se="http://www.opengis.net/se" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <NamedLayer>
    <se:Name>urba_fonc:zac</se:Name>
    <UserStyle>
      <se:Name>zac_contour</se:Name>
      <se:Description>
        <se:Title>Zones d'Aménagement Concerteés (ZAC) sur Rennes Métropole </se:Title>
        <se:Abstract>Contour de la ZAC.</se:Abstract>
      </se:Description>
      <se:FeatureTypeStyle>

        <!-- 1 règle par étape : polygone -->
        <se:Rule>
          <se:Name>En études</se:Name>
          <ogc:Filter>
            <ogc:And> 
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>archive</ogc:PropertyName>
                <ogc:Literal>0</ogc:Literal>
              </ogc:PropertyIsEqualTo>
              <ogc:Or>
                <ogc:PropertyIsEqualTo>
                  <ogc:PropertyName>etape</ogc:PropertyName>
                  <ogc:Literal>En projet</ogc:Literal>
                </ogc:PropertyIsEqualTo>
                <ogc:PropertyIsEqualTo>
                  <ogc:PropertyName>etape</ogc:PropertyName>
                  <ogc:Literal>En études de création</ogc:Literal>
                </ogc:PropertyIsEqualTo>
                <ogc:PropertyIsEqualTo>
                  <ogc:PropertyName>etape</ogc:PropertyName>
                  <ogc:Literal>En études de réalisation</ogc:Literal>
                </ogc:PropertyIsEqualTo>
              </ogc:Or>
            </ogc:And> 
          </ogc:Filter>
          <se:PolygonSymbolizer>
            <se:Fill>
              <se:SvgParameter name="fill">#e600a9</se:SvgParameter>
              <se:SvgParameter name="fill-opacity">0.1</se:SvgParameter>
            </se:Fill>
            <se:Stroke>
              <se:SvgParameter name="stroke">#e600a9</se:SvgParameter>
              <se:SvgParameter name="stroke-width">0.8</se:SvgParameter>
              <se:SvgParameter name="stroke-opacity">1.0</se:SvgParameter>
            </se:Stroke>
          </se:PolygonSymbolizer>
          <se:TextSymbolizer>
            <se:Label>
              <ogc:PropertyName>nomzac</ogc:PropertyName>
            </se:Label>
            <se:Font>
              <se:SvgParameter name="font-family">Arial</se:SvgParameter>
              <se:SvgParameter name="font-size">12</se:SvgParameter>
              <se:SvgParameter name="font-style">normal</se:SvgParameter>
              <se:SvgParameter name="font-weight">bold</se:SvgParameter>
            </se:Font>
            <se:Fill>
                <SvgParameter name="fill">#e600a9</SvgParameter>
            </se:Fill>
            <se:Halo>
              <se:Radius>0.7</se:Radius>
              <se:Fill>
                <se:SvgParameter name="fill">#fff</se:SvgParameter>
              </se:Fill>
            </se:Halo>
          </se:TextSymbolizer>
        </se:Rule>
        
        <se:Rule>
          <se:Name>En cours d'aménagement</se:Name>
          <ogc:Filter>
            <ogc:And> 
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>archive</ogc:PropertyName>
                <ogc:Literal>0</ogc:Literal>
              </ogc:PropertyIsEqualTo>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>etape</ogc:PropertyName>
                <ogc:Literal>En cours d'aménagement</ogc:Literal>
              </ogc:PropertyIsEqualTo>
            </ogc:And> 
          </ogc:Filter>
          <se:PolygonSymbolizer>
            <se:Fill>
              <se:SvgParameter name="fill">#73b2ff</se:SvgParameter>
              <se:SvgParameter name="fill-opacity">0.1</se:SvgParameter>
            </se:Fill>
            <se:Stroke>
              <se:SvgParameter name="stroke">#73b2ff</se:SvgParameter>
              <se:SvgParameter name="stroke-width">0.8</se:SvgParameter>
              <se:SvgParameter name="stroke-opacity">1.0</se:SvgParameter>
            </se:Stroke>
          </se:PolygonSymbolizer>
          <se:TextSymbolizer>
            <se:Label>
              <ogc:PropertyName>nomzac</ogc:PropertyName>
            </se:Label>
            <se:Font>
              <se:SvgParameter name="font-family">Arial</se:SvgParameter>
              <se:SvgParameter name="font-size">12</se:SvgParameter>
              <se:SvgParameter name="font-style">normal</se:SvgParameter>
              <se:SvgParameter name="font-weight">bold</se:SvgParameter>
            </se:Font>
            <se:Fill>
                <SvgParameter name="fill">#73b2ff</SvgParameter>
            </se:Fill>
            <se:Halo>
              <se:Radius>0.7</se:Radius>
              <se:Fill>
                <se:SvgParameter name="fill">#fff</se:SvgParameter>
              </se:Fill>
            </se:Halo>
          </se:TextSymbolizer>
        </se:Rule>
        
      </se:FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
