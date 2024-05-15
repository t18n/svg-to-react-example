import React, { SVGProps } from 'react';
import { action } from '@storybook/addon-actions';
import { Meta, StoryFn, StoryObj } from '@storybook/react';

import * as Icons from './components';

type IconComponentType = React.ComponentType<SVGProps<SVGSVGElement>>;

const IconsStory: StoryFn = ({ color, size, containerBg }) => {
  const categorizedIcons = Object.entries(Icons).reduce(
    (acc, entry) => {
      const [k, Component] = entry;

      console.log(k)

      if (k.includes('DC')) acc['DC'].push(Component);
      else if (k.includes('Nintendo')) acc['Nintendo'].push(Component);
      else if (k.includes('Db')) acc['Db'].push(Component);
      else acc['Other'].push(Component);

      return acc;
    },
    {
      DC: [],
      Nintendo: [],
      Db: [],
      Other: [],
    } as Record<string, IconComponentType[]>,
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40, padding: 20 }}>
      {Object.entries(categorizedIcons).map(([category, icons]) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'flex-start' }}>
          <h2>
            {category} ({icons.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 40, flexWrap: 'wrap' }}>
            {Object.entries(icons).map(([k, Component]) => (
              <div
                key={k}
                style={{
                  display: 'flex',
                  flexFlow: 'column',
                  alignItems: 'center',
                  gap: size / 3,
                  flexWrap: 'wrap',
                  width: size * 10,
                }}
              >
                <button
                  key={k}
                  onClick={() => copyToClipboard(k)}
                  style={{ cursor: 'pointer', background: containerBg, flexShrink: 0, border: 0 }}
                >
                  {Component && (
                    <Component width={size} height={size} color={color} />
                  )}
                </button>
                <div style={{ textAlign: 'center' }}>{Component.displayName}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const meta: Meta = {
  title: 'Icons',
  component: IconsStory,
};

export default meta;
type Story = StoryObj;

async function copyToClipboard(input: string) {
  await navigator.clipboard.writeText(input);
  action('Copied to clipboard')(input);
}

export const AllIcons: Story = {
  decorators: [],
  parameters: {},
  args: {
    size: 32,
    color: 'blue',
    containerBg: 'transparent',
  },
};
