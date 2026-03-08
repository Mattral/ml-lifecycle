import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Settings, CheckCircle, Plus, BarChart3, Star } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMLPipeline } from './MLPipelineContext';
import EmptyState from './EmptyState';

interface FeatureEngineeringModuleProps {
  onComplete: () => void;
}

const FeatureEngineeringModule: React.FC<FeatureEngineeringModuleProps> = ({ onComplete }) => {
  const { state, setTarget, addTransformation } = useMLPipeline();
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [transformations, setTransformations] = useState<{[key: string]: string}>({});
  const [engineeringComplete, setEngineeringComplete] = useState(false);
  const [previewColumn, setPreviewColumn] = useState<string>('');

  if (!state.dataset) {
    return (
      <EmptyState
        icon={Database}
        title="No Dataset Loaded"
        description="Load and clean your dataset first. Then you'll select a target variable and engineer features to improve model performance."
        actionLabel="Go to Data Ingestion"
        onAction={() => window.dispatchEvent(new CustomEvent('pipeline:navigate', { detail: 0 }))}
      />
    );
  }

  const workingData = state.cleanedData || state.dataset.data;
  const columns = state.dataset.columns;

  const detectTargetType = (column: string) => {
    const values = workingData.map(row => row[column]).filter(v => v != null);
    const uniqueValues = [...new Set(values)];
    
    if (uniqueValues.length <= 10 && uniqueValues.length > 1) {
      return 'classification';
    } else if (values.every(v => !isNaN(parseFloat(v)))) {
      return 'regression';
    }
    return 'unknown';
  };

  const getColumnType = (column: string) => {
    const values = workingData.map(row => row[column]).filter(v => v != null);
    return values.every(v => !isNaN(parseFloat(v))) ? 'numerical' : 'categorical';
  };

  const needsEncoding = (column: string) => {
    const columnType = getColumnType(column);
    const transformation = transformations[column] || 'none';
    return columnType === 'categorical' && transformation === 'none';
  };

  const availableTransformations = {
    numerical: ['none', 'log-transform', 'min-max-scale', 'z-score', 'binning'],
    categorical: ['none', 'one-hot-encode', 'label-encode']
  };

  const generateHistogramData = (column: string, transformation: string = 'none') => {
    const values = workingData.map(row => parseFloat(row[column])).filter(v => !isNaN(v));
    
    let transformedValues = values;
    
    switch (transformation) {
      case 'log-transform':
        transformedValues = values.map(v => Math.log(v + 1));
        break;
      case 'min-max-scale': {
        const min = Math.min(...values);
        const max = Math.max(...values);
        transformedValues = values.map(v => (v - min) / (max - min));
        break;
      }
      case 'z-score': {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
        transformedValues = values.map(v => (v - mean) / std);
        break;
      }
      case 'binning': {
        const binMin = Math.min(...values);
        const binSize = (Math.max(...values) - binMin) / 5;
        transformedValues = values.map(v => Math.floor((v - binMin) / binSize));
        break;
      }
    }

    const bins = 10;
    const minVal = Math.min(...transformedValues);
    const maxVal = Math.max(...transformedValues);
    const binWidth = (maxVal - minVal) / bins;
    
    const histogram = Array(bins).fill(0) as number[];
    transformedValues.forEach(value => {
      const binIndex = Math.min(Math.floor((value - minVal) / binWidth), bins - 1);
      histogram[binIndex]++;
    });
    
    return histogram.map((count, i) => ({
      range: `${(minVal + i * binWidth).toFixed(2)}`,
      count
    }));
  };

  const applyTransformations = () => {
    if (selectedTarget) {
      setTarget(selectedTarget);
    }

    Object.entries(transformations).forEach(([column, transformation]) => {
      if (transformation !== 'none') {
        addTransformation({ type: 'transformation', column, transformation, timestamp: new Date() });
      }
    });

    setEngineeringComplete(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Feature Engineering
          </CardTitle>
          <CardDescription>
            Select target variable and transform features for machine learning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="target" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="target">Target Selection</TabsTrigger>
              <TabsTrigger value="transformations">Transformations</TabsTrigger>
              <TabsTrigger value="preview">Histogram Preview</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="target" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Target Variable Selection</h3>
                  <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target variable..." />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map(col => (
                        <SelectItem key={col} value={col}>
                          <div className="flex items-center justify-between w-full">
                            <span>{col}</span>
                            <Badge variant="outline" className="ml-2">
                              {detectTargetType(col)}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTarget && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Target Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Variable:</span>
                          <span className="font-medium">{selectedTarget}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Task Type:</span>
                          <Badge variant={detectTargetType(selectedTarget) === 'classification' ? 'default' : 'secondary'}>
                            {detectTargetType(selectedTarget)}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Unique Values:</span>
                          <span>{[...new Set(workingData.map(row => row[selectedTarget]))].length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="transformations" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold">Feature Transformations</h3>
                <div className="flex items-center gap-1 text-sm text-warning">
                  <Star className="w-4 h-4" />
                  <span>Categorical features need encoding</span>
                </div>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {columns.filter(col => col !== selectedTarget).map(column => {
                  const columnType = getColumnType(column);
                  const requiresEncoding = needsEncoding(column);
                  return (
                    <Card key={column} className={`p-3 ${requiresEncoding ? 'border-warning/30 bg-warning/10' : ''}`}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{column}</span>
                          {requiresEncoding && <Star className="w-4 h-4 text-warning" />}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={columnType === 'numerical' ? 'default' : 'secondary'}>
                            {columnType}
                          </Badge>
                          {columnType === 'numerical' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPreviewColumn(column)}
                              className="text-xs"
                            >
                              Preview
                            </Button>
                          )}
                        </div>
                      </div>
                      <Select 
                        value={transformations[column] || 'none'} 
                        onValueChange={(value) => 
                          setTransformations(prev => ({ ...prev, [column]: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTransformations[columnType as keyof typeof availableTransformations].map(transform => (
                            <SelectItem key={transform} value={transform}>
                              {transform.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {requiresEncoding && (
                        <p className="text-xs text-warning mt-1">
                          * This categorical feature needs encoding for ML algorithms
                        </p>
                      )}
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Transformation Preview</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select a numerical column to see histogram comparison before and after transformation
                </p>
                
                <Select value={previewColumn} onValueChange={setPreviewColumn}>
                  <SelectTrigger className="mb-4">
                    <SelectValue placeholder="Select column for histogram preview..." />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.filter(col => getColumnType(col) === 'numerical' && col !== selectedTarget).map(col => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {previewColumn && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          Before Transformation
                        </CardTitle>
                        <CardDescription>{previewColumn} - Original Distribution</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                          <RechartsBarChart data={generateHistogramData(previewColumn)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="range" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="hsl(var(--primary))" />
                          </RechartsBarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          After Transformation
                        </CardTitle>
                        <CardDescription>
                          {previewColumn} - {transformations[previewColumn] || 'No transformation'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {transformations[previewColumn] && transformations[previewColumn] !== 'none' ? (
                          <ResponsiveContainer width="100%" height={200}>
                            <RechartsBarChart data={generateHistogramData(previewColumn, transformations[previewColumn])}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="range" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="count" fill="hsl(var(--success))" />
                            </RechartsBarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-48 bg-gradient-to-r from-muted to-muted/50 rounded flex items-center justify-center">
                            <div className="text-center">
                              <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">No transformation selected</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {previewColumn && transformations[previewColumn] && transformations[previewColumn] !== 'none' && (
                  <Card className="mt-4">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Transformation Impact</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <p>
                        {transformations[previewColumn] === 'log-transform' && 
                          "Log transformation reduces right skewness and makes the distribution more normal."}
                        {transformations[previewColumn] === 'min-max-scale' && 
                          "Min-max scaling transforms values to a 0-1 range, preserving the original distribution shape."}
                        {transformations[previewColumn] === 'z-score' && 
                          "Z-score standardization centers the data around 0 with unit variance."}
                        {transformations[previewColumn] === 'binning' && 
                          "Binning converts continuous values into discrete categories."}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="summary" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Transformation Summary</CardTitle>
                  <CardDescription>
                    Preview of how your features will be transformed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-3">Features (X)</h4>
                      <div className="space-y-2">
                        {columns.filter(col => col !== selectedTarget).map(col => (
                          <div key={col} className="flex justify-between items-center p-2 bg-primary/10 rounded">
                            <span className="text-sm">{col}</span>
                            <Badge variant="outline" className="text-xs">
                              {transformations[col] || 'none'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Target (y)</h4>
                      {selectedTarget ? (
                        <div className="p-3 bg-success/10 rounded border border-success/30">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-success">{selectedTarget}</span>
                            <Badge variant="outline">
                              {detectTargetType(selectedTarget)}
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-muted rounded border border-border text-center">
                          <span className="text-muted-foreground">No target variable selected</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {state.transformations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Applied Transformations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {state.transformations.map((transformation, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-primary/10 rounded border border-primary/20">
                          <div>
                            <span className="font-medium text-primary">{transformation.transformation}</span>
                            <p className="text-sm text-muted-foreground">Applied to {transformation.column}</p>
                          </div>
                          <CheckCircle className="w-5 h-5 text-primary" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Features: {columns.filter(col => col !== selectedTarget).length} | 
                  Target: {selectedTarget || 'Not selected'}
                </div>
                <Button 
                  onClick={applyTransformations} 
                  disabled={!selectedTarget || engineeringComplete}
                >
                  {engineeringComplete ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Engineering Complete
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Apply Transformations
                    </>
                  )}
                </Button>
              </div>

              {engineeringComplete && (
                <div className="flex justify-end">
                  <Button onClick={onComplete}>
                    Continue to Model Training
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeatureEngineeringModule;
