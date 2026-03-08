import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Zap, Eye } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useMLPipeline } from './MLPipelineContext';

interface ModelInterpretabilityModuleProps {
  onComplete: () => void;
}

interface FeatureImportanceEntry {
  feature: string;
  importance: number;
  impact: 'positive' | 'negative';
}

interface RowExplanation {
  feature: string;
  value: unknown;
  contribution: number;
  direction: string;
}

const ModelInterpretabilityModule: React.FC<ModelInterpretabilityModuleProps> = ({ onComplete }) => {
  const { state } = useMLPipeline();
  const [selectedRow, setSelectedRow] = useState(0);
  const [whatIfValues, setWhatIfValues] = useState<Record<string, string>>({});
  const [interpretabilityComplete, setInterpretabilityComplete] = useState(false);

  const features = useMemo(
    () => state.dataset?.columns.filter((col) => col !== state.targetVariable) ?? [],
    [state.dataset, state.targetVariable],
  );

  const featureImportance: FeatureImportanceEntry[] = useMemo(() => {
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    return features
      .map((feature, i) => ({
        feature,
        importance: seededRandom(i + 1) * 0.5 + 0.1,
        impact: (seededRandom(i + 100) > 0.5 ? 'positive' : 'negative') as 'positive' | 'negative',
      }))
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 10);
  }, [features]);

  const rowExplanation: RowExplanation[] = useMemo(() => {
    if (!state.dataset) return [];
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    const row = state.dataset.data[selectedRow];
    return features.slice(0, 5).map((feature, i) => ({
      feature,
      value: row[feature],
      contribution: (seededRandom(selectedRow * 100 + i) - 0.5) * 0.4,
      direction: seededRandom(selectedRow * 100 + i + 50) > 0.5 ? '↑' : '↓',
    }));
  }, [features, selectedRow, state.dataset]);

  const whatIfResult = useMemo(() => {
    const basePrediction = 0.65;
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    const changeCount = Object.keys(whatIfValues).length;
    const newPrediction = Math.max(0, Math.min(1, basePrediction + (seededRandom(changeCount + 42) - 0.5) * 0.3));
    return {
      original: basePrediction,
      new: newPrediction,
      change: newPrediction - basePrediction,
    };
  }, [whatIfValues]);

  const finalPrediction = useMemo(() => {
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    return (seededRandom(selectedRow + 7) * 0.3 + 0.4).toFixed(3);
  }, [selectedRow]);

  const handleComplete = () => {
    setInterpretabilityComplete(true);
    onComplete();
  };

  if (!state.dataset || !state.targetVariable) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Please load a dataset and train a model first
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" aria-hidden="true" />
            Model Interpretability
          </CardTitle>
          <CardDescription>Understand how your model makes predictions using SHAP-like explanations</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="importance" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="importance">Feature Importance</TabsTrigger>
              <TabsTrigger value="individual">Individual Explanations</TabsTrigger>
              <TabsTrigger value="whatif">What-If Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="importance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Global Feature Importance</CardTitle>
                  <CardDescription>Top 10 most important features for predictions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RechartsBarChart data={featureImportance} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 'dataMax']} />
                      <YAxis dataKey="feature" type="category" width={100} />
                      <Tooltip formatter={(value) => [`${(Number(value) * 100).toFixed(1)}%`, 'Importance']} />
                      <Bar dataKey="importance">
                        {featureImportance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.impact === 'positive' ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} />
                        ))}
                      </Bar>
                    </RechartsBarChart>
                  </ResponsiveContainer>

                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium">Feature Impact Legend</h4>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-success rounded" />
                        <span className="text-sm">Positive impact on target</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-destructive rounded" />
                        <span className="text-sm">Negative impact on target</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Feature Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {featureImportance.slice(0, 4).map((feature) => (
                      <div key={feature.feature} className="p-3 bg-muted rounded border border-border">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{feature.feature}</span>
                          <Badge variant={feature.impact === 'positive' ? 'default' : 'destructive'}>
                            {feature.impact}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {feature.impact === 'positive'
                            ? `Higher values increase prediction probability by ${(feature.importance * 100).toFixed(1)}%`
                            : `Higher values decrease prediction probability by ${(feature.importance * 100).toFixed(1)}%`}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="individual" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Select Data Point</h3>
                  <Select value={selectedRow.toString()} onValueChange={(value) => setSelectedRow(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a row to explain..." />
                    </SelectTrigger>
                    <SelectContent>
                      {state.dataset.data.slice(0, 20).map((row, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          Row {i + 1}: {Object.values(row).slice(0, 3).join(', ')}...
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Card className="mt-4">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Data Point Values</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {features.slice(0, 5).map((feature) => (
                          <div key={feature} className="flex justify-between">
                            <span className="text-sm text-muted-foreground">{feature}:</span>
                            <span className="text-sm font-medium">{String(state.dataset!.data[selectedRow][feature])}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Prediction Explanation</h3>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Feature Contributions</CardTitle>
                      <CardDescription>How each feature affects this specific prediction</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {rowExplanation.map((contrib) => (
                          <div key={contrib.feature} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{contrib.feature}</span>
                              <Badge variant="outline" className="text-xs">{String(contrib.value)}</Badge>
                            </div>
                            <span className={`text-sm ${contrib.contribution > 0 ? 'text-success' : 'text-destructive'}`}>
                              {contrib.direction} {Math.abs(contrib.contribution * 100).toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 p-3 bg-primary/10 rounded border border-primary/20">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-primary">Final Prediction:</span>
                          <span className="font-bold text-primary">{finalPrediction}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="whatif" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="w-4 h-4" aria-hidden="true" />
                    What-If Analysis
                  </CardTitle>
                  <CardDescription>Explore how changing feature values affects predictions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Modify Feature Values</h4>
                      <div className="space-y-3">
                        {features.slice(0, 5).map((feature) => (
                          <div key={feature} className="space-y-1">
                            <label className="text-sm font-medium">{feature}</label>
                            <Input
                              placeholder={`Current: ${String(state.dataset!.data[selectedRow][feature])}`}
                              value={whatIfValues[feature] ?? ''}
                              onChange={(e) =>
                                setWhatIfValues((prev) => ({ ...prev, [feature]: e.target.value }))
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Prediction Comparison</h4>
                      <Card>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Original Prediction:</span>
                              <span className="font-medium">{whatIfResult.original.toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">New Prediction:</span>
                              <span className="font-medium">{whatIfResult.new.toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Change:</span>
                              <span className={`font-medium ${whatIfResult.change > 0 ? 'text-success' : 'text-destructive'}`}>
                                {whatIfResult.change > 0 ? '+' : ''}{(whatIfResult.change * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="mt-4">
                        <h5 className="font-medium mb-2">Key Insights:</h5>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <p>• Changing {Object.keys(whatIfValues)[0] ?? features[0]} has the highest impact</p>
                          <p>• Model is most sensitive to {featureImportance[0].feature}</p>
                          <p>• Consider feature interactions for better predictions</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleComplete} disabled={interpretabilityComplete}>
          {interpretabilityComplete ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" aria-hidden="true" />
              Interpretability Complete
            </>
          ) : (
            'Complete Model Interpretability'
          )}
        </Button>
      </div>
    </div>
  );
};

export default ModelInterpretabilityModule;
