import React, {useRef, useEffect, useState} from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './App.css';
import './Map.css';

export default function Map({threats, posReps}) {

    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng] = useState(-76.11);
    const [lat] = useState(37.21);
    const [zoom] = useState(7);
    const [API_KEY] = useState('Ce9hgYWIkaeo6JSNYZbf');

    let aircraftMarkerArr = [];

    useEffect(() => {
        if (map.current) return;
        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: `https://api.maptiler.com/maps/topo/style.json?key=${API_KEY}`,
            center: [lng, lat],
            zoom: zoom
        });

        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

//         map.current.on('mousemove', function (e) {
//             document.getElementById('info').innerHTML =
// // e.point is the x, y coordinates of the mousemove event relative
// // to the top-left corner of the map
//
//                 // e.lngLat is the longitude, latitude geographical position of the event
//                 JSON.stringify(e.lngLat.wrap());
//         });

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

                var threatIcon = document.createElement('div');
                threatIcon.classList.add('Map_SamMarker');

                new maplibregl.Marker(threatIcon)
                    .setLngLat([threat.longitude, threat.latitude])
                    .addTo(map.current);
            })
        }

    }, [threats]);

    useEffect(() => {

        {
            posReps.map((posRep) => {

                console.log(aircraftMarkerArr)

                aircraftMarkerArr.map((marker) => {

                    console.log("Removing Marker: ", marker)
                    marker.remove()
                })

                var targetIcon = document.createElement('div');
                targetIcon.classList.add('Map_AircraftMarker');

                console.log("Creating TargetIcon")

                const newMarker = new maplibregl.Marker(targetIcon)
                    .setLngLat([posRep.lng, posRep.lat])
                    .setRotation(posRep.hdg)
                    .addTo(map.current);

                aircraftMarkerArr = []
                aircraftMarkerArr.push(newMarker)

                console.log(aircraftMarkerArr)

            })
        }
    }, [posReps])

    return (
        <div className="map-wrap">
            <div ref={mapContainer} className="map"/>
        </div>
    );
}