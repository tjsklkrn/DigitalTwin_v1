import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Plus, Trash2, Info } from 'lucide-react';

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

interface PlacedIntervention {
  id: string;
  cellId: string;
  interventionType: InterventionType;
  efficiency: number;
}

interface InterventionPanelProps {
  availableInterventions: InterventionType[];
  placedInterventions: PlacedIntervention[];
  selectedCellId: string | null;
  selectedCellType: string | null;
  onPlaceIntervention: (interventionId: string, cellId: string) => void;
  onRemoveIntervention: (interventionId: string) => void;
  onSelectIntervention: (intervention: InterventionType | null) => void;
  selectedIntervention: InterventionType | null;
}

export function InterventionPanel({
  availableInterventions,
  placedInterventions,
  selectedCellId,
  selectedCellType,
  onPlaceIntervention,
  onRemoveIntervention,
  onSelectIntervention,
  selectedIntervention
}: InterventionPanelProps) {

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 30) return 'text-green-600';
    if (efficiency >= 20) return 'text-blue-600';
    if (efficiency >= 10) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const canPlaceIntervention = (intervention: InterventionType) => {
    return selectedCellId && selectedCellType && 
           intervention.suitableFor.includes(selectedCellType);
  };

  const getCellInterventions = (cellId: string) => {
    return placedInterventions.filter(p => p.cellId === cellId);
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg mb-4">CO₂ Capture Interventions</h3>
      
      <Tabs defaultValue="place" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="place">Place Interventions</TabsTrigger>
          <TabsTrigger value="manage">Manage ({placedInterventions.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="place" className="space-y-4">
          {selectedCellId ? (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-800">
                Selected: Grid {selectedCellId} ({selectedCellType})
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {getCellInterventions(selectedCellId).length} intervention(s) already placed
              </div>
            </div>
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
              Select a cell on the map to place interventions
            </div>
          )}
          
          <div className="space-y-3">
            {availableInterventions.map((intervention) => (
              <div 
                key={intervention.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedIntervention?.id === intervention.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onSelectIntervention(
                  selectedIntervention?.id === intervention.id ? null : intervention
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{intervention.icon}</span>
                    <div>
                      <div className="text-sm">{intervention.name}</div>
                      <div className="text-xs text-gray-600">{intervention.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm ${getEfficiencyColor(intervention.efficiency)}`}>
                      -{intervention.efficiency}%
                    </div>
                    <div className="text-xs text-gray-500">
                      ${intervention.cost}/unit
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex flex-wrap gap-1">
                    {intervention.suitableFor.map((type) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (selectedCellId && canPlaceIntervention(intervention)) {
                        onPlaceIntervention(intervention.id, selectedCellId);
                      }
                    }}
                    disabled={!canPlaceIntervention(intervention)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Place
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {selectedIntervention && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Intervention Details</span>
              </div>
              <div className="text-sm space-y-1">
                <p><span>Name:</span> {selectedIntervention.name}</p>
                <p><span>Efficiency:</span> -{selectedIntervention.efficiency}% CO₂ reduction</p>
                <p><span>Cost:</span> ${selectedIntervention.cost} per unit</p>
                <p><span>Suitable for:</span> {selectedIntervention.suitableFor.join(', ')}</p>
                <p className="text-gray-600">{selectedIntervention.description}</p>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="manage" className="space-y-4">
          {placedInterventions.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No interventions placed yet. Switch to the "Place Interventions" tab to add some.
            </div>
          ) : (
            <div className="space-y-3">
              {placedInterventions.map((placed) => (
                <div key={placed.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{placed.interventionType.icon}</span>
                      <div>
                        <div className="text-sm">{placed.interventionType.name}</div>
                        <div className="text-xs text-gray-600">
                          Grid {placed.cellId} • -{placed.efficiency}% reduction
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onRemoveIntervention(placed.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <Separator />
              
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-sm text-green-800">Total Impact</div>
                <div className="text-xs text-green-600 mt-1">
                  {placedInterventions.length} interventions deployed
                  <br />
                  Average efficiency: {(
                    placedInterventions.reduce((sum, p) => sum + p.efficiency, 0) / 
                    placedInterventions.length
                  ).toFixed(1)}% CO₂ reduction
                  <br />
                  Total cost: ${placedInterventions.reduce((sum, p) => sum + p.interventionType.cost, 0)}
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}