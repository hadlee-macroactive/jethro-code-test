'use client';

import { useState } from 'react';
import { Snowflake, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useActivateFreeze } from '@/lib/hooks/use-streaks';
import { toast } from 'sonner';

interface FreezeButtonProps {
  streakType: string;
  freezeAvailable: boolean;
  disabled?: boolean;
  remainingCount?: number;
}

export function FreezeButton({ streakType, freezeAvailable, disabled, remainingCount = 0 }: FreezeButtonProps) {
  const [open, setOpen] = useState(false);
  const activateFreeze = useActivateFreeze();

  const handleActivate = async () => {
    try {
      await activateFreeze.mutateAsync({ streakType });
      setOpen(false);
      toast.success('Streak freeze activated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to activate freeze');
    }
  };

  if (!freezeAvailable && remainingCount === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Info className="w-4 h-4" />
        <span>No freezes available</span>
      </div>
    );
  }

  if (!freezeAvailable) {
    return (
      <Button disabled variant="outline" size="sm">
        <Snowflake className="w-4 h-4 mr-2" />
        Frozen
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <Snowflake className="w-4 h-4 mr-2" />
          Use Freeze
          {remainingCount > 1 && ` (${remainingCount})`}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Activate Streak Freeze</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This will preserve your current streak for one day. You have <strong>{remainingCount}</strong> freeze{remainingCount !== 1 ? 's' : ''} remaining.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleActivate} disabled={activateFreeze.isPending}>
              {activateFreeze.isPending ? 'Activating...' : 'Activate Freeze'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
