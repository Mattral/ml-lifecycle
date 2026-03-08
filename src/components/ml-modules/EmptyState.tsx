import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, actionLabel, onAction }) => {
  return (
    <Card className="border-dashed border-2 border-border/50 bg-card/40">
      <CardContent className="py-20 px-8 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-6"
        >
          <Icon className="w-7 h-7 text-muted-foreground/60" />
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="text-lg font-semibold tracking-tight text-foreground mb-2"
        >
          {title}
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-6"
        >
          {description}
        </motion.p>

        {actionLabel && onAction && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Button onClick={onAction} variant="default" size="sm" className="rounded-full px-5 gap-2">
              <ArrowLeft className="w-3.5 h-3.5" />
              {actionLabel}
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyState;
