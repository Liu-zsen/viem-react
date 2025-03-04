// src/components/Permit2Deposit.js
import React, { useState } from 'react';
import { useAccount, useSignTypedData, useReadContract, useWriteContract } from 'wagmi';
import { formatEther, parseEther ,verifyTypedData} from 'viem';
import { sepolia } from 'wagmi/chains';
import TokenBankABI from './tokenBankABI.json';
import Permit2ABI from './permit2ABI.json';

const TOKEN_BANK_ADDRESS = '0x5e0F3f051F52575c70195F6C7CECA4693B2765A6'; // TokenBank 地址
const PERMIT2_ADDRESS = '0x000000000022D473030F116dDEE9F6B43aC78BA3' as const; // Permit2 地址
const TOKEN_ADDRESS = '0xa39812b7e716e8B6CbbE018954A0A88C780360fa'; // 替换为你的 ERC20 代币地址

function Permit2Deposit() {
    const [amount, setAmount] = useState('');
    const { address, isConnected } = useAccount();
    const { signTypedDataAsync } = useSignTypedData(); // 用于生成签名
    const { writeContract, isSuccess, isError, error } = useWriteContract()

    // Permit2 的 EIP-712 类型数据
    const domain = {
        name: 'Permit2',
        chainId: sepolia.id,
        verifyingContract: PERMIT2_ADDRESS,
    };

    const types = {
        PermitTransferFrom: [
            { name: 'permitted', type: 'TokenPermissions' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
        ],
        TokenPermissions: [
            { name: 'token', type: 'address' },
            { name: 'amount', type: 'uint256' },
        ],
    };
    
    // 读取用户在 TokenBank 中的余额
    const { data: balance, isLoading } = useReadContract({
        address: TOKEN_BANK_ADDRESS,
        abi: TokenBankABI.abi,
        functionName: 'getBalance',
        args: [address, TOKEN_ADDRESS],
        chainId: sepolia.id,
        query: { enabled: !!address },
    });

    // 使用 Wagmi 获取 nonceBitmap
    const { data: nonceBitmap } = useReadContract({
        address: PERMIT2_ADDRESS,
        abi: Permit2ABI.abi,
        functionName: 'nonceBitmap',
        args: [address, 0n], // wordPos 从 0 开始
        chainId: sepolia.id,
        query: { enabled: !!address },
    });

    // 从 bitmap 中找到未使用的 nonce
  const getNextNonce = (bitmap) => {
    console.log('nonceBitmap:', bitmap); // 调试输出
    // 如果 bitmap 是 undefined 或 null，则返回 null
    if (bitmap === undefined || bitmap === null) {
      console.log('bitmap 未定义');
      return null;
    }

    const bitmapBigInt = BigInt(bitmap);
    console.log('bitmapBigInt:', bitmapBigInt.toString(16)); // 以16进制输出

    for (let bitPos = 0n; bitPos < 256n; bitPos++) {
      const mask = 1n << bitPos;
      if ((bitmapBigInt & mask) === 0n) {
        console.log('找到未使用的 nonce:', bitPos);
        return bitPos; // 返回 wordPos = 0 的第一个未使用 nonce
      }
    }
    throw new Error('当前 word 中没有可用的 nonce，请尝试更高的 wordPos');
  };

    const handleDeposit = async () => {

        if (!address || !amount) {
            alert('请连接钱包并输入金额');
            return;
        }
            console.log(nonceBitmap,'nonceBitmap`');
            
        try {
            const nonce = getNextNonce(nonceBitmap);
            console.log(nonce, 'nonce--');

            const deadline = Math.floor(Date.now() / 1000) + 60 * 60; // 1 小时后过期
            const parsedAmount = parseEther(amount); // 将输入金额转为 wei

            // 生成 Permit2 签名数据
            const message = {
                permitted: {
                    token: TOKEN_ADDRESS,
                    amount: parsedAmount,
                },
                nonce,
                deadline,
            };

            // 使用 Wagmi 的 signTypedDataAsync 生成签名
            const signature = await signTypedDataAsync({
                domain,
                types,
                primaryType: 'PermitTransferFrom',
                message,
            });
            console.log(';sd',{
                address: TOKEN_BANK_ADDRESS,
                abi: TokenBankABI.abi,
                functionName: 'depositWithPermit2',
                args: [
                    {
                        amount: parsedAmount,
                        nonce,
                        deadline,
                        token: TOKEN_ADDRESS,
                        signature,
                    },
                ],
            },'签名数据:',{
                domain,
                types,
                primaryType: 'PermitTransferFrom',
                message,
            });
            const isValid = await verifyTypedData({
                address,
                domain,
                types,
                primaryType: 'PermitTransferFrom',
                message,
                signature,
              });
              console.log('签名是否有效:', isValid);
            
            // 调用 TokenBank 的 depositWithPermit2 函数
            writeContract({
                address: TOKEN_BANK_ADDRESS,
                abi: TokenBankABI.abi,
                functionName: 'depositWithPermit2',
                args: [
                    {
                        amount: parsedAmount,
                        nonce,
                        deadline,
                        token: TOKEN_ADDRESS,
                        signature,
                    },
                ],
            });

            alert('存款请求已提交，请等待交易确认');
        } catch (error) {
            console.error('存款失败:', error);
            alert('存款失败，请检查控制台');
        }
    };

    return (
        <>
            {!isConnected ? (
                <appkit-button />
            ) : (
                <div>
                    <h2>通过 Permit2 签名存款</h2>
                    <input
                        type="number"
                        placeholder="存款金额 (ETH)"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                    <button onClick={handleDeposit} disabled={!address}>
                        {address ? '存款' : '请先连接钱包'}
                    </button>


                    {isLoading ? (
                        <p>Loading balance...</p>
                    ) : (
                        <p>TokenBank Balance: {balance ? formatEther(BigInt(`${balance}`)) : '0'} MTK</p>
                    )}
                    <div>
                        {/* 已有代码 */}
                        {isSuccess && <p>Deposit successful!</p>}
                        {isError && <p>Error: {error?.message}</p>}
                    </div>
                </div>
            )}
        </>
    );
}

export default Permit2Deposit;