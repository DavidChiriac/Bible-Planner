import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'davidchiriac.github.io.bibleplanner',
  appName: 'Bible Planner',
  webDir: 'dist/bible-planner/browser',
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com'],
    },
    EdgeToEdge: {
      backgroundColor: "#ffffff",
      navigationBarColor: "#000000",
      statusBarColor: "#000000",
    },
  },
};

export default config;
