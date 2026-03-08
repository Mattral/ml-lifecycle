import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Zap, BarChart } from 'lucide-react';
import { useMLPipeline } from './MLPipelineContext';

interface DeploymentSimulationModuleProps {
  onComplete: () => void;
}

interface PredictionResult {
  result: number;
  confidence: number;
  latency: number;
}

const DeploymentSimulationModule: React.FC<DeploymentSimulationModuleProps> = ({ onComplete }) => {
  const { state } = useMLPipeline();
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deploymentComplete, setDeploymentComplete] = useState(false);

  const features = state.dataset?.columns.filter((col) => col !== state.targetVariable) ?? [];

  const simulatePrediction = useCallback(async () => {
    setIsLoading(true);
    const latency = Math.random() * 200 + 50;
    await new Promise((resolve) => setTimeout(resolve, latency));

    setPrediction({
      result: parseFloat((Math.random() * 0.6 + 0.2).toFixed(3)),
      confidence: parseFloat((Math.random() * 0.3 + 0.7).toFixed(3)),
      latency: Math.round(latency),
    });
    setIsLoading(false);
  }, []);

  const handleComplete = useCallback(() => {
    setDeploymentComplete(true);
    onComplete();
  }, [onComplete]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" aria-hidden="true" />
            Inference & Deployment Simulation
          </CardTitle>
          <CardDescription>Test your model with real-time predictions and deployment simulation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">API Endpoint Simulation</h3>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">REST API Interface</CardTitle>
                  <CardDescription>POST /api/v1/predict</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-muted rounded">
                      <code className="text-sm">POST https://your-model-api.com/predict</code>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Headers:</span>
                      <div className="text-xs bg-muted p-2 rounded mt-1">
                        Content-Type: application/json<br />
                        Authorization: Bearer your-api-key
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-success rounded-full" />
                      <span className="text-sm text-success">API Status: Active</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Input Features</CardTitle>
                  <CardDescription>Enter values for prediction</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {features.slice(0, 6).map((feature) => (
                      <div key={feature} className="space-y-1">
                        <label className="text-sm font-medium">{feature}</label>
                        <Input
                          placeholder={`Enter ${feature} value...`}
                          value={inputValues[feature] ?? ''}
                          onChange={(e) => setInputValues((prev) => ({ ...prev, [feature]: e.target.value }))}
                        />
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={simulatePrediction}
                    className="w-full mt-4"
                    disabled={isLoading || Object.keys(inputValues).length === 0}
                    aria-label={isLoading ? 'Processing prediction' : 'Get prediction'}
                  >
                    {isLoading ? 'Processing...' : 'Get Prediction'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Prediction Results</h3>

              {prediction && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Model Response</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-primary/10 rounded">
                          <div className="text-2xl font-bold text-primary">{prediction.result}</div>
                          <div className="text-sm text-primary/80">Prediction</div>
                        </div>
                        <div className="text-center p-3 bg-success/10 rounded">
                          <div className="text-2xl font-bold text-success">{(prediction.confidence * 100).toFixed(1)}%</div>
                          <div className="text-sm text-success/80">Confidence</div>
                        </div>
                      </div>
                      <div className="p-3 bg-muted rounded">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Response Time:</span>
                          <Badge variant="outline">{prediction.latency}ms</Badge>
                        </div>
                      </div>
                      <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                        <strong>API Response:</strong>
                        {'\n'}
                        {JSON.stringify(
                          {
                            prediction: prediction.result,
                            confidence: prediction.confidence,
                            model_version: '1.0.3',
                            timestamp: new Date().toISOString(),
                            latency_ms: prediction.latency,
                          },
                          null,
                          2,
                        )}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="mt-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart className="w-4 h-4" aria-hidden="true" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: 'Average Latency', value: '127ms' },
                      { label: 'Requests/sec', value: '850' },
                      { label: 'Uptime', value: '99.9%', color: 'text-success' },
                      { label: 'Error Rate', value: '0.1%', color: 'text-success' },
                    ].map((metric) => (
                      <div key={metric.label} className="flex justify-between">
                        <span className="text-muted-foreground">{metric.label}:</span>
                        <span className={`font-medium ${metric.color ?? ''}`}>{metric.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Deployment Environment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['Production: us-east-1', 'Load Balancer: Active', 'Auto-scaling: Enabled', 'Monitoring: Active'].map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success rounded-full" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={handleComplete} disabled={deploymentComplete}>
              {deploymentComplete ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                  Deployment Complete
                </>
              ) : (
                'Complete Deployment Simulation'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeploymentSimulationModule;
