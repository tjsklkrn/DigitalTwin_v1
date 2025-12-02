// import React from "react";
// import { MapContainer, TileLayer, Pane } from "react-leaflet";
// import { Badge } from "./ui/badge";

// interface GridCell {
//   id: string;
//   x: number;
//   y: number;
//   emission: number;
//   type: "residential" | "industrial" | "commercial" | "transport";
//   interventions: Intervention[];
// }

// interface Intervention {
//   id: string;
//   type: "capture_unit" | "vertical_garden" | "solar_panel";
//   efficiency: number;
//   name: string;
//   icon: string;
// }

// interface MapVisualizationProps {
//   gridData: GridCell[];
//   onCellClick: (cell: GridCell) => void;
//   selectedCell: GridCell | null;
//   showInterventions: boolean;
// }

// export function MapVisualization({
//   gridData,
//   onCellClick,
//   selectedCell,
//   showInterventions,
// }: MapVisualizationProps) {
//   const GRID_COLUMNS = 12;
//   const GRID_ROWS = 12;
//   const GRID_CELL_SIZE = 50;

//   // -----------------------------
//   // COLOR HELPERS
//   // -----------------------------
//   const getGridColor = (emission: number) => {
//     if (emission >= 45) return "#dc2626"; // high
//     if (emission >= 25) return "#facc15"; // medium
//     return "#22c55e"; // low / good
//   };

//   const getEmissionColor = (e: number) => {
//     if (e > 50) return "#dc2626";
//     if (e > 30) return "#ea580c";
//     if (e > 15) return "#facc15";
//     if (e > 5) return "#84cc16";
//     return "#22c55e";
//   };

//   const getEmissionLabel = (e: number) => {
//     if (e > 50) return "Very High";
//     if (e > 30) return "High";
//     if (e > 15) return "Moderate";
//     if (e > 5) return "Low";
//     return "Very Low";
//   };

//   // -----------------------------
//   // 1) FALLBACK GRID if gridData is empty
//   // -----------------------------
//   const fallbackGrid: GridCell[] = React.useMemo(() => {
//     const total = GRID_COLUMNS * GRID_ROWS;
//     return Array.from({ length: total }, (_, index) => {
//       const col = index % GRID_COLUMNS;
//       const row = Math.floor(index / GRID_COLUMNS);
//       const base = 10 + (row * 3 + col * 2); // just to vary values

//       return {
//         id: `cell-${index}`,
//         x: col,
//         y: row,
//         emission: base, // 10–80-ish
//         type: (["residential", "industrial", "commercial", "transport"][
//           (row + col) % 4
//         ] ?? "residential") as GridCell["type"],
//         interventions: [],
//       };
//     });
//   }, []);

//   const effectiveGrid: GridCell[] =
//     gridData && gridData.length >= GRID_COLUMNS
//       ? gridData
//       : fallbackGrid;

//   // Convert whatever grid we use → SVG positions
//   const gridCells = effectiveGrid.map((cell, index) => ({
//     ...cell,
//     svgX: (index % GRID_COLUMNS) * GRID_CELL_SIZE,
//     svgY: Math.floor(index / GRID_COLUMNS) * GRID_CELL_SIZE,
//   }));

//   // Fake zones built from effective grid
//   const zones = [
//     { id: "zone-1", name: "Downtown", cells: effectiveGrid.slice(0, 24), x: 10, y: 10, width: 280, height: 180 },
//     { id: "zone-2", name: "Industrial Park", cells: effectiveGrid.slice(24, 42), x: 310, y: 30, width: 240, height: 150 },
//     { id: "zone-3", name: "Residential North", cells: effectiveGrid.slice(42, 66), x: 20, y: 210, width: 260, height: 160 },
//     { id: "zone-4", name: "Commercial District", cells: effectiveGrid.slice(66, 90), x: 300, y: 200, width: 250, height: 170 },
//     { id: "zone-5", name: "Residential South", cells: effectiveGrid.slice(90, 114), x: 50, y: 390, width: 230, height: 140 },
//     { id: "zone-6", name: "Transport Hub", cells: effectiveGrid.slice(114, 144), x: 310, y: 390, width: 240, height: 140 },
//   ];

//   // Helpful debug: see what the component actually receives
//   console.log("MapVisualization → gridData:", gridData.length, gridData);
//   console.log("MapVisualization → effectiveGrid:", effectiveGrid.length);

//   return (
//     <div className="bg-white p-6 rounded-lg border">
//       {/* TITLE + LEGEND */}
//       <div className="flex justify-between items-center mb-4">
//         <h3 className="text-lg">Neighborhood CO₂ Emissions Map</h3>

//         <div className="flex items-center gap-3 text-xs">
//           {[
//             ["#dc2626", "High (>45)"],
//             ["#facc15", "Medium (25–45)"],
//             ["#22c55e", "Low (<25)"],
//           ].map(([color, label]) => (
//             <div key={label} className="flex items-center gap-1">
//               <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
//               <span>{label}</span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* MAP + SVG OVERLAY */}
//       <div className="relative w-full" style={{ height: 560 }}>
//         <MapContainer
//           center={[18.5204, 73.8567]} // Pune
//           zoom={12}
//           scrollWheelZoom={true}
//           style={{ height: "100%", width: "100%" }}
//           className="absolute top-0 left-0"
//         >
//           <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

//           {/* CUSTOM SVG OVERLAY PANE */}
//           <Pane
//             name="custom-svg-pane"
//             style={{
//               zIndex: 1000,
//               pointerEvents: "none", // pane itself doesn't eat events
//             }}
//             className="custom-svg-pane"
//           >
//             <svg
//               width="100%"
//               height="100%"
//               viewBox="0 0 600 560"
//               className="absolute top-0 left-0"
//               style={{ pointerEvents: "none" }} // root svg doesn't eat events
//             >
//               {/* GRID LINES (make them stronger so you SEE them) */}
//               {Array.from({ length: GRID_ROWS + 1 }).map((_, i) => (
//                 <line
//                   key={`h-${i}`}
//                   x1="0"
//                   y1={i * GRID_CELL_SIZE}
//                   x2={GRID_COLUMNS * GRID_CELL_SIZE}
//                   y2={i * GRID_CELL_SIZE}
//                   stroke="#4b5563"
//                   strokeWidth={0.7}
//                   opacity={0.5}
//                 />
//               ))}
//               {Array.from({ length: GRID_COLUMNS + 1 }).map((_, i) => (
//                 <line
//                   key={`v-${i}`}
//                   x1={i * GRID_CELL_SIZE}
//                   y1="0"
//                   x2={i * GRID_CELL_SIZE}
//                   y2={GRID_ROWS * GRID_CELL_SIZE}
//                   stroke="#4b5563"
//                   strokeWidth={0.7}
//                   opacity={0.5}
//                 />
//               ))}

//               {/* EMISSION GRID RECTANGLES */}
//               {gridCells.map((cell) => (
//                 <rect
//                   key={cell.id}
//                   x={cell.svgX}
//                   y={cell.svgY}
//                   width={GRID_CELL_SIZE}
//                   height={GRID_CELL_SIZE}
//                   fill={getGridColor(cell.emission)}
//                   opacity={selectedCell?.id === cell.id ? 0.9 : 0.6}
//                   stroke="#111827"
//                   strokeWidth={selectedCell?.id === cell.id ? 2 : 0.5}
//                   style={{ pointerEvents: "auto", cursor: "pointer" }}
//                   onClick={() => onCellClick(cell)}
//                 />
//               ))}

//               {/* INTERVENTIONS ICONS */}
//               {showInterventions &&
//                 gridCells.flatMap((cell) =>
//                   cell.interventions.map((it, i) => (
//                     <g
//                       key={`${cell.id}-int-${i}`}
//                       style={{ pointerEvents: "none" }} // icons shouldn't block clicks
//                     >
//                       <rect
//                         x={cell.svgX + 10}
//                         y={cell.svgY + 10}
//                         width={30}
//                         height={30}
//                         rx={6}
//                         fill="white"
//                         opacity={0.9}
//                         stroke="#3b82f6"
//                         strokeWidth={1.5}
//                       />
//                       <text
//                         x={cell.svgX + 25}
//                         y={cell.svgY + 28}
//                         textAnchor="middle"
//                         fontSize={16}
//                       >
//                         {it.icon}
//                       </text>
//                     </g>
//                   ))
//                 )}

//               {/* ZONES */}
//               {zones.map((zone) => {
//                 if (!zone.cells.length) return null;
//                 const avg =
//                   zone.cells.reduce((s, c) => s + c.emission, 0) /
//                   zone.cells.length;

//                 return (
//                   <g
//                     key={zone.id}
//                     onClick={() => onCellClick(zone.cells[0])}
//                     style={{ pointerEvents: "auto", cursor: "pointer" }}
//                   >
//                     <rect
//                       x={zone.x}
//                       y={zone.y}
//                       width={zone.width}
//                       height={zone.height}
//                       fill={getEmissionColor(avg)}
//                       opacity={0.35}
//                       rx={8}
//                     />
//                     <text
//                       x={zone.x + zone.width / 2}
//                       y={zone.y + zone.height / 2 - 10}
//                       textAnchor="middle"
//                       fill="white"
//                       fontSize={14}
//                       fontWeight={600}
//                     >
//                       {zone.name}
//                     </text>
//                     <text
//                       x={zone.x + zone.width / 2}
//                       y={zone.y + zone.height / 2 + 10}
//                       textAnchor="middle"
//                       fill="white"
//                       fontSize={12}
//                     >
//                       {avg.toFixed(1)} tons CO₂
//                     </text>
//                     <text
//                       x={zone.x + zone.width / 2}
//                       y={zone.y + zone.height / 2 + 26}
//                       textAnchor="middle"
//                       fill="white"
//                       fontSize={11}
//                     >
//                       {getEmissionLabel(avg)}
//                     </text>
//                   </g>
//                 );
//               })}
//             </svg>
//           </Pane>
//         </MapContainer>
//       </div>

//       {/* SELECTED CELL PANEL */}
//       {selectedCell && (
//         <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
//           <div className="flex justify-between items-start mb-2">
//             <div>
//               <h4 className="text-md capitalize">{selectedCell.type} Zone</h4>
//               <p className="text-sm text-gray-600">
//                 Current Emissions: {selectedCell.emission.toFixed(1)} tons CO₂/year
//               </p>
//             </div>

//             <Badge
//               style={{
//                 backgroundColor: getEmissionColor(selectedCell.emission),
//                 color: "white",
//               }}
//             >
//               {getEmissionLabel(selectedCell.emission)}
//             </Badge>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

//--------------------------------
//--------------------------------
//CORRECT WORKING VERSION WITH GRIDS
// import React, { useEffect, useState } from "react";
// import { MapContainer, TileLayer, useMap } from "react-leaflet";

// // ------------------------------
// // TYPES
// // ------------------------------
// interface GridCell {
//   id: string;
//   emission: number;
// }

// interface MapVisualizationProps {
//   gridData: GridCell[];
//   selectedCell: GridCell | null;
//   onCellClick: (cell: GridCell) => void;
// }

// // ------------------------------
// // SVG OVERLAY COMPONENT
// // ------------------------------
// function SvgOverlay({ gridData, onCellClick, selectedCell }: MapVisualizationProps) {
//   const map = useMap();
//   const [size, setSize] = useState({ w: 0, h: 0 });

//   // Update SVG size when map container resizes or zoom changes
//   useEffect(() => {
//     const updateSize = () => {
//       const container = map.getContainer();
//       setSize({
//         w: container.clientWidth,
//         h: container.clientHeight,
//       });
//     };

//     updateSize();
//     map.on("resize", updateSize);
//     map.on("zoom", updateSize);
//     map.on("move", updateSize);

//     return () => {
//       map.off("resize", updateSize);
//       map.off("zoom", updateSize);
//       map.off("move", updateSize);
//     };
//   }, [map]);

//   const COLS = 12;
//   const ROWS = Math.ceil(gridData.length / COLS);

//   const CELL_W = size.w / COLS;
//   const CELL_H = size.h / ROWS;

//   return (
//     <svg
//       width={size.w}
//       height={size.h}
//       style={{
//         position: "absolute",
//         top: 0,
//         left: 0,
//         pointerEvents: "auto",
//         zIndex: 500,
//       }}
//     >
//       {/* GRID CELLS */}
//       {gridData.map((cell, i) => {
//         const col = i % COLS;
//         const row = Math.floor(i / COLS);

//         const isSelected = selectedCell?.id === cell.id;

//         return (
//           <rect
//             key={cell.id}
//             x={col * CELL_W}
//             y={row * CELL_H}
//             width={CELL_W}
//             height={CELL_H}
//             fill={isSelected ? "rgba(0,150,255,0.3)" : "rgba(0,0,0,0.05)"}
//             stroke="rgba(0,0,0,0.3)"
//             strokeWidth={isSelected ? 2 : 1}
//             onClick={() => onCellClick(cell)}
//             style={{ cursor: "pointer" }}
//           />
//         );
//       })}

//       {/* OPTIONAL TEXT (cell number) */}
//       {gridData.map((cell, i) => {
//         const col = i % COLS;
//         const row = Math.floor(i / COLS);

//         return (
//           <text
//             key={`txt-${cell.id}`}
//             x={col * CELL_W + CELL_W / 2}
//             y={row * CELL_H + CELL_H / 2}
//             textAnchor="middle"
//             fill="black"
//             fontSize={12}
//             pointerEvents="none"
//           >
//             {i + 1}
//           </text>
//         );
//       })}
//     </svg>
//   );
// }

// // ------------------------------
// // MAIN MAP VISUALIZATION
// // ------------------------------
// export function MapVisualization(props: MapVisualizationProps) {
//   return (
//     <div className="relative" style={{ height: 560 }}>
//       <MapContainer
//         center={[18.52, 73.85]}
//         zoom={12}
//         scrollWheelZoom
//         style={{ height: "100%", width: "100%" }}
//       >
//         <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

//         {/* Interactive SVG Grid */}
//         <SvgOverlay
//           gridData={props.gridData}
//           selectedCell={props.selectedCell}
//           onCellClick={props.onCellClick}
//         />
//       </MapContainer>
//     </div>
//   );
// }

//--------------------------------
//--------------------------------

import React from "react";
import { MapContainer, TileLayer, Rectangle, useMap } from "react-leaflet";
import L from "leaflet";

interface GridCell {
  id: string;
  emission: number;
}

interface MapVisualizationProps {
  gridData: GridCell[];
  selectedCell: GridCell | null;
  onCellClick: (cell: GridCell) => void;
}

const COLS = 12;
const ROWS = 12;

// ----------------------------------------------
// 🔵 Convert grid cell index → geographic bounds
// ----------------------------------------------
function getCellLatLngBounds(map: L.Map, col: number, row: number) {
  const mapBounds = map.getBounds();

  const north = mapBounds.getNorth();
  const south = mapBounds.getSouth();
  const west = mapBounds.getWest();
  const east = mapBounds.getEast();

  const latStep = (north - south) / ROWS;
  const lngStep = (east - west) / COLS;

  const cellNorth = north - row * latStep;
  const cellSouth = north - (row + 1) * latStep;
  const cellWest = west + col * lngStep;
  const cellEast = west + (col + 1) * lngStep;

  return [
    [cellSouth, cellWest],
    [cellNorth, cellEast],
  ] as L.LatLngBoundsExpression;
}

// ----------------------------------------------
// 🔵 Dynamic Grid Overlay Component
// ----------------------------------------------
function DynamicGridOverlay({ gridData, onCellClick, selectedCell }: MapVisualizationProps) {
  const map = useMap();
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  // Re-render on zoom or move
  React.useEffect(() => {
    map.on("zoomend", forceUpdate);
    map.on("moveend", forceUpdate);
    return () => {
      map.off("zoomend", forceUpdate);
      map.off("moveend", forceUpdate);
    };
  }, [map]);

  return (
    <>
      {gridData.map((cell, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);

        const bounds = getCellLatLngBounds(map, col, row);
        const isSelected = selectedCell?.id === cell.id;

        return (
          <Rectangle
            key={cell.id}
            bounds={bounds}
            pathOptions={{
              color: isSelected ? "#00A8FF" : "#000000",
              weight: isSelected ? 10 : 0.5,
              fillColor: "rgba(0,0,0,0.05)",
              fillOpacity: isSelected ? 1 : 0.12,
            }}
            eventHandlers={{
              click: () => onCellClick(cell),
            }}
          />
        );
      })}
    </>
  );
}

// ----------------------------------------------
// 🔵 Main Map Visualization Component
// ----------------------------------------------
export function MapVisualization({ gridData, selectedCell, onCellClick }: MapVisualizationProps) {
  return (
    <div className="relative" style={{ height: 560 }}>
      <MapContainer
        center={[18.52, 73.85]}
        zoom={12}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Fully dynamic grid overlay */}
        <DynamicGridOverlay
          gridData={gridData}
          selectedCell={selectedCell}
          onCellClick={onCellClick}
        />
      </MapContainer>
    </div>
  );
}
