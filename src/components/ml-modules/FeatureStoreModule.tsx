import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Database, Clock, Tag, Plus, Search, RefreshCw, Zap, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMLPipeline } from './MLPipelineContext';

interface FeatureStoreModuleProps {
  onComplete: () => void;
}

interface Feature {
  id: string;
  name: string;
  type: 'numerical' | 'categorical' | 'embedding' | 'timestamp';
  source: string;
  version: number;
  description: string;
  freshness: string;
  status: 'active' | 'deprecated' | 'draft';
  createdAt: Date;
  stats: { mean?: number; stddev?: number; nullPct: number; unique?: number };
}

const SAMPLE_FEATURES: Feature[] = [
  { id: 'f1', name: 'user_purchase_count_30d', type: 'numerical', source: 'transactions_db', version: 3, description: 'Number of purchases in last 30 days', freshness: '1h', status: 'active', createdAt: new Date('2025-12-01'), stats: { mean: 4.2, stddev: 2.1, nullPct: 0.01 } },
  { id: 'f2', name: 'user_avg_session_duration', type: 'numerical', source: 'analytics_stream', version: 2, description: 'Average session duration in seconds', freshness: '15m', status: 'active', createdAt: new Date('2025-11-15'), stats: { mean: 342, stddev: 180, nullPct: 0.03 } },
  { id: 'f3', name: 'product_category', type: 'categorical', source: 'product_catalog', version: 1, description: 'Product category label', freshness: '24h', status: 'active', createdAt: new Date('2025-10-20'), stats: { unique: 24, nullPct: 0.0 } },
  { id: 'f4', name: 'user_embedding_v2', type: 'embedding', source: 'ml_pipeline', version: 2, description: '128-dim user behavior embedding', freshness: '6h', status: 'active', createdAt: new Date('2026-01-10'), stats: { nullPct: 0.02 } },
  { id: 'f5', name: 'last_login_timestamp', type: 'timestamp', source: 'auth_service', version: 1, description: 'Last login UTC timestamp', freshness: '5m', status: 'active', createdAt: new Date('2025-09-05'), stats: { nullPct: 0.0 } },
  { id: 'f6', name: 'user_lifetime_value_v1', type: 'numerical', source: 'analytics_db', version: 1, description: 'Deprecated LTV calculation', freshness: 'N/A', status: 'deprecated', createdAt: new Date('2025-06-01'), stats: { mean: 120, stddev: 85, nullPct: 0.15 } },
];

const FeatureStoreModule: React.FC<FeatureStoreModuleProps> = ({ onComplete }) => {
  const { state } = useMLPipeline();
  const [features, setFeatures] = useState<Feature[]>(SAMPLE_FEATURES);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFeatureName, setNewFeatureName] = useState('');
  const [newFeatureType, setNewFeatureType] = useState<Feature['type']>('numerical');
  const [newFeatureSource, setNewFeatureSource] = useState('');
  const [newFeatureDesc, setNewFeatureDesc] = useState('');
  const [servingSimulating, setServingSimulating] = useState(false);
  const [servingResult, setServingResult] = useState<any>(null);
  const [moduleComplete, setModuleComplete] = useState(false);

  const filteredFeatures = features.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || f.type === filterType;
    const matchesStatus = filterStatus === 'all' || f.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const addFeature = () => {
    if (!newFeatureName.trim()) return;
    const feature: Feature = {
      id: `f-${Date.now()}`,
      name: newFeatureName.trim().replace(/\s+/g, '_').toLowerCase(),
      type: newFeatureType,
      source: newFeatureSource || 'manual_entry',
      version: 1,
      description: newFeatureDesc || 'Custom feature',
      freshness: 'N/A',
      status: 'draft',
      createdAt: new Date(),
      stats: { nullPct: 0 },
    };
    setFeatures(prev => [feature, ...prev]);
    setNewFeatureName('');
    setNewFeatureSource('');
    setNewFeatureDesc('');
    setShowAddForm(false);
  };

  const bumpVersion = (id: string) => {
    setFeatures(prev => prev.map(f => f.id === id ? { ...f, version: f.version + 1 } : f));
  };

  const simulateServing = async () => {
    setServingSimulating(true);
    setServingResult(null);
    await new Promise(resolve => setTimeout(resolve, 1200));
    const activeFeatures = features.filter(f => f.status === 'active');
    const result = Object.fromEntries(
      activeFeatures.map(f => [f.name, f.type === 'numerical' ? (Math.random() * 100).toFixed(2) : f.type === 'categorical' ? 'category_A' : f.type === 'embedding' ? '[0.12, -0.34, ...]' : new Date().toISOString()])
    );
    setServingResult(result);
    setServingSimulating(false);
  };

  const handleComplete = () => {
    setModuleComplete(true);
    onComplete();
  };

  const getTypeBadgeVariant = (type: Feature['type']) => {
    switch (type) {
      case 'numerical': return 'default';
      case 'categorical': return 'secondary';
      case 'embedding': return 'outline';
      case 'timestamp': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="module-header">
        <h2>Feature Store</h2>
        <p>Store, version, discover, and serve features for production ML systems</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Features', value: features.length, icon: Database },
          { label: 'Active', value: features.filter(f => f.status === 'active').length, icon: Zap },
          { label: 'Versions', value: features.reduce((s, f) => s + f.version, 0), icon: History },
          { label: 'Sources', value: new Set(features.map(f => f.source)).size, icon: RefreshCw },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className="w-4 h-4 text-muted-foreground" />
              <span className="stat-card-label">{s.label}</span>
            </div>
            <div className="stat-card-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Feature Registry */}
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-base flex items-center gap-2"><Database className="w-4 h-4" /> Feature Registry</CardTitle>
                  <CardDescription>{filteredFeatures.length} features</CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={() => setShowAddForm(!showAddForm)}>
                  <Plus className="w-4 h-4 mr-1" /> Register Feature
                </Button>
              </div>
              {/* Filters */}
              <div className="flex flex-wrap gap-2 mt-3">
                <div className="relative flex-1 min-w-[150px]">
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                  <Input placeholder="Search features..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-8 text-sm h-9" />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[130px] text-sm h-9"><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="numerical">Numerical</SelectItem>
                    <SelectItem value="categorical">Categorical</SelectItem>
                    <SelectItem value="embedding">Embedding</SelectItem>
                    <SelectItem value="timestamp">Timestamp</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[130px] text-sm h-9"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="deprecated">Deprecated</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <AnimatePresence>
                {showAddForm && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 p-4 rounded-lg border border-border bg-card space-y-3 overflow-hidden">
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="feature_name" value={newFeatureName} onChange={e => setNewFeatureName(e.target.value)} className="text-sm" />
                      <Select value={newFeatureType} onValueChange={v => setNewFeatureType(v as Feature['type'])}>
                        <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="numerical">Numerical</SelectItem>
                          <SelectItem value="categorical">Categorical</SelectItem>
                          <SelectItem value="embedding">Embedding</SelectItem>
                          <SelectItem value="timestamp">Timestamp</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Input placeholder="Data source" value={newFeatureSource} onChange={e => setNewFeatureSource(e.target.value)} className="text-sm" />
                    <Input placeholder="Description" value={newFeatureDesc} onChange={e => setNewFeatureDesc(e.target.value)} className="text-sm" />
                    <Button size="sm" onClick={addFeature} disabled={!newFeatureName.trim()}>Register</Button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">Version</TableHead>
                      <TableHead className="text-xs">Source</TableHead>
                      <TableHead className="text-xs">Freshness</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFeatures.map(f => (
                      <TableRow key={f.id} className={`cursor-pointer ${selectedFeature?.id === f.id ? 'bg-primary/5' : ''}`} onClick={() => setSelectedFeature(f)}>
                        <TableCell className="text-xs font-mono font-medium">{f.name}</TableCell>
                        <TableCell><Badge variant={getTypeBadgeVariant(f.type)} className="text-[10px]">{f.type}</Badge></TableCell>
                        <TableCell className="text-xs"><Badge variant="outline" className="text-[10px]">v{f.version}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{f.source}</TableCell>
                        <TableCell className="text-xs"><div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {f.freshness}</div></TableCell>
                        <TableCell>
                          <Badge variant={f.status === 'active' ? 'default' : f.status === 'deprecated' ? 'destructive' : 'secondary'} className="text-[10px]">
                            {f.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={e => { e.stopPropagation(); bumpVersion(f.id); }}>
                            <Tag className="w-3 h-3 mr-1" /> Bump
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detail & Serving */}
        <div className="space-y-4">
          {/* Feature Detail */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Feature Detail</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedFeature ? (
                <div className="space-y-3 text-sm">
                  <div><span className="text-muted-foreground">Name:</span> <span className="font-mono text-xs">{selectedFeature.name}</span></div>
                  <div><span className="text-muted-foreground">Description:</span> <span className="text-xs">{selectedFeature.description}</span></div>
                  <div><span className="text-muted-foreground">Type:</span> <Badge variant="outline" className="text-[10px] ml-1">{selectedFeature.type}</Badge></div>
                  <div><span className="text-muted-foreground">Version:</span> v{selectedFeature.version}</div>
                  <div className="pt-2 border-t border-border">
                    <div className="text-xs text-muted-foreground mb-1">Statistics</div>
                    {selectedFeature.stats.mean !== undefined && <div className="text-xs">Mean: {selectedFeature.stats.mean}</div>}
                    {selectedFeature.stats.stddev !== undefined && <div className="text-xs">Std Dev: {selectedFeature.stats.stddev}</div>}
                    {selectedFeature.stats.unique !== undefined && <div className="text-xs">Unique: {selectedFeature.stats.unique}</div>}
                    <div className="text-xs">Null %: {(selectedFeature.stats.nullPct * 100).toFixed(1)}%</div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Click a feature to see details</p>
              )}
            </CardContent>
          </Card>

          {/* Online Serving */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Zap className="w-4 h-4" /> Online Serving</CardTitle>
              <CardDescription>Simulate fetching feature vectors at inference time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button size="sm" className="w-full" onClick={simulateServing} disabled={servingSimulating}>
                {servingSimulating ? (
                  <><RefreshCw className="w-4 h-4 mr-1 animate-spin" /> Fetching...</>
                ) : (
                  <><Zap className="w-4 h-4 mr-1" /> Fetch Feature Vector</>
                )}
              </Button>
              {servingResult && (
                <motion.pre initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-mono bg-muted/50 p-3 rounded-lg overflow-x-auto text-muted-foreground max-h-48 overflow-y-auto">
                  {JSON.stringify(servingResult, null, 2)}
                </motion.pre>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {features.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleComplete} disabled={moduleComplete}>
            {moduleComplete ? (
              <><CheckCircle className="w-4 h-4 mr-2" /> Feature Store Complete</>
            ) : (
              'Complete Feature Store'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FeatureStoreModule;
