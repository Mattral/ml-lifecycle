
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, BarChart, TrendingUp, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar } from 'recharts';
import { useMLPipeline } from './MLPipelineContext';

interface MonitoringModuleProps {
  onComplete: () => void;
}

const MonitoringModule: React.FC<MonitoringModuleProps> = ({ onComplete }) => {
  const { state } = useMLPipeline();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [driftDetected, setDriftDetected] = useState(false);
  const [monitoringData, setMonitoringData] = useState<any[]>([]);
  const [monitoringComplete, setMonitoringComplete] = useState(false);

  const features = state.dataset?.columns.filter(col => col !== state.targetVariable) || [];

  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(() => {
        const newDataPoint = {
          timestamp: new Date().toLocaleTimeString(),
          accuracy: 0.85 + (Math.random() - 0.5) * 0.1,
          latency: 120 + Math.random() * 60,
          requests: Math.floor(Math.random() * 100) + 50,
          drift_score: Math.random() * 0.3
        };
        
        setMonitoringData(prev => [...prev.slice(-19), newDataPoint]);
        
        // Simulate drift detection
        if (newDataPoint.drift_score > 0.2 && Math.random() > 0.7) {
          setDriftDetected(true);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  const generateDriftAnalysis = () => {
    return features.slice(0, 5).map(feature => ({
      feature,
      training_mean: (Math.random() * 100).toFixed(2),
      live_mean: (Math.random() * 100).toFixed(2),
      drift_score: Math.random() * 0.4,
      status: Math.random() > 0.7 ? 'drift' : 'stable'
    }));
  };

  const driftAnalysis = generateDriftAnalysis();

  const handleStartMonitoring = () => {
    setIsMonitoring(true);
    setMonitoringData([]);
    setDriftDetected(false);
  };

  const handleStopMonitoring = () => {
    setIsMonitoring(false);
  };

  const handleCompleteMonitoring = () => {
    setMonitoringComplete(true);
    onComplete();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-5 h-5" />
            Monitoring & Drift Detection
          </CardTitle>
          <CardDescription>
            Monitor model performance and detect data drift in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Live Model Monitoring</h3>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleStartMonitoring} 
                    disabled={isMonitoring}
                    variant={isMonitoring ? 'outline' : 'default'}
                  >
                    {isMonitoring ? 'Monitoring...' : 'Start Monitoring'}
                  </Button>
                  {isMonitoring && (
                    <Button onClick={handleStopMonitoring} variant="outline">
                      Stop
                    </Button>
                  )}
                </div>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  {monitoringData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={monitoringData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis domain={[0.7, 1]} />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="accuracy" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          name="Accuracy"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-48 bg-gradient-to-r from-blue-100 to-blue-200 rounded flex items-center justify-center">
                      <div className="text-center">
                        <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-600">Start monitoring to see live metrics</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Model Status:</span>
                      <Badge variant={isMonitoring ? 'default' : 'secondary'}>
                        {isMonitoring ? 'Active' : 'Idle'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Current Accuracy:</span>
                      <span className="font-medium">
                        {monitoringData.length > 0 
                          ? `${(monitoringData[monitoringData.length - 1]?.accuracy * 100).toFixed(1)}%`
                          : 'N/A'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Average Latency:</span>
                      <span className="font-medium">
                        {monitoringData.length > 0 
                          ? `${Math.round(monitoringData[monitoringData.length - 1]?.latency)}ms`
                          : 'N/A'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Requests/min:</span>
                      <span className="font-medium">
                        {monitoringData.length > 0 
                          ? monitoringData[monitoringData.length - 1]?.requests
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Data Drift Detection</h3>
              
              {driftDetected && (
                <Card className="mb-4 border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <span className="font-medium text-red-700">Drift Alert Triggered!</span>
                    </div>
                    <p className="text-sm text-red-600 mt-1">
                      Feature distribution shift detected. Consider model retraining.
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Feature Drift Analysis</CardTitle>
                  <CardDescription>Training vs Live Data Comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {driftAnalysis.map(analysis => (
                      <div 
                        key={analysis.feature} 
                        className={`p-3 rounded border ${
                          analysis.status === 'drift' 
                            ? 'bg-red-50 border-red-200' 
                            : 'bg-green-50 border-green-200'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{analysis.feature}</span>
                          <Badge variant={analysis.status === 'drift' ? 'destructive' : 'default'}>
                            {analysis.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-600">Training Mean: </span>
                            <span>{analysis.training_mean}</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Live Mean: </span>
                            <span>{analysis.live_mean}</span>
                          </div>
                        </div>
                        <div className="mt-1">
                          <span className="text-xs text-slate-600">Drift Score: </span>
                          <span className={`text-xs ${analysis.drift_score > 0.2 ? 'text-red-600' : 'text-green-600'}`}>
                            {analysis.drift_score.toFixed(3)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Drift Threshold Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Alert Threshold:</span>
                      <Badge variant="outline">0.2</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Retrain Threshold:</span>
                      <Badge variant="outline">0.3</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Check Frequency:</span>
                      <Badge variant="outline">Hourly</Badge>
                    </div>
                    {driftDetected && (
                      <Button className="w-full mt-3" variant="outline">
                        Trigger Retraining Pipeline
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={handleCompleteMonitoring} disabled={monitoringComplete}>
              {monitoringComplete ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Monitoring Complete
                </>
              ) : (
                'Complete Monitoring Setup'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonitoringModule;
