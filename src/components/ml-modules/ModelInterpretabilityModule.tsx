import React, { useState } from 'react';
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

const ModelInterpretabilityModule: React.FC<ModelInterpretabilityModuleProps> = ({ onComplete }) => {
  const { state } = useMLPipeline();
  const [selectedFeature, setSelectedFeature] = useState<string>('');
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [whatIfValues, setWhatIfValues] = useState<{[key: string]: string}>({});
  const [interpretabilityComplete, setInterpretabilityComplete] = useState(false);

  if (!state.dataset || !state.targetVariable) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-slate-600">Please complete model training first</p>
        </CardContent>
      </Card>
    );
  }

  const features = state.dataset.columns.filter(col => col !== state.targetVariable);
  
  // Simulate SHAP-like feature importance
  const generateFeatureImportance = () => {
    return features.map(feature => ({
      feature,
      importance: Math.random() * 0.5 + 0.1,
      impact: Math.random() > 0.5 ? 'positive' : 'negative'
    })).sort((a, b) => b.importance - a.importance).slice(0, 10);
  };

  const featureImportance = generateFeatureImportance();

  // Simulate individual prediction explanation
  const generateRowExplanation = (rowIndex: number) => {
    const row = state.dataset!.data[rowIndex];
    return features.slice(0, 5).map(feature => ({
      feature,
      value: row[feature],
      contribution: (Math.random() - 0.5) * 0.4,
      direction: Math.random() > 0.5 ? '↑' : '↓'
    }));
  };

  // Simulate what-if analysis
  const simulateWhatIf = () => {
    const basePrediction = 0.65;
    const changes = Object.keys(whatIfValues).length;
    const newPrediction = Math.max(0, Math.min(1, basePrediction + (Math.random() - 0.5) * 0.3));
    
    return {
      original: basePrediction,
      new: newPrediction,
      change: newPrediction - basePrediction
    };
  };

  const handleCompleteInterpretability = () => {
    setInterpretabilityComplete(true);
    onComplete();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Model Interpretability
          </CardTitle>
          <CardDescription>
            Understand how your model makes predictions using SHAP-like explanations
          </CardDescription>
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
                      <Tooltip formatter={(value, name) => [`${(value as number * 100).toFixed(1)}%`, 'Importance']} />
                      <Bar dataKey="importance">
                        {featureImportance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.impact === 'positive' ? '#10b981' : '#ef4444'} />
                        ))}
                      </Bar>
                    </RechartsBarChart>
                  </ResponsiveContainer>
                  
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium">Feature Impact Legend</h4>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span className="text-sm">Positive impact on target</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
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
                    {featureImportance.slice(0, 4).map((feature, i) => (
                      <div key={feature.feature} className="p-3 bg-slate-50 rounded border">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{feature.feature}</span>
                          <Badge variant={feature.impact === 'positive' ? 'default' : 'destructive'}>
                            {feature.impact}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">
                          {feature.impact === 'positive' 
                            ? `Higher values increase prediction probability by ${(feature.importance * 100).toFixed(1)}%`
                            : `Higher values decrease prediction probability by ${(feature.importance * 100).toFixed(1)}%`
                          }
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
                        {features.slice(0, 5).map(feature => (
                          <div key={feature} className="flex justify-between">
                            <span className="text-sm text-slate-600">{feature}:</span>
                            <span className="text-sm font-medium">{state.dataset!.data[selectedRow][feature]}</span>
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
                        {generateRowExplanation(selectedRow).map((contrib, i) => (
                          <div key={contrib.feature} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{contrib.feature}</span>
                              <Badge variant="outline" className="text-xs">
                                {contrib.value}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm ${contrib.contribution > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {contrib.direction} {Math.abs(contrib.contribution * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-blue-800">Final Prediction:</span>
                          <span className="font-bold text-blue-800">{(Math.random() * 0.3 + 0.4).toFixed(3)}</span>
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
                    <Zap className="w-4 h-4" />
                    What-If Analysis
                  </CardTitle>
                  <CardDescription>
                    Explore how changing feature values affects predictions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Modify Feature Values</h4>
                      <div className="space-y-3">
                        {features.slice(0, 5).map(feature => (
                          <div key={feature} className="space-y-1">
                            <label className="text-sm font-medium">{feature}</label>
                            <Input
                              placeholder={`Current: ${state.dataset!.data[selectedRow][feature]}`}
                              value={whatIfValues[feature] || ''}
                              onChange={(e) => setWhatIfValues(prev => ({
                                ...prev,
                                [feature]: e.target.value
                              }))}
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
                              <span className="text-slate-600">Original Prediction:</span>
                              <span className="font-medium">{simulateWhatIf().original.toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">New Prediction:</span>
                              <span className="font-medium">{simulateWhatIf().new.toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Change:</span>
                              <span className={`font-medium ${simulateWhatIf().change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {simulateWhatIf().change > 0 ? '+' : ''}{(simulateWhatIf().change * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="mt-4">
                        <h5 className="font-medium mb-2">Key Insights:</h5>
                        <div className="space-y-2 text-sm text-slate-600">
                          <p>• Changing {Object.keys(whatIfValues)[0] || features[0]} has the highest impact</p>
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
        <Button onClick={handleCompleteInterpretability} disabled={interpretabilityComplete}>
          {interpretabilityComplete ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
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
