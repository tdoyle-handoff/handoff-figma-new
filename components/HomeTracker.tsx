import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import {
  Plus,
  Home,
  Star,
  MapPin,
  DollarSign,
  Edit,
  Trash2,
  GripVertical,
  Save,
  X,
  Heart,
  Share2,
  Image as ImageIcon,
  UploadCloud
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAuth } from '../hooks/useAuth';

type InterestLabel = 'dream-home' | 'very-interested' | 'maybe' | 'not-interested';

type StatusTag = 'none' | 'very-interested' | 'touring-soon' | 'offer-made';

interface HomeUpload {
  url: string;
  name: string;
  type: string;
}

interface TrackedHome {
  id: string;
  address: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  notes: string;
  ranking: number;
  dateAdded: string;
  label: InterestLabel;
  intensity?: 1 | 2;
  status?: StatusTag;
  photoUrl?: string;
  uploads?: HomeUpload[];
  tourDate?: string;
  isSample?: boolean;
}

export default function HomeTracker() {
  const [homes, setHomes] = useState<TrackedHome[]>([]);
  const [isAddingHome, setIsAddingHome] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<InterestLabel[]>([]);
  const [sortBy, setSortBy] = useState<'ranking' | 'price' | 'date'>('ranking');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [fabOpen, setFabOpen] = useState(false);

  const [newHome, setNewHome] = useState({
    address: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    notes: '',
    label: 'very-interested' as InterestLabel,
    status: 'none' as StatusTag
  });

  const { userProfile, isGuestMode, updateUserProfile } = useAuth();
  const persistTimerRef = useRef<number | null>(null);

  // Load saved homes on mount
  useEffect(() => {
    let loaded: TrackedHome[] | null = null;
    try {
      const raw = localStorage.getItem('handoff-home-tracker');
      if (raw) {
        const parsed = JSON.parse(raw) as TrackedHome[];
        if (Array.isArray(parsed)) loaded = parsed;
      }
    } catch {}
    try {
      const dismissed = localStorage.getItem('handoff-home-tracker-sample-dismissed') === 'true';
      if (!loaded || loaded.length === 0) {
        if (!dismissed) {
          loaded = [{
            id: 'sample-home-123',
            address: '123 Main St, Demo City',
            price: '$650,000',
            bedrooms: '3',
            bathrooms: '2',
            notes: 'This is sample data. Add your first home to replace it, or remove this sample.',
            ranking: 1,
            dateAdded: new Date().toLocaleDateString(),
            label: 'very-interested',
            intensity: 1,
            status: 'very-interested',
            isSample: true,
            uploads: []
          }];
        } else {
          loaded = [];
        }
      }
    } catch {}
    if (loaded) setHomes(loaded);

    try {
      const uiRaw = localStorage.getItem('handoff-home-tracker-ui');
      if (uiRaw) {
        const ui = JSON.parse(uiRaw) as { activeFilters?: InterestLabel[]; sortBy?: 'ranking' | 'price' | 'date' };
        if (ui?.activeFilters) setActiveFilters(ui.activeFilters);
        if (ui?.sortBy) setSortBy(ui.sortBy);
      }
    } catch {}
  }, []);

  // Persist homes whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('handoff-home-tracker', JSON.stringify(homes));
    } catch {}
    try {
      if (userProfile && !isGuestMode && typeof updateUserProfile === 'function') {
        if (persistTimerRef.current) window.clearTimeout(persistTimerRef.current);
        persistTimerRef.current = window.setTimeout(async () => {
          try {
            const currentPrefs = (userProfile as any)?.preferences || {};
            await updateUserProfile({ preferences: { ...currentPrefs, homeTracker: homes } as any });
          } catch {}
        }, 1500) as unknown as number;
      }
    } catch {}
    return () => {
      if (persistTimerRef.current) window.clearTimeout(persistTimerRef.current);
    };
  }, [homes, userProfile, isGuestMode, updateUserProfile]);

  // Persist simple UI state
  useEffect(() => {
    try {
      localStorage.setItem('handoff-home-tracker-ui', JSON.stringify({ activeFilters, sortBy }));
    } catch {}
  }, [activeFilters, sortBy]);

  const addHome = () => {
    if (!newHome.address.trim()) return;
    const withoutSample = homes.filter(h => !h.isSample);
    const home: TrackedHome = {
      id: Date.now().toString(),
      address: newHome.address,
      price: newHome.price,
      bedrooms: newHome.bedrooms,
      bathrooms: newHome.bathrooms,
      notes: newHome.notes,
      ranking: withoutSample.length + 1,
      dateAdded: new Date().toLocaleDateString(),
      label: newHome.label,
      intensity: 1,
      status: newHome.status || 'none',
      uploads: []
    };
    setHomes([...withoutSample, home].map((h, i) => ({ ...h, ranking: i + 1 })));
    try { localStorage.setItem('handoff-home-tracker-sample-dismissed','true'); } catch {}
    setNewHome({ address: '', price: '', bedrooms: '', bathrooms: '', notes: '', label: 'very-interested', status: 'none' });
    setIsAddingHome(false);
  };

  const removeHome = (id: string) => {
    const updatedHomes = homes.filter(h => h.id !== id);
    const removed = homes.find(h => h.id === id);
    if (removed?.isSample) {
      try { localStorage.setItem('handoff-home-tracker-sample-dismissed','true'); } catch {}
    }
    setHomes(updatedHomes.map((h, i) => ({ ...h, ranking: i + 1 })));
    setSelectedIds(prev => prev.filter(x => x !== id));
  };

  const updateHome = (id: string, updates: Partial<TrackedHome>) => {
    setHomes(prev => prev.map(home => home.id === id ? { ...home, ...updates } : home));
  };

  // Drag & Drop
  const onDragStart = (id: string) => setDraggingId(id);
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const onDrop = (overId: string) => {
    if (!draggingId || draggingId === overId) { setDraggingId(null); return; }
    const list = [...homes];
    const from = list.findIndex(h => h.id === draggingId);
    const to = list.findIndex(h => h.id === overId);
    if (from === -1 || to === -1) { setDraggingId(null); return; }
    const [moved] = list.splice(from, 1);
    list.splice(to, 0, moved);
    setHomes(list.map((h, i) => ({ ...h, ranking: i + 1 })));
    setDraggingId(null);
  };

  const getStatusPill = (status: StatusTag) => {
    switch (status) {
      case 'very-interested':
        return 'bg-[#007EA7] text-white';
      case 'touring-soon':
        return 'bg-[#F59E0B] text-white';
      case 'offer-made':
        return 'bg-[#10B981] text-white';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const filteredHomes = useMemo(() => {
    const base = homes;
    const filtered = activeFilters.length === 0 ? base : base.filter(h => activeFilters.includes(h.label));
    const copy = [...filtered];
    if (sortBy === 'ranking') copy.sort((a, b) => a.ranking - b.ranking);
    if (sortBy === 'date') copy.sort((a, b) => new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime());
    if (sortBy === 'price') {
      const parsePrice = (p: string) => Number(String(p).replace(/[^0-9.]/g, '')) || 0;
      copy.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    }
    return copy;
  }, [homes, activeFilters, sortBy]);

  const topChoice = useMemo(() => homes.find(h => h.ranking === 1) || null, [homes]);
  const dreamCount = useMemo(() => homes.filter(h => h.label === 'dream-home').length, [homes]);

  const toggleFilter = (label: InterestLabel) => {
    setActiveFilters(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);
  };

  const toggleSelected = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const addUploads = (id: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const items: HomeUpload[] = Array.from(files).map(f => ({ url: URL.createObjectURL(f), name: f.name, type: f.type }));
    updateHome(id, { uploads: [ ...(homes.find(h => h.id === id)?.uploads || []), ...items ] });
  };

  const labelConfig = (label: InterestLabel, intensity: 1 | 2 = 1) => {
    if (label === 'dream-home') return { text: 'Dream Home', cls: 'bg-[#FFE5EC] text-[#C1121F] border-[#C1121F]/20' };
    if (label === 'very-interested') return intensity === 2
      ? { text: 'Very Interested', cls: 'bg-[#005F7E] text-white border-[#005F7E]' }
      : { text: 'Very Interested', cls: 'bg-[#007EA7] text-white border-[#007EA7]' };
    if (label === 'maybe') return { text: 'Maybe', cls: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    return { text: 'Not Interested', cls: 'bg-gray-100 text-gray-800 border-gray-200' };
  };

  const StatCard = ({ bg, icon, title, value }: { bg: string; icon: React.ReactNode; title: string; value: React.ReactNode }) => (
    <div className={`rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`} style={{ backgroundColor: bg }}>
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <div className="text-sm" style={{ color: '#003049' }}>{title}</div>
          <div className="text-2xl font-bold" style={{ color: '#003049' }}>{value}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#003049' }}>My Home Tracker</h2>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Add your first property to unlock comparison tools.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <Select value={sortBy} onValueChange={(v: 'ranking' | 'price' | 'date') => setSortBy(v)}>
              <SelectTrigger className="w-44 bg-[#F3F4F6] border-[#F3F4F6] text-slate-700">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ranking" className={sortBy==='ranking'? 'text-[#007EA7] font-medium' : ''}>Sort: Ranking</SelectItem>
                <SelectItem value="price" className={sortBy==='price'? 'text-[#007EA7] font-medium' : ''}>Sort: Price</SelectItem>
                <SelectItem value="date" className={sortBy==='date'? 'text-[#007EA7] font-medium' : ''}>Sort: Date Added</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setIsAddingHome(true)} className="bg-[#007EA7] hover:bg-[#00698C] rounded-full px-5">
            <Plus className="h-4 w-4 mr-2" />
            Add Home
          </Button>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        {(['dream-home','very-interested','maybe','not-interested'] as InterestLabel[]).map(l => {
          const active = activeFilters.includes(l);
          return (
            <button key={l} onClick={() => toggleFilter(l)}
              className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${active ? 'bg-[#003049] text-white border-[#003049]' : 'bg-white text-slate-700 border-[#D1D5DB] hover:bg-slate-50'}`}>
              {l === 'dream-home' ? 'Dream Home' : l === 'very-interested' ? 'Very Interested' : l === 'maybe' ? 'Maybe' : 'Not Interested'}
            </button>
          );
        })}
        {activeFilters.length > 0 && (
          <button onClick={() => setActiveFilters([])} className="text-sm px-3 py-1.5 rounded-full border bg-white text-slate-700 border-[#D1D5DB] hover:bg-slate-50">Clear</button>
        )}
      </div>

      {/* Stats row */}
      {homes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard bg="#E6F0FA" icon={<Home className="h-5 w-5" style={{ color: '#003049' }} />} title="Total Homes" value={homes.length} />
          <StatCard bg="#FFF5D9" icon={<Star className="h-5 w-5" style={{ color: '#FFC107' }} />} title="Top Choice" value={topChoice ? topChoice.address : 'None'} />
          <StatCard bg="#FFE5EC" icon={<Heart className="h-5 w-5" style={{ color: '#C1121F' }} />} title="Dream Homes" value={dreamCount} />
        </div>
      )}

      {/* Add Home Form */}
      {isAddingHome && (
        <Card className="border-sky-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Home
              </span>
              <Button variant="outline" size="sm" onClick={() => setIsAddingHome(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address">Address *</Label>
                <Input id="address" placeholder="123 Main St, City, State" value={newHome.address} onChange={(e) => setNewHome({ ...newHome, address: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="price">Price</Label>
                <Input id="price" placeholder="$500,000" value={newHome.price} onChange={(e) => setNewHome({ ...newHome, price: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input id="bedrooms" placeholder="3" value={newHome.bedrooms} onChange={(e) => setNewHome({ ...newHome, bedrooms: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input id="bathrooms" placeholder="2.5" value={newHome.bathrooms} onChange={(e) => setNewHome({ ...newHome, bathrooms: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="label">Interest Level</Label>
                <Select value={newHome.label} onValueChange={(value: InterestLabel) => setNewHome({ ...newHome, label: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dream-home">🏡 Dream Home</SelectItem>
                    <SelectItem value="very-interested">⭐ Very Interested</SelectItem>
                    <SelectItem value="maybe">🤔 Maybe</SelectItem>
                    <SelectItem value="not-interested">❌ Not Interested</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status Tag</Label>
                <Select value={newHome.status || 'none'} onValueChange={(v: StatusTag) => setNewHome({ ...newHome, status: v })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="very-interested">Very Interested</SelectItem>
                    <SelectItem value="touring-soon">Touring Soon</SelectItem>
                    <SelectItem value="offer-made">Offer Made</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Add any notes about this property..." value={newHome.notes} onChange={(e) => setNewHome({ ...newHome, notes: e.target.value })} rows={3} />
            </div>
            <div className="flex gap-2">
              <Button onClick={addHome} className="bg-emerald-600 hover:bg-emerald-700">
                <Save className="h-4 w-4 mr-2" />
                Add Home
              </Button>
              <Button variant="outline" onClick={() => setIsAddingHome(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty & Filter no results */}
      {homes.length === 0 && !isAddingHome ? (
        <Card className="text-center py-12">
          <CardContent>
            <Home className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">No homes tracked yet</h3>
            <p className="text-slate-600 mb-4">Start tracking homes you're interested in to compare and rank them</p>
            <Button onClick={() => setIsAddingHome(true)} className="bg-[#007EA7] hover:bg-[#00698C]">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Home
            </Button>
          </CardContent>
        </Card>
      ) : filteredHomes.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Home className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">No homes match this filter</h3>
            <p className="text-slate-600 mb-4">Try selecting a different filter or add more homes to your tracker</p>
            <Button onClick={() => setActiveFilters([])} variant="outline" className="mr-2">Show All Homes</Button>
            <Button onClick={() => setIsAddingHome(true)} className="bg-[#007EA7] hover:bg-[#00698C]"><Plus className="h-4 w-4 mr-2" />Add Home</Button>
          </CardContent>
        </Card>
      ) : null}

      {/* Comparison view */}
      {comparisonOpen && selectedIds.length >= 2 && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-[#003049]">Comparison</span>
              <Button size="sm" variant="outline" onClick={() => setComparisonOpen(false)}>Close</Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="min-w-[700px]">
              <div className="grid" style={{ gridTemplateColumns: `200px repeat(${selectedIds.length}, minmax(220px, 1fr))` }}>
                <div className="font-bold p-3 border-b" style={{ color: '#003049' }}>Field</div>
                {selectedIds.map(id => (
                  <div key={id} className="font-bold p-3 border-b" style={{ color: '#003049' }}>{homes.find(h => h.id === id)?.address}</div>
                ))}
                {[
                  { key: 'price', label: 'Price', render: (h: TrackedHome) => h.price || '—' },
                  { key: 'beds', label: 'Bedrooms', render: (h: TrackedHome) => h.bedrooms || '—' },
                  { key: 'baths', label: 'Bathrooms', render: (h: TrackedHome) => h.bathrooms || '—' },
                  { key: 'label', label: 'Interest', render: (h: TrackedHome) => labelConfig(h.label, h.intensity || 1).text },
                  { key: 'status', label: 'Status', render: (h: TrackedHome) => (h.status && h.status !== 'none') ? h.status.replace('-', ' ') : '—' },
                  { key: 'date', label: 'Date Added', render: (h: TrackedHome) => h.dateAdded },
                ].map((row, idx) => (
                  <React.Fragment key={row.key}>
                    <div className={`p-3 font-medium ${idx % 2 === 0 ? 'bg-[#F9FAFB]' : ''}`} style={{ color: '#003049' }}>{row.label}</div>
                    {selectedIds.map(id => (
                      <div key={id} className={`p-3 ${idx % 2 === 0 ? 'bg-[#F9FAFB]' : ''}`}>{row.render(homes.find(h => h.id === id)!)}
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sample notice when present */}
      {homes.some(h => h.isSample) && (
        <div className="relative overflow-hidden rounded-xl border border-dashed" style={{ backgroundColor: '#F9FAFB', borderColor: '#D1D5DB' }}>
          <div className="p-4 flex items-center justify-between">
            <p className="italic text-slate-600">Sample property – Replace with your first real home.</p>
            <Button size="sm" className="bg-[#007EA7] hover:bg-[#00698C]" onClick={() => setIsAddingHome(true)}>Add Home</Button>
          </div>
        </div>
      )}

      {/* Homes List */}
      <div className="space-y-5">
        {filteredHomes.map((home) => (
          <Card key={home.id} className={`relative group transition-all shadow-sm hover:shadow-md ${home.isSample ? 'border-dashed' : ''} ${topChoice?.id === home.id ? 'border-2' : 'border'}`} style={topChoice?.id === home.id ? { borderColor: '#FFD700' } : {}}>
            {/* Gold ribbon for Top Choice */}
            {topChoice?.id === home.id && (
              <div className="absolute -top-2 -left-2 rotate-[-15deg]">
                <div className="bg-[#FFD700] text-[#003049] text-[10px] font-bold px-2 py-0.5 rounded">Top Choice</div>
              </div>
            )}

            <CardContent className="p-5">
              <div className="flex items-start gap-4" draggable onDragStart={() => onDragStart(home.id)} onDragOver={onDragOver} onDrop={() => onDrop(home.id)}>
                {/* Drag handle */}
                <div className="pt-1 cursor-grab text-slate-400 hover:text-slate-600">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Thumbnail */}
                <div className="w-[120px] h-[120px] rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                  {home.photoUrl ? (
                    <img src={home.photoUrl} alt="Home" className="w-full h-full object-cover" />
                  ) : (
                    <Home className="w-8 h-8 text-slate-400" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1">
                  {/* Title row */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold" style={{ color: '#003049' }}>
                          <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-500" />{home.address}</span>
                        </h3>
                        {home.label === 'dream-home' && <Heart className="w-4 h-4" style={{ color: '#C1121F' }} />}
                        {home.isSample && <Badge variant="secondary" className="text-xs">Sample</Badge>}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3">
                        {home.price && <span className="text-xl font-bold" style={{ color: '#003049' }}>{home.price}</span>}
                        {home.bedrooms && <span className="text-sm text-[#374151]">{home.bedrooms} bed</span>}
                        {home.bathrooms && <span className="text-sm text-[#374151]">{home.bathrooms} bath</span>}
                        <Badge variant="outline" className="text-xs">Added {home.dateAdded}</Badge>

                        {/* Interest label as interactive toggle */}
                        <button
                          onClick={() => {
                            if (home.label === 'very-interested') {
                              updateHome(home.id, { intensity: (home.intensity || 1) === 1 ? 2 : 1 });
                            }
                          }}
                          className={`text-xs border px-2 py-0.5 rounded-full ${labelConfig(home.label, home.intensity || 1).cls} transition-colors`}
                          title={home.label === 'very-interested' ? 'Click to toggle intensity' : ''}
                        >
                          {home.label === 'dream-home' ? <Heart className="h-3 w-3 inline mr-1" /> : home.label === 'very-interested' ? <Star className="h-3 w-3 inline mr-1" /> : null}
                          {labelConfig(home.label, home.intensity || 1).text}
                        </button>

                        {/* Status tag */}
                        {home.status && home.status !== 'none' && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusPill(home.status)} border border-white/0`}>{home.status.replace('-', ' ')}</span>
                        )}
                      </div>
                    </div>

                    {/* Hover actions */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <button onClick={() => setSelectedIds(prev => prev.includes(home.id) ? prev.filter(x => x !== home.id) : [...prev, home.id])} className={`px-2 py-1 rounded text-xs border ${selectedIds.includes(home.id) ? 'bg-[#007EA7] text-white border-[#007EA7]' : 'text-slate-600 hover:text-[#007EA7] hover:border-[#007EA7]'} `}>Select</button>
                      <Button size="icon" variant="ghost" onClick={() => setEditingId(home.id)} className="text-slate-500 hover:text-[#007EA7]"><Edit className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => removeHome(home.id)} className="text-slate-500 hover:text-[#007EA7]"><Trash2 className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => navigator.clipboard.writeText(`${home.address} ${home.price || ''}`)} className="text-[#007EA7]"><Share2 className="w-4 h-4" /></Button>
                    </div>
                  </div>

                  {/* Editable form */}
                  {editingId === home.id ? (
                    <div className="mt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Address</Label>
                          <Input value={home.address} onChange={(e) => updateHome(home.id, { address: e.target.value })} />
                        </div>
                        <div>
                          <Label>Price</Label>
                          <Input value={home.price} onChange={(e) => updateHome(home.id, { price: e.target.value })} />
                        </div>
                        <div>
                          <Label>Bedrooms</Label>
                          <Input value={home.bedrooms} onChange={(e) => updateHome(home.id, { bedrooms: e.target.value })} />
                        </div>
                        <div>
                          <Label>Bathrooms</Label>
                          <Input value={home.bathrooms} onChange={(e) => updateHome(home.id, { bathrooms: e.target.value })} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Interest Level</Label>
                          <Select value={home.label} onValueChange={(value: InterestLabel) => updateHome(home.id, { label: value })}>
                            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="dream-home">🏡 Dream Home</SelectItem>
                              <SelectItem value="very-interested">⭐ Very Interested</SelectItem>
                              <SelectItem value="maybe">🤔 Maybe</SelectItem>
                              <SelectItem value="not-interested">❌ Not Interested</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Status Tag</Label>
                          <Select value={home.status || 'none'} onValueChange={(v: StatusTag) => updateHome(home.id, { status: v })}>
                            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="very-interested">Very Interested</SelectItem>
                              <SelectItem value="touring-soon">Touring Soon</SelectItem>
                              <SelectItem value="offer-made">Offer Made</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label>Notes</Label>
                        <Textarea value={home.notes} onChange={(e) => updateHome(home.id, { notes: e.target.value })} rows={3} />
                      </div>
                      <div>
                        <Label>Photo / Files</Label>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <label className="flex items-center gap-2 px-3 py-2 rounded-md border text-sm cursor-pointer hover:bg-slate-50">
                            <UploadCloud className="w-4 h-4" /> Upload
                            <input type="file" className="hidden" multiple onChange={(e) => addUploads(home.id, e.target.files)} />
                          </label>
                          {(home.uploads || []).map((u, i) => (
                            <div key={i} className="w-14 h-14 rounded-md overflow-hidden bg-slate-100 flex items-center justify-center">
                              {u.type.startsWith('image/') ? <img src={u.url} alt={u.name} className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-slate-500" />}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => setEditingId(null)} className="bg-[#007EA7] hover:bg-[#00698C]"><Save className="h-4 w-4 mr-1" />Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3">
                      {/* Collapsible Notes */}
                      <details className="group">
                        <summary className="cursor-pointer text-sm text-slate-600 select-none">Notes & attachments</summary>
                        <div className="mt-2 rounded-lg border bg-slate-50 p-3">
                          {home.notes ? (
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{home.notes}</p>
                          ) : (
                            <p className="text-sm text-slate-500 italic">Add your notes or tour feedback here…</p>
                          )}
                          {(home.uploads || []).length > 0 && (
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {(home.uploads || []).map((u, i) => (
                                <div key={i} className="w-16 h-16 rounded-md overflow-hidden bg-slate-100 flex items-center justify-center">
                                  {u.type.startsWith('image/') ? <img src={u.url} alt={u.name} className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-slate-500" />}
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="mt-2">
                            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm cursor-pointer hover:bg-slate-100">
                              <UploadCloud className="w-4 h-4" /> Add files
                              <input type="file" className="hidden" multiple onChange={(e) => addUploads(home.id, e.target.files)} />
                            </label>
                          </div>
                        </div>
                      </details>
                    </div>
                  )}
                </div>

                {/* Right column actions visible on hover (desktop) */}
                <div className="flex flex-col items-end gap-2 ml-2">
                  <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" className="w-4 h-4" checked={selectedIds.includes(home.id)} onChange={() => toggleSelected(home.id)} />
                    Compare
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sticky Compare button */}
      {selectedIds.length >= 2 && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center pointer-events-none">
          <Button onClick={() => setComparisonOpen(true)} className="pointer-events-auto bg-[#007EA7] hover:bg-[#00698C] px-6 py-2 rounded-full shadow-lg">Compare {selectedIds.length} homes</Button>
        </div>
      )}

      {/* Speed-dial FAB */}
      <div className="fixed bottom-6 right-6">
        <div className="relative">
          {fabOpen && (
            <div className="absolute bottom-14 right-0 mb-2 flex flex-col items-end gap-2">
              <button onClick={() => setIsAddingHome(true)} className="flex items-center gap-2 bg-white border rounded-full px-3 py-1.5 shadow hover:bg-slate-50">
                <Plus className="w-4 h-4 text-[#007EA7]" /> <span className="text-sm">Add Property</span>
              </button>
              <button onClick={() => { const first = homes[0]; if (first) setEditingId(first.id); }} className="flex items-center gap-2 bg-white border rounded-full px-3 py-1.5 shadow hover:bg-slate-50">
                <Edit className="w-4 h-4 text-[#007EA7]" /> <span className="text-sm">Add Note</span>
              </button>
              <button onClick={() => { const first = homes[0]; if (first) updateHome(first.id, { status: 'touring-soon' }); }} className="flex items-center gap-2 bg-white border rounded-full px-3 py-1.5 shadow hover:bg-slate-50">
                <MapPin className="w-4 h-4 text-[#007EA7]" /> <span className="text-sm">Add Tour Date</span>
              </button>
            </div>
          )}
          <button onClick={() => setFabOpen(v => !v)} className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg text-white" style={{ backgroundColor: '#007EA7' }}>
            <Plus className={`w-6 h-6 transition-transform ${fabOpen ? 'rotate-45' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
