import React from 'react';
import { Surface, Text, Button, Input, Badge } from '../primitives';

export default function PrimitivesDemo() {
  return (
    <div className="adsm-ui p-6">
      <Surface variant="panel" className="p-6 mb-4">
        <Text as="h1" size="3xl" weight="bold" className="mb-4">
          Presentation Layer v2 Primitives
        </Text>
        
        <Text variant="secondary" className="mb-6">
          Testing the new atomic design primitives with token-based styling.
        </Text>

        {/* Surface Variants */}
        <div className="mb-8">
          <Text as="h2" size="xl" weight="semibold" className="mb-4">
            Surface Variants
          </Text>
          <div className="flex gap-4">
            <Surface className="p-4">
              <Text>Default Surface</Text>
            </Surface>
            <Surface variant="panel" className="p-4">
              <Text>Panel Surface</Text>
            </Surface>
            <Surface variant="accent" className="p-4">
              <Text>Accent Surface</Text>
            </Surface>
            <Surface variant="elevated" className="p-4">
              <Text>Elevated Surface</Text>
            </Surface>
          </div>
        </div>

        {/* Text Variants */}
        <div className="mb-8">
          <Text as="h2" size="xl" weight="semibold" className="mb-4">
            Text Variants
          </Text>
          <div className="space-y-2">
            <Text variant="primary" size="lg">Primary text (large)</Text>
            <Text variant="secondary">Secondary text (base)</Text>
            <Text variant="muted" size="sm">Muted text (small)</Text>
            <Text size="xs" weight="medium">Extra small medium weight</Text>
          </div>
        </div>

        {/* Button Variants */}
        <div className="mb-8">
          <Text as="h2" size="xl" weight="semibold" className="mb-4">
            Button Variants
          </Text>
          <div className="flex gap-3">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="primary" disabled>Disabled Button</Button>
          </div>
        </div>

        {/* Input Demo */}
        <div className="mb-8">
          <Text as="h2" size="xl" weight="semibold" className="mb-4">
            Input Field
          </Text>
          <div className="max-w-md">
            <Input placeholder="Enter some text..." />
          </div>
        </div>

        {/* Badge Variants */}
        <div className="mb-8">
          <Text as="h2" size="xl" weight="semibold" className="mb-4">
            Badge Variants
          </Text>
          <div className="flex gap-3 items-center">
            <Badge variant="default">Default</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
          </div>
        </div>

        {/* Theme Test */}
        <Surface variant="elevated" className="p-4">
          <Text as="h3" size="lg" weight="semibold" className="mb-3">
            Theme Consistency Test
          </Text>
          <Text variant="secondary" className="mb-4">
            All primitives should respond to theme changes automatically.
            Toggle between light and dark themes to verify consistency.
          </Text>
          <div className="flex gap-3 items-center">
            <Button variant="primary">Test Button</Button>
            <Badge variant="success">Live Badge</Badge>
            <Input placeholder="Test input..." />
          </div>
        </Surface>
      </Surface>
    </div>
  );
}