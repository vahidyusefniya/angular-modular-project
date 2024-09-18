import { CapacitorConfig } from "@capacitor/cli";
import { environment } from "./src/environments/environment";

const config: CapacitorConfig = {
  appId: environment.App_ID,
  appName: "Ezpin-Portal",
  webDir: "www",
  server: {
    androidScheme: "https",
  },
  plugins: {
    GoogleAuth: {
      scopes: environment.Scopes,
      clientId: environment.Client__Id,
      androidClientId: environment.Client__Id,
      serverClientId: environment.Client__Id,
      forceCodeForRefreshToken: environment.ForceCodeForRefreshToken,
    },
  },
};

export default config;
