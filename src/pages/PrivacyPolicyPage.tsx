
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, Database, Lock, UserCheck } from 'lucide-react';

export const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
        </div>

        <div className="grid gap-6">
          <Card className="glass-card border border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Shield className="h-6 w-6 text-blue-400" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <p>We collect information you provide directly to us, such as when you:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Create an account or update your profile</li>
                <li>Use our services and interact with our platform</li>
                <li>Contact us for support or feedback</li>
                <li>Subscribe to newsletters or promotional communications</li>
              </ul>
              <p>This may include your name, email address, username, and usage preferences.</p>
            </CardContent>
          </Card>

          <Card className="glass-card border border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Eye className="h-6 w-6 text-green-400" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices, updates, and support messages</li>
                <li>Respond to your comments, questions, and customer service requests</li>
                <li>Communicate with you about products, services, and events</li>
                <li>Monitor and analyze trends, usage, and activities</li>
                <li>Detect, investigate, and prevent fraudulent transactions</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-card border border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Database className="h-6 w-6 text-purple-400" />
                Information Sharing
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <p>We do not sell, trade, or otherwise transfer your personal information to third parties except:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights, property, or safety</li>
                <li>With service providers who assist in our operations</li>
                <li>In connection with a merger, acquisition, or sale of assets</li>
              </ul>
              <p>
                Any third-party service providers are contractually obligated to keep your information 
                confidential and secure.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Lock className="h-6 w-6 text-yellow-400" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <p>
                We implement appropriate security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction.
              </p>
              <p>Security measures include:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication procedures</li>
                <li>Secure hosting and data storage practices</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-card border border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <p>
                We use cookies and similar tracking technologies to collect and track information and 
                to improve our service. Cookies are files with a small amount of data that may include 
                an anonymous unique identifier.
              </p>
              <p>You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
            </CardContent>
          </Card>

          <Card className="glass-card border border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <UserCheck className="h-6 w-6 text-red-400" />
                Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access and update your personal information</li>
                <li>Request deletion of your personal data</li>
                <li>Object to processing of your personal information</li>
                <li>Request restriction of processing</li>
                <li>Data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
              <p>
                To exercise these rights, please contact us using the information provided in our 
                contact section.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <p>
                Our service is not intended for children under 21 years of age. We do not knowingly 
                collect personal information from children under 21. If you become aware that a child 
                has provided us with personal information, please contact us immediately.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes 
                by posting the new Privacy Policy on this page and updating the "last updated" date.
              </p>
              <p>
                You are advised to review this Privacy Policy periodically for any changes. Changes 
                to this Privacy Policy are effective when they are posted on this page.
              </p>
            </CardContent>
          </Card>

          <div className="text-center text-slate-400 text-sm">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
