import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/contexts/AppContext';
import { useWebhookPolling } from '@/hooks/useWebhookPolling';
import { SongForm } from './SongForm';
import { SongHistory } from './SongHistory';
import { CredentialsSettings } from './CredentialsSettings';
import { WebhookTester } from './WebhookTester';
import { WebhookStatusChecker } from './WebhookStatusChecker';
import { WebhookIntegrationTester } from './WebhookIntegrationTester';
import { WebhookPayloadViewer } from './WebhookPayloadViewer';
import { TaskMappingViewer } from './TaskMappingViewer';
import { LogOut, Crown, Music, History, Plus, Settings, Webhook, Eye, MapPin } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, logout, songs } = useAppContext();
  const [activeTab, setActiveTab] = useState('create');
  
  // Initialize webhook polling
  useWebhookPolling();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Music className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Personalized Assertive Songs
              </h1>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Link to="/profile/preferences" className="underline text-indigo-600">
                Preferences
              </Link>
              {user.isAdmin && (
                <Link to="/admin/dialogues" className="underline text-indigo-600">
                  Admin
                </Link>
              )}
              <span>{user.email}</span>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="create"><Plus className="h-4 w-4" />Create</TabsTrigger>
            <TabsTrigger value="history"><History className="h-4 w-4" />History</TabsTrigger>
            {/*<TabsTrigger value="webhook"><Webhook className="h-4 w-4" />Webhook</TabsTrigger> */}
            {/*<TabsTrigger value="payloads"><Eye className="h-4 w-4" />Payloads</TabsTrigger> */}
            {/*<TabsTrigger value="mappings"><MapPin className="h-4 w-4" />Mappings</TabsTrigger> */}
            <TabsTrigger value="settings"><Settings className="h-4 w-4" />Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create"><SongForm /></TabsContent>
          <TabsContent value="history"><SongHistory /></TabsContent>
          <TabsContent value="webhook">
            <div className="space-y-6">
              <WebhookIntegrationTester />
              <WebhookStatusChecker />
              <WebhookTester />
            </div>
          </TabsContent>
          <TabsContent value="payloads"><WebhookPayloadViewer /></TabsContent>
          <TabsContent value="mappings"><TaskMappingViewer /></TabsContent>
          <TabsContent value="settings"><CredentialsSettings /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
