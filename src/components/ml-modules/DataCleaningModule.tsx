
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Settings, Trash, CheckCircle, AlertCircle, Undo } from 'lucide-react';
import { useMLPipeline } from './MLPipelineContext';

interface DataCleaningModuleProps {
  onComplete: () => void;
}

const DataCleaningModule: React.FC<DataCleaningModuleProps> = ({ onComplete }) => {
  const { state, setCleanedData, addCleaningLog } = useMLPipeline();
  const [cleaningOptions, setCleaningOptions] = useState({
    dropMissingRows: false,
    imputeNumerical: true,
    imputeCategorical: true,
    removeOutliers: false
  });
  const [cleaningApplied, setCleaningApplied] = useState(false);

  if (!state.dataset) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-slate-600">Please load a dataset first</p>
        </CardContent>
      </Card>
    );
  }

  const analyzeDataQuality = () => {
    const data = state.dataset!.data;
    const columns = state.dataset!.columns;
    
    const qualityReport = columns.map(col => {
      const values = data.map(row => row[col]);
      const missing = values.filter(v => v == null || v === '').length;
      const missingPercent = (missing / values.length) * 100;
      
      const nonMissingValues = values.filter(v => v != null && v !== '');
      const isNumeric = nonMissingValues.every(v => !isNaN(parseFloat(v)));
      
      let outliers = 0;
      if (isNumeric && nonMissingValues.length > 0) {
        const numValues = nonMissingValues.map(v => parseFloat(v));
        const q1 = numValues.sort((a, b) => a - b)[Math.floor(numValues.length * 0.25)];
        const q3 = numValues.sort((a, b) => a - b)[Math.floor(numValues.length * 0.75)];
        const iqr = q3 - q1;
        outliers = numValues.filter(v => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr).length;
      }
      
      return {
        column: col,
        missing,
        missingPercent,
        outliers,
        isNumeric,
        severity: missingPercent > 20 ? 'high' : missingPercent > 5 ? 'medium' : 'low'
      };
    });
    
    return qualityReport;
  };

  const applyCleaning = () => {
    let cleanedData = [...state.dataset!.data];
    const logs: any[] = [];

    // Drop rows with missing values
    if (cleaningOptions.dropMissingRows) {
      const originalLength = cleanedData.length;
      cleanedData = cleanedData.filter(row => 
        Object.values(row).every(val => val != null && val !== '')
      );
      const removedRows = originalLength - cleanedData.length;
      if (removedRows > 0) {
        logs.push({
          action: 'Drop Missing Rows',
          details: `Removed ${removedRows} rows with missing values`,
          timestamp: new Date()
        });
      }
    }

    // Impute missing values
    if (cleaningOptions.imputeNumerical || cleaningOptions.imputeCategorical) {
      const qualityReport = analyzeDataQuality();
      
      qualityReport.forEach(report => {
        if (report.missing > 0) {
          if (report.isNumeric && cleaningOptions.imputeNumerical) {
            // Impute with mean
            const values = cleanedData.map(row => row[report.column])
              .filter(v => v != null && v !== '')
              .map(v => parseFloat(v));
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            
            cleanedData = cleanedData.map(row => ({
              ...row,
              [report.column]: row[report.column] == null || row[report.column] === '' 
                ? Math.round(mean * 100) / 100 
                : row[report.column]
            }));
            
            logs.push({
              action: 'Impute Numerical',
              details: `Imputed ${report.missing} missing values in ${report.column} with mean (${Math.round(mean * 100) / 100})`,
              timestamp: new Date()
            });
          } else if (!report.isNumeric && cleaningOptions.imputeCategorical) {
            // Impute with mode
            const values = cleanedData.map(row => row[report.column])
              .filter(v => v != null && v !== '');
            const mode = values.sort((a, b) =>
              values.filter(v => v === a).length - values.filter(v => v === b).length
            ).pop();
            
            cleanedData = cleanedData.map(row => ({
              ...row,
              [report.column]: row[report.column] == null || row[report.column] === '' 
                ? mode 
                : row[report.column]
            }));
            
            logs.push({
              action: 'Impute Categorical',
              details: `Imputed ${report.missing} missing values in ${report.column} with mode (${mode})`,
              timestamp: new Date()
            });
          }
        }
      });
    }

    // Remove outliers
    if (cleaningOptions.removeOutliers) {
      const qualityReport = analyzeDataQuality();
      qualityReport.forEach(report => {
        if (report.isNumeric && report.outliers > 0) {
          const values = cleanedData.map(row => parseFloat(row[report.column]))
            .filter(v => !isNaN(v));
          values.sort((a, b) => a - b);
          const q1 = values[Math.floor(values.length * 0.25)];
          const q3 = values[Math.floor(values.length * 0.75)];
          const iqr = q3 - q1;
          const lowerBound = q1 - 1.5 * iqr;
          const upperBound = q3 + 1.5 * iqr;
          
          const originalLength = cleanedData.length;
          cleanedData = cleanedData.filter(row => {
            const val = parseFloat(row[report.column]);
            return isNaN(val) || (val >= lowerBound && val <= upperBound);
          });
          const removedOutliers = originalLength - cleanedData.length;
          
          if (removedOutliers > 0) {
            logs.push({
              action: 'Remove Outliers',
              details: `Removed ${removedOutliers} outliers from ${report.column}`,
              timestamp: new Date()
            });
          }
        }
      });
    }

    setCleanedData(cleanedData);
    logs.forEach(log => addCleaningLog(log));
    setCleaningApplied(true);
  };

  const qualityReport = analyzeDataQuality();
  const workingData = state.cleanedData || state.dataset.data;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Data Cleaning & Validation
          </CardTitle>
          <CardDescription>
            Identify and fix data quality issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Data Quality Report */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Data Quality Report</h3>
              <div className="space-y-3">
                {qualityReport.map(report => (
                  <Card key={report.column} className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">{report.column}</span>
                      <Badge variant={
                        report.severity === 'high' ? 'destructive' : 
                        report.severity === 'medium' ? 'default' : 'secondary'
                      }>
                        {report.severity}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Missing:</span>
                        <span className={report.missing > 0 ? 'text-red-500' : 'text-green-500'}>
                          {report.missing} ({report.missingPercent.toFixed(1)}%)
                        </span>
                      </div>
                      {report.isNumeric && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Outliers:</span>
                          <span className={report.outliers > 0 ? 'text-orange-500' : 'text-green-500'}>
                            {report.outliers}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-600">Type:</span>
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
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                  <div>
                    <span className="font-medium">Drop Missing Rows</span>
                    <p className="text-sm text-slate-600">Remove rows with any missing values</p>
                  </div>
                  <Switch
                    checked={cleaningOptions.dropMissingRows}
                    onCheckedChange={(checked) => 
                      setCleaningOptions(prev => ({ ...prev, dropMissingRows: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                  <div>
                    <span className="font-medium">Impute Numerical</span>
                    <p className="text-sm text-slate-600">Fill missing numbers with mean</p>
                  </div>
                  <Switch
                    checked={cleaningOptions.imputeNumerical}
                    onCheckedChange={(checked) => 
                      setCleaningOptions(prev => ({ ...prev, imputeNumerical: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                  <div>
                    <span className="font-medium">Impute Categorical</span>
                    <p className="text-sm text-slate-600">Fill missing categories with mode</p>
                  </div>
                  <Switch
                    checked={cleaningOptions.imputeCategorical}
                    onCheckedChange={(checked) => 
                      setCleaningOptions(prev => ({ ...prev, imputeCategorical: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                  <div>
                    <span className="font-medium">Remove Outliers</span>
                    <p className="text-sm text-slate-600">Remove values outside IQR bounds</p>
                  </div>
                  <Switch
                    checked={cleaningOptions.removeOutliers}
                    onCheckedChange={(checked) => 
                      setCleaningOptions(prev => ({ ...prev, removeOutliers: checked }))
                    }
                  />
                </div>

                <Button 
                  onClick={applyCleaning} 
                  className="w-full"
                  disabled={cleaningApplied}
                >
                  {cleaningApplied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Cleaning Applied
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4 mr-2" />
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
              <AlertCircle className="w-5 h-5" />
              Cleaning Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {state.cleaningLogs.map((log, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
                  <div>
                    <span className="font-medium text-green-800">{log.action}</span>
                    <p className="text-sm text-green-600">{log.details}</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
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
          <CardDescription>
            Dataset shape comparison
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 rounded border border-red-200">
              <h4 className="font-medium text-red-800 mb-2">Before Cleaning</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Rows:</span>
                  <span>{state.dataset.shape[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span>Columns:</span>
                  <span>{state.dataset.shape[1]}</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">After Cleaning</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Rows:</span>
                  <span>{workingData.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Columns:</span>
                  <span>{state.dataset.columns.length}</span>
                </div>
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
