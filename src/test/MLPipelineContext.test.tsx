import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MLPipelineProvider, useMLPipeline } from '@/components/ml-modules/MLPipelineContext';

// Helper to test context
function TestConsumer() {
  const { state, setDataset, setTarget, setModel, addCleaningLog } = useMLPipeline();
  return (
    <div>
      <span data-testid="dataset-name">{state.dataset?.name ?? 'none'}</span>
      <span data-testid="target">{state.target ?? 'none'}</span>
      <span data-testid="model-name">{state.model?.name ?? 'none'}</span>
      <span data-testid="features">{state.features.join(',')}</span>
      <span data-testid="cleaning-logs">{state.cleaningLogs.length}</span>
      <button
        data-testid="set-dataset"
        onClick={() =>
          setDataset({
            name: 'TestData',
            data: [{ a: 1, b: 2 }],
            columns: ['a', 'b', 'target'],
            shape: [1, 3],
          })
        }
      />
      <button data-testid="set-target" onClick={() => setTarget('target')} />
      <button
        data-testid="set-model"
        onClick={() =>
          setModel({ name: 'TestModel', type: 'classifier', trainedAt: new Date() })
        }
      />
      <button
        data-testid="add-log"
        onClick={() =>
          addCleaningLog({ action: 'drop_nulls', details: 'removed 5 rows', timestamp: new Date() })
        }
      />
    </div>
  );
}

describe('MLPipelineContext', () => {
  it('throws when used outside provider', () => {
    expect(() => {
      render(<TestConsumer />);
    }).toThrow('useMLPipeline must be used within a MLPipelineProvider');
  });

  it('provides initial state', () => {
    render(
      <MLPipelineProvider>
        <TestConsumer />
      </MLPipelineProvider>
    );
    expect(screen.getByTestId('dataset-name')).toHaveTextContent('none');
    expect(screen.getByTestId('target')).toHaveTextContent('none');
    expect(screen.getByTestId('model-name')).toHaveTextContent('none');
  });

  it('sets dataset and updates features', () => {
    render(
      <MLPipelineProvider>
        <TestConsumer />
      </MLPipelineProvider>
    );
    fireEvent.click(screen.getByTestId('set-dataset'));
    expect(screen.getByTestId('dataset-name')).toHaveTextContent('TestData');
    expect(screen.getByTestId('features')).toHaveTextContent('a,b,target');
  });

  it('sets target and removes from features', () => {
    render(
      <MLPipelineProvider>
        <TestConsumer />
      </MLPipelineProvider>
    );
    fireEvent.click(screen.getByTestId('set-dataset'));
    fireEvent.click(screen.getByTestId('set-target'));
    expect(screen.getByTestId('target')).toHaveTextContent('target');
    // 'target' should be removed from features
    expect(screen.getByTestId('features').textContent).not.toContain('target');
  });

  it('sets model', () => {
    render(
      <MLPipelineProvider>
        <TestConsumer />
      </MLPipelineProvider>
    );
    fireEvent.click(screen.getByTestId('set-model'));
    expect(screen.getByTestId('model-name')).toHaveTextContent('TestModel');
  });

  it('adds cleaning logs', () => {
    render(
      <MLPipelineProvider>
        <TestConsumer />
      </MLPipelineProvider>
    );
    fireEvent.click(screen.getByTestId('add-log'));
    fireEvent.click(screen.getByTestId('add-log'));
    expect(screen.getByTestId('cleaning-logs')).toHaveTextContent('2');
  });
});
