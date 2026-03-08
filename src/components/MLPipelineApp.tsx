import React, { useState, useCallback, Suspense, lazy, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Upload, Search, Settings, Database, BarChart, CheckCircle,
  Eye, Zap, Package, Activity, GitBranch, LayoutDashboard,
  ChevronLeft, ChevronRight, HelpCircle, Sparkles, BookOpen,
  FlaskConical, Warehouse, PanelLeftClose, PanelLeft
} from 'lucide-react';
import { MLPipelineProvider } from './ml-modules/MLPipelineContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import ErrorBoundary from './ErrorBoundary';
import OnboardingWalkthrough from './ml-modules/OnboardingWalkthrough';

// Lazy-loaded modules
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

const ModuleLoader = () => (
  <div className="space-y-6 animate-pulse" role="status" aria-label="Loading module">
    <div className="h-8 bg-muted/60 rounded-xl w-1/4" />
    <div className="h-4 bg-muted/40 rounded-lg w-1/2" />
    <div className="h-72 bg-muted/30 rounded-2xl" />
  </div>
);

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
        <OnboardingWalkthrough onHighlightPhase={handleHighlightPhase} />

        {/* ─── Sidebar ─── */}
        <motion.aside
          animate={{ width: sidebarCollapsed ? 68 : 280 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="sidebar-refined text-sidebar-foreground flex flex-col border-r border-sidebar-border relative shrink-0"
          role="navigation"
          aria-label="Pipeline stages"
        >
          {/* Logo & Progress */}
          <div className="p-4 pb-3 border-b border-sidebar-border/60">
            <AnimatePresence mode="wait">
              {!sidebarCollapsed ? (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-apple-sm">
                      <Sparkles className="w-3.5 h-3.5 text-primary-foreground" aria-hidden="true" />
                    </div>
                    <div>
                      <h1 className="text-[14px] font-semibold text-sidebar-foreground tracking-tight leading-none">ML Explorer</h1>
                      <p className="text-[10px] text-sidebar-foreground/40 font-medium mt-0.5">Machine Learning Pipeline</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-sidebar-foreground/40 mb-1.5 font-medium">
                      <span>{completedSteps.length} of {ALL_STEPS.length} completed</span>
                      <span className="text-primary font-semibold">{Math.round(overallProgress)}%</span>
                    </div>
                    <Progress value={overallProgress} className="h-[3px]" aria-label={`Pipeline progress: ${Math.round(overallProgress)}%`} />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="collapsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-apple-sm">
                    <Sparkles className="w-3.5 h-3.5 text-primary-foreground" aria-hidden="true" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Steps */}
          <div className="flex-1 overflow-y-auto py-2 px-2 scrollbar-sidebar" role="list">
            {PIPELINE_PHASES.map((phase) => {
              const isPhaseHighlighted = highlightedPhase === phase.phase;
              const phaseStepIndices = PHASE_INDICES.get(phase.phase) ?? [];

              return (
                <div
                  key={phase.phase}
                  className={`mb-1 transition-all duration-500 rounded-xl ${isPhaseHighlighted ? 'bg-primary/8' : ''}`}
                  role="group"
                  aria-label={`${phase.phase} phase`}
                >
                  {!sidebarCollapsed && (
                    <div className="px-3 pt-3 pb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-[0.12em] transition-colors duration-300 ${
                        isPhaseHighlighted ? 'text-primary' : 'text-sidebar-foreground/25'
                      }`}>
                        {phase.phase}
                      </span>
                    </div>
                  )}

                  {sidebarCollapsed && (
                    <div className="flex justify-center py-1.5">
                      <div className="w-5 h-px bg-sidebar-border/60 rounded-full" />
                    </div>
                  )}

                  {phase.steps.map((step, localIdx) => {
                    const stepIdx = phaseStepIndices[localIdx];
                    const isActive = currentStep === stepIdx;
                    const isComplete = completedSteps.includes(stepIdx);
                    const StepIcon = step.icon;

                    return (
                      <Tooltip key={step.id}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setCurrentStep(stepIdx)}
                            role="listitem"
                            aria-current={isActive ? 'step' : undefined}
                            aria-label={`${step.label}${isComplete ? ' (completed)' : ''}`}
                            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 text-left transition-all duration-200 group relative rounded-lg mx-auto ${
                              sidebarCollapsed ? 'justify-center' : ''
                            } ${
                              isActive
                                ? 'bg-sidebar-accent/80 text-sidebar-foreground'
                                : 'text-sidebar-foreground/50 hover:text-sidebar-foreground/80 hover:bg-sidebar-accent/40'
                            }`}
                          >
                            {isActive && (
                              <motion.div
                                layoutId="activeIndicator"
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-primary rounded-r-full"
                                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                              />
                            )}

                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-500 ease-out ${
                              isComplete
                                ? 'bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]'
                                : isActive
                                  ? `${STEP_COLORS[stepIdx] ?? 'bg-primary'} text-white ring-2 ring-primary/20`
                                  : 'bg-sidebar-accent/60 text-sidebar-foreground/40'
                            }`}>
                              {isComplete ? (
                                <CheckCircle className="w-3 h-3" aria-hidden="true" />
                              ) : (
                                <StepIcon className="w-3 h-3" aria-hidden="true" />
                              )}
                            </div>

                            {!sidebarCollapsed && (
                              <div className="min-w-0 flex-1">
                                <div className="text-[12px] font-medium truncate leading-tight">{step.label}</div>
                                {isActive && (
                                  <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="text-[10px] text-sidebar-foreground/35 mt-0.5 line-clamp-1 leading-snug"
                                  >
                                    {step.story.slice(0, 60)}…
                                  </motion.p>
                                )}
                              </div>
                            )}

                            {!sidebarCollapsed && isComplete && (
                              <div className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                            )}
                          </button>
                        </TooltipTrigger>
                        {sidebarCollapsed && (
                          <TooltipContent side="right" className="font-medium">
                            {step.label}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Collapse Toggle — pinned bottom, no overlap */}
          <div className="shrink-0 p-2 border-t border-sidebar-border/40">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full text-sidebar-foreground/30 hover:text-sidebar-foreground/60 hover:bg-sidebar-accent/40 h-7 text-[11px]"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <PanelLeft className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </motion.aside>

        {/* ─── Main Content ─── */}
        <main className="flex-1 overflow-y-auto" role="main">
          {/* Top Bar — Apple frosted glass */}
          <header className="sticky top-0 z-10 top-bar-glass px-8 py-4">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                      completedSteps.includes(currentStep) ? 'bg-success' : 'bg-primary animate-pulse-soft'
                    }`}
                    aria-hidden="true"
                  />
                  <h2 className="text-[17px] font-semibold tracking-tight">
                    {ALL_STEPS[currentStep]?.label}
                  </h2>
                </div>
                <Badge variant="secondary" className="text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                  {currentStep + 1} / {ALL_STEPS.length}
                </Badge>
              </div>

              <div className="flex items-center gap-1.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowStory(showStory === currentStep ? null : currentStep)}
                      className="text-muted-foreground hover:text-foreground h-8 px-3 rounded-full"
                      aria-label="Show production insight"
                    >
                      <BookOpen className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                      <span className="text-[12px] font-medium">Insight</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>See how this works in production</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-muted-foreground hover:text-foreground" aria-label="Help">
                      <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-[12px]">
                    {ALL_STEPS[currentStep]?.story}
                  </TooltipContent>
                </Tooltip>

                <div className="w-px h-4 bg-border/60 mx-1" />

                <div className="flex gap-0.5" role="group" aria-label="Step navigation">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={currentStep === 0}
                    onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                    className="w-8 h-8 rounded-full"
                    aria-label="Previous step"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={currentStep === ALL_STEPS.length - 1}
                    onClick={() => setCurrentStep(prev => Math.min(ALL_STEPS.length - 1, prev + 1))}
                    className="w-8 h-8 rounded-full"
                    aria-label="Next step"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Real world context */}
            <AnimatePresence>
              {showStory === currentStep && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                  className="max-w-7xl mx-auto mt-3"
                  role="complementary"
                  aria-label="Production insight"
                >
                  <div className="p-4 rounded-2xl bg-primary/[0.04] border border-primary/10">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-primary mb-0.5">Production Insight</p>
                        <p className="text-[13px] text-muted-foreground leading-relaxed">{ALL_STEPS[currentStep]?.realWorld}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </header>

          {/* Module Content */}
          <div className="p-8 max-w-7xl mx-auto">
            <ErrorBoundary fallbackTitle="Module Error" onReset={() => setCurrentStep(0)}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 20, scale: 0.98, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -12, scale: 0.98, filter: 'blur(4px)' }}
                  transition={{
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                    scale: { type: 'spring', stiffness: 300, damping: 30 },
                  }}
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