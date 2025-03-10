import { privateKeyToAccount } from 'viem/accounts';
import { http ,createPublicClient ,encodeFunctionData , parseUnits ,createWalletClient} from 'viem'
import { sepolia } from 'viem/chains';
import dotenv from 'dotenv';
import { Buffer } from 'buffer';
import { ABI } from './ERC20ABI.js';
// 编写一个脚本(可以基于 Viem.js 、Ethers.js 或其他的库来实现)来模拟一个命令行
// 钱包,钱包包含的功能有:
// • 1. 生成私钥、查询余额(可人工转入金额)
// • 2. 构建一个 ERC20 转账的 EIP 1559 交易
// • 3. 用 1 生成的账号,对 ERC20 转账进行签名
// • 4. 发送交易到 Sepolia 网络。

dotenv.config();

/**
 * 生成一个随机私钥
 */
function generatePrivateKey() {
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    return Buffer.from(randomBytes).toString('hex');
}
// 1. 生成私钥  
const privateKey = privateKeyToAccount(`${process.env.PRIVATE_KEY}` || generatePrivateKey());
console.log('privateKey:',privateKey);

// 推到账户
const userAddress = privateKey.address;
console.log('Account address:',userAddress);

// 2. 创建 Viem 客户端
const publicClient = createPublicClient({ chain: sepolia, transport: http() });
const walletClient = createWalletClient({ privateKey, chain: sepolia, transport: http() });

// 查询测试网eth余额
const balanceOf = await publicClient.getBalance({
    address: userAddress
})
// 查询自己发行的 ERC20 Token余额
const balanceOf_MTK = await publicClient.readContract({
    address: '0x3a4765fACd26809060432Ad8904297c5b6A6E8b6',
    abi: ABI,
    functionName: 'balanceOf',
    args: [userAddress]
})
console.log(`账户余额: ETH` ,balanceOf);
console.log(`账户余额: MTK` ,balanceOf_MTK);

// 查询nonce
const nonce = await publicClient.getTransactionCount({
    address: userAddress
})
console.log(`nonce: ${nonce}` );

// 构建交易参数
/**
 * 构建并发送 ERC20 转账交易（EIP-1559）
 * @param {string} recipient 接收地址
 * @param {string} amount 发送金额（ERC20 单位）
 * @param {string} tokenAddress 代币合约地址
 */
async function sendTransactionExample(recipient, amount, tokenAddress) {
    try {

        const decimals = 18; // 代币精度（不同 ERC20 可能不同）
        const amountInWei = parseUnits(amount, decimals);

        // ERC20 `tokensReceived` 方法的 ABI 编码
        const data = encodeFunctionData({
            abi: ABI,
            functionName: 'transfer',
            args: [recipient, amountInWei]
        });

        // 计算交易参数
        const [gasPrice] = await Promise.all([
            publicClient.getGasPrice(),
        ]);

        const txPrarams = {
            account: privateKey,
            to: tokenAddress,
            data,
            value: 0n,
            nonce,

            // EIP-1559 交易
            maxFeePerGas: gasPrice * 2n,
            maxPriorityFeePerGas: gasPrice / 2n,

            gas: 50000n, // 预估 Gas
        };
        
        console.log("正在签名交易...");
        const signedTx = await walletClient.signTransaction(txPrarams);

        console.log("正在发送交易...");
        const txHash = await walletClient.sendRawTransaction({
            serializedTransaction: signedTx,
        });
        console.log("交易哈希:", txHash);
    } catch (error) {
        console.log(error,'--error');
        
    }
}


// 运行示例
(async () => {
    await sendTransactionExample("0x314500582Cf2c459A6E31547397eB75A816D2a42", "1", "0x3a4765fACd26809060432Ad8904297c5b6A6E8b6");
})();
