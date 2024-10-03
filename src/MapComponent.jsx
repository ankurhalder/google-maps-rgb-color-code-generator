import { useCallback, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import "./MapComponent.css";

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const center = {
  lat: 22.5726,
  lng: 88.3639,
};

const MapComponent = () => {
  const [color, setColor] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(center);

  const handleMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    getColor(lat, lng);
    setMarkerPosition({ lat, lng });
  }, []);

  const getColor = (lat, lng) => {
    const zoom = 20;
    const tileX = Math.floor(((lng + 180) / 360) * Math.pow(2, zoom));
    const tileY = Math.floor(
      ((1 -
        Math.log(
          Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
        ) /
          Math.PI) /
        2) *
        Math.pow(2, zoom)
    );

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = 256;
    canvas.height = 256;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = `https://mt1.google.com/vt/lyrs=m&x=${tileX}&y=${tileY}&z=${zoom}`;

    img.onload = () => {
      context.drawImage(img, 0, 0);
      const pixelData = context.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      ).data;

      let totalRed = 0,
        totalGreen = 0,
        totalBlue = 0;
      const pixelCount = pixelData.length / 4;

      for (let i = 0; i < pixelData.length; i += 4) {
        totalRed += pixelData[i];
        totalGreen += pixelData[i + 1];
        totalBlue += pixelData[i + 2];
      }

      const avgRed = Math.round(totalRed / pixelCount);
      const avgGreen = Math.round(totalGreen / pixelCount);
      const avgBlue = Math.round(totalBlue / pixelCount);

      setColor(`RGB(${avgRed}, ${avgGreen}, ${avgBlue})`);
      console.log("RGB values at", lat, lng, ":", [avgRed, avgGreen, avgBlue]);
    };

    img.onerror = () => {
      console.error("Error loading image");
      setColor("Error loading color");
    };
  };

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100dvh" }}
        center={center}
        zoom={10}
        onClick={handleMapClick}
      >
        {markerPosition && <Marker position={markerPosition} />}
      </GoogleMap>
      {color && (
        <div className="color-display">
          <div
            className="color-swatch"
            style={{
              backgroundColor: color,
              width: "50px",
              height: "50px",
              display: "inline-block",
              marginRight: "10px",
            }}
          ></div>
          Color: {color}
        </div>
      )}
    </LoadScript>
  );
};

export default MapComponent;
