import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart, CheckCircle, Play, Square } from 'lucide-react';
import { useMLPipeline } from './MLPipelineContext';
import EmptyState from './EmptyState';

interface ModelTrainingModuleProps {
  onComplete: () => void;
}

interface TrainingMetric {
  epoch: number;
  loss: number;
  accuracy: number;
}

interface ModelConfig {
  id: string;
  name: string;
  description: string;
}

const CLASSIFICATION_MODELS: ModelConfig[] = [
  { id: 'logistic-regression', name: 'Logistic Regression', description: 'Linear classifier for binary/multiclass problems' },
  { id: 'decision-tree', name: 'Decision Tree', description: 'Tree-based classifier with interpretable rules' },
  { id: 'neural-network', name: 'Neural Network', description: 'Deep learning model for complex patterns' },
];

const REGRESSION_MODELS: ModelConfig[] = [
  { id: 'linear-regression', name: 'Linear Regression', description: 'Linear relationship between features and target' },
  { id: 'decision-tree-regressor', name: 'Decision Tree Regressor', description: 'Tree-based regressor' },
  { id: 'neural-network-regressor', name: 'Neural Network Regressor', description: 'Deep learning for regression' },
];

const TOTAL_EPOCHS = 50;

const ModelTrainingModule: React.FC<ModelTrainingModuleProps> = ({ onComplete }) => {
  const { state, setModel } = useMLPipeline();
  const [selectedModel, setSelectedModel] = useState('logistic-regression');
  const [isTraining, setIsTraining] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [trainingMetrics, setTrainingMetrics] = useState<TrainingMetric[]>([]);
  const [trainingComplete, setTrainingComplete] = useState(false);
  const abortRef = useRef(false);

  if (!state.dataset || !state.target) {
    return (
      <EmptyState
        icon={BarChart}
        title="Not Ready for Training"
        description="Complete feature engineering first — select a target variable and configure transformations so the model knows what to learn."
        actionLabel="Go to Feature Engineering"
        onAction={() => window.dispatchEvent(new CustomEvent('pipeline:navigate', { detail: 4 }))}
      />
    );
  }

  const targetValues = state.dataset.data.map((row) => row[state.target!]).filter((v) => v != null);
  const taskType = targetValues.every((v) => !isNaN(parseFloat(String(v)))) ? 'regression' : 'classification';
  const models = taskType === 'classification' ? CLASSIFICATION_MODELS : REGRESSION_MODELS;

  const simulateTraining = async () => {
    abortRef.current = false;
    setIsTraining(true);
    setCurrentEpoch(0);
    setTrainingMetrics([]);

    const collectedMetrics: TrainingMetric[] = [];

    for (let epoch = 1; epoch <= TOTAL_EPOCHS; epoch++) {
      if (abortRef.current) break;
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (abortRef.current) break;

      const progress = epoch / TOTAL_EPOCHS;
      const loss = 1.0 * Math.exp(-progress * 2) + 0.1 * Math.random();
      const accuracy = Math.min(0.95, 0.5 + 0.4 * progress + 0.05 * Math.random());
      const metric = { epoch, loss, accuracy };

      collectedMetrics.push(metric);
      setCurrentEpoch(epoch);
      setTrainingMetrics([...collectedMetrics]);
    }

    if (!abortRef.current) {
      const lastMetric = collectedMetrics[collectedMetrics.length - 1];
      setModel({
        name: selectedModel,
        type: selectedModel,
        taskType,
        epochs: TOTAL_EPOCHS,
        finalLoss: lastMetric?.loss ?? 0.1,
        finalAccuracy: lastMetric?.accuracy ?? 0.85,
        features: state.features,
        target: state.target,
        trainedAt: new Date(),
      });
      setTrainingComplete(true);
    }

    setIsTraining(false);
  };

  const stopTraining = () => {
    abortRef.current = true;
    setIsTraining(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-5 h-5" aria-hidden="true" />
            Model Training
          </CardTitle>
          <CardDescription>Select and train a machine learning model</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Model Selection */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold">Model Selection</h3>
                <Badge variant="outline">{taskType}</Badge>
              </div>

              <div className="space-y-3" role="listbox" aria-label="Select model">
                {models.map((model) => (
                  <Card
                    key={model.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedModel === model.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => !isTraining && setSelectedModel(model.id)}
                    role="option"
                    aria-selected={selectedModel === model.id}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (!isTraining) setSelectedModel(model.id);
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{model.name}</h4>
                        {selectedModel === model.id && (
                          <CheckCircle className="w-5 h-5 text-primary" aria-hidden="true" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{model.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                <div className="p-4 bg-muted rounded">
                  <h4 className="font-medium mb-2">Training Configuration</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Features:</span>
                      <span>{state.features.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Target:</span>
                      <span>{state.target}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Training Samples:</span>
                      <span>{Math.floor((state.cleanedData ?? state.dataset.data).length * 0.8)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Test Samples:</span>
                      <span>{Math.ceil((state.cleanedData ?? state.dataset.data).length * 0.2)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={simulateTraining}
                  disabled={isTraining || trainingComplete}
                  className="w-full"
                  aria-label={isTraining ? `Training epoch ${currentEpoch} of ${TOTAL_EPOCHS}` : 'Start training'}
                >
                  {isTraining ? (
                    <>
                      <Square className="w-4 h-4 mr-2" aria-hidden="true" />
                      Training... (Epoch {currentEpoch}/{TOTAL_EPOCHS})
                    </>
                  ) : trainingComplete ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                      Training Complete
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" aria-hidden="true" />
                      Start Training
                    </>
                  )}
                </Button>

                {isTraining && (
                  <Button onClick={stopTraining} variant="outline" className="w-full" aria-label="Stop training">
                    <Square className="w-4 h-4 mr-2" aria-hidden="true" />
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
                      <span>{currentEpoch}/{TOTAL_EPOCHS}</span>
                    </div>
                    <Progress value={(currentEpoch / TOTAL_EPOCHS) * 100} aria-label="Training progress" />
                  </div>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Training Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {trainingMetrics.length > 0 && (
                        <div className="space-y-4">
                          <div>
                            <h5 className="text-sm font-medium mb-2">Loss</h5>
                            <div className="h-20 bg-destructive/10 rounded flex items-end p-2">
                              {trainingMetrics.slice(-10).map((metric, i) => (
                                <div
                                  key={i}
                                  className="bg-destructive w-2 mx-1 rounded-t"
                                  style={{ height: `${(1 - metric.loss) * 60}px` }}
                                />
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Current: {trainingMetrics[trainingMetrics.length - 1]?.loss.toFixed(4)}
                            </p>
                          </div>

                          <div>
                            <h5 className="text-sm font-medium mb-2">
                              {taskType === 'classification' ? 'Accuracy' : 'R² Score'}
                            </h5>
                            <div className="h-20 bg-success/10 rounded flex items-end p-2">
                              {trainingMetrics.slice(-10).map((metric, i) => (
                                <div
                                  key={i}
                                  className="bg-success w-2 mx-1 rounded-t"
                                  style={{ height: `${metric.accuracy * 60}px` }}
                                />
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Current: {(trainingMetrics[trainingMetrics.length - 1]?.accuracy * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      )}

                      {!isTraining && !trainingComplete && (
                        <div className="text-center py-8 text-muted-foreground">Start training to see metrics</div>
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
                        <span className="text-muted-foreground">Model:</span>
                        <span>{models.find((m) => m.id === selectedModel)?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Epochs:</span>
                        <span>{state.model.epochs}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Final Loss:</span>
                        <span>{(state.model.finalLoss ?? 0).toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
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
          <Button onClick={onComplete}>Continue to Evaluation</Button>
        </div>
      )}
    </div>
  );
};

export default ModelTrainingModule;
