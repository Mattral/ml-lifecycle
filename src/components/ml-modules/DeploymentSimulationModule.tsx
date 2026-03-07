
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Zap, BarChart } from 'lucide-react';
import { useMLPipeline } from './MLPipelineContext';

interface DeploymentSimulationModuleProps {
  onComplete: () => void;
}

const DeploymentSimulationModule: React.FC<DeploymentSimulationModuleProps> = ({ onComplete }) => {
  const { state } = useMLPipeline();
  const [inputValues, setInputValues] = useState<{[key: string]: string}>({});
  const [prediction, setPrediction] = useState<{result: number, confidence: number, latency: number} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deploymentComplete, setDeploymentComplete] = useState(false);

  const features = state.dataset?.columns.filter(col => col !== state.targetVariable) || [];

  const simulatePrediction = async () => {
    setIsLoading(true);
    
    // Simulate API latency
    const latency = Math.random() * 200 + 50; // 50-250ms
    
    await new Promise(resolve => setTimeout(resolve, latency));
    
    // Simulate prediction result
    const result = Math.random() * 0.6 + 0.2; // 0.2-0.8
    const confidence = Math.random() * 0.3 + 0.7; // 0.7-1.0
    
    setPrediction({
      result: parseFloat(result.toFixed(3)),
      confidence: parseFloat(confidence.toFixed(3)),
      latency: Math.round(latency)
    });
    
    setIsLoading(false);
  };

  const handleCompleteDeployment = () => {
    setDeploymentComplete(true);
    onComplete();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Inference & Deployment Simulation
          </CardTitle>
          <CardDescription>
            Test your model with real-time predictions and deployment simulation
          </CardDescription>
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
                    <div className="p-3 bg-slate-100 rounded">
                      <code className="text-sm">
                        POST https://your-model-api.com/predict
                      </code>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Headers:</span>
                      <div className="text-xs bg-slate-50 p-2 rounded mt-1">
                        Content-Type: application/json<br/>
                        Authorization: Bearer your-api-key
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">API Status: Active</span>
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
                    {features.slice(0, 6).map(feature => (
                      <div key={feature} className="space-y-1">
                        <label className="text-sm font-medium">{feature}</label>
                        <Input
                          placeholder={`Enter ${feature} value...`}
                          value={inputValues[feature] || ''}
                          onChange={(e) => setInputValues(prev => ({
                            ...prev,
                            [feature]: e.target.value
                          }))}
                        />
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={simulatePrediction} 
                    className="w-full mt-4"
                    disabled={isLoading || Object.keys(inputValues).length === 0}
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
                        <div className="text-center p-3 bg-blue-50 rounded">
                          <div className="text-2xl font-bold text-blue-600">{prediction.result}</div>
                          <div className="text-sm text-blue-600">Prediction</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded">
                          <div className="text-2xl font-bold text-green-600">{(prediction.confidence * 100).toFixed(1)}%</div>
                          <div className="text-sm text-green-600">Confidence</div>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-slate-50 rounded">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Response Time:</span>
                          <Badge variant="outline">{prediction.latency}ms</Badge>
                        </div>
                      </div>

                      <div className="text-xs bg-slate-100 p-3 rounded">
                        <strong>API Response:</strong>
                        <pre className="mt-1">
{JSON.stringify({
  prediction: prediction.result,
  confidence: prediction.confidence,
  model_version: "1.0.3",
  timestamp: new Date().toISOString(),
  latency_ms: prediction.latency
}, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="mt-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart className="w-4 h-4" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Average Latency:</span>
                      <span className="font-medium">127ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Requests/sec:</span>
                      <span className="font-medium">850</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Uptime:</span>
                      <span className="font-medium text-green-600">99.9%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Error Rate:</span>
                      <span className="font-medium text-green-600">0.1%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Deployment Environment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Production: us-east-1</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Load Balancer: Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Auto-scaling: Enabled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Monitoring: Active</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={handleCompleteDeployment} disabled={deploymentComplete}>
              {deploymentComplete ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
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
