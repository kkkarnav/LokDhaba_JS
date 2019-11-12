import React from 'react';
import { Map, GeoJSON, TileLayer, withLeaflet } from 'react-leaflet';
import '../../Assets/Styles/layout.css';
import 'leaflet/dist/leaflet.css';
import WinnerLegends from './WinnerLegends';
import ColPalette from '../../Assets/Data/PartyColourPalette.json';
import PrintControlDefault from 'react-leaflet-easyprint';

export default class WinnerMap extends React.Component {

  onEachFeature = (feature, layer) => {
    var popupContent = "";
    for (var key in feature.properties) {
      if (feature.properties.hasOwnProperty(key)) {
        var value = feature.properties[key];
        popupContent += `<b>${key}:</b> ${value}<br/>`;
      }
    }
    layer.bindPopup(popupContent);
  }

  renderConstituencies = (mapGeoJson, dataFilterOptions) => {
    return mapGeoJson.map(constituency => {


      var color = "#FFFFFF00"
      var constituencyParty = constituency.properties.Party;
      if(dataFilterOptions.has(constituencyParty)){
        for (var i = 0; i < ColPalette.length; i++) {
          var element = ColPalette[i];
          if (element.Party == constituencyParty) {
            color = element.Color;
            break;
          }
        }
      }

      var style = {fillColor: color,
      weight: 1,
      opacity: 0.3,
      color: 'black',
      fillOpacity: 0.7};


      return (
        <GeoJSON key={constituency.id} data={constituency} style={style} onEachFeature={this.onEachFeature}/>
      );
    });
  }

  render() {
    var data = this.props.data;
    var electionType = this.props.electionType === "GE" ? "Lok Sabha" : "Vidhan Sabha";
    var assemblyNo =this.props.assemblyNo;
    var dataFilterOptions = this.props.dataFilterOptions;
    var parties = data.features.flatMap(X => X.properties.Party);
    var legend = {}
    for (var i = 0; i < parties.length; i++) {
      var pty = parties[i];
      if(dataFilterOptions.has(pty)){
        legend[pty] = legend[pty] ? legend[pty] + 1 : 1;
      }
    }

    var SortedKeys = Object.keys(legend).sort(function(a,b){return legend[b]-legend[a]})
    var sortedLegend ={}
    for (var i =0; i < SortedKeys.length; i++) {
      var pty = SortedKeys[i];
      if(legend[pty]){
        sortedLegend[pty] = legend[pty]
      }
    }

    var leaflet = this.renderConstituencies(data.features,dataFilterOptions);

    const PrintControl = withLeaflet(PrintControlDefault);


    return (
      <div className="my-map" style={{width: "100%", height: "100%"}}>
      <div style={{textAlign: "center"}}>
      <label>
      {`Constituency wise winning parties for ${electionType} in Assembly #${assemblyNo}`}
      </label>
      </div>
      <Map center={[20.5937, 78.9629]}
      zoom={5}
      maxZoom={13}
      attributionControl={true}
      zoomControl={true}
      doubleClickZoom={true}
      scrollWheelZoom={false}
      dragging={true}
      animate={true}
      easeLinearity={0.35}>
      <TileLayer
      attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {leaflet}
      <WinnerLegends Legend = {sortedLegend}/>

      <PrintControl ref={(ref) => { this.printControl = ref; }} position="topleft" sizeModes={['Current', 'A4Portrait', 'A4Landscape']} hideControlContainer={false} />
      <PrintControl position="topleft" sizeModes={['Current', 'A4Portrait', 'A4Landscape']} hideControlContainer={false} title="Export as PNG" exportOnly />
      </Map>
      </div>
    );
  }
}
