import React, {useRef, useEffect, useState} from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './App.css';
import './Map.css';

export default function Map( {threats} ) {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng] = useState(-76.11);
    const [lat] = useState(37.01);
    const [zoom] = useState(8);
    const [API_KEY] = useState('Ce9hgYWIkaeo6JSNYZbf');

    useEffect(() => {
        if (map.current) return;
        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: `https://api.maptiler.com/maps/topo/style.json?key=${API_KEY}`,
            center: [lng, lat],
            zoom: zoom
        });

        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

        {threats.map((threat) => {

            var threatIcon = document.createElement('div');
            threatIcon.classList.add('Map_SamMarker');

            // threatIcon.addEventListener('click', function () {
            //     window.alert(threat.name);
            // });

            new maplibregl.Marker(threatIcon)
                .setLngLat([threat.longitude, threat.latitude])
                .addTo(map.current);

        })}

    });

    return (
        <div className="map-wrap">
            <div ref={mapContainer} className="map"/>
        </div>
    );
}