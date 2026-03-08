import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface DataPoint {
  [key: string]: string | number | boolean | null;
}

interface Dataset {
  name: string;
  data: DataPoint[];
  columns: string[];
  target?: string;
  shape: [number, number];
}

interface CleaningLog {
  action: string;
  details: string;
  timestamp: Date;
}

interface TransformationLog {
  type: string;
  column?: string;
  details: string;
}

interface TrainedModel {
  name: string;
  type: string;
  accuracy?: number;
  trainedAt: Date;
}

interface PredictionResult {
  actual: number;
  predicted: number;
  confidence: number;
}

interface MLPipelineState {
  dataset: Dataset | null;
  cleanedData: DataPoint[] | null;
  features: string[];
  target: string | null;
  targetVariable: string | null;
  model: TrainedModel | null;
  predictions: PredictionResult[];
  cleaningLogs: CleaningLog[];
  transformations: TransformationLog[];
}

interface MLPipelineContextType {
  state: MLPipelineState;
  setDataset: (dataset: Dataset) => void;
  setCleanedData: (data: DataPoint[]) => void;
  setTarget: (target: string) => void;
  addCleaningLog: (log: CleaningLog) => void;
  addTransformation: (transformation: TransformationLog) => void;
  setModel: (model: TrainedModel) => void;
  setPredictions: (predictions: PredictionResult[]) => void;
}

const MLPipelineContext = createContext<MLPipelineContextType | undefined>(undefined);

const INITIAL_STATE: MLPipelineState = {
  dataset: null,
  cleanedData: null,
  features: [],
  target: null,
  targetVariable: null,
  model: null,
  predictions: [],
  cleaningLogs: [],
  transformations: [],
};

export const MLPipelineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<MLPipelineState>(INITIAL_STATE);

  const setDataset = useCallback((dataset: Dataset) => {
    setState(prev => ({ ...prev, dataset, features: dataset.columns }));
  }, []);

  const setCleanedData = useCallback((data: DataPoint[]) => {
    setState(prev => ({ ...prev, cleanedData: data }));
  }, []);

  const setTarget = useCallback((target: string) => {
    setState(prev => ({
      ...prev,
      target,
      targetVariable: target,
      features: prev.features.filter(f => f !== target),
    }));
  }, []);

  const addCleaningLog = useCallback((log: CleaningLog) => {
    setState(prev => ({
      ...prev,
      cleaningLogs: [...prev.cleaningLogs, log],
    }));
  }, []);

  const addTransformation = useCallback((transformation: TransformationLog) => {
    setState(prev => ({
      ...prev,
      transformations: [...prev.transformations, transformation],
    }));
  }, []);

  const setModel = useCallback((model: TrainedModel) => {
    setState(prev => ({ ...prev, model }));
  }, []);

  const setPredictions = useCallback((predictions: PredictionResult[]) => {
    setState(prev => ({ ...prev, predictions }));
  }, []);

  return (
    <MLPipelineContext.Provider value={{
      state,
      setDataset,
      setCleanedData,
      setTarget,
      addCleaningLog,
      addTransformation,
      setModel,
      setPredictions,
    }}>
      {children}
    </MLPipelineContext.Provider>
  );
};

export const useMLPipeline = (): MLPipelineContextType => {
  const context = useContext(MLPipelineContext);
  if (context === undefined) {
    throw new Error('useMLPipeline must be used within a MLPipelineProvider');
  }
  return context;
};

// Re-export types for use in modules
export type { DataPoint, Dataset, CleaningLog, TransformationLog, TrainedModel, PredictionResult, MLPipelineState };
