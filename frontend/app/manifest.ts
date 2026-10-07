import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             'ApkaAI — Discover & Buy the Best AI Tools',
    short_name:       'ApkaAI',
    description:      "India's #1 AI Tools Marketplace — 100+ AI tools, cloud cost comparison, and exclusive deals.",
    start_url:        '/',
    display:          'standalone',
    background_color: '#08051A',
    theme_color:      '#7C3AED',
    orientation:      'portrait-primary',
    scope:            '/',
    lang:             'en-IN',
    categories:       ['productivity', 'business', 'utilities'],
    icons: [
      {
        src:     '/apkaai-logo.png',
        sizes:   '192x192',
        type:    'image/png',
        purpose: 'any',
      },
      {
        src:     '/apkaai-logo.png',
        sizes:   '512x512',
        type:    'image/png',
        purpose: 'maskable',
      },
    ],
    screenshots: [
      {
        src:          '/apkaai-logo.png',
        sizes:        '1280x720',
        type:         'image/png',
        // @ts-expect-error - form_factor is valid in PWA spec
        form_factor:  'wide',
        label:        'ApkaAI — AI Tools Marketplace',
      },
    ],
    shortcuts: [
      {
        name:       'All AI Tools',
        short_name: 'Tools',
        url:        '/tools',
        description:'Browse 100+ AI tools',
        icons:      [{ src: '/apkaai-logo.png', sizes: '96x96', type: 'image/png' }],
      },
      {
        name:       'Compare Tools',
        short_name: 'Compare',
        url:        '/compare',
        description:'Compare AI tools side by side',
        icons:      [{ src: '/apkaai-logo.png', sizes: '96x96', type: 'image/png' }],
      },
      {
        name:       'Book Demo',
        short_name: 'Demo',
        url:        '/demo',
        description:'Book a free 30-minute demo',
        icons:      [{ src: '/apkaai-logo.png', sizes: '96x96', type: 'image/png' }],
      },
      {
        name:       'Cloud Pricing',
        short_name: 'Cloud',
        url:        '/cloud',
        description:'Compare AWS, Azure, GCP costs',
        icons:      [{ src: '/apkaai-logo.png', sizes: '96x96', type: 'image/png' }],
      },
    ],
  }
}
