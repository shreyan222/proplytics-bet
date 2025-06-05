
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, AlertCircle, Scale } from 'lucide-react';

export const TermsOfUsePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Terms of Use</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Please read these terms carefully before using Proplytics.
          </p>
        </div>

        <div className="grid gap-6">
          <Card className="glass-card border border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <FileText className="h-6 w-6 text-blue-400" />
                Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <p>
                By accessing and using Proplytics, you accept and agree to be bound by the terms and 
                provision of this agreement. If you do not agree to abide by the above, please do not 
                use this service.
              </p>
              <p>
                These terms may be updated from time to time without notice. Your continued use of the 
                platform constitutes acceptance of any changes to these terms.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Use License</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <p>
                Permission is granted to temporarily download one copy of the materials on Proplytics 
                for personal, non-commercial transitory viewing only.
              </p>
              <p>This is the grant of a license, not a transfer of title, and under this license you may not:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display</li>
                <li>attempt to decompile or reverse engineer any software contained on the website</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-card border border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <AlertCircle className="h-6 w-6 text-yellow-400" />
                Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <p>
                The materials on Proplytics are provided on an 'as is' basis. Proplytics makes no 
                warranties, expressed or implied, and hereby disclaims and negates all other warranties 
                including without limitation, implied warranties or conditions of merchantability, 
                fitness for a particular purpose, or non-infringement of intellectual property or 
                other violation of rights.
              </p>
              <p>
                Further, Proplytics does not warrant or make any representations concerning the accuracy, 
                likely results, or reliability of the use of the materials on its website or otherwise 
                relating to such materials or on any sites linked to this site.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">User Conduct</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <p>You agree not to use the service to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Upload, post, or transmit any content that is unlawful, harmful, or objectionable</li>
                <li>Impersonate any person or entity or misrepresent your affiliation</li>
                <li>Interfere with or disrupt the service or servers or networks connected to the service</li>
                <li>Attempt to gain unauthorized access to any portion of the service</li>
                <li>Use automated scripts to collect information from the service</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-card border border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Limitations</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <p>
                In no event shall Proplytics or its suppliers be liable for any damages (including, 
                without limitation, damages for loss of data or profit, or due to business interruption) 
                arising out of the use or inability to use the materials on Proplytics, even if 
                Proplytics or an authorized representative has been notified orally or in writing of 
                the possibility of such damage.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Scale className="h-6 w-6 text-green-400" />
                Governing Law
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <p>
                These terms and conditions are governed by and construed in accordance with the laws 
                of the United States and you irrevocably submit to the exclusive jurisdiction of the 
                courts in that state or location.
              </p>
              <p>
                Any legal action or proceeding arising under these terms will be brought exclusively 
                in courts located in the United States.
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

export default TermsOfUsePage;
