import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { useState, useEffect } from "react";
import { useWhitelist } from '../contexts/WhitelistContext'; // Adjust the import path as necessary
import { useAccount, useSendTransaction } from 'wagmi';
import React from 'react';
import { ethers } from 'ethers';
import { AppProps } from "next/app";
import { useRouter } from 'next/router';
import Web3 from "web3";
import { Contract } from "web3-eth-contract";

interface HomeProps extends AppProps {
	web3: Web3;
	contract: Contract<any>; 
	proofs: string[];
  }

export default function Home({ web3, contract }: HomeProps) {
	const [isNetworkSwitchHighlighted, setIsNetworkSwitchHighlighted] = useState(false);
	const [isConnectHighlighted, setIsConnectHighlighted] = useState(false);
	const [mintAmount, setMintAmount] = useState(1);
	const { sendTransaction } = useSendTransaction();
	const [mintPrice, setMintPrice] = useState(0.012); // Default price
	const [showGameInfo, setShowGameInfo] = useState(false);
	const [showMenu, setShowMenu] = useState(true);
	const [claimRewardsClicked, setClaimRewardsClicked] = useState(false);
	const { address } = useAccount();
	const { isWhitelisted } = useWhitelist();
	const [userBalance, setUserBalance] = useState(0);
	const [showWhitelistButton, setShowWhitelistButton] = useState(true);
	const [showEarnGotchi, setShowEarnGotchi] = useState(window.innerWidth > 1200);
	const [showHeader, setShowHeader] = useState(window.innerWidth > 600);
  const [totalSupply, setTotalSupply] = useState(0); 
  
 


	useEffect(() => {
		function handleResize() {
		  setShowEarnGotchi(window.innerWidth > 1200);
		  setShowHeader(window.innerWidth > 600);
		}
	
		window.addEventListener('resize', handleResize);
	
		// Clean up the event listener on component unmount
		return () => window.removeEventListener('resize', handleResize);
	  }, []);
	

  const router = useRouter();
  const refreshPage = () => {
		router.reload();
	};


  const closeAll = () => {
    setIsNetworkSwitchHighlighted(false);
    setIsConnectHighlighted(false);
  };

  

// Add logic to check the network before minting
// const checkNetworkAndMint = async (mintFunction) => {
//   if (window.ethereum) {
//     try {
//       // Use eth_chainId to get the current chain ID
//       const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
//       const chainId = parseInt(chainIdHex, 16);
//       const baseChainId = 8453; // Your base chain ID as a number
      
//       console.log("TEST22:" + chainId);
//       if (chainId !== baseChainId) {
//         alert(`Please switch to the correct network with chain ID ${baseChainId}.`);
//       } else {
//         if (!address) {
//           console.error("Wallet not connected.");
//           return;
//         }

//         // Execute the passed mint function (either normal mint or whitelist mint)
//         await mintFunction();
//       }
//     } catch (error) {
//       console.error('Failed to get chain ID:', error);
//     }
//   } else {
//     // Handle case where Ethereum wallet is not detected
//     alert("Please make sure your Ethereum wallet is connected.");
//   }
// };


// Modified handleMintButtonClick function
const handleMintButtonClick = async () => {
  const mintFunction = async () => {
    // Convert the amount to Wei
    const value = web3.utils.toWei((0.012 * mintAmount).toString(), 'ether');

    // Prepare transaction parameters
    const transactionParameters = {
      from: address,
      to: contract.options.address || '', // Set a default value for to
      value: value.toString(), // Convert BigInt to string for web3
      data: contract.methods.mintNFT(mintAmount).encodeABI(),
    };

    // Sending the transaction
    const tx = await sendTransaction({ ...transactionParameters });
  };

  mintFunction();

  // // Add user alert dialogue
  // const confirmed = confirm("Please confirm you are on BASE network before you continue.   It will say BASE in the top right.");
  // if (confirmed) {
  //   // Check network and mint
  //   mintFunction();
  // } else {
  //   console.log("Minting canceled by user.");
  //   // Handle cancellation if needed
  // }
};


const claimRewards = async () => {
  try {
    if (!address) {
      console.error("No account connected");
      return;
    }

    const data = contract.methods.claimAllRewards().encodeABI();

    // Try to estimate gas for the transaction
    try {
      const gasEstimate = await web3.eth.estimateGas({
        from: address,
        to: contract.options.address,
        data: data,
      });
      console.log("Estimated Gas:", gasEstimate);

      // If gas estimation succeeds, proceed with sending the transaction
      const transactionParameters = {
        from: address,
        to: contract.options.address,
        data: data,
        gas: gasEstimate.toString(), // Optional, but recommended to specify
      };

      // Use `sendTransaction` from wagmi's `useSendTransaction` or your method of sending transactions
      const tx = await sendTransaction(transactionParameters);
      console.log("Transaction submitted", tx);
    } catch (gasError) {
      // Handle gas estimation error (e.g., no rewards to claim)
      console.error("Gas estimation failed:", gasError);
      alert("No tokens to claim currently.  Gas estimation failed.");
    }
  } catch (error) {
    console.error("Error claiming rewards:", error);
  }
};



const redirectToGamePage = () => {
  router.push('https://chao-game.vercel.app/'); // Replace '/game' with your desired path
};

const redirectToTwitterPage = () => {
  router.push('https://twitter.com/ERCtamagotchi'); 
};

const redirectToDexscreenerPage = () => {
  router.push('https://dexscreener.com/base/0xE80b05Fea29dcCD909997872BC4901189B0aB761'); 
};
  
  


// Modified handleWhitelistMintClick function
const handleWhitelistMintClick = async () => {
  const mintFunction = async () => {
    // Convert the amount to Wei
    const value = web3.utils.toWei((0.006 * mintAmount).toString(), 'ether');

    // Prepare transaction parameters
    const transactionParameters = {
      from: address,
      to: contract.options.address,
      value: value.toString(), // Convert BigInt to string for web3
      data: contract.methods.whitelistMint(mintAmount, window.whitelistProof).encodeABI(), // Pass window.whitelistProof as the merkleProof parameter
    };

    // Sending the transaction
    const tx = await sendTransaction({ ...transactionParameters });
  };
  mintFunction();

  // // Add user alert dialogue
  // const confirmed = confirm("Please confirm you are on BASE network before you continue.  It will say BASE in the top right.");
  // if (confirmed) {
  //   // Check network and mint
  //   mintFunction();
  // } else {
  //   console.log("Minting canceled by user.");
  //   // Handle cancellation if needed
  // }
};

return (
  <>
    <Head>
      <title>BASED PETS</title>
      <meta name="description" content="Generated by create-wc-dapp" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <header className={styles.header}>
      <div className={styles.headerContent} onClick={refreshPage}>
        {showHeader && <h1>BASED PETS</h1>}
      </div>
      <div className={styles.buttons}>
        <div onClick={closeAll} className={`${styles.highlight} ${isNetworkSwitchHighlighted ? styles.highlightSelected : ``}`}>
          <w3m-network-button />
        </div>
        <div onClick={closeAll} className={`${styles.highlight} ${isConnectHighlighted ? styles.highlightSelected : ``}`}>
          <w3m-button />
        </div>
      </div>
    </header>

    <main className={styles.main}>
      <div className={styles.menu}>
        {showMenu && !claimRewardsClicked && (
          <>
            <ul className={styles.menuList}>
              <li>
                 PETS MOGGING ON BASE!
                <img src="/basedpets21.png" alt="Bird" style={{ marginTop:"2vh", width: '32vh', height: '32vh' }}/>
                <br></br>
                <span style={{marginTop:"20px", fontSize:"1.5vh"}}>0xE80b05Fea29dcCD909997872BC4901189B0aB761</span>

              </li>
            </ul>
            <button 
              className={styles.playButton}
              onClick={redirectToGamePage}
            >
              PLAY
            </button>
            <button 
              className={styles.claimButton}
              onClick={claimRewards}
            >
              CLAIM!
            </button>
            <br></br>
            
{/* 
            <ul className={styles.menuList}>
              <li>
                <br></br>
                  Fuck $ROOST coin.
               
              </li>
            </ul> */}

            <br></br>

            <div>
            <br></br>
              <img src="/dexscreener.png" alt="Dexscreener" className={styles.imageHoverEffect} style={{ width: '9vh', height: '9vh', borderRadius: '2vh', border: '2px solid black' }}
                 onClick={redirectToDexscreenerPage}/>
               
              <img src="/twitter.png" alt="Twitter" className={styles.imageHoverEffect} style={{ width: '9vh', height: '9vh', borderRadius: '2vh', border: '2px solid black', marginLeft: '3vh' }}
               onClick={redirectToTwitterPage}/>
            </div>

          </>
        )}
      </div>
    </main>
  </>
);
}