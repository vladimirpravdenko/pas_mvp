import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { Settings, Key, Eye, EyeOff } from 'lucide-react';
import { sunoApi } from '@/services/sunoApi';

interface Credentials {
  sunoApiKey: string;
  ollamaUrl: string;
  openaiApiKey: string;
}

export const CredentialsSettings: React.FC = () => {
  const [credentials, setCredentials] = useState<Credentials>({
    sunoApiKey: localStorage.getItem('sunoApiKey') || '',
    ollamaUrl: localStorage.getItem('ollamaUrl') || 'http://localhost:11434',
    openaiApiKey: localStorage.getItem('openaiApiKey') || ''
  });
  const [showKeys, setShowKeys] = useState({
    suno: false,
    openai: false
  });

  useEffect(() => {
    // Set the API key in the service when component mounts
    if (credentials.sunoApiKey) {
      sunoApi.setApiKey(credentials.sunoApiKey);
    }
  }, [credentials.sunoApiKey]);

  const handleSave = (type: keyof Credentials) => {
    localStorage.setItem(type, credentials[type]);
    
    // Update the API service with the new key
    if (type === 'sunoApiKey') {
      sunoApi.setApiKey(credentials[type]);
    }
    
    toast({
      title: 'Credentials Saved',
      description: `${type} credentials have been saved successfully.`
    });
  };

  const handleInputChange = (key: keyof Credentials, value: string) => {
    setCredentials(prev => ({ ...prev, [key]: value }));
  };

  const toggleShowKey = (type: 'suno' | 'openai') => {
    setShowKeys(prev => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          API Credentials
        </CardTitle>
        <CardDescription>
          Configure your API credentials for song generation services.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="suno" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="suno">Suno API</TabsTrigger>
            <TabsTrigger value="ollama">Ollama</TabsTrigger>
            <TabsTrigger value="openai">OpenAI</TabsTrigger>
          </TabsList>
          
          <TabsContent value="suno" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="suno-key">Suno API Key</Label>
              <div className="relative">
                <Input
                  id="suno-key"
                  type={showKeys.suno ? 'text' : 'password'}
                  value={credentials.sunoApiKey}
                  onChange={(e) => handleInputChange('sunoApiKey', e.target.value)}
                  placeholder="Enter your Suno API key"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => toggleShowKey('suno')}
                >
                  {showKeys.suno ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-gray-600">
                Get your API key from <a href="https://docs.sunoapi.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">SunoAPI.org</a>
              </p>
            </div>
            <Button onClick={() => handleSave('sunoApiKey')} className="w-full">
              <Key className="h-4 w-4 mr-2" />
              Save Suno Credentials
            </Button>
          </TabsContent>
          
          <TabsContent value="ollama" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ollama-url">Ollama URL</Label>
              <Input
                id="ollama-url"
                type="url"
                value={credentials.ollamaUrl}
                onChange={(e) => handleInputChange('ollamaUrl', e.target.value)}
                placeholder="http://localhost:11434"
              />
              <p className="text-sm text-gray-600">
                URL to your Ollama instance for lyrics generation.
              </p>
            </div>
            <Button onClick={() => handleSave('ollamaUrl')} className="w-full">
              <Key className="h-4 w-4 mr-2" />
              Save Ollama Settings
            </Button>
          </TabsContent>
          
          <TabsContent value="openai" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openai-key">OpenAI API Key</Label>
              <div className="relative">
                <Input
                  id="openai-key"
                  type={showKeys.openai ? 'text' : 'password'}
                  value={credentials.openaiApiKey}
                  onChange={(e) => handleInputChange('openaiApiKey', e.target.value)}
                  placeholder="Enter your OpenAI API key"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => toggleShowKey('openai')}
                >
                  {showKeys.openai ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-gray-600">
                Alternative to Ollama for lyrics generation.
              </p>
            </div>
            <Button onClick={() => handleSave('openaiApiKey')} className="w-full">
              <Key className="h-4 w-4 mr-2" />
              Save OpenAI Credentials
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};