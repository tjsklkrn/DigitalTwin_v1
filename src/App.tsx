import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { toast } from 'sonner@2.0.3';
import { MapVisualization } from './components/MapVisualization';
import { SimulationControls } from './components/SimulationControls';
import { KPIMetrics } from './components/KPIMetrics';
import { InterventionPanel } from './components/InterventionPanel';
import { Map, BarChart3, Settings } from 'lucide-react';

// Types
interface GridCell {
  id: string;
  x: number;
  y: number;
  emission: number;
  type: 'residential' | 'industrial' | 'commercial' | 'transport';
  interventions: Intervention[];
}

interface Intervention {
  id: string;
  type: 'capture_unit' | 'vertical_garden' | 'solar_panel';
  efficiency: number;
  name: string;
  icon: string;
}

interface InterventionType {
  id: string;
  name: string;
  type: 'capture_unit' | 'vertical_garden' | 'solar_panel';
  efficiency: number;
  cost: number;
  description: string;
  icon: string;
  suitableFor: string[];
}

interface SimulationParameters {
  green: number;
  building: number;
  water: number;
  vehicles: number;
  industrial: number;
  energy: number;
  congestion: number;
  publicTransport: number;
}

export default function App() {
  // State
  const [selectedCell, setSelectedCell] = useState<GridCell | null>(null);
  const [selectedIntervention, setSelectedIntervention] = useState<InterventionType | null>(null);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [currentScenario, setCurrentScenario] = useState('Default Scenario');
  const [showInterventions, setShowInterventions] = useState(true);

  // Simulation parameters - new factors
  const [parameters, setParameters] = useState<SimulationParameters>({
    green: 30,
    building: 60,
    water: 15,
    vehicles: 70,
    industrial: 50,
    energy: 65,
    congestion: 55,
    publicTransport: 40,
  });

  // Mock data
  const [gridData, setGridData] = useState<GridCell[]>(() => {
    const cells: GridCell[] = [];
    for (let i = 0; i < 144; i++) { // 12x12 grid
      const x = i % 12;
      const y = Math.floor(i / 12);
      const types: GridCell['type'][] = ['residential', 'industrial', 'commercial', 'transport'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      let baseEmission = 0;
      switch (type) {
        case 'industrial': baseEmission = Math.random() * 60 + 30; break;
        case 'commercial': baseEmission = Math.random() * 40 + 20; break;
        case 'transport': baseEmission = Math.random() * 35 + 15; break;
        case 'residential': baseEmission = Math.random() * 25 + 5; break;
      }

      cells.push({
        id: `${x}-${y}`,
        x,
        y,
        emission: baseEmission,
        type,
        interventions: []
      });
    }
    return cells;
  });

  const availableInterventions: InterventionType[] = [
    {
      id: 'capture_unit_1',
      name: 'Industrial CO₂ Capture Unit',
      type: 'capture_unit',
      efficiency: 35,
      cost: 50000,
      description: 'High-capacity capture system for industrial emissions',
      icon: '🏭',
      suitableFor: ['industrial', 'commercial']
    },
    {
      id: 'capture_unit_2',
      name: 'Compact Capture System',
      type: 'capture_unit',
      efficiency: 20,
      cost: 25000,
      description: 'Smaller capture unit for moderate emission sources',
      icon: '⚙️',
      suitableFor: ['commercial', 'transport']
    },
    {
      id: 'vertical_garden_1',
      name: 'Vertical Garden Wall',
      type: 'vertical_garden',
      efficiency: 15,
      cost: 8000,
      description: 'Living wall system that absorbs CO₂ naturally',
      icon: '🌿',
      suitableFor: ['residential', 'commercial']
    },
    {
      id: 'vertical_garden_2',
      name: 'Rooftop Garden System',
      type: 'vertical_garden',
      efficiency: 25,
      cost: 15000,
      description: 'Extensive rooftop vegetation for CO₂ absorption',
      icon: '🌱',
      suitableFor: ['residential', 'commercial', 'industrial']
    },
    {
      id: 'solar_panel_1',
      name: 'Solar Panel Array',
      type: 'solar_panel',
      efficiency: 12,
      cost: 12000,
      description: 'Reduces emissions by replacing grid electricity',
      icon: '☀️',
      suitableFor: ['residential', 'commercial', 'industrial']
    }
  ];

  const placedInterventions = gridData.flatMap(cell => 
    cell.interventions.map(intervention => ({
      id: `${cell.id}-${intervention.id}`,
      cellId: cell.id,
      interventionType: availableInterventions.find(a => a.id === intervention.id)!,
      efficiency: intervention.efficiency
    }))
  ).filter(p => p.interventionType);

  // Calculate KPIs
  const calculateKPIs = (data: GridCell[]) => {
    const baseEmissions = data.reduce((sum, cell) => sum + cell.emission, 0);
    const currentEmissions = data.reduce((sum, cell) => {
      let reduction = 0;
      cell.interventions.forEach(intervention => {
        reduction += cell.emission * (intervention.efficiency / 100);
      });
      return sum + (cell.emission - reduction);
    }, 0);

    const totalReduction = baseEmissions - currentEmissions;
    const reductionPercentage = (totalReduction / baseEmissions) * 100;
    const interventionCount = data.reduce((sum, cell) => sum + cell.interventions.length, 0);
    const totalCost = placedInterventions.reduce((sum, p) => sum + p.interventionType.cost, 0);
    const hotspotCount = data.filter(cell => {
      const currentEmission = cell.emission - cell.interventions.reduce((sum, i) => sum + cell.emission * (i.efficiency / 100), 0);
      return currentEmission > 30;
    }).length;
    const avgEfficiency = interventionCount > 0 ? 
      placedInterventions.reduce((sum, p) => sum + p.efficiency, 0) / interventionCount : 0;

    return {
      totalEmissions: currentEmissions,
      emissionReduction: reductionPercentage,
      interventionEfficiency: avgEfficiency,
      costEffectiveness: totalReduction > 0 ? totalCost / totalReduction : 0,
      projectedSavings: totalReduction,
      hotspotCount
    };
  };

  const baselineKPIs = {
    totalEmissions: gridData.reduce((sum, cell) => sum + cell.emission, 0),
    emissionReduction: 0,
    interventionEfficiency: 0,
    costEffectiveness: 0,
    projectedSavings: 0,
    hotspotCount: gridData.filter(cell => cell.emission > 30).length
  };

  const currentKPIs = calculateKPIs(gridData);

  // Mock historical and projection data
  const historicalData = [
    { year: 2020, emissions: baselineKPIs.totalEmissions * 0.95, interventions: 0 },
    { year: 2021, emissions: baselineKPIs.totalEmissions * 0.98, interventions: 2 },
    { year: 2022, emissions: baselineKPIs.totalEmissions * 1.02, interventions: 5 },
    { year: 2023, emissions: baselineKPIs.totalEmissions, interventions: 8 },
    { year: 2024, emissions: currentKPIs.totalEmissions, interventions: placedInterventions.length },
  ];

  const emissionsByType = [
    { type: 'Residential', baseline: 420, current: 350 },
    { type: 'Industrial', baseline: 680, current: 580 },
    { type: 'Commercial', baseline: 340, current: 310 },
    { type: 'Transport', baseline: 290, current: 275 }
  ];

  // Event handlers
  const handleCellClick = (cell: GridCell) => {
    setSelectedCell(cell);
  };

  const handleParameterChange = (key: keyof SimulationParameters, value: number) => {
    setParameters(prev => ({ ...prev, [key]: value }));
    // Update grid data in real-time based on factor changes
    updateGridDataFromParameters({ ...parameters, [key]: value });
  };

  // Update grid data based on current parameters
  const updateGridDataFromParameters = (params: SimulationParameters) => {
    setGridData(prev => prev.map(cell => {
      // Base emission for this cell type
      let baseEmission = 0;
      switch (cell.type) {
        case 'industrial': baseEmission = Math.random() * 60 + 30; break;
        case 'commercial': baseEmission = Math.random() * 40 + 20; break;
        case 'transport': baseEmission = Math.random() * 35 + 15; break;
        case 'residential': baseEmission = Math.random() * 25 + 5; break;
      }

      // Apply factor modifiers
      let emission = baseEmission;
      
      // Green areas reduce emissions
      emission *= (1 - params.green / 200);
      
      // Building density increases emissions
      emission *= (0.5 + params.building / 100);
      
      // Water bodies reduce emissions slightly
      emission *= (1 - params.water / 300);
      
      // Vehicles increase emissions
      emission *= (0.4 + params.vehicles / 100);
      
      // Industrial activity affects industrial zones more
      if (cell.type === 'industrial') {
        emission *= (0.5 + params.industrial / 80);
      } else {
        emission *= (0.7 + params.industrial / 200);
      }
      
      // Energy consumption increases emissions
      emission *= (0.5 + params.energy / 100);
      
      // Congestion increases transport emissions
      if (cell.type === 'transport') {
        emission *= (0.6 + params.congestion / 100);
      } else {
        emission *= (0.8 + params.congestion / 200);
      }
      
      // Public transport reduces emissions
      emission *= (1.2 - params.publicTransport / 150);

      return {
        ...cell,
        emission: Math.max(0, emission)
      };
    }));
  };

  const handleRunSimulation = () => {
    setIsSimulationRunning(true);
    toast.success('Applying factors...');
    
    setTimeout(() => {
      updateGridDataFromParameters(parameters);
      setIsSimulationRunning(false);
      toast.success('Factors applied successfully!');
    }, 1000);
  };

  const handlePlaceIntervention = (interventionId: string, cellId: string) => {
    const interventionType = availableInterventions.find(a => a.id === interventionId);
    if (!interventionType) return;

    const newIntervention: Intervention = {
      id: interventionId,
      type: interventionType.type,
      efficiency: interventionType.efficiency,
      name: interventionType.name,
      icon: interventionType.icon
    };

    setGridData(prev => prev.map(cell => 
      cell.id === cellId 
        ? { ...cell, interventions: [...cell.interventions, newIntervention] }
        : cell
    ));

    toast.success(`${interventionType.name} placed successfully!`);
  };

  const handleRemoveIntervention = (interventionId: string) => {
    const [cellId] = interventionId.split('-');
    
    setGridData(prev => prev.map(cell => 
      cell.id === cellId 
        ? { ...cell, interventions: cell.interventions.filter((_, idx) => `${cellId}-${idx}` !== interventionId) }
        : cell
    ));

    toast.success('Intervention removed');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl">CO₂ Capture Digital Twin</h1>
              <p className="text-gray-600 mt-1">
                Simulate, visualize, and plan carbon capture strategies for urban neighborhoods
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">{currentScenario}</Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowInterventions(!showInterventions)}
              >
                {showInterventions ? 'Hide' : 'Show'} Interventions
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="map">
              <Map className="w-4 h-4 mr-2" />
              Interactive Map
            </TabsTrigger>
            <TabsTrigger value="simulation">
              <Settings className="w-4 h-4 mr-2" />
              Simulation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <KPIMetrics
              currentKPI={currentKPIs}
              baselineKPI={baselineKPIs}
              historicalData={historicalData}
              emissionsByType={emissionsByType}
            />
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <MapVisualization
                  gridData={gridData}
                  onCellClick={handleCellClick}
                  selectedCell={selectedCell}
                  showInterventions={showInterventions}
                />
              </div>
              <div>
                <InterventionPanel
                  availableInterventions={availableInterventions}
                  placedInterventions={placedInterventions}
                  selectedCellId={selectedCell?.id || null}
                  selectedCellType={selectedCell?.type || null}
                  onPlaceIntervention={handlePlaceIntervention}
                  onRemoveIntervention={handleRemoveIntervention}
                  onSelectIntervention={setSelectedIntervention}
                  selectedIntervention={selectedIntervention}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="simulation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <SimulationControls
                parameters={parameters}
                onParameterChange={handleParameterChange}
                onRunSimulation={handleRunSimulation}
                onResetSimulation={() => {
                  const defaultParams = {
                    green: 30,
                    building: 60,
                    water: 15,
                    vehicles: 70,
                    industrial: 50,
                    energy: 65,
                    congestion: 55,
                    publicTransport: 40,
                  };
                  setParameters(defaultParams);
                  updateGridDataFromParameters(defaultParams);
                  toast.success('Parameters reset to default');
                }}
                onSaveScenario={() => {
                  toast.success('Scenario saved as "Custom Scenario"');
                  setCurrentScenario('Custom Scenario');
                }}
                isRunning={isSimulationRunning}
                currentScenario={currentScenario}
              />
              <div className="lg:col-span-2">
                <MapVisualization
                  gridData={gridData}
                  onCellClick={handleCellClick}
                  selectedCell={selectedCell}
                  showInterventions={showInterventions}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
