import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, TrendingDown, Target, BarChart3, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { LeagueSelector } from '@/components/LeagueSelector';
import { useMultiLeagueProps } from '@/utils/multiLeagueUtils';
import { SEO } from '@/components/SEO';
import { PropsTable } from '@/components/PropsTable';
import { useYesterdayProps } from '@/hooks/useYesterdayProps';
import { PropsFilters } from '@/components/PropsFilters';
import { PropFilters } from '@/types/nba';

interface DayPerformance {
  date: string;
  overs: {
    total: number;
    hits: number;
    hitRate: number;
  };
  unders: {
    total: number;
    hits: number;
    hitRate: number;
  };
  overallHitRate: number;
}

export const RecapPage: React.FC = () => {
  const [selectedLeagues, setSelectedLeagues] = useState<('NBA' | 'NFL')[]>(['NBA']);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filters, setFilters] = useState<PropFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const { props, isLoading, error, refetch, leagueDisplay, locked } = useMultiLeagueProps(selectedLeagues);
  const previousDate = (() => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  })();
  // Fetch yesterday's props when a date is selected
  const {
    data: yesterdayData,
    isLoading: isLoadingYesterday,
    error: yesterdayError,
    refetch: refetchYesterday,
  } = useYesterdayProps(selectedDate, selectedLeagues);
  const yesterdayProps = yesterdayData?.props ?? [];
  const lockedYesterday = yesterdayData?.locked ?? locked;
  const filteredYesterdayProps = useMemo(() => {
    return yesterdayProps.filter(prop => {
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        if (!prop.player_name.toLowerCase().includes(searchLower) &&
            !prop.team.toLowerCase().includes(searchLower) &&
            !prop.stat_type.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      if (lockedYesterday) return true;

      if (filters.teams && filters.teams.length > 0) {
        if (!filters.teams.includes(prop.team)) return false;
      }

      if (filters.stat_types && filters.stat_types.length > 0) {
        if (!filters.stat_types.includes(prop.stat_type)) return false;
      }

      if (filters.odds_types && filters.odds_types.length > 0) {
        if (!filters.odds_types.includes(prop.odds_type)) return false;
      }

      if (filters.positions && filters.positions.length > 0) {
        if (!filters.positions.includes(prop.position)) return false;
      }

      if (filters.sample_sizes && filters.sample_sizes.length > 0) {
        if (!filters.sample_sizes.includes(prop.sample_size)) return false;
      }

      return true;
    });
  }, [filters.odds_types, filters.positions, filters.stat_types, filters.teams, filters.sample_sizes, searchQuery, yesterdayProps, lockedYesterday]);

  const handleFiltersChange = (newFilters: PropFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  // Generate calendar dates for the last 30 days
  const generateCalendarDates = (): string[] => {
    const dates: string[] = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(
        new Date(date.getTime() - date.getTimezoneOffset() * 60000)
          .toISOString()
          .split('T')[0]
      );
    }
    
    return dates;
  };

  const calendarDates = generateCalendarDates();

  // Mock performance data structure (in real app, this would come from your backend)
  const getDayPerformance = (date: string): DayPerformance | null => {
    // This would be replaced with actual data from your backend
    // For now, return null to show empty state
    return null;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  const getDateStatus = (date: string): 'future' | 'past' | 'today' => {
    const today = new Date().toISOString().split('T')[0];
    if (date === today) return 'today';
    if (date > today) return 'future';
    return 'past';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading {leagueDisplay} recap...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">Error loading recap: {error.message}</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Props Performance Recap - Daily Results Tracker"
        description="Track your daily prop betting performance with our calendar interface. Click on any past day to see how top props performed, split by overs and unders."
        keywords="props recap, daily performance, prop results, overs unders, hit rate tracking"
      />
      
      <div className="container mx-auto p-6 space-y-6">
        {/* League Selector */}
        <LeagueSelector
          selectedLeagues={selectedLeagues}
          onLeaguesChange={setSelectedLeagues}
        />

        {/* Header */}
        <div className="border-b border-slate-700 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3 text-white">
                <Calendar className="h-10 w-10 text-blue-500" />
                {leagueDisplay} Props Recap
              </h1>
              <p className="text-xl text-slate-400 mt-2">
                Click on any past day to see how top props performed
              </p>
            </div>
            <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
              Last 30 Days
            </Badge>
          </div>
        </div>

        {/* Calendar Grid */}
        <Card className="glass-card border border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Daily Performance Calendar</CardTitle>
            <CardDescription className="text-slate-400">
              Click on any past date to view top props performance for that day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {/* Calendar Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center p-2 text-sm font-semibold text-slate-400">
                  {day}
                </div>
              ))}
              
              {/* Calendar Dates */}
              {calendarDates.map((date) => {
                const status = getDateStatus(date);
                const performance = getDayPerformance(date);
                const isClickable = status === 'past';
                
                
                return (
                  <div
                    key={date}
                    className={`
                      p-2 text-center cursor-pointer rounded-lg transition-all duration-200
                      ${status === 'future' 
                        ? 'text-slate-600 bg-slate-800/30 cursor-not-allowed' 
                        : status === 'today'
                        ? 'text-white bg-blue-600/20 border border-blue-500/30'
                        : isClickable
                        ? 'text-white bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/30 hover:border-slate-500/50'
                        : 'text-slate-400 bg-slate-800/30'
                      }
                    `}
                    onClick={() => isClickable && setSelectedDate(date)}
                  >
                    <div className="text-sm font-medium mb-1">
                      {new Date(date).getDate()}
                    </div>
                    {performance && (
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-green-400">O</span>
                          <span className="text-slate-300">{performance.overs.hitRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-400">U</span>
                          <span className="text-slate-300">{performance.unders.hitRate}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Performance */}
        {selectedDate && (
          <Card className="glass-card border border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">
                    {formatDate(selectedDate)} - Top Props Performance
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    How the top {leagueDisplay} props performed on this date
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedDate(null)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Performance Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="bg-green-500/10 border border-green-500/30">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp className="h-6 w-6 text-green-400 mr-2" />
                      <span className="text-sm font-medium text-green-400">Overs</span>
                    </div>
                    <div className="text-2xl font-bold text-green-400">
                      {getDayPerformance(selectedDate)?.overs.hitRate || 0}%
                    </div>
                    <div className="text-xs text-slate-400">
                      Hit Rate
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-red-500/10 border border-red-500/30">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingDown className="h-6 w-6 text-red-400 mr-2" />
                      <span className="text-sm font-medium text-red-400">Unders</span>
                    </div>
                    <div className="text-2xl font-bold text-red-400">
                      {getDayPerformance(selectedDate)?.unders.hitRate || 0}%
                    </div>
                    <div className="text-xs text-slate-400">
                      Hit Rate
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-500/10 border border-blue-500/30">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Target className="h-6 w-6 text-blue-400 mr-2" />
                      <span className="text-sm font-medium text-blue-400">Overall</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-400">
                      {getDayPerformance(selectedDate)?.overallHitRate || 0}%
                    </div>
                    <div className="text-xs text-slate-400">
                      Hit Rate
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Props Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Props from {formatDate(previousDate)}</h3>
                  <p className="text-sm text-slate-400">
                    Showing props from the day before ({(() => {
                      const date = new Date(selectedDate);
                      date.setDate(date.getDate() - 1);
                      return formatDate(date.toISOString().split('T')[0]);
                    })()})
                  </p>
                </div>
                
                {isLoadingYesterday ? (
                  <div className="text-center py-8 text-slate-400">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p>Loading props...</p>
                  </div>
                ) : yesterdayError ? (
                  <div className="text-center py-8 text-red-400">
                    <XCircle className="h-12 w-12 mx-auto mb-4" />
                    <p>Error loading props: {yesterdayError.message}</p>
                    <Button onClick={() => refetchYesterday()} variant="outline" className="mt-4">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                ) : yesterdayProps.length > 0 ? (
                  <div className="space-y-6">
                    <PropsFilters
                      filters={filters}
                      onFiltersChange={handleFiltersChange}
                      onClearFilters={handleClearFilters}
                      totalProps={yesterdayProps.length}
                      filteredProps={filteredYesterdayProps.length}
                      locked={lockedYesterday}
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      allProps={yesterdayProps}
                      selectedLeague={selectedLeagues[0]}
                    />
                    <PropsTable props={filteredYesterdayProps} viewMode="table" />
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <BarChart3 className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                    <p>No props data available for this date</p>
                    <p className="text-sm">Check back later or select a different date</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Date Selected State */}
        {!selectedDate && (
          <Card className="glass-card border border-slate-700">
            <CardContent className="text-center py-12">
              <Calendar className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Select a Date</h3>
              <p className="text-slate-400">
                Click on any past date in the calendar above to view top props performance for that day
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};
