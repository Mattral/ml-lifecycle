import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, BarChart, TrendingUp, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMLPipeline } from './MLPipelineContext';

interface MonitoringModuleProps {
  onComplete: () => void;
}

interface MonitoringDataPoint {
  timestamp: string;
  accuracy: number;
  latency: number;
  requests: number;
  drift_score: number;
}

interface DriftAnalysis {
  feature: string;
  training_mean: string;
  live_mean: string;
  drift_score: number;
  status: 'drift' | 'stable';
}

const MonitoringModule: React.FC<MonitoringModuleProps> = ({ onComplete }) => {
  const { state } = useMLPipeline();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [driftDetected, setDriftDetected] = useState(false);
  const [monitoringData, setMonitoringData] = useState<MonitoringDataPoint[]>([]);
  const [monitoringComplete, setMonitoringComplete] = useState(false);

  const features = state.dataset?.columns.filter((col) => col !== state.targetVariable) ?? [];

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      const newPoint: MonitoringDataPoint = {
        timestamp: new Date().toLocaleTimeString(),
        accuracy: 0.85 + (Math.random() - 0.5) * 0.1,
        latency: 120 + Math.random() * 60,
        requests: Math.floor(Math.random() * 100) + 50,
        drift_score: Math.random() * 0.3,
      };

      setMonitoringData((prev) => [...prev.slice(-19), newPoint]);

      if (newPoint.drift_score > 0.2 && Math.random() > 0.7) {
        setDriftDetected(true);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  // Memoize drift analysis with stable seeded values
  const driftAnalysis: DriftAnalysis[] = useMemo(() => {
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    return features.slice(0, 5).map((feature, i) => ({
      feature,
      training_mean: (seededRandom(i + 1) * 100).toFixed(2),
      live_mean: (seededRandom(i + 50) * 100).toFixed(2),
      drift_score: seededRandom(i + 100) * 0.4,
      status: seededRandom(i + 100) * 0.4 > 0.2 ? 'drift' : 'stable',
    }));
  }, [features]);

  const handleStartMonitoring = useCallback(() => {
    setIsMonitoring(true);
    setMonitoringData([]);
    setDriftDetected(false);
  }, []);

  const handleStopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  const handleComplete = useCallback(() => {
    setMonitoringComplete(true);
    onComplete();
  }, [onComplete]);

  const lastDataPoint = monitoringData[monitoringData.length - 1];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-5 h-5" aria-hidden="true" />
            Monitoring & Drift Detection
          </CardTitle>
          <CardDescription>Monitor model performance and detect data drift in real-time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Live Model Monitoring</h3>
                <div className="flex gap-2">
                  <Button onClick={handleStartMonitoring} disabled={isMonitoring} variant={isMonitoring ? 'outline' : 'default'}>
                    {isMonitoring ? 'Monitoring...' : 'Start Monitoring'}
                  </Button>
                  {isMonitoring && (
                    <Button onClick={handleStopMonitoring} variant="outline">Stop</Button>
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
                        <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--primary))" strokeWidth={2} name="Accuracy" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-48 bg-primary/10 rounded flex items-center justify-center">
                      <div className="text-center">
                        <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" aria-hidden="true" />
                        <p className="text-sm text-muted-foreground">Start monitoring to see live metrics</p>
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
                      <span className="text-muted-foreground">Model Status:</span>
                      <Badge variant={isMonitoring ? 'default' : 'secondary'}>{isMonitoring ? 'Active' : 'Idle'}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Accuracy:</span>
                      <span className="font-medium">
                        {lastDataPoint ? `${(lastDataPoint.accuracy * 100).toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average Latency:</span>
                      <span className="font-medium">
                        {lastDataPoint ? `${Math.round(lastDataPoint.latency)}ms` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Requests/min:</span>
                      <span className="font-medium">
                        {lastDataPoint ? lastDataPoint.requests : 'N/A'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Data Drift Detection</h3>

              {driftDetected && (
                <Card className="mb-4 border-destructive/30 bg-destructive/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-destructive" aria-hidden="true" />
                      <span className="font-medium text-destructive">Drift Alert Triggered!</span>
                    </div>
                    <p className="text-sm text-destructive/80 mt-1">
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
                    {driftAnalysis.map((analysis) => (
                      <div
                        key={analysis.feature}
                        className={`p-3 rounded border ${
                          analysis.status === 'drift'
                            ? 'bg-destructive/10 border-destructive/20'
                            : 'bg-success/10 border-success/20'
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
                            <span className="text-muted-foreground">Training Mean: </span>
                            <span>{analysis.training_mean}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Live Mean: </span>
                            <span>{analysis.live_mean}</span>
                          </div>
                        </div>
                        <div className="mt-1">
                          <span className="text-xs text-muted-foreground">Drift Score: </span>
                          <span className={`text-xs ${analysis.drift_score > 0.2 ? 'text-destructive' : 'text-success'}`}>
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
                      <span className="text-muted-foreground">Alert Threshold:</span>
                      <Badge variant="outline">0.2</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Retrain Threshold:</span>
                      <Badge variant="outline">0.3</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check Frequency:</span>
                      <Badge variant="outline">Hourly</Badge>
                    </div>
                    {driftDetected && (
                      <Button className="w-full mt-3" variant="outline">Trigger Retraining Pipeline</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={handleComplete} disabled={monitoringComplete}>
              {monitoringComplete ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" aria-hidden="true" />
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
