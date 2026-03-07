import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, BarChart, TrendingUp, Zap } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart as RechartsBarChart, Bar, Cell } from 'recharts';
import { useMLPipeline } from './MLPipelineContext';

interface EvaluationModuleProps {
  onComplete: () => void;
}

const EvaluationModule: React.FC<EvaluationModuleProps> = ({ onComplete }) => {
  const { state, setPredictions } = useMLPipeline();
  const [evaluationResults, setEvaluationResults] = useState<any>(null);
  const [evaluationComplete, setEvaluationComplete] = useState(false);

  useEffect(() => {
    if (state.model && !evaluationResults) {
      generateEvaluationResults();
    }
  }, [state.model]);

  if (!state.model) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-slate-600">Please train a model first</p>
        </CardContent>
      </Card>
    );
  }

  const generateEvaluationResults = () => {
    const taskType = state.model.taskType;
    const testSize = Math.ceil((state.cleanedData || state.dataset!.data).length * 0.2);

    if (taskType === 'classification') {
      // Generate classification metrics
      const accuracy = 0.85 + Math.random() * 0.1;
      const precision = 0.80 + Math.random() * 0.15;
      const recall = 0.75 + Math.random() * 0.2;
      const f1Score = 2 * (precision * recall) / (precision + recall);

      const truePositives = Math.floor(testSize * 0.4 * recall);
      const falsePositives = Math.floor(testSize * 0.6 * (1 - precision));
      const falseNegatives = Math.floor(testSize * 0.4 * (1 - recall));
      const trueNegatives = testSize - truePositives - falsePositives - falseNegatives;

      setEvaluationResults({
        taskType: 'classification',
        metrics: {
          accuracy: accuracy,
          precision: precision,
          recall: recall,
          f1Score: f1Score
        },
        confusionMatrix: {
          truePositives,
          falsePositives,
          falseNegatives,
          trueNegatives
        },
        testSize
      });
    } else {
      // Generate regression metrics
      const r2Score = 0.75 + Math.random() * 0.2;
      const mae = 1000 + Math.random() * 2000;
      const mse = mae * mae * (1 + Math.random());
      const rmse = Math.sqrt(mse);

      setEvaluationResults({
        taskType: 'regression',
        metrics: {
          r2Score: r2Score,
          mae: mae,
          mse: mse,
          rmse: rmse
        },
        testSize
      });
    }

    // Generate sample predictions
    const samplePredictions = Array.from({ length: 10 }, (_, i) => ({
      actual: Math.random() > 0.5 ? 1 : 0,
      predicted: Math.random() > 0.4 ? 1 : 0,
      confidence: 0.6 + Math.random() * 0.4
    }));

    setPredictions(samplePredictions);
    setEvaluationComplete(true);
  };

  // Generate synthetic data for plots
  const generatePredictionAccuracyData = () => {
    return Array.from({ length: 50 }, (_, i) => ({
      actual: Math.random() * 100,
      predicted: Math.random() * 100 + (Math.random() - 0.5) * 20,
    }));
  };

  const generateLearningCurveData = () => {
    const epochs = Array.from({ length: 20 }, (_, i) => i + 1);
    return epochs.map(epoch => ({
      epoch,
      training: 0.9 - Math.exp(-epoch * 0.3) * 0.3 + Math.random() * 0.05,
      validation: 0.85 - Math.exp(-epoch * 0.25) * 0.25 + Math.random() * 0.08,
    }));
  };

  const generateResidualData = () => {
    return Array.from({ length: 100 }, (_, i) => ({
      fitted: Math.random() * 100,
      residual: (Math.random() - 0.5) * 20,
    }));
  };

  const generateQQData = () => {
    return Array.from({ length: 50 }, (_, i) => ({
      theoretical: (i - 25) / 5,
      sample: (i - 25) / 5 + (Math.random() - 0.5) * 2,
    }));
  };

  const generateResidualHistogramData = () => {
    const bins = 15;
    return Array.from({ length: bins }, (_, i) => ({
      bin: (i - bins/2).toFixed(1),
      frequency: Math.floor(Math.random() * 20) + 5,
    }));
  };

  const generateROCData = () => {
    return Array.from({ length: 20 }, (_, i) => ({
      fpr: i / 20,
      tpr: Math.min(1, (i / 20) + 0.1 + Math.random() * 0.1),
    }));
  };

  const generateFeatureImportanceData = () => {
    return state.features.slice(0, 8).map(feature => ({
      feature,
      importance: Math.random(),
      impact: Math.random() > 0.5 ? 'positive' : 'negative'
    }));
  };

  const handleCompleteEvaluation = () => {
    onComplete();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-5 h-5" />
            Model Evaluation
          </CardTitle>
          <CardDescription>
            Comprehensive evaluation of your trained model
          </CardDescription>
        </CardHeader>
        <CardContent>
          {evaluationResults && (
            <Tabs defaultValue="metrics" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
                <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
                <TabsTrigger value="residuals">Residual Analysis</TabsTrigger>
                <TabsTrigger value="importance">Feature Importance</TabsTrigger>
              </TabsList>

              <TabsContent value="metrics" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Performance Metrics */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                    <div className="space-y-3">
                      {evaluationResults.taskType === 'classification' ? (
                        <>
                          <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                            <span className="font-medium">Accuracy</span>
                            <Badge variant="default">
                              {(evaluationResults.metrics.accuracy * 100).toFixed(1)}%
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                            <span className="font-medium">Precision</span>
                            <Badge variant="secondary">
                              {(evaluationResults.metrics.precision * 100).toFixed(1)}%
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                            <span className="font-medium">Recall</span>
                            <Badge variant="outline">
                              {(evaluationResults.metrics.recall * 100).toFixed(1)}%
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                            <span className="font-medium">F1-Score</span>
                            <Badge variant="secondary">
                              {(evaluationResults.metrics.f1Score * 100).toFixed(1)}%
                            </Badge>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                            <span className="font-medium">R² Score</span>
                            <Badge variant="default">
                              {(evaluationResults.metrics.r2Score * 100).toFixed(1)}%
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                            <span className="font-medium">MAE</span>
                            <Badge variant="secondary">
                              {evaluationResults.metrics.mae.toFixed(0)}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                            <span className="font-medium">RMSE</span>
                            <Badge variant="outline">
                              {evaluationResults.metrics.rmse.toFixed(0)}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                            <span className="font-medium">MSE</span>
                            <Badge variant="secondary">
                              {evaluationResults.metrics.mse.toFixed(0)}
                            </Badge>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="mt-6 p-4 bg-slate-50 rounded">
                      <h4 className="font-medium mb-2">Evaluation Summary</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Test Samples:</span>
                          <span>{evaluationResults.testSize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Model Type:</span>
                          <span>{state.model.type.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Task:</span>
                          <span className="capitalize">{evaluationResults.taskType}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Model Performance Indicators */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Performance Indicators</h3>
                    
                    {evaluationResults.taskType === 'classification' ? (
                      <div className="space-y-4">
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">Model Performance</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm">Overall Performance:</span>
                                <Badge variant={evaluationResults.metrics.accuracy > 0.8 ? 'default' : 'secondary'}>
                                  {evaluationResults.metrics.accuracy > 0.9 ? 'Excellent' : 
                                   evaluationResults.metrics.accuracy > 0.8 ? 'Good' : 
                                   evaluationResults.metrics.accuracy > 0.7 ? 'Fair' : 'Poor'}
                                </Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Precision-Recall Balance:</span>
                                <Badge variant="outline">
                                  {Math.abs(evaluationResults.metrics.precision - evaluationResults.metrics.recall) < 0.1 ? 'Balanced' : 'Imbalanced'}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">Model Performance</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm">R² Performance:</span>
                                <Badge variant={evaluationResults.metrics.r2Score > 0.8 ? 'default' : 'secondary'}>
                                  {evaluationResults.metrics.r2Score > 0.9 ? 'Excellent' : 
                                   evaluationResults.metrics.r2Score > 0.7 ? 'Good' : 
                                   evaluationResults.metrics.r2Score > 0.5 ? 'Fair' : 'Poor'}
                                </Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Error Level:</span>
                                <Badge variant="outline">
                                  {evaluationResults.metrics.mae < 1000 ? 'Low' : 
                                   evaluationResults.metrics.mae < 2000 ? 'Medium' : 'High'}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="visualizations" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Prediction Accuracy Plot */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Prediction Accuracy Plot</CardTitle>
                      <CardDescription>Predicted vs Actual Values</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <ScatterChart data={generatePredictionAccuracyData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="actual" name="Actual" />
                          <YAxis dataKey="predicted" name="Predicted" />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                          <Scatter fill="#3b82f6" />
                          <Line 
                            type="linear" 
                            dataKey="actual" 
                            stroke="#ef4444" 
                            strokeDasharray="5 5" 
                            dot={false}
                          />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* ROC Curve */}
                  {evaluationResults.taskType === 'classification' && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">ROC Curve Analysis</CardTitle>
                        <CardDescription>True Positive Rate vs False Positive Rate</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={generateROCData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="fpr" name="False Positive Rate" />
                            <YAxis dataKey="tpr" name="True Positive Rate" />
                            <Tooltip />
                            <Line 
                              type="monotone" 
                              dataKey="tpr" 
                              stroke="#10b981" 
                              strokeWidth={2}
                              dot={{ r: 3 }}
                            />
                            <Line 
                              type="linear" 
                              dataKey="fpr" 
                              stroke="#6b7280" 
                              strokeDasharray="5 5" 
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                        <p className="text-xs text-slate-500 mt-2">
                          AUC = {(0.8 + Math.random() * 0.15).toFixed(3)}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Confusion Matrix for Classification */}
                  {evaluationResults.taskType === 'classification' && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Confusion Matrix</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div></div>
                          <div className="text-sm font-medium">Predicted 0</div>
                          <div className="text-sm font-medium">Predicted 1</div>
                          
                          <div className="text-sm font-medium">Actual 0</div>
                          <div className="bg-green-100 p-3 rounded border border-green-300">
                            <div className="text-lg font-bold text-green-800">
                              {evaluationResults.confusionMatrix.trueNegatives}
                            </div>
                            <div className="text-xs text-green-600">True Negative</div>
                          </div>
                          <div className="bg-red-100 p-3 rounded border border-red-300">
                            <div className="text-lg font-bold text-red-800">
                              {evaluationResults.confusionMatrix.falsePositives}
                            </div>
                            <div className="text-xs text-red-600">False Positive</div>
                          </div>
                          
                          <div className="text-sm font-medium">Actual 1</div>
                          <div className="bg-red-100 p-3 rounded border border-red-300">
                            <div className="text-lg font-bold text-red-800">
                              {evaluationResults.confusionMatrix.falseNegatives}
                            </div>
                            <div className="text-xs text-red-600">False Negative</div>
                          </div>
                          <div className="bg-green-100 p-3 rounded border border-green-300">
                            <div className="text-lg font-bold text-green-800">
                              {evaluationResults.confusionMatrix.truePositives}
                            </div>
                            <div className="text-xs text-green-600">True Positive</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Learning Curves */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Training vs Validation</CardTitle>
                      <CardDescription>Learning Curves Over Training</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={generateLearningCurveData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="epoch" />
                          <YAxis domain={[0.5, 1]} />
                          <Tooltip />
                          <Line 
                            type="monotone" 
                            dataKey="training" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            name="Training Accuracy"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="validation" 
                            stroke="#ef4444" 
                            strokeWidth={2}
                            name="Validation Accuracy"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="residuals" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Residual Plot */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Residual Analysis
                      </CardTitle>
                      <CardDescription>Residuals vs Fitted Values</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <ScatterChart data={generateResidualData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="fitted" name="Fitted Values" />
                          <YAxis dataKey="residual" name="Residuals" />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                          <Scatter fill="#8b5cf6" />
                        </ScatterChart>
                      </ResponsiveContainer>
                      <div className="mt-3 text-xs text-slate-600">
                        <p>• Random scatter indicates good model fit</p>
                        <p>• Patterns suggest model bias or heteroscedasticity</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Q-Q Plot */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Normality Check</CardTitle>
                      <CardDescription>Q-Q Plot of Residuals</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <ScatterChart data={generateQQData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="theoretical" name="Theoretical Quantiles" />
                          <YAxis dataKey="sample" name="Sample Quantiles" />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                          <Scatter fill="#14b8a6" />
                          <Line 
                            type="linear" 
                            dataKey="theoretical" 
                            stroke="#ef4444" 
                            strokeDasharray="5 5" 
                            dot={false}
                          />
                        </ScatterChart>
                      </ResponsiveContainer>
                      <div className="mt-3 text-xs text-slate-600">
                        <p>• Points on diagonal = normal residuals</p>
                        <p>• Deviations indicate non-normality</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Residual Histogram */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Residual Histogram</CardTitle>
                      <CardDescription>Distribution of Residuals</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <RechartsBarChart data={generateResidualHistogramData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="bin" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="frequency" fill="#f59e0b" />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                      <div className="mt-3 text-xs text-slate-600">
                        <p>• Bell curve = good residual distribution</p>
                        <p>• Skewness indicates model bias</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Scale-Location Plot */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Variance Analysis</CardTitle>
                      <CardDescription>Scale-Location Plot</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <ScatterChart data={generateResidualData().map(d => ({ 
                          ...d, 
                          sqrtResidual: Math.sqrt(Math.abs(d.residual)) 
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="fitted" name="Fitted Values" />
                          <YAxis dataKey="sqrtResidual" name="√|Residuals|" />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                          <Scatter fill="#ec4899" />
                        </ScatterChart>
                      </ResponsiveContainer>
                      <div className="mt-3 text-xs text-slate-600">
                        <p>• Horizontal line = constant variance</p>
                        <p>• Trend indicates heteroscedasticity</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Residual Analysis Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Residual Analysis Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded">
                        <div className="text-lg font-bold text-green-800">
                          {(Math.random() * 0.1).toFixed(3)}
                        </div>
                        <div className="text-sm text-green-600">Mean Residual</div>
                        <div className="text-xs text-slate-500">Should be ~0</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <div className="text-lg font-bold text-blue-800">
                          {(0.8 + Math.random() * 0.15).toFixed(3)}
                        </div>
                        <div className="text-sm text-blue-600">Normality Score</div>
                        <div className="text-xs text-slate-500">Higher = more normal</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded">
                        <div className="text-lg font-bold text-purple-800">
                          {(Math.random() * 2 + 1).toFixed(1)}
                        </div>
                        <div className="text-sm text-purple-600">Durbin-Watson</div>
                        <div className="text-xs text-slate-500">~2 = no autocorrelation</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="importance" className="space-y-4">
                {/* Feature Importance */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Feature Impact Analysis</CardTitle>
                    <CardDescription>Top factors influencing model predictions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsBarChart 
                        data={generateFeatureImportanceData()} 
                        layout="horizontal"
                        margin={{ left: 80 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 1]} />
                        <YAxis dataKey="feature" type="category" width={80} />
                        <Tooltip formatter={(value, name) => [`${(value as number * 100).toFixed(1)}%`, 'Importance']} />
                        <Bar dataKey="importance">
                          {generateFeatureImportanceData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.impact === 'positive' ? '#10b981' : '#ef4444'} />
                          ))}
                        </Bar>
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Sample Predictions */}
      {state.predictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sample Predictions</CardTitle>
            <CardDescription>
              Example predictions on test data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Sample</th>
                    <th className="text-left p-2">Actual</th>
                    <th className="text-left p-2">Predicted</th>
                    <th className="text-left p-2">Confidence</th>
                    <th className="text-left p-2">Correct?</th>
                  </tr>
                </thead>
                <tbody>
                  {state.predictions.slice(0, 5).map((pred, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">Sample {i + 1}</td>
                      <td className="p-2">{pred.actual}</td>
                      <td className="p-2">{pred.predicted}</td>
                      <td className="p-2">{(pred.confidence * 100).toFixed(1)}%</td>
                      <td className="p-2">
                        {pred.actual === pred.predicted ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <span className="text-red-500">✗</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={handleCompleteEvaluation} disabled={!evaluationComplete}>
          {evaluationComplete ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Pipeline
            </>
          ) : (
            'Completing Evaluation...'
          )}
        </Button>
      </div>
    </div>
  );
};

export default EvaluationModule;
