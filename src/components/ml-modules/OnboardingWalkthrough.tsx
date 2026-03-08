import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Sparkles, Rocket } from 'lucide-react';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '@/lib/storage';

interface OnboardingStep {
  title: string;
  description: string;
  targetPhase: string;
  emoji: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: 'Welcome to ML Explorer',
    description: 'An interactive journey through a complete machine learning pipeline — from raw data to production deployment.',
    targetPhase: 'welcome',
    emoji: '✨',
  },
  {
    title: 'Data Phase',
    description: 'Ingest data, explore patterns with interactive visualizations, and clean it for quality. Every ML project begins here.',
    targetPhase: 'Data',
    emoji: '📊',
  },
  {
    title: 'Build Phase',
    description: 'Engineer features, train models with real-time progress, and evaluate performance metrics.',
    targetPhase: 'Build',
    emoji: '🔧',
  },
  {
    title: 'Ship Phase',
    description: 'Explain model predictions, package into containers, and deploy as scalable REST APIs.',
    targetPhase: 'Ship',
    emoji: '🚀',
  },
  {
    title: 'Operate Phase',
    description: 'Monitor for drift, automate retraining with CI/CD, and track everything from a central dashboard.',
    targetPhase: 'Operate',
    emoji: '⚙️',
  },
  {
    title: 'You\'re all set',
    description: 'Navigate through each of the 14 stages to experience the full ML lifecycle. Let\'s build something great.',
    targetPhase: 'ready',
    emoji: '🎯',
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
      const timer = setTimeout(() => setIsVisible(true), 600);
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
        size="icon"
        onClick={handleRestart}
        className="fixed bottom-5 left-5 z-40 w-9 h-9 rounded-full text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/60"
        aria-label="Restart onboarding tour"
      >
        <Sparkles className="w-4 h-4" aria-hidden="true" />
      </Button>
    );
  }

  const step = ONBOARDING_STEPS[currentStep];
  const isLast = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop — subtle frosted overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-background/50 backdrop-blur-md z-50"
            onClick={handleDismiss}
            aria-hidden="true"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] max-w-[90vw]"
            role="dialog"
            aria-modal="true"
            aria-label={`Onboarding step ${currentStep + 1} of ${ONBOARDING_STEPS.length}`}
          >
            <div className="bg-card border border-border/60 rounded-3xl shadow-apple-xl overflow-hidden">
              {/* Progress bar — minimal Apple-style */}
              <div className="px-8 pt-6">
                <div className="flex items-center gap-1.5">
                  {ONBOARDING_STEPS.map((_, i) => (
                    <motion.div
                      key={i}
                      className={`h-[3px] rounded-full transition-all duration-500 ${
                        i === currentStep
                          ? 'flex-[2] bg-primary'
                          : i < currentStep
                            ? 'flex-1 bg-primary/30'
                            : 'flex-1 bg-border'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="px-8 pt-7 pb-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <div className="text-4xl mb-4" aria-hidden="true">
                      {step.emoji}
                    </div>
                    <h3 className="text-xl font-semibold text-foreground tracking-tight mb-2">
                      {step.title}
                    </h3>
                    <p className="text-[14px] text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between px-8 py-6">
                <button
                  onClick={handleDismiss}
                  className="text-[13px] text-muted-foreground/60 hover:text-muted-foreground transition-colors font-medium"
                >
                  Skip tour
                </button>
                <div className="flex items-center gap-2">
                  {currentStep > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handlePrev}
                      className="w-9 h-9 rounded-full"
                      aria-label="Previous step"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    onClick={handleNext}
                    size="sm"
                    className="rounded-full px-5 h-9 font-medium text-[13px] shadow-apple-sm"
                    aria-label={isLast ? 'Start exploring' : 'Next step'}
                  >
                    {isLast ? (
                      <>Get Started <Rocket className="w-3.5 h-3.5 ml-1.5" aria-hidden="true" /></>
                    ) : (
                      <>Continue <ChevronRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" /></>
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