import React from 'react'
import { Map, GeoJSON , TileLayer, withLeaflet} from 'react-leaflet';
import '../../Assets/Styles/layout.css';
import 'leaflet/dist/leaflet.css';
import ConstituencyTypeLegends from './ConstituencyTypeLegends';
import PrintControlDefault from 'react-leaflet-easyprint';

export default class ConstituencyTypeMap extends React.Component {

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

  renderConstituencies = (mapGeoJson) => {
    return mapGeoJson.map(constituency => {
       let style = {fillColor: '#FFFFFF00',
                    weight: 1,
                    opacity: 1,
                    color: 'black',
                    fillOpacity: 0.7};
       switch(constituency.properties.Constituency_Type){
         case "General":
           style = {fillColor: '#1F78B4',
                    weight: 1,
                    opacity: 1,
                    color: 'black',
                    fillOpacity: 0.7};
           break;
         case "SC":
           style = {fillColor: '#A6CEE3',
                    weight: 1,
                    opacity: 1,
                    color: 'black',
                    fillOpacity: 0.7};
           break;
         case "ST":
           style = {fillColor: '#B2DF8A',
                    weight: 1,
                    opacity: 1,
                    color: 'black',
                    fillOpacity: 0.7};
           break;
        defualt:
           break;
        }
        return (
          <GeoJSON key={constituency.id} data={constituency} style={style} onEachFeature={this.onEachFeature}/>
        );
      });
    }

  render() {
    var data = this.props.data;
    var electionType = this.props.electionType === "GE" ? "Lok Sabha" : "Vidhan Sabha";
    var assemblyNo =this.props.assemblyNo;
    const PrintControl = withLeaflet(PrintControlDefault);

    return (
      <div className="my-map" style={{width: "100%", height: "100%"}}>
      <div style={{textAlign: "center"}}>
      <label>
         {`Constituency types for ${electionType} in Assembly #${assemblyNo}`}
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
          {this.renderConstituencies(data.features)}
          <ConstituencyTypeLegends/>
          <PrintControl ref={(ref) => { this.printControl = ref; }} position="topleft" sizeModes={['Current', 'A4Portrait', 'A4Landscape']} hideControlContainer={false} />
          <PrintControl position="topleft" sizeModes={['Current', 'A4Portrait', 'A4Landscape']} hideControlContainer={false} title="Export as PNG" exportOnly />
          
        </Map>
      </div>
    );
  }
}
