import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { useMLPipeline, type CleaningLog } from './MLPipelineContext';

interface DataCleaningModuleProps {
  onComplete: () => void;
}

interface QualityReport {
  column: string;
  missing: number;
  missingPercent: number;
  outliers: number;
  isNumeric: boolean;
  severity: 'high' | 'medium' | 'low';
}

const DataCleaningModule: React.FC<DataCleaningModuleProps> = ({ onComplete }) => {
  const { state, setCleanedData, addCleaningLog } = useMLPipeline();
  const [cleaningOptions, setCleaningOptions] = useState({
    dropMissingRows: false,
    imputeNumerical: true,
    imputeCategorical: true,
    removeOutliers: false,
  });
  const [cleaningApplied, setCleaningApplied] = useState(false);

  const analyzeDataQuality = useCallback((): QualityReport[] => {
    if (!state.dataset) return [];
    const { data, columns } = state.dataset;

    return columns.map((col) => {
      const values = data.map((row) => row[col]);
      const missing = values.filter((v) => v == null || v === '').length;
      const missingPercent = (missing / values.length) * 100;

      const nonMissing = values.filter((v) => v != null && v !== '');
      const isNumeric = nonMissing.every((v) => !isNaN(parseFloat(String(v))));

      let outliers = 0;
      if (isNumeric && nonMissing.length > 0) {
        const numValues = nonMissing.map((v) => parseFloat(String(v))).sort((a, b) => a - b);
        const q1 = numValues[Math.floor(numValues.length * 0.25)];
        const q3 = numValues[Math.floor(numValues.length * 0.75)];
        const iqr = q3 - q1;
        outliers = numValues.filter((v) => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr).length;
      }

      return {
        column: col,
        missing,
        missingPercent,
        outliers,
        isNumeric,
        severity: missingPercent > 20 ? 'high' : missingPercent > 5 ? 'medium' : 'low',
      };
    });
  }, [state.dataset]);

  const qualityReport = useMemo(() => analyzeDataQuality(), [analyzeDataQuality]);

  const applyCleaning = useCallback(() => {
    if (!state.dataset) return;
    let cleanedData = [...state.dataset.data];
    const logs: CleaningLog[] = [];

    if (cleaningOptions.dropMissingRows) {
      const originalLength = cleanedData.length;
      cleanedData = cleanedData.filter((row) =>
        Object.values(row).every((val) => val != null && val !== ''),
      );
      const removedRows = originalLength - cleanedData.length;
      if (removedRows > 0) {
        logs.push({ action: 'Drop Missing Rows', details: `Removed ${removedRows} rows with missing values`, timestamp: new Date() });
      }
    }

    if (cleaningOptions.imputeNumerical || cleaningOptions.imputeCategorical) {
      for (const report of qualityReport) {
        if (report.missing === 0) continue;

        if (report.isNumeric && cleaningOptions.imputeNumerical) {
          const numericValues = cleanedData
            .map((row) => row[report.column])
            .filter((v) => v != null && v !== '')
            .map((v) => parseFloat(String(v)));
          const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
          const roundedMean = Math.round(mean * 100) / 100;

          cleanedData = cleanedData.map((row) => ({
            ...row,
            [report.column]: row[report.column] == null || row[report.column] === '' ? roundedMean : row[report.column],
          }));

          logs.push({ action: 'Impute Numerical', details: `Imputed ${report.missing} missing values in ${report.column} with mean (${roundedMean})`, timestamp: new Date() });
        } else if (!report.isNumeric && cleaningOptions.imputeCategorical) {
          const values = cleanedData.map((row) => row[report.column]).filter((v) => v != null && v !== '');
          const freqMap = new Map<unknown, number>();
          for (const v of values) {
            freqMap.set(v, (freqMap.get(v) ?? 0) + 1);
          }
          let mode: unknown = values[0];
          let maxCount = 0;
          for (const [val, count] of freqMap) {
            if (count > maxCount) {
              mode = val;
              maxCount = count;
            }
          }

          cleanedData = cleanedData.map((row) => ({
            ...row,
            [report.column]: row[report.column] == null || row[report.column] === '' ? mode : row[report.column],
          }));

          logs.push({ action: 'Impute Categorical', details: `Imputed ${report.missing} missing values in ${report.column} with mode (${String(mode)})`, timestamp: new Date() });
        }
      }
    }

    if (cleaningOptions.removeOutliers) {
      for (const report of qualityReport) {
        if (!report.isNumeric || report.outliers === 0) continue;
        const numericValues = cleanedData.map((row) => parseFloat(String(row[report.column]))).filter((v) => !isNaN(v)).sort((a, b) => a - b);
        const q1 = numericValues[Math.floor(numericValues.length * 0.25)];
        const q3 = numericValues[Math.floor(numericValues.length * 0.75)];
        const iqr = q3 - q1;
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;

        const originalLength = cleanedData.length;
        cleanedData = cleanedData.filter((row) => {
          const val = parseFloat(String(row[report.column]));
          return isNaN(val) || (val >= lowerBound && val <= upperBound);
        });
        const removed = originalLength - cleanedData.length;
        if (removed > 0) {
          logs.push({ action: 'Remove Outliers', details: `Removed ${removed} outliers from ${report.column}`, timestamp: new Date() });
        }
      }
    }

    setCleanedData(cleanedData);
    logs.forEach((log) => addCleaningLog(log));
    setCleaningApplied(true);
  }, [state.dataset, cleaningOptions, qualityReport, setCleanedData, addCleaningLog]);

  if (!state.dataset) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Please load a dataset first</p>
        </CardContent>
      </Card>
    );
  }

  const workingData = state.cleanedData ?? state.dataset.data;

  const severityVariant = (severity: string) =>
    severity === 'high' ? 'destructive' : severity === 'medium' ? 'default' : 'secondary';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" aria-hidden="true" />
            Data Cleaning & Validation
          </CardTitle>
          <CardDescription>Identify and fix data quality issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Data Quality Report */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Data Quality Report</h3>
              <div className="space-y-3">
                {qualityReport.map((report) => (
                  <Card key={report.column} className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">{report.column}</span>
                      <Badge variant={severityVariant(report.severity)}>{report.severity}</Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Missing:</span>
                        <span className={report.missing > 0 ? 'text-destructive' : 'text-success'}>
                          {report.missing} ({report.missingPercent.toFixed(1)}%)
                        </span>
                      </div>
                      {report.isNumeric && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Outliers:</span>
                          <span className={report.outliers > 0 ? 'text-warning' : 'text-success'}>
                            {report.outliers}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span>{report.isNumeric ? 'Numerical' : 'Categorical'}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Cleaning Options */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Cleaning Options</h3>
              <div className="space-y-4">
                {[
                  { key: 'dropMissingRows' as const, label: 'Drop Missing Rows', desc: 'Remove rows with any missing values' },
                  { key: 'imputeNumerical' as const, label: 'Impute Numerical', desc: 'Fill missing numbers with mean' },
                  { key: 'imputeCategorical' as const, label: 'Impute Categorical', desc: 'Fill missing categories with mode' },
                  { key: 'removeOutliers' as const, label: 'Remove Outliers', desc: 'Remove values outside IQR bounds' },
                ].map((opt) => (
                  <div key={opt.key} className="flex items-center justify-between p-3 bg-muted rounded">
                    <div>
                      <span className="font-medium">{opt.label}</span>
                      <p className="text-sm text-muted-foreground">{opt.desc}</p>
                    </div>
                    <Switch
                      checked={cleaningOptions[opt.key]}
                      onCheckedChange={(checked) =>
                        setCleaningOptions((prev) => ({ ...prev, [opt.key]: checked }))
                      }
                      aria-label={opt.label}
                    />
                  </div>
                ))}

                <Button onClick={applyCleaning} className="w-full" disabled={cleaningApplied}>
                  {cleaningApplied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                      Cleaning Applied
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4 mr-2" aria-hidden="true" />
                      Apply Cleaning
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cleaning Logs */}
      {state.cleaningLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" aria-hidden="true" />
              Cleaning Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {state.cleaningLogs.map((log, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-success/10 rounded border border-success/20">
                  <div>
                    <span className="font-medium text-success">{log.action}</span>
                    <p className="text-sm text-success/80">{log.details}</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-success" aria-hidden="true" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Before/After Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Before vs After</CardTitle>
          <CardDescription>Dataset shape comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-destructive/10 rounded border border-destructive/20">
              <h4 className="font-medium text-destructive mb-2">Before Cleaning</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span>Rows:</span><span>{state.dataset.shape[0]}</span></div>
                <div className="flex justify-between"><span>Columns:</span><span>{state.dataset.shape[1]}</span></div>
              </div>
            </div>
            <div className="p-4 bg-success/10 rounded border border-success/20">
              <h4 className="font-medium text-success mb-2">After Cleaning</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span>Rows:</span><span>{workingData.length}</span></div>
                <div className="flex justify-between"><span>Columns:</span><span>{state.dataset.columns.length}</span></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onComplete} disabled={!cleaningApplied}>
          {cleaningApplied ? 'Continue to Feature Engineering' : 'Apply Cleaning First'}
        </Button>
      </div>
    </div>
  );
};

export default DataCleaningModule;
