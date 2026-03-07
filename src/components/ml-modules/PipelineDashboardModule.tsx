import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Download, LayoutDashboard, Clock, Database, BarChart, Zap, Activity } from 'lucide-react';
import { useMLPipeline } from './MLPipelineContext';

interface PipelineDashboardModuleProps {
  onComplete: () => void;
}

const PipelineDashboardModule: React.FC<PipelineDashboardModuleProps> = ({ onComplete }) => {
  const { state } = useMLPipeline();
  const [moduleComplete, setModuleComplete] = useState(false);

  const pipelineSummary = {
    dataset: state.dataset?.name || 'N/A',
    dataset_shape: state.dataset?.shape || [0, 0],
    target_variable: state.targetVariable || state.target || 'N/A',
    model_type: state.model?.type || 'N/A',
    model_version: 'v1.0.3',
    accuracy: state.model?.finalAccuracy ? (state.model.finalAccuracy * 100).toFixed(1) + '%' : 'N/A',
    features_used: state.features?.length || 0,
    cleaning_steps: state.cleaningLogs?.length || 0,
    transformations: state.transformations?.length || 0,
    drift_detected: false,
    retrain_triggered: false,
    pipeline_duration: '3m 42s',
    timestamp: new Date().toISOString(),
  };

  const timelineSteps = [
    { step: 'Data Ingestion', status: 'complete', duration: '2s', details: `Loaded ${pipelineSummary.dataset}` },
    { step: 'Exploratory Analysis', status: 'complete', duration: '5s', details: 'Generated statistics and visualizations' },
    { step: 'Data Cleaning', status: 'complete', duration: '3s', details: `${pipelineSummary.cleaning_steps} cleaning operations applied` },
    { step: 'Feature Engineering', status: 'complete', duration: '4s', details: `${pipelineSummary.features_used} features, ${pipelineSummary.transformations} transformations` },
    { step: 'Model Training', status: 'complete', duration: '45s', details: `Trained ${pipelineSummary.model_type}` },
    { step: 'Evaluation', status: 'complete', duration: '8s', details: `Accuracy: ${pipelineSummary.accuracy}` },
    { step: 'Interpretability', status: 'complete', duration: '6s', details: 'SHAP analysis and what-if exploration' },
    { step: 'Packaging', status: 'complete', duration: '3s', details: `Version ${pipelineSummary.model_version}` },
    { step: 'Deployment', status: 'complete', duration: '15s', details: 'REST API serving on K8s' },
    { step: 'Monitoring', status: 'complete', duration: '—', details: 'Live drift detection active' },
    { step: 'CI/CD', status: 'complete', duration: '2m', details: 'Automated pipeline configured' },
  ];

  const handleExport = () => {
    const exportData = {
      ...pipelineSummary,
      timeline: timelineSteps,
      exported_at: new Date().toISOString(),
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `ml_pipeline_run_${Date.now()}.json`);
    link.click();
  };

  const handleComplete = () => {
    setModuleComplete(true);
    onComplete();
  };

  const statCards = [
    { label: 'Dataset', value: pipelineSummary.dataset, icon: Database, color: 'text-info' },
    { label: 'Model', value: pipelineSummary.model_type.replace(/-/g, ' '), icon: BarChart, color: 'text-primary' },
    { label: 'Accuracy', value: pipelineSummary.accuracy, icon: Zap, color: 'text-success' },
    { label: 'Duration', value: pipelineSummary.pipeline_duration, icon: Clock, color: 'text-warning' },
    { label: 'Features', value: String(pipelineSummary.features_used), icon: Database, color: 'text-primary' },
    { label: 'Drift', value: pipelineSummary.drift_detected ? 'Detected' : 'None', icon: Activity, color: pipelineSummary.drift_detected ? 'text-destructive' : 'text-success' },
  ];

  return (
    <div className="space-y-6">
      <div className="module-header">
        <h2>Pipeline Dashboard</h2>
        <p>Complete overview of your ML pipeline run</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <div className="text-lg font-bold truncate">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Pipeline Timeline
            </CardTitle>
            <CardDescription>Chronological view of all pipeline stages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {timelineSteps.map((step, index) => (
                <div key={step.step} className="flex gap-3 pb-4 last:pb-0 relative">
                  {/* Timeline line */}
                  {index < timelineSteps.length - 1 && (
                    <div className="absolute left-[11px] top-6 w-0.5 h-full bg-success/20" />
                  )}
                  {/* Dot */}
                  <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center shrink-0 z-10">
                    <CheckCircle className="w-3.5 h-3.5 text-success" />
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{step.step}</span>
                      <span className="text-xs text-muted-foreground">{step.duration}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary JSON & Export */}
        <div className="space-y-4">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Run Summary</CardTitle>
                  <CardDescription>Export pipeline run metadata</CardDescription>
                </div>
                <Button onClick={handleExport} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="text-[11px] font-mono bg-foreground/5 p-4 rounded-lg overflow-x-auto text-muted-foreground max-h-80 overflow-y-auto">
                {JSON.stringify(pipelineSummary, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Infrastructure</CardTitle>
              <CardDescription>Deployment configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { label: 'Container', value: 'Docker', badge: 'Active' },
                  { label: 'Orchestration', value: 'Kubernetes', badge: '3 replicas' },
                  { label: 'Registry', value: 'ghcr.io', badge: 'v1.0.3' },
                  { label: 'Monitoring', value: 'Prometheus + Grafana', badge: 'Active' },
                  { label: 'CI/CD', value: 'GitHub Actions', badge: 'Passing' },
                  { label: 'Region', value: 'us-east-1', badge: 'Primary' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/50">
                    <div>
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                      <div className="text-sm font-medium">{item.value}</div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{item.badge}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleComplete} disabled={moduleComplete}>
          {moduleComplete ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Pipeline Complete! 🎉
            </>
          ) : (
            'Complete Pipeline Journey'
          )}
        </Button>
      </div>
    </div>
  );
};

export default PipelineDashboardModule;
