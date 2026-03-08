import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, Play, FlaskConical, BarChart3, Download, Trash2, GitCompare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMLPipeline } from './MLPipelineContext';

interface ExperimentTrackingModuleProps {
  onComplete: () => void;
}

interface ExperimentRun {
  id: string;
  name: string;
  model: string;
  hyperparams: Record<string, number | string>;
  metrics: Record<string, number>;
  artifacts: string[];
  status: 'running' | 'completed' | 'failed';
  duration: number;
  timestamp: Date;
}

const MODEL_OPTIONS = ['Random Forest', 'XGBoost', 'Logistic Regression', 'Neural Network'];

const generateRun = (name: string, model: string, customParams: Record<string, number | string>): ExperimentRun => {
  const baseMetrics: Record<string, Record<string, number>> = {
    'Random Forest': { accuracy: 0.82 + Math.random() * 0.1, f1: 0.79 + Math.random() * 0.1, precision: 0.81 + Math.random() * 0.1, recall: 0.78 + Math.random() * 0.12 },
    'XGBoost': { accuracy: 0.84 + Math.random() * 0.08, f1: 0.82 + Math.random() * 0.08, precision: 0.83 + Math.random() * 0.08, recall: 0.80 + Math.random() * 0.1 },
    'Logistic Regression': { accuracy: 0.75 + Math.random() * 0.1, f1: 0.72 + Math.random() * 0.1, precision: 0.74 + Math.random() * 0.1, recall: 0.71 + Math.random() * 0.12 },
    'Neural Network': { accuracy: 0.86 + Math.random() * 0.06, f1: 0.84 + Math.random() * 0.06, precision: 0.85 + Math.random() * 0.06, recall: 0.83 + Math.random() * 0.08 },
  };

  const metrics = Object.fromEntries(
    Object.entries(baseMetrics[model] || baseMetrics['Random Forest']).map(([k, v]) => [k, Math.min(parseFloat(v.toFixed(4)), 0.99)])
  );

  return {
    id: `run-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    model,
    hyperparams: customParams,
    metrics,
    artifacts: ['model.pkl', 'metrics.json', 'confusion_matrix.png', 'feature_importance.png'],
    status: 'completed',
    duration: Math.floor(Math.random() * 120) + 10,
    timestamp: new Date(),
  };
};

const DEFAULT_HYPERPARAMS: Record<string, Record<string, number | string>> = {
  'Random Forest': { n_estimators: 100, max_depth: 10, min_samples_split: 2 },
  'XGBoost': { n_estimators: 200, learning_rate: 0.1, max_depth: 6 },
  'Logistic Regression': { C: 1.0, max_iter: 100, solver: 'lbfgs' },
  'Neural Network': { hidden_layers: 3, neurons: 128, learning_rate: 0.001 },
};

const ExperimentTrackingModule: React.FC<ExperimentTrackingModuleProps> = ({ onComplete }) => {
  const { state: _pipelineState } = useMLPipeline();
  const [runs, setRuns] = useState<ExperimentRun[]>([]);
  const [runName, setRunName] = useState('experiment-1');
  const [selectedModel, setSelectedModel] = useState('Random Forest');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [moduleComplete, setModuleComplete] = useState(false);

  const launchRun = async () => {
    setIsRunning(true);
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    const run = generateRun(runName, selectedModel, DEFAULT_HYPERPARAMS[selectedModel]);
    setRuns(prev => [run, ...prev]);
    setRunName(`experiment-${runs.length + 2}`);
    setIsRunning(false);
  };

  const toggleCompare = (id: string) => {
    setCompareIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const deleteRun = (id: string) => {
    setRuns(prev => prev.filter(r => r.id !== id));
    setCompareIds(prev => prev.filter(x => x !== id));
  };

  const comparedRuns = runs.filter(r => compareIds.includes(r.id));
  const bestRun = runs.length > 0 ? runs.reduce((a, b) => (a.metrics.accuracy > b.metrics.accuracy ? a : b)) : null;

  const handleComplete = () => {
    setModuleComplete(true);
    onComplete();
  };

  return (
    <div className="space-y-6">
      <div className="module-header">
        <h2>Experiment Tracking</h2>
        <p>Track runs, compare hyperparameters, and manage model artifacts (MLflow-style)</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* New Run Panel */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FlaskConical className="w-4 h-4" /> New Experiment Run
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Run Name</label>
              <Input value={runName} onChange={e => setRunName(e.target.value)} className="text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Model</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MODEL_OPTIONS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Hyperparameters</label>
              <pre className="text-[10px] font-mono bg-muted/50 p-2 rounded-lg text-muted-foreground">
                {JSON.stringify(DEFAULT_HYPERPARAMS[selectedModel], null, 2)}
              </pre>
            </div>
            <Button onClick={launchRun} disabled={isRunning} className="w-full" size="sm">
              {isRunning ? (
                <><span className="animate-spin mr-1">⏳</span> Training...</>
              ) : (
                <><Play className="w-4 h-4 mr-1" /> Launch Run</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Runs Table */}
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" /> Experiment Runs
                  </CardTitle>
                  <CardDescription>{runs.length} runs logged</CardDescription>
                </div>
                {bestRun && (
                  <Badge className="text-[10px]">
                    Best: {bestRun.name} ({(bestRun.metrics.accuracy * 100).toFixed(1)}%)
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {runs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No runs yet. Launch an experiment to get started.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Compare</TableHead>
                        <TableHead className="text-xs">Name</TableHead>
                        <TableHead className="text-xs">Model</TableHead>
                        <TableHead className="text-xs">Accuracy</TableHead>
                        <TableHead className="text-xs">F1</TableHead>
                        <TableHead className="text-xs">Duration</TableHead>
                        <TableHead className="text-xs">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {runs.map(run => (
                          <motion.tr
                            key={run.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`${compareIds.includes(run.id) ? 'bg-primary/5' : ''} ${run.id === bestRun?.id ? 'border-l-2 border-l-success' : ''}`}
                          >
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={compareIds.includes(run.id)}
                                onChange={() => toggleCompare(run.id)}
                                className="accent-primary"
                              />
                            </TableCell>
                            <TableCell className="text-xs font-medium">{run.name}</TableCell>
                            <TableCell><Badge variant="outline" className="text-[10px]">{run.model}</Badge></TableCell>
                            <TableCell className="text-xs font-mono">{(run.metrics.accuracy * 100).toFixed(2)}%</TableCell>
                            <TableCell className="text-xs font-mono">{(run.metrics.f1 * 100).toFixed(2)}%</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{run.duration}s</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => deleteRun(run.id)} className="h-6 w-6 p-0">
                                <Trash2 className="w-3 h-3 text-destructive" />
                              </Button>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Comparison View */}
      {comparedRuns.length >= 2 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <GitCompare className="w-4 h-4" /> Run Comparison
              </CardTitle>
              <CardDescription>Comparing {comparedRuns.length} runs side by side</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {comparedRuns.map(run => (
                  <div key={run.id} className="p-4 rounded-xl border border-border bg-card space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{run.name}</span>
                      <Badge variant="outline" className="text-[10px]">{run.model}</Badge>
                    </div>
                    <div className="space-y-1.5">
                      {Object.entries(run.metrics).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-xs">
                          <span className="text-muted-foreground capitalize">{k}</span>
                          <span className="font-mono">{(v * 100).toFixed(2)}%</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground mb-1">Hyperparameters</div>
                      <pre className="text-[9px] font-mono bg-muted/50 p-2 rounded">
                        {JSON.stringify(run.hyperparams, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground mb-1">Artifacts</div>
                      <div className="flex flex-wrap gap-1">
                        {run.artifacts.map(a => (
                          <Badge key={a} variant="secondary" className="text-[9px] gap-1">
                            <Download className="w-2.5 h-2.5" /> {a}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {runs.length >= 2 && (
        <div className="flex justify-end">
          <Button onClick={handleComplete} disabled={moduleComplete}>
            {moduleComplete ? (
              <><CheckCircle className="w-4 h-4 mr-2" /> Tracking Complete</>
            ) : (
              'Complete Experiment Tracking'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExperimentTrackingModule;
