import React, { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./App.css";
import "./Map.css";

let aircraftMarkerArr = [];
let aircraftMarkerLabelArr = [];
let threatMarkerArr = [];

export default function Map({ threats, posReps, focusedThreatId }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng] = useState(-76.71);
  const [lat] = useState(37.8);
  const [zoom] = useState(8);
  const [API_KEY] = useState("Ce9hgYWIkaeo6JSNYZbf");

  useEffect(() => {
    //If we have a threat in mouse focus
    if (focusedThreatId !== null) {
      //Find the marker and change the size of the DIV element directly
      const focusIdx = threatMarkerArr.findIndex(
        (t) => t._element.id === focusedThreatId
      );
      let focusMarker = threatMarkerArr[focusIdx];

      if (focusMarker) {
        focusMarker._element.style.width = "150px";
        focusMarker._element.style.height = "150px";
      }
    } else {
      //If none of the threats are in focus, just reset the size
      //   to null so that the CSS class defines it
      threatMarkerArr.forEach((m) => {
        m._element.style.width = null;
        m._element.style.height = null;
      });
    }
  }, [focusedThreatId]);

  function getTargetCoords(name) {
    const target = posReps.filter((aircraft) => {
      return aircraft.name === name;
    });
    if (target.length > 0) {
      const coords = { lat: target[0].lat, lon: target[0].lng };
      // console.log('targetCoords: ', coords)
      return coords;
    } else {
      return null;
    }
  }

  useEffect(() => {
    if (map.current) {
      if (map.current.loaded()) {
        threats.map((threat) => {
          let coords = {};
          if (map.current.getLayer(`${threat.sam_id}`)) {
            map.current.removeLayer(`${threat.sam_id}`);
          }
          if (map.current.getSource(`${threat.sam_id}`)) {
            map.current.removeSource(`${threat.sam_id}`);
          }
          if (threat.cur_target) {
            coords = getTargetCoords(threat.cur_target);
            if (coords) {
              map.current.addSource(`${threat.sam_id}`, {
                type: "geojson",
                data: {
                  type: "Feature",
                  geometry: {
                    type: "Polygon",
                    coordinates: [
                      [
                        [threat.long, threat.lat],
                        [coords.lon, coords.lat],
                        [coords.lon - 0.02, coords.lat - 0.02],
                      ],
                    ],
                  },
                },
              });
              map.current.addLayer({
                id: `${threat.sam_id}`,
                type: "fill",
                source: `${threat.sam_id}`,
                layout: {},
                paint: {
                  // 'fill-color': '#088',
                  "fill-color":
                    threat.status === "not ready"
                      ? "#9ea0a3"
                      : threat.status === "moving"
                      ? "#e3e84a"
                      : "#3ca836",
                  "fill-opacity": 0.8,
                },
              });
            }
          }
        });
      }
    }
  });

  useEffect(() => {
    if (map.current) return;
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/topo/style.json?key=${API_KEY}`,
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    // map.current.on('mousemove', function (e) {
    //     document.getElementById('info').innerHTML = JSON.stringify(e.lngLat.wrap());
    // });

    threats.map((threat) => {
      console.log("threat in map: ", threat);

      var threatIcon = document.createElement("div");
      threatIcon.classList.add("Map_SamMarker");
      threatIcon.id = threat.sam_id;

      const threatPopupValue = `<h3>${threat.sam_id}</h3><h3>Target: ${threat.cur_target}</h3>`;
      const threatPopup = new maplibregl.Popup().setHTML(threatPopupValue);
      threatPopup.className = "Map_ThreatPopup";

      const threatMarker = new maplibregl.Marker(threatIcon)
        .setLngLat([threat.long, threat.lat])
        .setPopup(threatPopup)
        .addTo(map.current);

      threatMarkerArr.push(threatMarker);
    });
  }, [threats, posReps]);

  useEffect(() => {
    console.log("Creating TargetIcons");

    aircraftMarkerArr.map((marker) => {
      marker.remove();
    });

    aircraftMarkerLabelArr.map((marker) => {
      marker.remove();
    });

    aircraftMarkerArr = [];
    aircraftMarkerLabelArr = [];

    posReps.map((posRep) => {
      let targetIcon = document.createElement("div");
      targetIcon.classList.add("Map_AircraftMarker");

      let targetLabel = document.createElement("div");
      targetLabel.classList.add("Map_AircraftLabel");
      targetLabel.innerText = posRep.name;

      const newMarker = new maplibregl.Marker(targetIcon)
        .setLngLat([posRep.lng, posRep.lat])
        .setRotation(posRep.hdg)
        .addTo(map.current);

      const newMarkerLabel = new maplibregl.Marker(targetLabel)
        .setLngLat([posRep.lng, posRep.lat])
        .addTo(map.current);

      aircraftMarkerArr.push(newMarker);
      aircraftMarkerLabelArr.push(newMarkerLabel);
    });
  }, [posReps]);

  return (
    <div className="map-wrap">
      {/*<pre id={"info"} />*/}
      <div ref={mapContainer} className="map" />
    </div>
  );
}
