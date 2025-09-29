"use client";

import { useState } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import { Card, CardContent } from "@/components/ui/card";
import { ProcessedRow, StandardFields } from "@/lib/definitions";

interface MapViewProps {
  data: ProcessedRow[];
}

/** Returns color based on pollution level using Tailwind config colors */
const getMarkerColor = (level: string) => {
  switch (level) {
    case "High":
      return "#e53e3e"; // destructive.DEFAULT
    case "Medium":
      return "#f6e05e"; // accent.DEFAULT
    case "Low":
    default:
      return "#4fd1c5"; // secondary.DEFAULT
  }
};

export default function MapView({ data }: MapViewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [activeMarker, setActiveMarker] = useState<ProcessedRow | null>(null);

  const validData = data.filter(
    (d) =>
      d.latitude != null &&
      d.longitude != null &&
      !isNaN(parseFloat(d.latitude)) &&
      !isNaN(parseFloat(d.longitude))
  );

  if (!apiKey) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <CardContent className="text-center space-y-2">
          <p className="text-destructive font-semibold">
            Google Maps API Key is missing or invalid.
          </p>
          <p className="text-muted-foreground">
            Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment
            variables.
          </p>
          <p className="text-muted-foreground text-sm pt-2">
            Note: Billing must be enabled on your Google Cloud project for maps
            to display.
          </p>
        </CardContent>
      </Card>
    );
  }

  const center =
    validData.length > 0
      ? {
          lat: parseFloat(validData[0].latitude),
          lng: parseFloat(validData[0].longitude),
        }
      : { lat: 40.7128, lng: -74.006 };

  return (
    <Card>
      <div className="h-[600px] w-full rounded-lg overflow-hidden">
        <APIProvider apiKey={apiKey}>
          <Map
            defaultCenter={center}
            defaultZoom={validData.length > 0 ? 10 : 3}
            mapId="a3a7c3a4c5d6c6e6"
            gestureHandling="greedy"
          >
            {validData.map((markerData) => (
              <AdvancedMarker
                key={markerData.id}
                position={{
                  lat: parseFloat(markerData.latitude),
                  lng: parseFloat(markerData.longitude),
                }}
                onClick={() => setActiveMarker(markerData)}
              >
                <Pin
                  background={getMarkerColor(markerData.pollutionLevel)}
                  borderColor="#fff"
                  glyphColor="#fff"
                />
              </AdvancedMarker>
            ))}

            {activeMarker && (
              <InfoWindow
                position={{
                  lat: parseFloat(activeMarker.latitude),
                  lng: parseFloat(activeMarker.longitude),
                }}
                onCloseClick={() => setActiveMarker(null)}
              >
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-lg mb-2">
                    {activeMarker.location_name || "Sample Location"}
                  </h3>
                  <p>
                    <span className="font-semibold">HMPI:</span>{" "}
                    {activeMarker.hmpi}
                  </p>
                  <p>
                    <span className="font-semibold">Pollution Level:</span>{" "}
                    <span
                      style={{
                        color: getMarkerColor(activeMarker.pollutionLevel),
                      }}
                    >
                      {activeMarker.pollutionLevel}
                    </span>
                  </p>
                  <hr className="my-2" />
                  <div className="text-xs space-y-1">
                    {Object.keys(StandardFields).map((field) => {
                      if (
                        field.startsWith("location") ||
                        field === "date" ||
                        field === "latitude" ||
                        field === "longitude" ||
                        !activeMarker[field]
                      )
                        return null;

                      return (
                        <p key={field}>
                          <span className="font-semibold">
                            {
                              StandardFields[
                                field as keyof typeof StandardFields
                              ]
                            }
                            :
                          </span>{" "}
                          {activeMarker[field]}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </div>
    </Card>
  );
}
