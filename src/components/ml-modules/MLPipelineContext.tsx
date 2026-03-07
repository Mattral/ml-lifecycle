
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DataPoint {
  [key: string]: any;
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

interface MLPipelineState {
  dataset: Dataset | null;
  cleanedData: DataPoint[] | null;
  features: string[];
  target: string | null;
  targetVariable: string | null;
  model: any;
  predictions: any[];
  cleaningLogs: CleaningLog[];
  transformations: any[];
}

interface MLPipelineContextType {
  state: MLPipelineState;
  setDataset: (dataset: Dataset) => void;
  setCleanedData: (data: DataPoint[]) => void;
  setTarget: (target: string) => void;
  addCleaningLog: (log: CleaningLog) => void;
  addTransformation: (transformation: any) => void;
  setModel: (model: any) => void;
  setPredictions: (predictions: any[]) => void;
}

const MLPipelineContext = createContext<MLPipelineContextType | undefined>(undefined);

export const MLPipelineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<MLPipelineState>({
    dataset: null,
    cleanedData: null,
    features: [],
    target: null,
    targetVariable: null,
    model: null,
    predictions: [],
    cleaningLogs: [],
    transformations: []
  });

  const setDataset = (dataset: Dataset) => {
    setState(prev => ({ ...prev, dataset, features: dataset.columns }));
  };

  const setCleanedData = (data: DataPoint[]) => {
    setState(prev => ({ ...prev, cleanedData: data }));
  };

  const setTarget = (target: string) => {
    setState(prev => ({ 
      ...prev, 
      target,
      targetVariable: target,
      features: prev.features.filter(f => f !== target)
    }));
  };

  const addCleaningLog = (log: CleaningLog) => {
    setState(prev => ({ 
      ...prev, 
      cleaningLogs: [...prev.cleaningLogs, log]
    }));
  };

  const addTransformation = (transformation: any) => {
    setState(prev => ({ 
      ...prev, 
      transformations: [...prev.transformations, transformation]
    }));
  };

  const setModel = (model: any) => {
    setState(prev => ({ ...prev, model }));
  };

  const setPredictions = (predictions: any[]) => {
    setState(prev => ({ ...prev, predictions }));
  };

  return (
    <MLPipelineContext.Provider value={{
      state,
      setDataset,
      setCleanedData,
      setTarget,
      addCleaningLog,
      addTransformation,
      setModel,
      setPredictions
    }}>
      {children}
    </MLPipelineContext.Provider>
  );
};

export const useMLPipeline = () => {
  const context = useContext(MLPipelineContext);
  if (context === undefined) {
    throw new Error('useMLPipeline must be used within a MLPipelineProvider');
  }
  return context;
};
