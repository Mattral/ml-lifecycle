
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart, CheckCircle, Play, Square } from 'lucide-react';
import { useMLPipeline } from './MLPipelineContext';

interface ModelTrainingModuleProps {
  onComplete: () => void;
}

const ModelTrainingModule: React.FC<ModelTrainingModuleProps> = ({ onComplete }) => {
  const { state, setModel } = useMLPipeline();
  const [selectedModel, setSelectedModel] = useState<string>('logistic-regression');
  const [isTraining, setIsTraining] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [trainingMetrics, setTrainingMetrics] = useState<{epoch: number, loss: number, accuracy: number}[]>([]);
  const [trainingComplete, setTrainingComplete] = useState(false);

  if (!state.dataset || !state.target) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-slate-600">Please complete feature engineering first</p>
        </CardContent>
      </Card>
    );
  }

  const taskType = state.dataset.data.map(row => row[state.target!]).filter(v => v != null).every(v => !isNaN(parseFloat(v))) ? 'regression' : 'classification';

  const availableModels = {
    classification: [
      { id: 'logistic-regression', name: 'Logistic Regression', description: 'Linear classifier for binary/multiclass problems' },
      { id: 'decision-tree', name: 'Decision Tree', description: 'Tree-based classifier with interpretable rules' },
      { id: 'neural-network', name: 'Neural Network', description: 'Deep learning model for complex patterns' }
    ],
    regression: [
      { id: 'linear-regression', name: 'Linear Regression', description: 'Linear relationship between features and target' },
      { id: 'decision-tree-regressor', name: 'Decision Tree Regressor', description: 'Tree-based regressor' },
      { id: 'neural-network-regressor', name: 'Neural Network Regressor', description: 'Deep learning for regression' }
    ]
  };

  const models = availableModels[taskType as keyof typeof availableModels];

  const simulateTraining = async () => {
    setIsTraining(true);
    setCurrentEpoch(0);
    setTrainingMetrics([]);

    const totalEpochs = 50;
    
    for (let epoch = 1; epoch <= totalEpochs; epoch++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Simulate realistic training curves
      const progress = epoch / totalEpochs;
      const loss = 1.0 * Math.exp(-progress * 2) + 0.1 * Math.random();
      const accuracy = Math.min(0.95, 0.5 + 0.4 * progress + 0.05 * Math.random());

      setCurrentEpoch(epoch);
      setTrainingMetrics(prev => [...prev, { epoch, loss, accuracy }]);
    }

    const finalModel = {
      name: selectedModel,
      type: selectedModel,
      taskType,
      epochs: totalEpochs,
      finalLoss: trainingMetrics[trainingMetrics.length - 1]?.loss || 0.1,
      finalAccuracy: trainingMetrics[trainingMetrics.length - 1]?.accuracy || 0.85,
      features: state.features,
      target: state.target,
      trainedAt: new Date(),
    };

    setModel(finalModel);
    setIsTraining(false);
    setTrainingComplete(true);
  };

  const stopTraining = () => {
    setIsTraining(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-5 h-5" />
            Model Training
          </CardTitle>
          <CardDescription>
            Select and train a machine learning model
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Model Selection */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold">Model Selection</h3>
                <Badge variant="outline">{taskType}</Badge>
              </div>
              
              <div className="space-y-3">
                {models.map(model => (
                  <Card 
                    key={model.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedModel === model.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => !isTraining && setSelectedModel(model.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{model.name}</h4>
                        {selectedModel === model.id && (
                          <CheckCircle className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{model.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                <div className="p-4 bg-slate-50 rounded">
                  <h4 className="font-medium mb-2">Training Configuration</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Features:</span>
                      <span>{state.features.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Target:</span>
                      <span>{state.target}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Training Samples:</span>
                      <span>{Math.floor((state.cleanedData || state.dataset.data).length * 0.8)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Test Samples:</span>
                      <span>{Math.ceil((state.cleanedData || state.dataset.data).length * 0.2)}</span>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={simulateTraining}
                  disabled={isTraining || trainingComplete}
                  className="w-full"
                >
                  {isTraining ? (
                    <>
                      <Square className="w-4 h-4 mr-2" />
                      Training... (Epoch {currentEpoch}/50)
                    </>
                  ) : trainingComplete ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Training Complete
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Training
                    </>
                  )}
                </Button>

                {isTraining && (
                  <Button 
                    onClick={stopTraining}
                    variant="outline"
                    className="w-full"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop Training
                  </Button>
                )}
              </div>
            </div>

            {/* Training Progress */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Training Progress</h3>
              
              {(isTraining || trainingComplete) && (
                <>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Epoch Progress</span>
                      <span>{currentEpoch}/50</span>
                    </div>
                    <Progress value={(currentEpoch / 50) * 100} />
                  </div>

                  {/* Metrics Chart Simulation */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Training Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {trainingMetrics.length > 0 && (
                        <div className="space-y-4">
                          {/* Loss Chart Simulation */}
                          <div>
                            <h5 className="text-sm font-medium mb-2">Loss</h5>
                            <div className="h-20 bg-gradient-to-r from-red-100 to-red-50 rounded flex items-end p-2">
                              {trainingMetrics.slice(-10).map((metric, i) => (
                                <div 
                                  key={i}
                                  className="bg-red-500 w-2 mx-1 rounded-t"
                                  style={{ height: `${(1 - metric.loss) * 60}px` }}
                                />
                              ))}
                            </div>
                            <p className="text-xs text-slate-600 mt-1">
                              Current: {trainingMetrics[trainingMetrics.length - 1]?.loss.toFixed(4)}
                            </p>
                          </div>

                          {/* Accuracy Chart Simulation */}
                          <div>
                            <h5 className="text-sm font-medium mb-2">
                              {taskType === 'classification' ? 'Accuracy' : 'R² Score'}
                            </h5>
                            <div className="h-20 bg-gradient-to-r from-green-100 to-green-50 rounded flex items-end p-2">
                              {trainingMetrics.slice(-10).map((metric, i) => (
                                <div 
                                  key={i}
                                  className="bg-green-500 w-2 mx-1 rounded-t"
                                  style={{ height: `${metric.accuracy * 60}px` }}
                                />
                              ))}
                            </div>
                            <p className="text-xs text-slate-600 mt-1">
                              Current: {(trainingMetrics[trainingMetrics.length - 1]?.accuracy * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      )}

                      {!isTraining && !trainingComplete && (
                        <div className="text-center py-8 text-slate-500">
                          Start training to see metrics
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}

              {trainingComplete && state.model && (
                <Card className="mt-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Training Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Model:</span>
                        <span>{models.find(m => m.id === selectedModel)?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Epochs:</span>
                        <span>{state.model.epochs}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Final Loss:</span>
                        <span>{(state.model.finalLoss ?? 0).toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">
                          Final {taskType === 'classification' ? 'Accuracy' : 'R² Score'}:
                        </span>
                        <span>{((state.model.finalAccuracy ?? 0) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {trainingComplete && (
        <div className="flex justify-end">
          <Button onClick={onComplete}>
            Continue to Evaluation
          </Button>
        </div>
      )}
    </div>
  );
};

export default ModelTrainingModule;
