import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'davidchiriac.github.io.bibleplanner',
  appName: 'Bible Agenda',
  webDir: 'dist/bible-agenda/browser',
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com'],
    },
  },
};

export default config;
