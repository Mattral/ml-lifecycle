import React, { useState, useCallback, Suspense, lazy, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Upload, Search, Settings, Database, BarChart, CheckCircle,
  Eye, Zap, Package, Activity, GitBranch, LayoutDashboard,
  ChevronLeft, ChevronRight, HelpCircle, Sparkles, BookOpen,
  FlaskConical, Warehouse
} from 'lucide-react';
import { MLPipelineProvider } from './ml-modules/MLPipelineContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import ErrorBoundary from './ErrorBoundary';
import OnboardingWalkthrough from './ml-modules/OnboardingWalkthrough';

// Lazy-loaded modules for code splitting
const DataIngestionModule = lazy(() => import('./ml-modules/DataIngestionModule'));
const EDAModule = lazy(() => import('./ml-modules/EDAModule'));
const DataCleaningModule = lazy(() => import('./ml-modules/DataCleaningModule'));
const FeatureEngineeringModule = lazy(() => import('./ml-modules/FeatureEngineeringModule'));
const ModelTrainingModule = lazy(() => import('./ml-modules/ModelTrainingModule'));
const EvaluationModule = lazy(() => import('./ml-modules/EvaluationModule'));
const ModelInterpretabilityModule = lazy(() => import('./ml-modules/ModelInterpretabilityModule'));
const ModelPackagingModule = lazy(() => import('./ml-modules/ModelPackagingModule'));
const DeploymentSimulationModule = lazy(() => import('./ml-modules/DeploymentSimulationModule'));
const MonitoringModule = lazy(() => import('./ml-modules/MonitoringModule'));
const CICDPipelineModule = lazy(() => import('./ml-modules/CICDPipelineModule'));
const PipelineDashboardModule = lazy(() => import('./ml-modules/PipelineDashboardModule'));
const ExperimentTrackingModule = lazy(() => import('./ml-modules/ExperimentTrackingModule'));
const FeatureStoreModule = lazy(() => import('./ml-modules/FeatureStoreModule'));

interface PipelineStep {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  story: string;
  realWorld: string;
}

interface PipelinePhase {
  phase: string;
  steps: PipelineStep[];
}

const PIPELINE_PHASES: PipelinePhase[] = [
  {
    phase: 'Data',
    steps: [
      { id: 'ingestion', label: 'Data Ingestion', icon: Upload, story: 'Every ML journey starts with data. This is where you collect, validate, and prepare your raw data for the pipeline.', realWorld: 'Data engineers use tools like Apache Kafka, Airflow, and Spark to ingest data from APIs, databases, and streams.' },
      { id: 'eda', label: 'Exploration', icon: Search, story: 'Before building models, you need to understand your data — its shape, patterns, and quirks.', realWorld: 'Data scientists use Jupyter notebooks with pandas, matplotlib, and seaborn to explore datasets.' },
      { id: 'cleaning', label: 'Cleaning', icon: Settings, story: 'Real-world data is messy. Missing values, outliers, and inconsistencies must be handled carefully.', realWorld: 'Tools like Great Expectations and dbt help automate data quality checks in production.' },
    ]
  },
  {
    phase: 'Build',
    steps: [
      { id: 'feature-store', label: 'Feature Store', icon: Warehouse, story: 'Centralize, version, and serve features for consistent ML training and inference.', realWorld: 'Feature stores like Feast and Tecton manage features at scale, ensuring consistency between training and serving.' },
      { id: 'engineering', label: 'Features', icon: Database, story: 'Transform raw data into meaningful features that help your model learn patterns effectively.', realWorld: 'Feature stores like Feast and Tecton manage features at scale for production ML systems.' },
      { id: 'training', label: 'Training', icon: BarChart, story: 'Train your model on the prepared data. Watch it learn from patterns and improve over iterations.', realWorld: 'Teams use distributed training with PyTorch/TensorFlow on GPU clusters, tracked by MLflow or W&B.' },
      { id: 'evaluation', label: 'Evaluation', icon: CheckCircle, story: 'Measure how well your model performs. Is it accurate? Fair? Robust? This step answers those questions.', realWorld: 'Beyond accuracy, production models are evaluated for bias, fairness, and robustness.' },
    ]
  },
  {
    phase: 'Ship',
    steps: [
      { id: 'interpretability', label: 'Explain', icon: Eye, story: 'Understand WHY your model makes certain predictions. Crucial for trust and compliance.', realWorld: 'SHAP, LIME, and Captum are used to explain model decisions in regulated industries.' },
      { id: 'packaging', label: 'Package', icon: Package, story: 'Package your model with metadata, versioning, and Docker containers for reproducible deployment.', realWorld: 'Models are containerized with Docker and stored in registries like MLflow Model Registry.' },
      { id: 'deployment', label: 'Deploy', icon: Zap, story: 'Deploy your model to serve predictions in real-time via REST APIs on Kubernetes clusters.', realWorld: 'Teams use K8s, Seldon Core, or AWS SageMaker for scalable model serving with A/B testing.' },
    ]
  },
  {
    phase: 'Operate',
    steps: [
      { id: 'monitoring', label: 'Monitor', icon: Activity, story: 'Watch your model in production. Detect data drift, concept drift, and performance degradation.', realWorld: 'Tools like Evidently AI, WhyLabs, and Prometheus monitor model and data health.' },
      { id: 'experiments', label: 'Experiments', icon: FlaskConical, story: 'Track experiment runs, compare hyperparameters, and manage model artifacts systematically.', realWorld: 'MLflow, Weights & Biases, and Neptune.ai help teams track and reproduce experiments.' },
      { id: 'cicd', label: 'CI/CD', icon: GitBranch, story: 'Automate testing, validation, and retraining. Build a self-healing ML pipeline.', realWorld: 'GitHub Actions, Jenkins, and Kubeflow Pipelines automate the full ML lifecycle.' },
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, story: 'View the complete pipeline run, export summaries, and manage your ML project holistically.', realWorld: 'ML platforms provide centralized dashboards for experiment tracking and governance.' },
    ]
  }
];

const ALL_STEPS = PIPELINE_PHASES.flatMap(p => p.steps);

const STEP_COLORS = [
  'bg-step-data', 'bg-step-explore', 'bg-step-clean',
  'bg-step-engineer', 'bg-step-engineer', 'bg-step-train', 'bg-step-evaluate',
  'bg-step-interpret', 'bg-step-package', 'bg-step-deploy',
  'bg-step-monitor', 'bg-step-cicd', 'bg-step-cicd', 'bg-step-dashboard'
];

/** Loading skeleton for lazy modules */
const ModuleLoader = () => (
  <div className="space-y-4 animate-pulse" role="status" aria-label="Loading module">
    <div className="h-8 bg-muted rounded w-1/3" />
    <div className="h-4 bg-muted rounded w-2/3" />
    <div className="h-64 bg-muted rounded" />
  </div>
);

/** Compute flat step indices per phase */
const computePhaseIndices = (): Map<string, number[]> => {
  const map = new Map<string, number[]>();
  let idx = 0;
  for (const phase of PIPELINE_PHASES) {
    const indices: number[] = [];
    for (let i = 0; i < phase.steps.length; i++) {
      indices.push(idx++);
    }
    map.set(phase.phase, indices);
  }
  return map;
};

const PHASE_INDICES = computePhaseIndices();

const MLPipelineApp = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showStory, setShowStory] = useState<number | null>(null);
  const [highlightedPhase, setHighlightedPhase] = useState<string | null>(null);

  const overallProgress = (completedSteps.length / ALL_STEPS.length) * 100;

  const handleStepComplete = useCallback((stepIndex: number) => {
    setCompletedSteps(prev =>
      prev.includes(stepIndex) ? prev : [...prev, stepIndex]
    );
    if (stepIndex < ALL_STEPS.length - 1) {
      setCurrentStep(stepIndex + 1);
    }
  }, []);

  const handleHighlightPhase = useCallback((phase: string | null) => {
    setHighlightedPhase(phase);
  }, []);

  const renderModule = useMemo(() => {
    const stepId = ALL_STEPS[currentStep]?.id;
    const moduleMap: Record<string, React.ReactNode> = {
      ingestion: <DataIngestionModule onComplete={() => handleStepComplete(0)} />,
      eda: <EDAModule onComplete={() => handleStepComplete(1)} />,
      cleaning: <DataCleaningModule onComplete={() => handleStepComplete(2)} />,
      'feature-store': <FeatureStoreModule onComplete={() => handleStepComplete(3)} />,
      engineering: <FeatureEngineeringModule onComplete={() => handleStepComplete(4)} />,
      training: <ModelTrainingModule onComplete={() => handleStepComplete(5)} />,
      evaluation: <EvaluationModule onComplete={() => handleStepComplete(6)} />,
      interpretability: <ModelInterpretabilityModule onComplete={() => handleStepComplete(7)} />,
      packaging: <ModelPackagingModule onComplete={() => handleStepComplete(8)} />,
      deployment: <DeploymentSimulationModule onComplete={() => handleStepComplete(9)} />,
      monitoring: <MonitoringModule onComplete={() => handleStepComplete(10)} />,
      experiments: <ExperimentTrackingModule onComplete={() => handleStepComplete(11)} />,
      cicd: <CICDPipelineModule onComplete={() => handleStepComplete(12)} />,
      dashboard: <PipelineDashboardModule onComplete={() => handleStepComplete(13)} />,
    };
    return moduleMap[stepId] || null;
  }, [currentStep, handleStepComplete]);

  return (
    <MLPipelineProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Onboarding */}
        <OnboardingWalkthrough onHighlightPhase={handleHighlightPhase} />

        {/* Sidebar */}
        <motion.aside
          animate={{ width: sidebarCollapsed ? 64 : 300 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border relative shrink-0"
          role="navigation"
          aria-label="Pipeline stages"
        >
          {/* Header */}
          <div className="p-4 border-b border-sidebar-border">
            {!sidebarCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" aria-hidden="true" />
                  <h1 className="text-lg font-bold text-sidebar-foreground">ML Explorer</h1>
                </div>
                <p className="text-xs text-sidebar-foreground/60">End-to-End Machine Learning Journey</p>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-sidebar-foreground/60 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(overallProgress)}%</span>
                  </div>
                  <Progress value={overallProgress} className="h-1.5" aria-label={`Pipeline progress: ${Math.round(overallProgress)}%`} />
                </div>
              </motion.div>
            )}
            {sidebarCollapsed && (
              <div className="flex justify-center">
                <Sparkles className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
            )}
          </div>

          {/* Steps */}
          <div className="flex-1 overflow-y-auto py-2" role="list">
            {PIPELINE_PHASES.map((phase) => {
              const isPhaseHighlighted = highlightedPhase === phase.phase;
              const phaseStepIndices = PHASE_INDICES.get(phase.phase) ?? [];

              return (
                <div
                  key={phase.phase}
                  className={`mb-1 transition-all duration-500 ${isPhaseHighlighted ? 'bg-primary/10 rounded-lg mx-1' : ''}`}
                  role="group"
                  aria-label={`${phase.phase} phase`}
                >
                  {!sidebarCollapsed && (
                    <div className="px-4 py-2">
                      <span className={`text-[10px] font-semibold uppercase tracking-widest transition-colors duration-300 ${isPhaseHighlighted ? 'text-primary' : 'text-sidebar-foreground/40'}`}>
                        {phase.phase}
                      </span>
                    </div>
                  )}
                  {phase.steps.map((step, localIdx) => {
                    const stepIdx = phaseStepIndices[localIdx];
                    const isActive = currentStep === stepIdx;
                    const isComplete = completedSteps.includes(stepIdx);
                    const StepIcon = step.icon;

                    return (
                      <button
                        key={step.id}
                        onClick={() => setCurrentStep(stepIdx)}
                        role="listitem"
                        aria-current={isActive ? 'step' : undefined}
                        aria-label={`${step.label}${isComplete ? ' (completed)' : ''}`}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-200 group relative ${
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-foreground'
                            : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-r"
                          />
                        )}
                        <div className={`step-indicator shrink-0 ${
                          isComplete
                            ? 'step-indicator-complete'
                            : isActive
                            ? `${STEP_COLORS[stepIdx] ?? 'bg-primary'} text-white step-indicator-active`
                            : 'bg-sidebar-accent text-sidebar-foreground/50'
                        }`}>
                          {isComplete ? (
                            <CheckCircle className="w-4 h-4" aria-hidden="true" />
                          ) : (
                            <StepIcon className="w-4 h-4" aria-hidden="true" />
                          )}
                        </div>
                        {!sidebarCollapsed && (
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium truncate">{step.label}</div>
                            {isActive && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="text-[11px] text-sidebar-foreground/50 mt-0.5 line-clamp-2"
                              >
                                {step.story}
                              </motion.div>
                            )}
                          </div>
                        )}
                        {!sidebarCollapsed && isComplete && (
                          <Badge variant="outline" className="text-[10px] border-success/30 text-success shrink-0">
                            Done
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Collapse button */}
          <div className="p-2 border-t border-sidebar-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto" role="main">
          {/* Top Bar */}
          <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${completedSteps.includes(currentStep) ? 'bg-success' : 'bg-primary animate-pulse-soft'}`}
                    aria-hidden="true"
                  />
                  <h2 className="text-lg font-semibold">
                    {ALL_STEPS[currentStep]?.label}
                  </h2>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Step {currentStep + 1} of {ALL_STEPS.length}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowStory(showStory === currentStep ? null : currentStep)}
                      aria-label="Show production insight"
                    >
                      <BookOpen className="w-4 h-4 mr-1" aria-hidden="true" />
                      <span className="text-xs">Real World</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>See how this works in production</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-8 h-8" aria-label="Help">
                      <HelpCircle className="w-4 h-4" aria-hidden="true" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    {ALL_STEPS[currentStep]?.story}
                  </TooltipContent>
                </Tooltip>

                <div className="flex gap-1" role="group" aria-label="Step navigation">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentStep === 0}
                    onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                    aria-label="Previous step"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentStep === ALL_STEPS.length - 1}
                    onClick={() => setCurrentStep(prev => Math.min(ALL_STEPS.length - 1, prev + 1))}
                    aria-label="Next step"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Real world context bar */}
            <AnimatePresence>
              {showStory === currentStep && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10"
                  role="complementary"
                  aria-label="Production insight"
                >
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-xs font-medium text-primary mb-1">Production Insight</p>
                      <p className="text-xs text-muted-foreground">{ALL_STEPS[currentStep]?.realWorld}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </header>

          {/* Module Content */}
          <div className="p-6 max-w-7xl mx-auto">
            <ErrorBoundary fallbackTitle="Module Error" onReset={() => setCurrentStep(0)}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Suspense fallback={<ModuleLoader />}>
                    {renderModule}
                  </Suspense>
                </motion.div>
              </AnimatePresence>
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </MLPipelineProvider>
  );
};

export default MLPipelineApp;
