import type { Preview } from '@storybook/react-vite';
import '../src/styles/theme.css';
import '../src/styles/storybook.css';

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
  },
};

export default preview;
