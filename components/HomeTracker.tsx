import React, { useState } from 'react';
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
  Heart
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

type InterestLabel = 'dream-home' | 'very-interested' | 'maybe' | 'not-interested';

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
}

export default function HomeTracker() {
  const [homes, setHomes] = useState<TrackedHome[]>([]);
  const [isAddingHome, setIsAddingHome] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newHome, setNewHome] = useState({
    address: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    notes: '',
    label: 'very-interested' as InterestLabel
  });

  const addHome = () => {
    if (!newHome.address.trim()) return;

    const home: TrackedHome = {
      id: Date.now().toString(),
      ...newHome,
      ranking: homes.length + 1,
      dateAdded: new Date().toLocaleDateString()
    };

    setHomes([...homes, home]);
    setNewHome({ address: '', price: '', bedrooms: '', bathrooms: '', notes: '', label: 'very-interested' as InterestLabel });
    setIsAddingHome(false);
  };

  const removeHome = (id: string) => {
    const updatedHomes = homes.filter(h => h.id !== id);
    // Reorder rankings
    const reorderedHomes = updatedHomes.map((home, index) => ({
      ...home,
      ranking: index + 1
    }));
    setHomes(reorderedHomes);
  };

  const updateHome = (id: string, updates: Partial<TrackedHome>) => {
    setHomes(homes.map(home => 
      home.id === id ? { ...home, ...updates } : home
    ));
  };

  const moveHome = (id: string, direction: 'up' | 'down') => {
    const currentIndex = homes.findIndex(h => h.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === homes.length - 1)
    ) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newHomes = [...homes];
    [newHomes[currentIndex], newHomes[newIndex]] = [newHomes[newIndex], newHomes[currentIndex]];
    
    // Update rankings
    const reorderedHomes = newHomes.map((home, index) => ({
      ...home,
      ranking: index + 1
    }));
    
    setHomes(reorderedHomes);
  };

  const getRankingColor = (ranking: number) => {
    if (ranking === 1) return 'bg-yellow-500 text-white';
    if (ranking === 2) return 'bg-gray-400 text-white';
    if (ranking === 3) return 'bg-amber-600 text-white';
    return 'bg-blue-100 text-blue-800';
  };

  const getRankingIcon = (ranking: number) => {
    if (ranking <= 3) return <Star className="h-3 w-3" />;
    return null;
  };

  const getLabelConfig = (label: InterestLabel) => {
    switch (label) {
      case 'dream-home':
        return {
          text: 'Dream Home',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <Heart className="h-3 w-3" />
        };
      case 'very-interested':
        return {
          text: 'Very Interested',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <Star className="h-3 w-3" />
        };
      case 'maybe':
        return {
          text: 'Maybe',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: null
        };
      case 'not-interested':
        return {
          text: 'Not Interested',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: null
        };
      default:
        return {
          text: 'Very Interested',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <Star className="h-3 w-3" />
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-700">My Home Tracker</h2>
          <p className="text-slate-600 mt-1">
            Keep track of homes you're interested in, add notes, and rank them by preference
          </p>
        </div>
        <Button 
          onClick={() => setIsAddingHome(true)}
          className="bg-sky-600 hover:bg-sky-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Home
        </Button>
      </div>

      {/* Stats */}
      {homes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-sky-600" />
                <div>
                  <p className="text-sm text-slate-600">Total Homes</p>
                  <p className="text-2xl font-semibold">{homes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-slate-600">Top Choice</p>
                  <p className="text-sm font-medium truncate">
                    {homes.find(h => h.ranking === 1)?.address || 'None'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-slate-600">With Notes</p>
                  <p className="text-2xl font-semibold">
                    {homes.filter(h => h.notes.trim()).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
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
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsAddingHome(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  placeholder="123 Main St, City, State"
                  value={newHome.address}
                  onChange={(e) => setNewHome({...newHome, address: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  placeholder="$500,000"
                  value={newHome.price}
                  onChange={(e) => setNewHome({...newHome, price: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  placeholder="3"
                  value={newHome.bedrooms}
                  onChange={(e) => setNewHome({...newHome, bedrooms: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  placeholder="2.5"
                  value={newHome.bathrooms}
                  onChange={(e) => setNewHome({...newHome, bathrooms: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="label">Interest Level</Label>
              <Select
                value={newHome.label}
                onValueChange={(value: InterestLabel) => setNewHome({...newHome, label: value})}
              >
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
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this property..."
                value={newHome.notes}
                onChange={(e) => setNewHome({...newHome, notes: e.target.value})}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={addHome} className="bg-emerald-600 hover:bg-emerald-700">
                <Save className="h-4 w-4 mr-2" />
                Add Home
              </Button>
              <Button variant="outline" onClick={() => setIsAddingHome(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Homes List */}
      {homes.length === 0 && !isAddingHome ? (
        <Card className="text-center py-12">
          <CardContent>
            <Home className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">No homes tracked yet</h3>
            <p className="text-slate-600 mb-4">
              Start tracking homes you're interested in to compare and rank them
            </p>
            <Button 
              onClick={() => setIsAddingHome(true)}
              className="bg-sky-600 hover:bg-sky-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Home
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {homes.map((home, index) => (
            <Card key={home.id} className="relative">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Ranking Badge */}
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRankingColor(home.ranking)}`}>
                    {getRankingIcon(home.ranking)}
                    #{home.ranking}
                  </div>

                  {/* Home Details */}
                  <div className="flex-1">
                    {editingId === home.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Address</Label>
                            <Input
                              value={home.address}
                              onChange={(e) => updateHome(home.id, { address: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Price</Label>
                            <Input
                              value={home.price}
                              onChange={(e) => updateHome(home.id, { price: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Bedrooms</Label>
                            <Input
                              value={home.bedrooms}
                              onChange={(e) => updateHome(home.id, { bedrooms: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Bathrooms</Label>
                            <Input
                              value={home.bathrooms}
                              onChange={(e) => updateHome(home.id, { bathrooms: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Notes</Label>
                          <Textarea
                            value={home.notes}
                            onChange={(e) => updateHome(home.id, { notes: e.target.value })}
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => setEditingId(null)}
                            className="bg-sky-600 hover:bg-sky-700"
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg text-slate-700 flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-slate-500" />
                              {home.address}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                              {home.price && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {home.price}
                                </span>
                              )}
                              {home.bedrooms && (
                                <span>{home.bedrooms} bed</span>
                              )}
                              {home.bathrooms && (
                                <span>{home.bathrooms} bath</span>
                              )}
                              <Badge variant="outline" className="text-xs">
                                Added {home.dateAdded}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {home.notes && (
                          <div className="bg-slate-50 rounded-lg p-3 mb-3">
                            <p className="text-sm text-slate-700">{home.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {editingId !== home.id && (
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moveHome(home.id, 'up')}
                          disabled={index === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moveHome(home.id, 'down')}
                          disabled={index === homes.length - 1}
                        >
                          ↓
                        </Button>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingId(home.id)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeHome(home.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
