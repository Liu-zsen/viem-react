import { useEffect, useState } from 'react';
import { useAccount, useConnect, useSignTypedData, useReadContract, useWriteContract } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { formatEther, parseUnits } from 'viem';
import tokenBankABI from './tokenBankABI.json';
import myTokenABI from './myTokenABI.json';
import '../App.css';
// TokenBank 地址
const BANK_ADDRESS = '0x1Cd149D60b15cD3F654f382F5f26D1FeDd225F82';
// MyToken 地址
const TOKEN_ADDRESS = '0xa39812b7e716e8B6CbbE018954A0A88C780360fa';

function Permit() {
  const { address, isConnected } = useAccount();
  // const { connect, connectors } = useConnect();
  // const { writeContract } = useWriteContract();
  const { writeContract, isSuccess, isError, error } = useWriteContract()
  // const { signTypedData, data: signature } = useSignTypedData();
  const { signTypedData } = useSignTypedData();
  const [withdrawAmount, setWithdrawAmount] = useState(''); // 取款金额

  const [amount, setAmount] = useState('');

  // 读取用户在 TokenBank 中的余额
  const { data: balance, isLoading } = useReadContract({
    address: BANK_ADDRESS,
    abi: tokenBankABI.abi,
    functionName: 'getBalance',
    args: [address, TOKEN_ADDRESS],
    chainId: sepolia.id,
    query: { enabled: !!address },
  });


  // 读取 MyToken 的 nonce
  const { data: nonce } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: myTokenABI.abi,
    functionName: 'nonces',
    args: [address],
    chainId: sepolia.id,
    query: { enabled: !!address },
  });

  // 生成 permit 签名后存款
  const handlePermitDeposit = async () => {
    if (!amount || !address) return;

    const value = parseUnits(amount, 18); // 假设代币有 18 位小数
    const deadline = Math.floor(Date.now() / 1000) + 60 * 60; // 1 小时后过期

    const domain = {
      name: 'MyToken2',
      version: '1',
      chainId: sepolia.id,
      verifyingContract: TOKEN_ADDRESS as `0x${string}`,
    };

    const types = {
      Permit: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
    };

    const message = {
      owner: address,
      spender: BANK_ADDRESS,
      value: value.toString(),
      nonce: nonce?.toString(),
      deadline,
    };

    signTypedData({
      domain,
      types,
      primaryType: 'Permit',
      message,
    }, {
      onSuccess: async (sig) => {
        const r = sig.slice(0, 66);
        const s = '0x' + sig.slice(66, 130);
        const v = parseInt(sig.slice(130), 16);
        // 将参数封装为一个 tuple
        const permitData = [TOKEN_ADDRESS, value, deadline, v, r, s];

        writeContract({
          address: BANK_ADDRESS,
          abi: tokenBankABI.abi,
          functionName: 'permitDeposit',
          args: [permitData],
          chainId: sepolia.id,
        })
        
      },
    });
  };
  // 用户取款
  const handleWithdraw = async () => {
    if (!withdrawAmount || !address) return;
    const value = parseUnits(withdrawAmount, 18);
    writeContract({
      address: BANK_ADDRESS,
      abi: tokenBankABI.abi,
      functionName: 'withdraw',
      args: [TOKEN_ADDRESS, value],
      chainId: sepolia.id,
    });
  };

  useEffect(() => {
    console.log(`用户${address}在 TokenBank 中的余额:` , balance);
    console.log('nonce:', nonce);
  }, [balance,nonce]);
  // 报错信息
  useEffect(() => {
    if (isSuccess) {
      console.log('Withdraw transaction successful');
      setWithdrawAmount(''); // 清空输入框
    }
    if (isError) {
      console.error('Withdraw failed:', error);
    }
  }, [isSuccess, isError, error]);
  
  return (
    <div className="App">
      <h1>TokenBank with Permit</h1>
      {!isConnected ? (
        <appkit-button />
      ) : (
        <div>
          <p>Address: {address}</p>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Deposit amount"
          />
          {/* 存款 */}
          <button onClick={handlePermitDeposit}>Permit Deposit</button>

          {/* 取款部分 */}
          <div>
            
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Withdraw amount"
            />
            <button onClick={handleWithdraw} disabled={isSuccess}>
              {isSuccess ? 'Withdrawing...' : '取款'}
            </button>
          </div>

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
    </div>
  );
}

export default Permit;