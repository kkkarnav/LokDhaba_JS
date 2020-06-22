import React from 'react';
import { Map, GeoJSON, withLeaflet } from 'react-leaflet';
import '../../Assets/Styles/layout.css';
import 'leaflet/dist/leaflet.css';
import PrintControlDefault from 'react-leaflet-easyprint';
import StateCentroids from '../../Assets/Data/StateCentroids.json';
import ContinuousLegend from './ContinuousLegend';
import DiscreteLegend from '../Shared/DiscreteLegend';
import MapSlider from '../Shared/MapSlider';

export default class MapViz extends React.Component {
  onEachFeature = (feature, layer) => {
    var popupContent = '';
    for (var key in feature.properties) {
      if (feature.properties.hasOwnProperty(key)) {
        var value = feature.properties[key];
        popupContent += `<b>${key}:</b> ${value}<br/>`;
      }
    }
    layer.bindPopup(popupContent);
  };

  renderConstituencies = (mapGeoJson, dataFilterOptions) => {
    const { getMapColor, vizParameter } = this.props;

    return mapGeoJson.map((constituency) => {
      const val = constituency.properties[vizParameter];
      let style = {
        fillColor: getMapColor(val, dataFilterOptions),
        weight: 1,
        opacity: 1,
        color: 'black',
        fillOpacity: 1
      };

      return (
        <GeoJSON
          key={constituency.id + "-" + constituency.properties.Assembly_No}
          data={constituency}
          style={() => {
            return ({ fillColor: style.fillColor, weight: style.weight, opacity: style.opacity, color: style.color, fillOpacity: style.fillOpacity })
          }}
          onEachFeature={this.onEachFeature}
        />
      );
    });
  };

  renderLegend = () => {
    const { legendType, discreteLegend, getLegendColor } = this.props;

    if (legendType === "Continuous") {
      return (
        <ContinuousLegend />
      )
    }
    else if (legendType === "Discrete") {
      return (
        <DiscreteLegend Legend={discreteLegend} getLegendColor={getLegendColor} />
      )
    }
  }

  render() {
    const title = this.props.title;
    var data = this.props.data;
    var electionType = this.props.electionType === 'GE' ? 'Lok Sabha' : 'Vidhan Sabha';
    const PrintControl = withLeaflet(PrintControlDefault);
    var dataFilterOptions = this.props.dataFilterOptions;
    var shape = this.props.map;
    var state = this.props.stateName;
    let joinMap = {};

    if (electionType === 'Lok Sabha') {
      for (var i = 0; i < data.length; i++) {
        data[i].key = data[i].State_Name + '_' + data[i].Constituency_No;
      }
      joinMap = {
        geoKey: 'properties.State_Key', //here geoKey can be feature 'id' also
        dataKey: 'key'
      };
    } else {
      joinMap = {
        geoKey: 'properties.ASSEMBLY', //here geoKey can be feature 'id' also
        dataKey: 'Constituency_No'
      };
    }

    var extendGeoJSON = require('extend-geojson-properties');
    extendGeoJSON(shape, data, joinMap);

    var leaflet = this.renderConstituencies(shape, dataFilterOptions);

    var st = state !== '' ? state : 'Lok_Sabha';
    var centerX = StateCentroids.filter(function (item) {
      return item.State_Name === st;
    })[0].Y;
    var centerY = StateCentroids.filter(function (item) {
      return item.State_Name === st;
    })[0].X;
    var zoom = StateCentroids.filter(function (item) {
      return item.State_Name === st;
    })[0].zoom;

    return (
      <div style={{ height: '300px' }}>
        <div className="my-map" style={{ width: '100%', height: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <label>
              {title}
            </label>
          </div>
          <Map
            center={[centerX, centerY]}
            zoom={zoom - 1}
            maxZoom={zoom + 8}
            attributionControl={true}
            zoomControl={true}
            doubleClickZoom={true}
            scrollWheelZoom={false}
            dragging={true}
            animate={true}
            easeLinearity={0.35}
          >
            {leaflet}
            <PrintControl
              ref={(ref) => {
                this.printControl = ref;
              }}
              position="topleft"
              sizeModes={['Current', 'A4Portrait', 'A4Landscape']}
              hideControlContainer={false}
            />
            <PrintControl
              position="topleft"
              sizeModes={['Current', 'A4Portrait', 'A4Landscape']}
              hideControlContainer={false}
              title="Export as PNG"
              exportOnly
            />
            {/* <ContinuousLegend /> */}
            {this.renderLegend()}
            <MapSlider
              handlePlay={this.props.playChangeYears}
              onSliderYearChange={this.props.onSliderYearChange}
              year={this.props.assemblyNo}
              yearOptions={this.props.yearOptions}
            />
          </Map>
        </div>
      </div>
    );
  }
}
