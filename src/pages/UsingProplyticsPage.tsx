
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BarChart3, Target, Trophy, Zap, TrendingUp, Users, Activity } from 'lucide-react';

export const UsingProplyticsPage = () => {
  return (
    <div className="container mx-auto p-6 space-y-8 max-w-6xl">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Using Proplytics</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Master our advanced props analytics platform with this comprehensive guide
        </p>
      </div>

      {/* Overview of Prop Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Overview of Prop Types
          </CardTitle>
          <CardDescription>
            Understanding our three-tier prop classification system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Badge className="bg-blue-600 hover:bg-blue-700">Standard Props</Badge>
              <p className="text-sm text-muted-foreground">
                Reliable, data-backed propositions with consistent historical performance. These represent solid value plays with moderate risk.
              </p>
            </div>
            <div className="space-y-3">
              <Badge className="bg-red-600 hover:bg-red-700">Demon Props</Badge>
              <p className="text-sm text-muted-foreground">
                High-risk, high-reward propositions based on advanced statistical models. These require careful consideration and bankroll management.
              </p>
            </div>
            <div className="space-y-3">
              <Badge className="bg-green-600 hover:bg-green-700">Goblin Props</Badge>
              <p className="text-sm text-muted-foreground">
                Premium high-confidence picks with exceptional statistical backing. Our most trusted recommendations for serious bettors.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Scoring System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            AI Scoring Explained
          </CardTitle>
          <CardDescription>
            How our advanced algorithms evaluate each proposition
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Scoring Factors</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Player historical performance vs opponent</li>
                <li>• Recent form and trend analysis</li>
                <li>• Team pace and style matchups</li>
                <li>• Injury reports and lineup changes</li>
                <li>• Home/away performance splits</li>
                <li>• Weather conditions (outdoor sports)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Score Ranges</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>90-100:</span>
                  <Badge className="bg-green-600">Exceptional Value</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>75-89:</span>
                  <Badge className="bg-blue-600">Strong Play</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>60-74:</span>
                  <Badge className="bg-yellow-600">Decent Value</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Below 60:</span>
                  <Badge variant="destructive">Avoid</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart Interpretation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            How to Interpret Charts
          </CardTitle>
          <CardDescription>
            Making sense of our data visualizations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Performance Charts</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Track player performance over time with moving averages and trend lines.
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Green trend = Improving performance</li>
                <li>• Red trend = Declining performance</li>
                <li>• Dotted line = Season average</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Matchup Analysis</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Compare player stats against specific opponents and defenses.
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Bar height = Statistical advantage</li>
                <li>• Color intensity = Confidence level</li>
                <li>• Historical markers = Past matchups</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grading Logic */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Our Grading Logic
          </CardTitle>
          <CardDescription>
            The methodology behind our prop evaluations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Statistical Weight Distribution</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-medium">35%</div>
                  <div className="text-muted-foreground">Recent Form</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">25%</div>
                  <div className="text-muted-foreground">Historical Matchups</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">25%</div>
                  <div className="text-muted-foreground">Season Performance</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">15%</div>
                  <div className="text-muted-foreground">External Factors</div>
                </div>
              </div>
            </div>
            <Separator />
            <p className="text-sm text-muted-foreground">
              Our algorithms continuously learn and adapt, adjusting weights based on real-world outcomes and evolving player/team dynamics.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tips for Using Platform */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Platform Usage Tips
          </CardTitle>
          <CardDescription>
            Maximize your success with these proven strategies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Filtering & Tracking</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Use team filters for specialization</li>
                <li>• Track your favorite players consistently</li>
                <li>• Set score thresholds based on your risk tolerance</li>
                <li>• Monitor prop line movements throughout the day</li>
                <li>• Compare props across different sportsbooks</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Finding High-Value Picks</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Focus on 80+ scoring props for consistency</li>
                <li>• Look for recent form improvements</li>
                <li>• Check injury reports before finalizing picks</li>
                <li>• Consider home/away splits for certain players</li>
                <li>• Use our comparison tool for multi-prop strategies</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* League-Specific Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            League-Specific Strategies
          </CardTitle>
          <CardDescription>
            Tailored approaches for each sport
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                NBA Strategy
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Back-to-back games often see reduced minutes</li>
                <li>• Pay attention to pace of play matchups</li>
                <li>• Consider rest advantages and travel schedules</li>
                <li>• Monitor blowout potential for garbage time stats</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                NFL Strategy
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Weather significantly impacts passing games</li>
                <li>• Divisional games often play differently</li>
                <li>• Consider game script and expected point totals</li>
                <li>• Monitor injury reports throughout the week</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                MLB Strategy
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Pitcher matchups are crucial for hitter props</li>
                <li>• Park factors significantly affect offensive numbers</li>
                <li>• Weather and wind direction impact home runs</li>
                <li>• Bullpen quality affects late-game situations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsingProplyticsPage;
