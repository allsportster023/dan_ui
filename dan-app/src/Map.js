import React, {useRef, useEffect, useState} from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './App.css';
import './Map.css';

let aircraftMarkerArr = [];
let threatMarkerArr = [];

export default function Map({threats, posReps, focusedThreatId}) {
    console.log('threats in map: ', threats)


    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng] = useState(-76.71);
    const [lat] = useState(37.8);
    const [zoom] = useState(7);
    const [API_KEY] = useState('Ce9hgYWIkaeo6JSNYZbf');

    useEffect(() => {

        //If we have a threat in mouse focus
        if(focusedThreatId !== null) {

            //Find the marker and change the size of the DIV element directly
            const focusIdx = threatMarkerArr.findIndex((t) => t._element.id === focusedThreatId)
            let focusMarker = threatMarkerArr[focusIdx]

            if(focusMarker) {
                focusMarker._element.style.width = "150px"
                focusMarker._element.style.height = "150px"
            }
        } else {
            //If none of the threats are in focus, just reset the size
            //   to null so that the CSS class defines it
            threatMarkerArr.forEach((m) => {
                m._element.style.width = null
                m._element.style.height = null
            })
        }
    }, [focusedThreatId])

    useEffect(() => {
        if (map.current) return;
        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: `https://api.maptiler.com/maps/topo/style.json?key=${API_KEY}`,
            center: [lng, lat],
            zoom: zoom
        });

        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

        // map.current.on('mousemove', function (e) {
        //     document.getElementById('info').innerHTML = JSON.stringify(e.lngLat.wrap());
        // });

        map.current.once("load", () => {
            // This code runs once the base style has finished loading.

            map.current.addSource('maine', {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Polygon',
                        'coordinates': [
                            [
                                [-76.41, 36.81],
                                [-75.75, 37.27],
                                [-75.50, 37.05]]
                        ]
                    }
                }
            })

            map.current.addLayer({
                'id': 'maine',
                'type': 'fill',
                'source': 'maine',
                'layout': {},
                'paint': {
                    'fill-color': '#088',
                    'fill-opacity': 0.8
                }
            });
        });

        {
            threats.map((threat) => {
                console.log('threat in map: ', threat)

                var threatIcon = document.createElement('div');
                threatIcon.classList.add('Map_SamMarker');
                threatIcon.id = threat.sam_id

                const threatPopup = `<h3>${threat.sam_id}</h3><h3>Target: ${threat.cur_target}</h3>`
                const threatPopup2 = new maplibregl.Popup().setHTML(threatPopup)
                threatPopup2.className = 'Map_ThreatPopup'

                const threatMarker = new maplibregl.Marker(threatIcon)
                    .setLngLat([threat.long, threat.lat])
                    // .setPopup(new maplibregl.Popup().setHTML(threatPopup))
                    .setPopup(threatPopup2)
                    .addTo(map.current);

                threatMarkerArr.push(threatMarker)
            })
        }

    }, [threats]);

    useEffect(() => {

        {

            aircraftMarkerArr.map((marker) => {
                marker.remove()
            })

            aircraftMarkerArr = []

            posReps.map((posRep) => {
                let targetIcon = document.createElement('div');
                targetIcon.classList.add('Map_AircraftMarker');
                let label = document.createTextNode(posRep.name);
                label.className = 'Map_AircraftLabel'

                console.log("Creating TargetIcon")

                const newMarker = new maplibregl.Marker(targetIcon)
                    .setLngLat([posRep.lng, posRep.lat])
                    .setRotation(posRep.hdg)
                    .addTo(map.current);

                aircraftMarkerArr.push(newMarker)

            })
        }
    }, [posReps])

    return (
        <div className="map-wrap">
            {/*<pre id={"info"} />*/}
            <div ref={mapContainer} className="map"/>
        </div>
    );
}