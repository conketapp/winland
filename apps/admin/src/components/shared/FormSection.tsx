/**
 * Shared FormSection Component
 * Wraps form fields in a Card with title
 */

import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export default function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );
}

