import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { setSupabaseConfig } from '@/store/mapStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound } from 'lucide-react';

export default function Access() {
  const { projectRef } = useParams<{ projectRef: string }>();
  const navigate = useNavigate();
  const [anonKey, setAnonKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectRef?.trim()) {
      setError('Invalid share link.');
      return;
    }
    const key = anonKey.trim();
    if (!key) {
      setError('Please enter the anon key.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const url = `https://${projectRef.trim()}.supabase.co`;
      setSupabaseConfig(url, key);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect.');
    } finally {
      setLoading(false);
    }
  };

  if (!projectRef?.trim()) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <p className="text-muted-foreground">Invalid share link. Check the URL and try again.</p>
        <Button variant="link" onClick={() => navigate('/')} className="mt-4">Go to Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <KeyRound className="w-12 h-12 text-muted-foreground" />
          <h1 className="text-2xl font-semibold text-foreground">Access shared Lore</h1>
          <p className="text-sm text-muted-foreground">
            Enter the anon key (shared separately) to view this account&apos;s maps.
          </p>
          <p className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">
            Project: {projectRef}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="anon-key">Anon key</Label>
            <Input
              id="anon-key"
              type="password"
              placeholder="Paste the anon key"
              value={anonKey}
              onChange={e => setAnonKey(e.target.value)}
              autoComplete="off"
              className="font-mono text-sm"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Connecting…' : 'Access maps'}
          </Button>
        </form>
        <Button variant="ghost" className="w-full" onClick={() => navigate('/')}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
