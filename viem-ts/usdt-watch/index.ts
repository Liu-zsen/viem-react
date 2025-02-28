import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

const publicClient = createPublicClient({
    chain: mainnet,
    transport: http('https://rpc.ankr.com/eth'), 
});

//1 监听新区块
publicClient.watchBlocks({
    onBlock:(block) => {
        console.log(`新区块高度: ${block.number}`,`区块哈希值: ${block.hash}`);
      },
})

//2 监听USDT_Transfer 
publicClient.watchEvent({
    // USDT_ADDRESS
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    event: {
      type: 'event',
      name: 'Transfer',
      inputs: [
        { name: 'from', type: 'address', indexed: true },
        { name: 'to', type: 'address', indexed: true },
        { name: 'value', type: 'uint256', indexed: false },
      ],
    },
    onLogs: (logs) => {
      logs.forEach((log) => {
        const { transactionHash, args } = log;
        const { from, to, value } = args;
        console.log(
          `在区块 ${log.blockNumber} 的交易 ${transactionHash} 中：`,
          `从 ${from} 转账 ${Number(value) / 1e6} USDT 到 ${to}`
        );
      });
    },
  });