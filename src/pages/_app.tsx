// Import necessary modules and styles
import "@/styles/globals.css";
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";
import { useDisconnect, useEnsAvatar, useEnsName, useConnect, useAccount, Connector } from "wagmi";
import { WagmiConfig } from "wagmi";
import type { AppProps } from "next/app";
import { useRouter } from 'next/router';
import { useEffect, useState } from "react";
import { base } from "wagmi/chains";
import Confetti from "react-confetti"; // Import Confetti
import Web3 from 'web3';
import { useWhitelist } from '../contexts/WhitelistContext'; // Adjust the import path as necessary
import { WhitelistProvider } from '../contexts/WhitelistContext'; // Adjust the import path as necessary

// Define supported chains
const chains = [base];
  
// ABI provided by you
const abi: any[] = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_nftContractAddress",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_rewardTokenAddress",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "claimant",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Claimed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "EVOLVED_REWARD_AMOUNT",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "HOLDING_PERIOD",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "INITIAL_CLAIM_AMOUNT",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MAX_TIME_DURATION",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "REWARD_AMOUNT",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "claimAllRewards",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "claimCounts",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "evolvedCounter",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "hasEvolvedExternally",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "lastClaimTimestamps",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "nftContract",
		"outputs": [
			{
				"internalType": "contract ITamagotchiERC",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "rewardToken",
		"outputs": [
			{
				"internalType": "contract IERC20",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "tokenAddress",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "withdrawERC20",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];

// Contract address
const contractAddress = '0x05272F3838E8bf0f35B0f6c1ebAB319dAd877B11';
interface EthereumProvider {
  request: ({ method, params }: { method: string; params?: any[] }) => Promise<any>;
}

interface Window {
  ethereum?: EthereumProvider;
}




const infuraUrl = `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;

// Initialize Web3 instance with Infura provider
const web3 = new Web3(infuraUrl);

// Get contract instance
const contract = new web3.eth.Contract(abi, contractAddress);

// Get project ID from environment variable
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || "";

// Define metadata for the project
const metadata = {
  name: "Next Starter Template",
  description: "A Next.js starter template with Web3Modal v3 + Wagmi",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

declare global {
	interface Window {
	  whitelistProof: string[]; // Assuming your proof is an array of strings
	}
  }

interface WhitelistEntry {
	address: string;
	proof: string[]; // Assuming proof is an array of strings, adjust according to your actual data structure
  }

// Configure Web3Modal
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });
createWeb3Modal({ wagmiConfig, projectId, chains });


// Main App component
export default function App({ Component, pageProps }: AppProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
	<>
	  {ready ? (
		<WagmiConfig config={wagmiConfig}>
		  <WhitelistProvider> {/* Wrap your components with the WhitelistProvider */}
		    <Component {...pageProps} web3={web3} contract={contract} />
			<ConnectWallet />
		  </WhitelistProvider>
 
		</WagmiConfig>

    
	  ) : null}
	</>
  );
}




// Component for connecting wallet
function ConnectWallet() {
	const { isConnected } = useAccount();
	if (isConnected) return <Account />;
	return <WalletOptions />;
  }

  // Component for rendering wallet options
  function WalletOptions() {
	const { connectors, connect } = useConnect();
  const handleConnect = async (connector) => {

    const chainId = await web3.eth.getChainId(); // Assuming this returns a number
    const baseChainId: bigint = BigInt(8453); // Convert your base chain ID to bigint
        if (BigInt(chainId) !== baseChainId) { // Replace yourBaseNetworkChainId with Base's chain ID
    // Alert the user to switch to the correct network manually
    alert(`Please switch to the correct network with chain ID ${baseChainId}.`);
    } else {
      // If the chain ID matches, proceed with the connection
      connect({ connector });
    }
    
  };
	return (
    <>
      {connectors.map((connector) => (
        <button key={connector.name} onClick={() => handleConnect(connector)}>
          {connector.name}
        </button>
      ))}
    </>
	);
  }
  
  // Component for rendering account details
 function Account() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });

  const [showConfetti, setShowConfetti] = useState(false); // State to control confetti visibility
  const [headerText, setHeaderText] = useState("Mint Details"); // State to control header text
  const { setWhitelisted } = useWhitelist();
  
  
	return (
	  <>
	
	  </>
	);
  }
  

  