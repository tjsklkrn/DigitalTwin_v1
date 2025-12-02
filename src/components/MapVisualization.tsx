import React from "react";
import { MapContainer, TileLayer, Pane } from "react-leaflet";
import { Badge } from "./ui/badge";

interface GridCell {
  id: string;
  x: number;
  y: number;
  emission: number;
  type: "residential" | "industrial" | "commercial" | "transport";
  interventions: Intervention[];
}

interface Intervention {
  id: string;
  type: "capture_unit" | "vertical_garden" | "solar_panel";
  efficiency: number;
  name: string;
  icon: string;
}

interface MapVisualizationProps {
  gridData: GridCell[];
  onCellClick: (cell: GridCell) => void;
  selectedCell: GridCell | null;
  showInterventions: boolean;
}

export function MapVisualization({
  gridData,
  onCellClick,
  selectedCell,
  showInterventions,
}: MapVisualizationProps) {
  const getEmissionColor = (emission: number) => {
    if (emission > 50) return "#dc2626";
    if (emission > 30) return "#ea580c";
    if (emission > 15) return "#facc15";
    if (emission > 5) return "#84cc16";
    return "#22c55e";
  };

  const getEmissionLabel = (emission: number) => {
    if (emission > 50) return "Very High";
    if (emission > 30) return "High";
    if (emission > 15) return "Moderate";
    if (emission > 5) return "Low";
    return "Very Low";
  };

  const zones = [
    { id: "zone-1", name: "Downtown", cells: gridData.slice(0, 24), x: 10, y: 10, width: 280, height: 180 },
    { id: "zone-2", name: "Industrial Park", cells: gridData.slice(24, 42), x: 310, y: 30, width: 240, height: 150 },
    { id: "zone-3", name: "Residential North", cells: gridData.slice(42, 66), x: 20, y: 210, width: 260, height: 160 },
    { id: "zone-4", name: "Commercial District", cells: gridData.slice(66, 90), x: 300, y: 200, width: 250, height: 170 },
    { id: "zone-5", name: "Residential South", cells: gridData.slice(90, 114), x: 50, y: 390, width: 230, height: 140 },
    { id: "zone-6", name: "Transport Hub", cells: gridData.slice(114, 144), x: 310, y: 390, width: 240, height: 140 },
  ];

  return (
    <div className="bg-white p-6 rounded-lg border">
      {/* Title + Legend */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg">Neighborhood CO₂ Emissions Map</h3>

        <div className="flex items-center gap-3 text-xs">
          {[["#dc2626", "Very High"], ["#ea580c", "High"], ["#facc15", "Moderate"], ["#84cc16", "Low"], ["#22c55e", "Very Low"]].map(
            ([color, label]) => (
              <div key={label} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: color }}></div>
                <span>{label}</span>
              </div>
            )
          )}
        </div>
      </div>

      {/* MAP + SVG OVERLAY */}
      <div className="relative w-full" style={{ height: "560px" }}>
        
        {/* LEAFLET MAP */}
        <MapContainer
          center={[18.5204, 73.8567]} // PUNE
          zoom={12}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
          className="absolute top-0 left-0"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* SVG PANE ABOVE MAP */}
          <Pane name="svg-pane" style={{ zIndex: 650 }}>
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 600 560"
              className="absolute top-0 left-0 pointer-events-none"
            >
              {/* STREET GRID */}
              {Array.from({ length: 12 }).map((_, i) => (
                <line
                  key={`h-${i}`}
                  x1="0"
                  y1={i * 50}
                  x2="600"
                  y2={i * 50}
                  stroke="#d1d5db"
                  opacity="0.3"
                />
              ))}

              {Array.from({ length: 12 }).map((_, i) => (
                <line
                  key={`v-${i}`}
                  x1={i * 50}
                  y1="0"
                  x2={i * 50}
                  y2="560"
                  stroke="#d1d5db"
                  opacity="0.3"
                />
              ))}

              {/* ORANGE ZONES */}
              {zones.map((zone) => {
                const avgEmission = zone.cells.reduce((s, c) => s + c.emission, 0) / zone.cells.length;
                const color = getEmissionColor(avgEmission);
                const label = getEmissionLabel(avgEmission);

                return (
                  <g
                    key={zone.id}
                    className="pointer-events-auto cursor-pointer"
                    onClick={() => onCellClick(zone.cells[0])}
                  >
                    <rect
                      x={zone.x}
                      y={zone.y}
                      width={zone.width}
                      height={zone.height}
                      fill={color}
                      opacity="0.7"
                      rx="8"
                    />

                    <text x={zone.x + zone.width / 2} y={zone.y + zone.height / 2 - 10} textAnchor="middle" fill="white" fontSize="14" fontWeight="600">
                      {zone.name}
                    </text>

                    <text x={zone.x + zone.width / 2} y={zone.y + zone.height / 2 + 10} textAnchor="middle" fill="white" fontSize="12">
                      {avgEmission.toFixed(1)} tons CO₂
                    </text>

                    <text x={zone.x + zone.width / 2} y={zone.y + zone.height / 2 + 28} textAnchor="middle" fill="white" fontSize="11">
                      {label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </Pane>
        </MapContainer>
      </div>

      {/* SELECTED CELL PANEL */}
      {selectedCell && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="text-md capitalize">{selectedCell.type} Zone</h4>
              <p className="text-sm text-gray-600">
                Current Emissions: {selectedCell.emission.toFixed(1)} tons CO₂/year
              </p>
            </div>

            <Badge style={{ backgroundColor: getEmissionColor(selectedCell.emission), color: "white" }}>
              {getEmissionLabel(selectedCell.emission)}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}
