import { Configuration, RelayersApi } from "@openzeppelin/relayer-sdk";

const config = new Configuration({
  basePath: import.meta.env.VITE_RELAYER_URL,
  accessToken: import.meta.env.VITE_RELAYER_ACCESS_TOKEN,
});

export const relayerId = "lisk-sepolia";
export const relayersApi = new RelayersApi(config);
