import React, {useRef, useEffect, useState} from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './App.css';

export default function Map() {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng] = useState(-76.11);
    const [lat] = useState(37.01);
    const [zoom] = useState(8);
    const [API_KEY] = useState('yQlacdY3yLnRA1hc8Ui4');

    useEffect(() => {
        if (map.current) return;
        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: `https://api.maptiler.com/maps/streets/style.json?key=${API_KEY}`,
            center: [lng, lat],
            zoom: zoom
        });

    });

    return (
        <div className="map-wrap">
            <div ref={mapContainer} className="map"/>
        </div>
    );
}