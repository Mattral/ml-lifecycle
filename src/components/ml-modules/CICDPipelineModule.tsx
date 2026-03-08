import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, GitBranch, Play, Clock, AlertTriangle, Terminal, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMLPipeline } from './MLPipelineContext';

interface CICDPipelineModuleProps {
  onComplete: () => void;
}

interface PipelineStage {
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  duration?: number;
  logs: string[];
}

const CICDPipelineModule: React.FC<CICDPipelineModuleProps> = ({ onComplete }) => {
  const { state } = useMLPipeline();
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineComplete, setPipelineComplete] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(-1);
  const [stages, setStages] = useState<PipelineStage[]>([
    { name: 'Code Checkout', status: 'pending', logs: [] },
    { name: 'Lint & Type Check', status: 'pending', logs: [] },
    { name: 'Unit Tests', status: 'pending', logs: [] },
    { name: 'Data Validation', status: 'pending', logs: [] },
    { name: 'Model Training', status: 'pending', logs: [] },
    { name: 'Accuracy Threshold Check', status: 'pending', logs: [] },
    { name: 'Build Docker Image', status: 'pending', logs: [] },
    { name: 'Push to Registry', status: 'pending', logs: [] },
    { name: 'Deploy to Staging', status: 'pending', logs: [] },
    { name: 'Integration Tests', status: 'pending', logs: [] },
    { name: 'Deploy to Production', status: 'pending', logs: [] },
  ]);
  const [retrainingTriggered, setRetrainingTriggered] = useState(false);
  const [moduleComplete, setModuleComplete] = useState(false);

  const stageLogs: Record<string, string[]> = {
    'Code Checkout': ['Cloning repository...', 'git checkout main', 'HEAD is now at a1b2c3d', '✓ Code checkout complete'],
    'Lint & Type Check': ['Running eslint...', 'Running mypy type checks...', '0 errors, 0 warnings', '✓ All checks passed'],
    'Unit Tests': ['pytest tests/ -v', 'test_data_pipeline.py ✓', 'test_feature_eng.py ✓', 'test_model.py ✓', '12 passed, 0 failed', '✓ All tests passed'],
    'Data Validation': ['Checking data schema...', 'Validating feature distributions...', 'Checking for data drift...', 'PSI scores within threshold', '✓ Data validation passed'],
    'Model Training': ['Loading training data...', 'Training model (epoch 1/10)...', 'Training model (epoch 10/10)...', 'Final accuracy: 0.842', '✓ Training complete'],
    'Accuracy Threshold Check': ['Minimum accuracy: 0.80', 'Current accuracy: 0.842', 'Accuracy ≥ threshold ✓', '✓ Accuracy check passed'],
    'Build Docker Image': ['Building Dockerfile...', 'Step 1/8: FROM python:3.11-slim', 'Step 8/8: CMD ["uvicorn", "app:app"]', 'Image size: 342MB', '✓ Docker image built'],
    'Push to Registry': ['Tagging image: v1.0.3', 'Pushing to ghcr.io/ml-pipeline...', 'sha256:a1b2c3d4e5f6...', '✓ Image pushed to registry'],
    'Deploy to Staging': ['Applying K8s manifests...', 'deployment.apps/ml-model configured', 'Waiting for rollout...', 'Rollout complete: 3/3 replicas ready', '✓ Deployed to staging'],
    'Integration Tests': ['Running smoke tests...', 'Testing /predict endpoint...', 'Response time: 127ms ✓', 'Prediction accuracy: 0.84 ✓', '✓ Integration tests passed'],
    'Deploy to Production': ['Applying production manifests...', 'Canary deployment: 10% traffic...', 'Canary metrics healthy ✓', 'Rolling update: 100% traffic', '✓ Production deployment complete'],
  };

  const runPipeline = async () => {
    setPipelineRunning(true);
    setCurrentStageIndex(0);

    for (let i = 0; i < stages.length; i++) {
      setCurrentStageIndex(i);
      setStages(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'running', logs: [] } : s));

      const logs = stageLogs[stages[i].name] || ['Processing...'];
      for (const log of logs) {
        await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
        setStages(prev => prev.map((s, idx) =>
          idx === i ? { ...s, logs: [...s.logs, log] } : s
        ));
      }

      const duration = Math.floor(Math.random() * 30) + 5;
      setStages(prev => prev.map((s, idx) =>
        idx === i ? { ...s, status: 'success', duration } : s
      ));
    }

    setPipelineRunning(false);
    setPipelineComplete(true);
  };

  const triggerRetraining = async () => {
    setRetrainingTriggered(true);
    // Reset and re-run
    setStages(prev => prev.map(s => ({ ...s, status: 'pending', logs: [], duration: undefined })));
    setPipelineComplete(false);
    await new Promise(resolve => setTimeout(resolve, 500));
    runPipeline();
  };

  const handleComplete = () => {
    setModuleComplete(true);
    onComplete();
  };

  const getStatusIcon = (status: PipelineStage['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'running': return <RefreshCw className="w-4 h-4 text-primary animate-spin" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="module-header">
        <h2>CI/CD & Retraining Pipeline</h2>
        <p>Automated testing, building, and deployment of your ML model</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pipeline DAG */}
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <GitBranch className="w-4 h-4" />
                    Pipeline Stages
                  </CardTitle>
                  <CardDescription>Automated CI/CD pipeline flow</CardDescription>
                </div>
                {!pipelineRunning && !pipelineComplete && (
                  <Button onClick={runPipeline} size="sm">
                    <Play className="w-4 h-4 mr-1" />
                    Run Pipeline
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stages.map((stage, index) => (
                  <motion.div
                    key={stage.name}
                    initial={{ opacity: 0.5 }}
                    animate={{
                      opacity: stage.status !== 'pending' ? 1 : 0.5,
                      scale: stage.status === 'running' ? 1.01 : 1,
                    }}
                    className={`p-3 rounded-lg border transition-colors ${
                      stage.status === 'running'
                        ? 'border-primary/30 bg-primary/5'
                        : stage.status === 'success'
                        ? 'border-success/20 bg-success/5'
                        : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(stage.status)}
                        <span className="text-sm font-medium">{stage.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {stage.duration && (
                          <span className="text-xs text-muted-foreground">{stage.duration}s</span>
                        )}
                        <Badge
                          variant={
                            stage.status === 'success' ? 'default' :
                            stage.status === 'running' ? 'secondary' : 'outline'
                          }
                          className="text-[10px]"
                        >
                          {stage.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Logs */}
                    <AnimatePresence>
                      {stage.status === 'running' && stage.logs.length > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-2 p-2 bg-foreground/5 rounded font-mono text-[11px] text-muted-foreground overflow-hidden"
                        >
                          {stage.logs.map((log, i) => (
                            <div key={i} className="flex items-center gap-1">
                              <Terminal className="w-3 h-3 shrink-0" />
                              <span>{log}</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Connection line */}
                    {index < stages.length - 1 && (
                      <div className="flex justify-center py-1">
                        <div className={`w-0.5 h-2 ${stage.status === 'success' ? 'bg-success/30' : 'bg-border'}`} />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls & Summary */}
        <div className="space-y-4">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Pipeline Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={pipelineComplete ? 'default' : pipelineRunning ? 'secondary' : 'outline'}>
                    {pipelineComplete ? 'Complete' : pipelineRunning ? 'Running' : 'Idle'}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Stages:</span>
                  <span>{stages.filter(s => s.status === 'success').length}/{stages.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Time:</span>
                  <span>{stages.reduce((sum, s) => sum + (s.duration || 0), 0)}s</span>
                </div>
                {pipelineRunning && (
                  <Progress value={(stages.filter(s => s.status === 'success').length / stages.length) * 100} className="h-1.5" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Retraining</CardTitle>
              <CardDescription>Trigger model retraining after drift detection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-border bg-card">
                  <div className="text-xs text-muted-foreground mb-1">Trigger Conditions:</div>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    <li>• Accuracy drops below 80%</li>
                    <li>• Data drift score {">"} 0.2</li>
                    <li>• Scheduled: Weekly</li>
                    <li>• Manual trigger</li>
                  </ul>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={triggerRetraining}
                  disabled={pipelineRunning}
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  {retrainingTriggered ? 'Retrain Again' : 'Trigger Retraining'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Pipeline Config</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-[10px] font-mono bg-foreground/5 p-3 rounded-lg overflow-x-auto text-muted-foreground">
{`# .github/workflows/ml-pipeline.yml
name: ML Pipeline
on:
  push:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'

jobs:
  train-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Train Model
        run: python train.py
      - name: Build & Push
        run: docker build -t model .
      - name: Deploy
        run: kubectl apply -f k8s/`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>

      {pipelineComplete && (
        <div className="flex justify-end">
          <Button onClick={handleComplete} disabled={moduleComplete}>
            {moduleComplete ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                CI/CD Complete
              </>
            ) : (
              'Complete CI/CD Pipeline'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CICDPipelineModule;
