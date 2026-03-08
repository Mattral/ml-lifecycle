import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft, Sparkles, Rocket } from 'lucide-react';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '@/lib/storage';

interface OnboardingStep {
  title: string;
  description: string;
  targetPhase: string;
  icon: React.ReactNode;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: 'Welcome to ML Explorer!',
    description: 'This interactive tool walks you through a complete machine learning pipeline — from raw data to production deployment. Let\'s take a quick tour!',
    targetPhase: 'welcome',
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    title: '📊 Data Phase',
    description: 'Start by ingesting data, exploring its patterns with visualizations, and cleaning it for quality. Every ML project begins here.',
    targetPhase: 'Data',
    icon: <span className="text-lg">📊</span>,
  },
  {
    title: '🔧 Build Phase',
    description: 'Engineer features, train models, and evaluate performance. This is where your data transforms into intelligence.',
    targetPhase: 'Build',
    icon: <span className="text-lg">🔧</span>,
  },
  {
    title: '🚀 Ship Phase',
    description: 'Explain predictions, package your model into Docker containers, and deploy it as a REST API on Kubernetes.',
    targetPhase: 'Ship',
    icon: <span className="text-lg">🚀</span>,
  },
  {
    title: '⚙️ Operate Phase',
    description: 'Monitor for drift, automate retraining with CI/CD, and track everything from a central dashboard. This keeps your model healthy in production.',
    targetPhase: 'Operate',
    icon: <span className="text-lg">⚙️</span>,
  },
  {
    title: 'You\'re Ready!',
    description: 'Click through each of the 14 stages to experience the full ML lifecycle. Complete them all to master the pipeline!',
    targetPhase: 'ready',
    icon: <Rocket className="w-5 h-5" />,
  },
];

const STORAGE_KEY = 'ml-explorer-onboarding-complete';

interface OnboardingWalkthroughProps {
  onHighlightPhase?: (phase: string | null) => void;
}

const OnboardingWalkthrough: React.FC<OnboardingWalkthroughProps> = ({ onHighlightPhase }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const completed = getLocalStorage<boolean>(STORAGE_KEY, false);
    if (!completed) {
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const phase = ONBOARDING_STEPS[currentStep]?.targetPhase;
    if (phase && phase !== 'welcome' && phase !== 'ready') {
      onHighlightPhase?.(phase);
    } else {
      onHighlightPhase?.(null);
    }
  }, [currentStep, onHighlightPhase]);

  const handleNext = useCallback(() => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsVisible(false);
      onHighlightPhase?.(null);
      setLocalStorage(STORAGE_KEY, true);
    }
  }, [currentStep, onHighlightPhase]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  }, [currentStep]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    onHighlightPhase?.(null);
    setLocalStorage(STORAGE_KEY, true);
  }, [onHighlightPhase]);

  const handleRestart = useCallback(() => {
    removeLocalStorage(STORAGE_KEY);
    setCurrentStep(0);
    setIsVisible(true);
  }, []);

  if (!isVisible) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRestart}
        className="fixed bottom-4 left-4 z-40 text-muted-foreground hover:text-foreground"
        aria-label="Restart onboarding tour"
      >
        <Sparkles className="w-4 h-4" aria-hidden="true" />
      </Button>
    );
  }

  const step = ONBOARDING_STEPS[currentStep];

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
            onClick={handleDismiss}
            aria-hidden="true"
          />

          {/* Tooltip Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] max-w-[90vw]"
            role="dialog"
            aria-modal="true"
            aria-label={`Onboarding step ${currentStep + 1} of ${ONBOARDING_STEPS.length}`}
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Progress dots */}
              <div className="flex items-center justify-center gap-1.5 pt-4" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={ONBOARDING_STEPS.length}>
                {ONBOARDING_STEPS.map((_, i) => (
                  <motion.div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentStep ? 'w-6 bg-primary' : i < currentStep ? 'w-1.5 bg-primary/40' : 'w-1.5 bg-border'
                    }`}
                  />
                ))}
              </div>

              {/* Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary" aria-hidden="true">
                        {step.icon}
                      </div>
                      <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between px-6 pb-5">
                <Button variant="ghost" size="sm" onClick={handleDismiss} className="text-muted-foreground">
                  <X className="w-3 h-3 mr-1" aria-hidden="true" /> Skip
                </Button>
                <div className="flex items-center gap-2">
                  {currentStep > 0 && (
                    <Button variant="outline" size="sm" onClick={handlePrev} aria-label="Previous step">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  )}
                  <Button size="sm" onClick={handleNext} aria-label={currentStep === ONBOARDING_STEPS.length - 1 ? 'Start exploring' : 'Next step'}>
                    {currentStep === ONBOARDING_STEPS.length - 1 ? (
                      <>Get Started <Rocket className="w-4 h-4 ml-1" aria-hidden="true" /></>
                    ) : (
                      <>Next <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" /></>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OnboardingWalkthrough;
