//
// if you are not going to read or write smart contract, you can delete this file
//

import { useAppKitNetwork, useAppKitAccount  } from '@reown/appkit/react'
import { useReadContract, useWriteContract } from 'wagmi'
import { useEffect } from 'react'
// import ABI from './tokenBank';
const storageABI = [
	{
		"inputs": [],
		"name": "retrieve",
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
				"name": "num",
				"type": "uint256"
			}
		],
		"name": "store",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]

const storageSC = "0xEe6D291CC60d7CeD6627fA4cd8506912245c8cA4" 
// bank 合约地址
// const BNAK_ADDRESS = "0x52b0c332eD45c3Ecd5F10A6947944eA2d7E4c0ab" 

export const SmartContractActionButtonList = () => {
    const { isConnected } = useAppKitAccount() // AppKit hook to get the address and check if the user is connected
    const { chainId } = useAppKitNetwork()
    const { writeContract, isSuccess } = useWriteContract()

    // 查询自己发行的 Bank Token余额
    // const balanceOfMTK = useBalance({
    //   address: BNAK_ADDRESS
    // }); // Wagmi hook t

    const readContract = useReadContract({
      address: storageSC,
      abi: storageABI,
      functionName: 'retrieve',
      query: {
        enabled: false, // disable the query in onload
      }
    })

    useEffect(() => {
      if (isSuccess) {
        console.log("contract write success");
      }
    }, [isSuccess])

    const handleReadSmartContract = async () => {
      console.log("Read Sepolia Smart Contract");
      const { data } = await readContract.refetch();
      console.log("data: ", data)
    }

    const handleWriteSmartContract = () => {
        console.log("Write Sepolia Smart Contract")
        writeContract({
          address: storageSC,
          abi: storageABI,
          functionName: 'store',
          args: [123n],
        })
    }
    //  存入 Token
    // const handleDepositBankContract =  () => {
    //     console.log("Write Sepolia Bank Contract")
    //     writeContract({
    //       address: BNAK_ADDRESS,
    //       abi: ABI,
    //       functionName: 'deposit',
    //       args: [1n],
    //     })
    // }

    // const handleGetBankBalanceOf =  async () => {
      
    //   console.log("Read Sepolia bank:",balanceOfMTK);
    //   const { data } = await balanceOfMTK.refetch();
    //   console.log("balanceOfMTK: ", data)
    // }




  return (
    isConnected && chainId === 11155111 && ( // Only show the buttons if the user is connected to Sepolia
    <div >
        <button onClick={handleReadSmartContract}>Read Sepolia Smart Contract</button>
        <button onClick={handleWriteSmartContract}>Write Sepolia Smart Contract</button>  
        {/* <button onClick={handleDepositBankContract}>部署bank合约</button>  
        <button onClick={handleGetBankBalanceOf}>查询自己发行的 Bank Token余额</button>   */}
    </div>
    )
  )
}
