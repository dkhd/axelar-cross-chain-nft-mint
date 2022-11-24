import "@rainbow-me/rainbowkit/styles.css";
import "../styles/globals.css";

import type { AppProps } from "next/app";

import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { chain, Chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

const moonbaseChain: Chain = {
  id: 1287,
  name: "Moonbase Alpha",
  network: "moonbase",
  nativeCurrency: {
    decimals: 18,
    name: "DEV",
    symbol: "DEV",
  },
  rpcUrls: {
    default: "https://rpc.api.moonbase.moonbeam.network",
  },
  blockExplorers: {
    default: {
      name: "Moonbase Alpha Explorer",
      url: "https://moonbase.moonscan.io/",
    },
  },
  testnet: true,
};

const { chains, provider } = configureChains(
  [moonbaseChain, chain.polygonMumbai],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id === moonbaseChain.id)
        return {  http: "https://rpc.api.moonbase.moonbeam.network" };
        return { http: "https://rpc-mumbai.maticvigil.com" };

      },
      // rpc: () => {
      //   return {
      //     http: "https://rpc.api.moonbase.moonbeam.network",
      //   };
      // },
    }),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "GMP Mint NFT",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />;
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
