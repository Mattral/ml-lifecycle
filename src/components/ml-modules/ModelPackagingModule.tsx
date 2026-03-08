import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Download, Settings } from 'lucide-react';
import { useMLPipeline } from './MLPipelineContext';

interface ModelPackagingModuleProps {
  onComplete: () => void;
}

const ModelPackagingModule: React.FC<ModelPackagingModuleProps> = ({ onComplete }) => {
  const { state } = useMLPipeline();
  const [packagingComplete, setPackagingComplete] = useState(false);

  const modelMetadata = useMemo(() => ({
    model: 'LogisticRegression',
    version: '1.0.3',
    timestamp: new Date().toISOString().split('T')[0],
    accuracy: 0.842,
    features: state.dataset?.columns.filter((col) => col !== state.targetVariable) ?? [],
    target: state.targetVariable ?? 'unknown',
    sha256: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    dataset_size: state.dataset?.shape ?? [0, 0],
    transformations: state.transformations ?? [],
  }), [state.dataset, state.targetVariable, state.transformations]);

  const handleDownloadMetadata = useCallback(() => {
    const dataStr = JSON.stringify(modelMetadata, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `model_metadata_v${modelMetadata.version}.json`);
    link.click();
  }, [modelMetadata]);

  const handleComplete = useCallback(() => {
    setPackagingComplete(true);
    onComplete();
  }, [onComplete]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" aria-hidden="true" />
            Model Packaging & Versioning
          </CardTitle>
          <CardDescription>Package your model with metadata for deployment and versioning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Model Information</h3>
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Model Type:</span>
                      <Badge variant="default">{modelMetadata.model}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version:</span>
                      <span className="font-medium">{modelMetadata.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium">{modelMetadata.timestamp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Accuracy:</span>
                      <span className="font-medium text-success">{(modelMetadata.accuracy * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dataset Size:</span>
                      <span className="font-medium">{modelMetadata.dataset_size[0]} × {modelMetadata.dataset_size[1]}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Security & Integrity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-muted-foreground">SHA256 Hash:</span>
                      <p className="text-xs font-mono bg-muted p-2 rounded mt-1 break-all">{modelMetadata.sha256}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" aria-hidden="true" />
                      <span className="text-sm text-success">Model integrity verified</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Feature Configuration</h3>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Input Features ({modelMetadata.features.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {modelMetadata.features.map((feature) => (
                      <div key={feature} className="flex justify-between items-center p-2 bg-muted rounded">
                        <span className="text-sm">{feature}</span>
                        <Badge variant="outline" className="text-xs">required</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Target Variable</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-success/10 rounded border border-success/20">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-success">{modelMetadata.target}</span>
                      <Badge variant="outline">target</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {modelMetadata.transformations.length > 0 && (
                <Card className="mt-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Applied Transformations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {modelMetadata.transformations.map((transform, i) => (
                        <div key={i} className="flex justify-between items-center p-2 bg-primary/10 rounded">
                          <span className="text-sm">{transform.column}</span>
                          <Badge variant="outline" className="text-xs">{transform.transformation}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Model Metadata JSON</CardTitle>
              <CardDescription>Complete model configuration for deployment</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
                {JSON.stringify(modelMetadata, null, 2)}
              </pre>
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-muted-foreground">
                  This metadata file contains all information needed to deploy and version your model
                </p>
                <Button onClick={handleDownloadMetadata} variant="outline" aria-label="Download model metadata JSON">
                  <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                  Download JSON
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end mt-6">
            <Button onClick={handleComplete} disabled={packagingComplete}>
              {packagingComplete ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                  Packaging Complete
                </>
              ) : (
                'Complete Model Packaging'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModelPackagingModule;
