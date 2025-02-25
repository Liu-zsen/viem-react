import { useEffect, useState } from 'react';
import { useDisconnect, useAppKit, useAppKitNetwork, useAppKitAccount  } from '@reown/appkit/react'
import { formatEther, parseGwei, type Address } from 'viem'
import { useEstimateGas, useSendTransaction, useSignMessage, useBalance ,useReadContract } from 'wagmi'
import { networks } from '../config'
import bankABI from './tokenBank'
import { sepolia } from 'viem/chains';
// test transaction
const TEST_TX = {
  to: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045" as Address, // vitalik address
  value: parseGwei('0.0001')
}

// bank 合约地址
const BNAK_ADDRESS = "0x52b0c332eD45c3Ecd5F10A6947944eA2d7E4c0ab" 
interface ActionButtonListProps {
  sendHash: (hash: `0x${string}` ) => void;
  sendSignMsg: (hash: string) => void;
  sendBalance: (balance: string) => void;
  sendBankBalance: (balance: string) => void;
}

export const ActionButtonList = ({ sendHash, sendSignMsg, sendBalance,sendBankBalance }: ActionButtonListProps) => {
    const { disconnect } = useDisconnect(); // AppKit hook to disconnect
    const { open } = useAppKit(); // AppKit hook to open the modal
    const { switchNetwork } = useAppKitNetwork(); // AppKithook to switch network
    const { address, isConnected } = useAppKitAccount() // AppKit hook to get the address and check if the user is connected


    const { data: gas } = useEstimateGas({...TEST_TX}); // Wagmi hook to estimate gas
    const { data: hash, sendTransaction, } = useSendTransaction(); // Wagmi hook to send a transaction
    const { signMessageAsync } = useSignMessage() // Wagmi hook to sign a message
    const [userBalanceOf , setUserBalanceOf] = useState('');

    const { refetch } = useBalance({
      address: address as Address
    }); // Wagmi hook to get the balance

    const { data: BankData } = useReadContract({
      address: BNAK_ADDRESS, // Bank 合约地址
      abi: bankABI, // 合约的 ABI
      functionName: 'getBalance', // 查询余额的函数名，通常是 balanceOf
      args: [address], // 参数：用户的地址
      chainId: sepolia.id,
    });

    // 查询自己发行的 Bank Token余额
    const balanceOfMTK = useBalance({
      address: BNAK_ADDRESS
    }); 
    // Wagmi hook t

    
    useEffect(() => {
        if (hash) {
          sendHash(hash);
        }
    }, [hash]);

    // function to send a tx
    const handleSendTx = () => {
      try {
        sendTransaction({
          ...TEST_TX,
          gas // Add the gas to the transaction
        });
      } catch (err) {
        console.log('Error sending transaction:', err);
      }
    }

    // function to sing a msg 
    const handleSignMsg = async () => {
      const msg = "Hello Reown AppKit!" // message to sign
      const sig = await signMessageAsync({ message: msg, account: address as Address }); 
      sendSignMsg(sig);
    }

    // function to get the balance
    const handleGetBalance = async () => {
      const balance = await refetch()
      const Balance = BigInt(`${balance?.data?.value}`);
      sendBalance(formatEther(Balance) + " " + balance?.data?.symbol.toString())
    } 

    // 获取bank合约总余额
    const handleGetBankBalance = async () => {
      const balance = await balanceOfMTK.refetch()
      console.log(balance,'balancebalance') 
      const Balance = BigInt(`${balance?.data?.value}`);
      sendBankBalance(formatEther(Balance) + " " + balance?.data?.symbol.toString())
    }


    // 获取用户在bank合约的余额
    const handleGetUserBankBalance = async () =>{
    console.log(BankData,'BankData??',address);
    
      const balance = BankData ? BankData.toString() : '0'; // 根据需要格式化
      console.log(balance,'----balance');
      setUserBalanceOf(`${balance}`)
      // return <div>用户余额: {balance}</div>;
    }

    const handleDisconnect = async () => {
      try {
        await disconnect();
      } catch (error) {
        console.error("Failed to disconnect:", error);
      }
    };


  return (
    isConnected && (
    <div >
        <button onClick={() => open()}>Open</button>
        <button onClick={handleDisconnect}>Disconnect</button>
        <button onClick={() => switchNetwork(networks[1]) }>Switch</button>
        <button onClick={handleSignMsg}>Sign msg</button>
        <button onClick={handleSendTx}>Send tx</button>
        <button onClick={handleGetBalance}>Get Balance</button>  
        <button onClick={handleGetBankBalance}> 获取合约Bank 总余额</button>  
        <button onClick={handleGetUserBankBalance}> 
        获取 当前用户在Bank合约存的余额: {userBalanceOf}
      </button>  
        
    </div>
    )
  )
}
