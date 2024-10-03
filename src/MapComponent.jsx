import { useCallback, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import "./MapComponent.css";

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
    const zoom = 10;
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
      const pixelData = context.getImageData(128, 128, 1, 1).data;
      const red = pixelData[0];
      const green = pixelData[1];
      const blue = pixelData[2];

      setColor(`RGB(${red}, ${green}, ${blue})`);
      console.log("RGB values at", lat, lng, ":", [red, green, blue]);
    };

    img.onerror = () => {
      console.error("Error loading image");
      setColor("Error loading color");
    };
  };

  const mapStyles = [
    {
      featureType: "all",
      elementType: "geometry",
      stylers: [
        {
          color: "#ffffff",
        },
      ],
    },
    {
      featureType: "landscape",
      elementType: "all",
      stylers: [
        {
          color: "#f2f2f2",
        },
      ],
    },
    {
      featureType: "water",
      elementType: "all",
      stylers: [
        {
          color: "#a3c6e8",
        },
      ],
    },
    {
      featureType: "road",
      elementType: "all",
      stylers: [
        {
          color: "#dddddd",
        },
      ],
    },
    {
      featureType: "poi",
      elementType: "all",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
  ];

  return (
    <LoadScript googleMapsApiKey="AIzaSyAoa5txB7CgG3jbkXoLOSZ9Q5tB8B7h2-U">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100dvh" }}
        center={center}
        zoom={10}
        onClick={handleMapClick}
        options={{ styles: mapStyles }}
      >
        {markerPosition && <Marker position={markerPosition} />}
      </GoogleMap>
      {color && <div className="color-display">Color: {color}</div>}
    </LoadScript>
  );
};

export default MapComponent;
