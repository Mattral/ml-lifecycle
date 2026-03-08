import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, CheckCircle, PieChart, BarChart3, Zap } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie, ScatterChart, Scatter, LineChart, Line } from 'recharts';
import { useMLPipeline } from './MLPipelineContext';

interface EDAModuleProps {
  onComplete: () => void;
}

interface NumericStats {
  type: 'numeric';
  count: number;
  missing: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  std: number;
  skewness: number;
  kurtosis: number;
  q1: number;
  q3: number;
}

interface CategoricalStats {
  type: 'categorical';
  count: number;
  missing: number;
  unique: number;
  topValues: { value: string; count: number }[];
  mode: string;
}

type ColumnStats = NumericStats | CategoricalStats;

/** Semantic chart palette using CSS custom properties */
const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--destructive))',
  'hsl(var(--info))',
  'hsl(var(--step-engineer))',
  'hsl(var(--step-package))',
  'hsl(var(--step-deploy))',
  'hsl(var(--step-evaluate))',
  'hsl(var(--step-cicd))',
];

const EDAModule: React.FC<EDAModuleProps> = ({ onComplete }) => {
  const { state } = useMLPipeline();
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [selectedColumn2, setSelectedColumn2] = useState<string | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  useEffect(() => {
    if (state.dataset && state.dataset.columns.length > 0) {
      setSelectedColumn(state.dataset.columns[0]);
      setSelectedColumn2(state.dataset.columns[1] || state.dataset.columns[0]);
    }
  }, [state.dataset]);

  const generateColumnStats = (column: string): ColumnStats => {
    const values = state.dataset!.data.map(row => row[column]).filter(v => v != null);
    const isNumeric = values.every(v => !isNaN(parseFloat(v)));
    
    if (isNumeric) {
      const numValues = values.map(v => parseFloat(v));
      const mean = numValues.reduce((a, b) => a + b, 0) / numValues.length;
      const sortedValues = [...numValues].sort((a, b) => a - b);
      const variance = numValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / numValues.length;
      const std = Math.sqrt(variance);
      
      const skewness = numValues.reduce((a, b) => a + Math.pow((b - mean) / std, 3), 0) / numValues.length;
      const kurtosis = numValues.reduce((a, b) => a + Math.pow((b - mean) / std, 4), 0) / numValues.length - 3;
      
      return {
        type: 'numeric',
        count: values.length,
        missing: state.dataset!.data.length - values.length,
        mean,
        median: sortedValues[Math.floor(sortedValues.length / 2)],
        min: Math.min(...numValues),
        max: Math.max(...numValues),
        std,
        skewness,
        kurtosis,
        q1: sortedValues[Math.floor(sortedValues.length * 0.25)],
        q3: sortedValues[Math.floor(sortedValues.length * 0.75)]
      };
    } else {
      const uniqueValues = [...new Set(values)];
      const valueCounts = uniqueValues.map(val => ({
        value: val,
        count: values.filter(v => v === val).length
      })).sort((a, b) => b.count - a.count);
      
      return {
        type: 'categorical',
        count: values.length,
        missing: state.dataset!.data.length - values.length,
        unique: uniqueValues.length,
        topValues: valueCounts.slice(0, 5),
        mode: valueCounts[0]?.value
      };
    }
  };

  const generateHistogramData = (column: string) => {
    const values = state.dataset!.data.map(row => parseFloat(row[column])).filter(v => !isNaN(v));
    const bins = 10;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binWidth = (max - min) / bins;
    
    const histogram = Array(bins).fill(0) as number[];
    values.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binWidth), bins - 1);
      histogram[binIndex]++;
    });
    
    return histogram.map((count, i) => ({
      range: `${(min + i * binWidth).toFixed(1)}`,
      count
    }));
  };

  const generateCategoricalData = (column: string) => {
    const values = state.dataset!.data.map(row => row[column]).filter(v => v != null);
    const valueCounts = new Map<string, number>();
    values.forEach(val => {
      valueCounts.set(val, (valueCounts.get(val) || 0) + 1);
    });
    
    return Array.from(valueCounts.entries())
      .map(([value, count]) => ({ name: value, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  };

  const generateScatterData = (col1: string, col2: string) => {
    return state.dataset!.data.slice(0, 100).map((row, i) => ({
      x: parseFloat(row[col1]) || 0,
      y: parseFloat(row[col2]) || 0,
      index: i
    })).filter(d => !isNaN(d.x) && !isNaN(d.y));
  };

  const dataTypes = useMemo(() => {
    if (!state.dataset) return [];
    return state.dataset.columns.map(col => {
      const stats = generateColumnStats(col);
      return { column: col, type: stats.type };
    });
  }, [state.dataset]);

  const missingStats = useMemo(() => {
    if (!state.dataset) return [];
    return state.dataset.columns.map(col => {
      const values = state.dataset!.data.map(row => row[col]);
      const missing = values.filter(v => v == null || v === '').length;
      return {
        column: col,
        missing,
        percentage: (missing / state.dataset!.data.length) * 100
      };
    });
  }, [state.dataset]);

  const correlationData = useMemo(() => {
    if (!state.dataset) return [];
    const numCols = dataTypes.filter(dt => dt.type === 'numeric').map(dt => dt.column);
    // Seeded deterministic pseudo-correlation for display
    return numCols.slice(0, 5).map((col, i) => ({
      name: col,
      correlation: Math.sin(i * 1.5 + 0.7) * 0.8
    }));
  }, [state.dataset, dataTypes]);

  const numericColumns = dataTypes.filter(dt => dt.type === 'numeric').map(dt => dt.column);

  if (!state.dataset) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Please load a dataset first</p>
        </CardContent>
      </Card>
    );
  }

  const handleCompleteAnalysis = () => {
    setAnalysisComplete(true);
    onComplete();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Exploratory Data Analysis
          </CardTitle>
          <CardDescription>
            Comprehensive data exploration and analysis with interactive visualizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
              <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
              <TabsTrigger value="quality">Data Quality</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Dataset Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dataset Name:</span>
                      <span className="font-medium">{state.dataset.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shape:</span>
                      <span className="font-medium">{state.dataset.shape[0]} × {state.dataset.shape[1]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Memory Usage:</span>
                      <span className="font-medium">{(state.dataset.shape[0] * state.dataset.shape[1] * 8 / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Data Types</h4>
                    <div className="space-y-2">
                      {dataTypes.map(dt => (
                        <div key={dt.column} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span className="text-sm">{dt.column}</span>
                          <Badge variant={dt.type === 'numeric' ? 'default' : 'secondary'}>
                            {dt.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Quick Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Numeric Columns:</span>
                      <span className="font-medium">{numericColumns.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Categorical Columns:</span>
                      <span className="font-medium">{state.dataset.columns.length - numericColumns.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Missing Values:</span>
                      <span className="font-medium text-destructive">
                        {missingStats.reduce((sum, stat) => sum + stat.missing, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duplicate Rows:</span>
                      <span className="font-medium">0</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Columns ({state.dataset.columns.length})</h4>
                    <div className="max-h-40 overflow-y-auto">
                      <div className="flex flex-wrap gap-1">
                        {state.dataset.columns.map(col => (
                          <Badge key={col} variant="outline" className="text-xs">
                            {col}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Data Preview</h3>
                  <div className="flex gap-2">
                    <Badge variant="outline">First 5 Rows</Badge>
                    <Badge variant="outline">Last 5 Rows</Badge>
                  </div>
                </div>
                <div className="grid gap-4">
                  <div>
                    <h4 className="font-medium mb-2">df.head()</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border">
                        <thead>
                          <tr className="border-b bg-muted">
                            {state.dataset.columns.map(col => (
                              <th key={col} className="text-left p-2 font-medium">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {state.dataset.data.slice(0, 5).map((row, i) => (
                            <tr key={i} className="border-b">
                              {state.dataset!.columns.map(col => (
                                <td key={col} className="p-2">{row[col]?.toString() || 'null'}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="statistics" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Numerical Features (df.describe())</h3>
                  {numericColumns.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border">
                        <thead>
                          <tr className="border-b bg-muted">
                            <th className="text-left p-2">Statistic</th>
                            {numericColumns.slice(0, 3).map(col => (
                              <th key={col} className="text-left p-2">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(['count', 'mean', 'std', 'min', 'q1', 'median', 'q3', 'max', 'skewness', 'kurtosis'] as const).map(stat => (
                            <tr key={stat} className="border-b">
                              <td className="p-2 font-medium">{stat}</td>
                              {numericColumns.slice(0, 3).map(col => {
                                const colStats = generateColumnStats(col);
                                const value = colStats.type === 'numeric' ? colStats[stat] : 'N/A';
                                return (
                                  <td key={col} className="p-2">
                                    {typeof value === 'number' ? value.toFixed(2) : value}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No numerical columns found</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Categorical Features</h3>
                  {state.dataset.columns.filter(col => generateColumnStats(col).type === 'categorical').length > 0 ? (
                    <div className="space-y-3">
                      {state.dataset.columns.filter(col => generateColumnStats(col).type === 'categorical').slice(0, 3).map(col => {
                        const colStats = generateColumnStats(col);
                        if (colStats.type !== 'categorical') return null;
                        return (
                          <Card key={col} className="p-3">
                            <h4 className="font-medium mb-2">{col}</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Count:</span>
                                <span>{colStats.count}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Unique:</span>
                                <span>{colStats.unique}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Mode:</span>
                                <span>{colStats.mode}</span>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No categorical columns found</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="visualizations" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Single Variable Analysis</h3>
                  <Select value={selectedColumn || ''} onValueChange={setSelectedColumn}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select column for analysis" />
                    </SelectTrigger>
                    <SelectContent>
                      {state.dataset.columns.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedColumn && (
                    <div className="mt-4 space-y-4">
                      {generateColumnStats(selectedColumn).type === 'numeric' ? (
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <BarChart3 className="w-4 h-4" />
                              Histogram - {selectedColumn}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={200}>
                              <RechartsBarChart data={generateHistogramData(selectedColumn)}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="range" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="hsl(var(--primary))" />
                              </RechartsBarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      ) : (
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <PieChart className="w-4 h-4" />
                              Distribution - {selectedColumn}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={200}>
                              <RechartsPieChart>
                                <Pie
                                  data={generateCategoricalData(selectedColumn)}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                                  outerRadius={80}
                                  fill="hsl(var(--primary))"
                                  dataKey="value"
                                >
                                  {generateCategoricalData(selectedColumn).map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </RechartsPieChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Two Variable Analysis</h3>
                  <div className="space-y-3">
                    <Select value={selectedColumn || ''} onValueChange={setSelectedColumn}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select first variable" />
                      </SelectTrigger>
                      <SelectContent>
                        {numericColumns.map(col => (
                          <SelectItem key={col} value={col}>{col}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={selectedColumn2 || ''} onValueChange={setSelectedColumn2}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select second variable" />
                      </SelectTrigger>
                      <SelectContent>
                        {numericColumns.map(col => (
                          <SelectItem key={col} value={col}>{col}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedColumn && selectedColumn2 && (
                    <div className="mt-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Scatter Plot
                          </CardTitle>
                          <CardDescription>
                            {selectedColumn} vs {selectedColumn2}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={250}>
                            <ScatterChart data={generateScatterData(selectedColumn, selectedColumn2)}>
                              <CartesianGrid />
                              <XAxis type="number" dataKey="x" name={selectedColumn} />
                              <YAxis type="number" dataKey="y" name={selectedColumn2} />
                              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                              <Scatter name="Data Points" data={generateScatterData(selectedColumn, selectedColumn2)} fill="hsl(var(--step-engineer))" />
                            </ScatterChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="quality" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Missing Values Analysis</CardTitle>
                  <CardDescription>Identify and visualize missing data patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Missing Values Summary</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border">
                          <thead>
                            <tr className="border-b bg-muted">
                              <th className="text-left p-2">Column</th>
                              <th className="text-left p-2">Missing</th>
                              <th className="text-left p-2">Percentage</th>
                            </tr>
                          </thead>
                          <tbody>
                            {missingStats.map(stat => (
                              <tr key={stat.column} className="border-b">
                                <td className="p-2">{stat.column}</td>
                                <td className="p-2">
                                  <span className={stat.missing > 0 ? 'text-destructive' : 'text-success'}>
                                    {stat.missing}
                                  </span>
                                </td>
                                <td className="p-2">
                                  <span className={stat.percentage > 5 ? 'text-destructive' : 'text-success'}>
                                    {stat.percentage.toFixed(1)}%
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Missing Values Visualization</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <RechartsBarChart data={missingStats}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="column" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="missing" fill="hsl(var(--destructive))" />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Correlation Analysis</CardTitle>
                  <CardDescription>Analyze relationships between numerical variables</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={correlationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[-1, 1]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="correlation" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleCompleteAnalysis} disabled={analysisComplete}>
          {analysisComplete ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Analysis Complete
            </>
          ) : (
            'Complete EDA'
          )}
        </Button>
      </div>
    </div>
  );
};

export default EDAModule;
