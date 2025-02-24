# viem-react

## 1. 安装依赖

```bash
cd viem-wallet
npm install 
node wallet.js
```

## 功能说明
生成私钥：
若 .env 文件中无私钥，则自动生成一个新的私钥（请妥善保存）。

查询账户余额：
使用 publicClient.getBalance() 获取 ETH 余额。

构建 ERC20 交易：
使用 ERC20 代币的 transfer 方法进行 ABI 编码。
采用 EIP-1559 交易，自动计算 maxFeePerGas 和 maxPriorityFeePerGas。

签名交易：
通过 walletClient.signTransaction(tx) 进行签名。

发送交易：
使用 walletClient.sendRawTransaction(signedTx) 发送到 Sepolia 测试网。

## 依赖
viem.js：用于交互以太坊（比 ethers.js 更高效）。
dotenv：管理私钥环境变量。
这个脚本可以轻松扩展，例如：

支持手动输入转账信息（使用 readline 获取用户输入）。
查询 ERC20 余额。
在多个 EVM 兼容链上运行（如 Polygon、Arbitrum）。
