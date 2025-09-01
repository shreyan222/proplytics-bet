import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NormalizedSearch } from '@/components/NormalizedSearch';
import { Badge } from '@/components/ui/badge';

export const SearchPage: React.FC = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background effects */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500 opacity-20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-40 right-10 w-80 h-80 bg-blue-600 opacity-15 rounded-full blur-2xl animate-ping" />
      <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-slate-600 opacity-10 rounded-full blur-2xl animate-pulse transform -translate-x-1/2" />
      
      <div className="relative z-10 container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="border-b border-slate-700 pb-6 glass-card p-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-4">
              Prop Search & Analysis
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Search for any player to see all their available props organized by type and odds category. 
              Get comprehensive insights into performance metrics, historical data, and scoring algorithms.
            </p>
          </div>
        </div>

        {/* Search Component */}
        <NormalizedSearch />

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card className="glass-card border border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                🔍 Smart Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">
                Type any player name to instantly see all available props. 
                Autocomplete suggestions help you find players quickly.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                📊 Grouped Display
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">
                Props are intelligently grouped by player, then by prop type, 
                making it easy to compare different betting options.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                🎯 Advanced Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">
                Filter by prop type, odds category, team, league, and more. 
                Find exactly what you're looking for with precision.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="glass-card border border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-center">
              How the Search Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto border border-blue-500/30">
                  <span className="text-blue-400 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-white">Search</h3>
                <p className="text-sm text-slate-400">
                  Type a player name like "Caleb Williams"
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
                  <span className="text-green-400 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-white">Group</h3>
                <p className="text-sm text-slate-400">
                  See all props grouped by type (Pass, Rush, etc.)
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto border border-purple-500/30">
                  <span className="text-purple-400 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-white">Filter</h3>
                <p className="text-sm text-slate-400">
                  Apply filters to narrow down results
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto border border-orange-500/30">
                  <span className="text-orange-400 font-bold">4</span>
                </div>
                <h3 className="font-semibold text-white">Analyze</h3>
                <p className="text-sm text-slate-400">
                  View detailed stats and performance metrics
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Example Search Results */}
        <Card className="glass-card border border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-center">
              Example: Search for "Caleb Williams"
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                    👤
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Caleb Williams</h4>
                    <p className="text-sm text-slate-400">15 total props • 4 prop types</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🏈</span>
                      <span className="text-white font-medium">Passing Yards</span>
                      <Badge variant="outline" className="text-blue-400 border-blue-400">3 props</Badge>
                    </div>
                    <div className="ml-6 space-y-1 text-sm text-slate-400">
                      <div>• Standard: 250.5 yards (-110)</div>
                      <div>• Alt Lines: 275.5 yards (-150)</div>
                      <div>• Goblin: 300.5 yards (-200)</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🎯</span>
                      <span className="text-white font-medium">Passing TDs</span>
                      <Badge variant="outline" className="text-blue-400 border-blue-400">4 props</Badge>
                    </div>
                    <div className="ml-6 space-y-1 text-sm text-slate-400">
                      <div>• Standard: 2.5 TDs (-110)</div>
                      <div>• Alt Lines: 3.5 TDs (-180)</div>
                      <div>• Demon: 1.5 TDs (+120)</div>
                      <div>• Goblin: 4.5 TDs (-300)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
