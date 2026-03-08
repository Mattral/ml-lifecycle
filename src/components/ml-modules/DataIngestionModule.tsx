import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { useMLPipeline } from './MLPipelineContext';

interface DataIngestionModuleProps {
  onComplete: () => void;
}

interface SampleDataset {
  name: string;
  description: string;
  rows: number;
  columns: number;
  target: string;
  type: 'Classification' | 'Regression';
}

const SAMPLE_DATASETS: SampleDataset[] = [
  {
    name: 'Titanic Survival',
    description: 'Classic classification problem predicting passenger survival',
    rows: 891,
    columns: 12,
    target: 'Survived',
    type: 'Classification',
  },
  {
    name: 'House Prices',
    description: 'Regression problem predicting house sale prices',
    rows: 1460,
    columns: 81,
    target: 'SalePrice',
    type: 'Regression',
  },
  {
    name: 'Customer Churn',
    description: 'Predict customer churn for telecommunications company',
    rows: 7043,
    columns: 21,
    target: 'Churn',
    type: 'Classification',
  },
];

const DataIngestionModule: React.FC<DataIngestionModuleProps> = ({ onComplete }) => {
  const { setDataset } = useMLPipeline();
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateSampleData = useCallback(
    (datasetName: string) => {
      setIsLoading(true);

      setTimeout(() => {
        let data: Record<string, string | number | null>[];
        let columns: string[];

        if (datasetName === 'Titanic Survival') {
          columns = ['PassengerId', 'Survived', 'Pclass', 'Name', 'Sex', 'Age', 'SibSp', 'Parch', 'Ticket', 'Fare', 'Cabin', 'Embarked'];
          data = Array.from({ length: 200 }, (_, i) => ({
            PassengerId: i + 1,
            Survived: Math.random() > 0.6 ? 1 : 0,
            Pclass: Math.floor(Math.random() * 3) + 1,
            Name: `Passenger ${i + 1}`,
            Sex: Math.random() > 0.5 ? 'male' : 'female',
            Age: Math.floor(Math.random() * 60) + 10,
            SibSp: Math.floor(Math.random() * 5),
            Parch: Math.floor(Math.random() * 4),
            Ticket: `T${Math.floor(Math.random() * 10000)}`,
            Fare: Math.round((Math.random() * 500 + 10) * 100) / 100,
            Cabin: Math.random() > 0.7 ? `C${Math.floor(Math.random() * 100)}` : null,
            Embarked: ['S', 'C', 'Q'][Math.floor(Math.random() * 3)],
          }));
        } else if (datasetName === 'House Prices') {
          columns = ['Id', 'SalePrice', 'LotArea', 'YearBuilt', 'BedroomAbvGr', 'FullBath', 'GarageArea', 'OverallQual', 'OverallCond'];
          data = Array.from({ length: 150 }, (_, i) => ({
            Id: i + 1,
            SalePrice: Math.floor(Math.random() * 400000) + 100000,
            LotArea: Math.floor(Math.random() * 15000) + 5000,
            YearBuilt: Math.floor(Math.random() * 50) + 1970,
            BedroomAbvGr: Math.floor(Math.random() * 5) + 1,
            FullBath: Math.floor(Math.random() * 3) + 1,
            GarageArea: Math.floor(Math.random() * 800) + 200,
            OverallQual: Math.floor(Math.random() * 10) + 1,
            OverallCond: Math.floor(Math.random() * 10) + 1,
          }));
        } else {
          columns = ['CustomerId', 'Churn', 'AccountLength', 'VoiceMailPlan', 'NumberVmailMessages', 'TotalDayMinutes', 'TotalDayCharge', 'CustomerServiceCalls'];
          data = Array.from({ length: 100 }, (_, i) => ({
            CustomerId: i + 1,
            Churn: Math.random() > 0.8 ? 'Yes' : 'No',
            AccountLength: Math.floor(Math.random() * 200) + 1,
            VoiceMailPlan: Math.random() > 0.7 ? 'Yes' : 'No',
            NumberVmailMessages: Math.floor(Math.random() * 50),
            TotalDayMinutes: Math.round((Math.random() * 300 + 50) * 100) / 100,
            TotalDayCharge: Math.round((Math.random() * 50 + 10) * 100) / 100,
            CustomerServiceCalls: Math.floor(Math.random() * 10),
          }));
        }

        setDataset({
          name: datasetName,
          data,
          columns,
          shape: [data.length, columns.length],
        });
        setIsLoading(false);
        onComplete();
      }, 1500);
    },
    [setDataset, onComplete],
  );

  const validationChecks = useMemo(
    () => [
      { label: 'Schema Validation', icon: CheckCircle },
      { label: 'Type Detection', icon: CheckCircle },
      { label: 'Missing Value Check', icon: CheckCircle },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" aria-hidden="true" />
            Data Ingestion
          </CardTitle>
          <CardDescription>Choose a dataset to begin your ML pipeline journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Sample Datasets */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Sample Datasets</h3>
              <div className="space-y-3" role="listbox" aria-label="Available datasets">
                {SAMPLE_DATASETS.map((dataset) => (
                  <Card
                    key={dataset.name}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedDataset === dataset.name ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedDataset(dataset.name)}
                    role="option"
                    aria-selected={selectedDataset === dataset.name}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedDataset(dataset.name);
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{dataset.name}</h4>
                        <Badge variant={dataset.type === 'Classification' ? 'default' : 'secondary'}>
                          {dataset.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{dataset.description}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>{dataset.rows} rows</span>
                        <span>{dataset.columns} columns</span>
                        <span>Target: {dataset.target}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedDataset && (
                <Button
                  onClick={() => generateSampleData(selectedDataset)}
                  disabled={isLoading}
                  className="w-full mt-4"
                  aria-label={isLoading ? 'Loading dataset' : `Load ${selectedDataset}`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                      Loading Dataset...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                      Load {selectedDataset}
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* File Upload */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Upload Your Data</h3>
              <Card className="border-dashed border-2 border-border hover:border-muted-foreground transition-colors">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                  <Upload className="w-12 h-12 text-muted-foreground mb-4" aria-hidden="true" />
                  <h4 className="text-lg font-medium mb-2">Upload CSV File</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop your CSV file here, or click to browse
                  </p>
                  <Button variant="outline" disabled aria-label="File upload coming soon">
                    <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
                    Choose File
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">Coming soon: Full file upload support</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Validation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" aria-hidden="true" />
            Data Validation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {validationChecks.map((check) => (
              <div key={check.label} className="flex items-center gap-2">
                <check.icon className="w-5 h-5 text-success" aria-hidden="true" />
                <span className="text-sm">{check.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataIngestionModule;
