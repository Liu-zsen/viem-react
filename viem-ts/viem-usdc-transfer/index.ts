import { createPublicClient, http, parseAbiItem, formatUnits } from 'viem';
import { mainnet } from 'viem/chains';

// USDC 合约地址
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
// 解析 Transfer 事件 ABI
const TRANSFER_EVENT = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)');

// 创建公共客户端，连接 Ethereum 主网
const client = createPublicClient({
  chain: mainnet,
  transport: http('https://rpc.ankr.com/eth'), // 免费的公共 RPC，也可替换 Infura 或 Alchemy
});

async function getLatestUSDCTransfers() {
  try {
    // 获取最新区块号
    const LATEST_BLOCK = await client.getBlockNumber();
    console.log(`最新区块号: ${LATEST_BLOCK}`);

    // 查询当前最新的 100 个区块
    const from_block = LATEST_BLOCK - BigInt(99);
    const to_Block = LATEST_BLOCK;

    // 获取范围内的 Transfer 事件日志，过滤条件为 USDC 合约地址
    const logs = await client.getLogs({
      address: USDC_ADDRESS,
      event: TRANSFER_EVENT,
      fromBlock: from_block,
      toBlock: to_Block,
    });

    console.log(`在最近100个区块中找到${logs.length}USDC转账事件`);
    
    // 处理并格式化日志
    logs.forEach((log) => {
      const { args, transactionHash } = log;
      if (args && 'from' in args && 'to' in args && 'value' in args) {
        const { from, to, value } = args;
        if (value === undefined) return;
        
        // USDC 有 6 位小数，使用 formatUnits 转换
        const amount = formatUnits(value, 6);
        console.log( `从 ${from} 转账给 ${to} ${amount} USDC ,交易ID：${transactionHash}`);
      }
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

// 执行脚本
getLatestUSDCTransfers();