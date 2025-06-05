
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Shield, Phone, ExternalLink } from 'lucide-react';

export const ResponsibleGamingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Responsible Gaming</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            We're committed to promoting safe and responsible gaming practices. Your well-being is our priority.
          </p>
        </div>

        <div className="grid gap-6">
          <Card className="glass-card border border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Shield className="h-6 w-6 text-blue-400" />
                Our Commitment
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <p>
                Proplytics is committed to providing a safe environment for all users. We believe that sports betting 
                should be entertaining and enjoyable, not a source of financial hardship or personal distress.
              </p>
              <p>
                We provide tools and resources to help you maintain control over your gaming activities and encourage 
                responsible participation in sports betting.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <AlertTriangle className="h-6 w-6 text-yellow-400" />
                Warning Signs
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <p className="font-semibold">Be aware of these warning signs of problem gambling:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Betting more money than you can afford to lose</li>
                <li>Chasing losses with bigger bets</li>
                <li>Neglecting responsibilities to gamble</li>
                <li>Lying about gambling activities</li>
                <li>Feeling anxious or depressed about gambling</li>
                <li>Borrowing money to gamble</li>
                <li>Unable to stop or control gambling behavior</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-card border border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Responsible Gaming Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <ul className="list-disc list-inside space-y-2">
                <li>Set a budget before you start and stick to it</li>
                <li>Never bet money you can't afford to lose</li>
                <li>Don't chase your losses</li>
                <li>Take regular breaks from betting</li>
                <li>Don't gamble when you're upset, angry, or depressed</li>
                <li>Keep gambling in perspective - it's entertainment, not an investment</li>
                <li>Be aware of how much time and money you're spending</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-card border border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Phone className="h-6 w-6 text-green-400" />
                Get Help
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <p>If you or someone you know has a gambling problem, help is available:</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <ExternalLink className="h-4 w-4" />
                  <a href="https://www.ncpgambling.org" className="text-blue-400 hover:text-blue-300 transition-colors">
                    National Council on Problem Gambling
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4" />
                  <span>National Problem Gambling Helpline: 1-800-522-4700</span>
                </div>
                <div className="flex items-center gap-3">
                  <ExternalLink className="h-4 w-4" />
                  <a href="https://www.gamblersanonymous.org" className="text-blue-400 hover:text-blue-300 transition-colors">
                    Gamblers Anonymous
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Age Verification</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <p>
                You must be 21 years or older to use Proplytics. We take age verification seriously and 
                reserve the right to verify your age at any time.
              </p>
              <p>
                Underage gambling is illegal and harmful. If you suspect someone underage is using our 
                platform, please contact us immediately.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResponsibleGamingPage;
