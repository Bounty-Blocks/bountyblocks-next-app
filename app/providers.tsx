'use client';

import React, { PropsWithChildren, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';

const { networkConfig } = createNetworkConfig({
	mainnet: { url: getFullnodeUrl('mainnet') },
	testnet: { url: getFullnodeUrl('testnet') },
});

export default function AppProviders({ children }: PropsWithChildren) {
	const [queryClient] = useState(() => new QueryClient());

	return (
		<QueryClientProvider client={queryClient}>
			<SuiClientProvider networks={networkConfig} network="testnet">
				<WalletProvider slushWallet={{ name: 'BountyBlocks' }}>
					{children}
				</WalletProvider>
			</SuiClientProvider>
		</QueryClientProvider>
	);
} 