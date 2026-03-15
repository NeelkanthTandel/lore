import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  getTmdbApiKey,
  setTmdbApiKey,
  getSupabaseUrl,
  getSupabaseAnonKey,
  setSupabaseConfig,
  testSupabaseConnection,
  SUPABASE_SETUP_SQL,
} from '@/store/mapStore';
import { Check, Copy, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after save (e.g. to refetch maps from Supabase). */
  onAfterSave?: () => void;
}

export default function SettingsDialog({ open, onOpenChange, onAfterSave }: Props) {
  const [apiKey, setApiKey] = useState(getTmdbApiKey());
  const [supabaseUrl, setSupabaseUrl] = useState(getSupabaseUrl());
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(getSupabaseAnonKey());
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'table_missing' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [sqlCopied, setSqlCopied] = useState(false);
  const [scriptModalOpen, setScriptModalOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setApiKey(getTmdbApiKey());
      setSupabaseUrl(getSupabaseUrl());
      setSupabaseAnonKey(getSupabaseAnonKey());
      setTestStatus('idle');
      setTestMessage('');
    }
  }, [open]);

  const handleSave = () => {
    setTmdbApiKey(apiKey);
    setSupabaseConfig(supabaseUrl, supabaseAnonKey);
    onOpenChange(false);
    onAfterSave?.();
  };

  const handleTestConnection = async () => {
    setSupabaseConfig(supabaseUrl, supabaseAnonKey);
    setTestStatus('testing');
    setTestMessage('');
    const err = await testSupabaseConnection();
    if (err === null) {
      setTestStatus('ok');
      setTestMessage('Connected. Table exists.');
    } else if (err === 'TABLE_MISSING') {
      setTestStatus('table_missing');
      setTestMessage('Run the setup script once in Supabase SQL Editor.');
    } else {
      setTestStatus('error');
      setTestMessage(err);
    }
  };

  const copySetupSql = async () => {
    await navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-2">
          <DialogTitle className="text-foreground">Settings</DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6 space-y-6">
          {/* TMDB */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">TMDB API Key</Label>
            <Input
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="Enter your TMDB API key"
              className="text-sm bg-secondary border-border"
            />
            <p className="text-xs text-muted-foreground">
              Get one free at{' '}
              <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                themoviedb.org
              </a>
            </p>
          </div>

          {/* Supabase */}
          <div className="space-y-2 border-t border-border pt-4">
            <Label className="text-xs font-medium text-foreground">Supabase (optional – sync across devices)</Label>
            <p className="text-xs text-muted-foreground">
              Create a project at{' '}
              <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                supabase.com
              </a>
              , then add your project URL and anon key. The app can’t create tables (Supabase security), so you run a one-time setup{' '}
              <button type="button" onClick={() => setScriptModalOpen(true)} className="text-primary hover:underline font-medium">
                script
              </button>
              {' '}in your project’s SQL Editor to create the storage table.
            </p>
            <Input
              value={supabaseUrl}
              onChange={e => { setSupabaseUrl(e.target.value); setTestStatus('idle'); }}
              placeholder="https://xxxx.supabase.co"
              className="text-sm bg-secondary border-border font-mono"
            />
            <Input
              value={supabaseAnonKey}
              onChange={e => { setSupabaseAnonKey(e.target.value); setTestStatus('idle'); }}
              placeholder="Anon / public key"
              type="password"
              autoComplete="off"
              className="text-sm bg-secondary border-border font-mono"
            />
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={handleTestConnection} disabled={testStatus === 'testing'}>
                {testStatus === 'testing' ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                Test connection
              </Button>
              {testStatus === 'ok' && <span className="text-xs text-green-600 flex items-center gap-1"><Check className="w-3 h-3" /> Connected</span>}
              {testStatus === 'error' && <span className="text-xs text-destructive">{testMessage}</span>}
            </div>
            {testStatus === 'table_missing' && (
              <div className="rounded-md bg-amber-500/10 border border-amber-500/30 p-3 space-y-2">
                <p className="text-xs text-foreground flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  The table doesn’t exist yet. Create it once:
                </p>
                <p className="text-xs text-muted-foreground">
                  In Supabase: open <strong>SQL Editor</strong> → <strong>New query</strong> → paste the script below → <strong>Run</strong>. Then test again.
                </p>
                <pre className="text-[10px] bg-secondary/80 p-2 rounded overflow-x-auto max-h-32 overflow-y-auto border border-border">
                  {SUPABASE_SETUP_SQL}
                </pre>
                <Button type="button" variant="outline" size="sm" onClick={copySetupSql}>
                  {sqlCopied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  {sqlCopied ? 'Copied' : 'Copy setup script'}
                </Button>
              </div>
            )}
          </div>

          </div>
        <div className="flex-shrink-0 p-6 pt-3 border-t border-border bg-card">
          <Button onClick={handleSave} className="w-full">Save</Button>
        </div>
      </DialogContent>

      {/* Setup script modal */}
      <Dialog open={scriptModalOpen} onOpenChange={setScriptModalOpen}>
        <DialogContent className="bg-card border-border max-w-2xl min-w-[28rem] max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-2">
            <DialogTitle className="text-foreground">Supabase setup script</DialogTitle>
          </DialogHeader>
          <p className="flex-shrink-0 px-6 text-xs text-muted-foreground">
            Run this once in Supabase: <strong>SQL Editor</strong> → <strong>New query</strong> → paste → <strong>Run</strong>.
          </p>
          <pre className="flex-1 min-h-0 text-xs bg-secondary/80 mx-6 mt-2 mb-2 p-4 rounded-md overflow-auto border border-border font-mono whitespace-pre">
            {SUPABASE_SETUP_SQL}
          </pre>
          <div className="flex-shrink-0 p-6 pt-3 border-t border-border bg-card">
            <Button type="button" variant="outline" size="sm" onClick={copySetupSql}>
              {sqlCopied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
              {sqlCopied ? 'Copied' : 'Copy script'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
