import { createPublicClient, http } from 'viem';
import { keccak256 } from 'ethers';
import { mainnet, sepolia } from 'viem/chains';

// 连接到以太坊节点（如 Infura 或本地节点）
const client = createPublicClient({
    chain: sepolia,
    transport: http('https://sepolia.infura.io/v3/2935dc49c33149ad8e66b52f09c22169'), // 免费的公共 RPC，也可替换 Infura 或 Alchemy
});

// 合约地址
const contractAddress = '0xa9437047fa98633980e90467349BD2502a776890';

// 读取存储插槽的工具函数
async function getStorageAt(slot: string) {
  const storage = await client.getStorageAt({
    address: contractAddress,
    slot: slot as `0x${string}`,
  });
  return storage || '0x'; // 如果为空，返回 0x
}

// 主函数
async function readLocks() {
  // 读取数组长度（存储在 slot 0）
  const lengthSlot = '0x0000000000000000000000000000000000000000000000000000000000000000';
  const lengthData = await getStorageAt(lengthSlot);
  const length = BigInt(lengthData);

  console.log(`Array length: ${length}`);

  // 计算数组元素的起始存储位置
  const startSlot = keccak256(lengthSlot); // keccak256(0)
  let currentSlot = BigInt(startSlot);

  // 遍历数组并读取每个元素
  for (let i = 0; i < length; i++) {
    // 读取 user (address)
    const userSlot = `0x${currentSlot.toString(16).padStart(64, '0')}`;
    const userData = await getStorageAt(userSlot);
    const user = `0x${userData.slice(-40)}`; // 提取后 20 字节

    // 读取 startTime (uint64)
    const startTimeSlot = `0x${(currentSlot + 1n).toString(16).padStart(64, '0')}`;
    const startTimeData = await getStorageAt(startTimeSlot);
    const startTime = BigInt(startTimeData);

    // 读取 amount (uint256)
    const amountSlot = `0x${(currentSlot + 2n).toString(16).padStart(64, '0')}`;
    const amountData = await getStorageAt(amountSlot);
    const amount = BigInt(amountData);

    // 打印结果
    console.log(
      `locks[${i}]: user: ${user}, startTime: ${startTime}, amount: ${amount}`
    );

    // 移动到下一个元素（每个元素占用 3 个插槽）
    currentSlot += 3n;
  }
}

// 运行主函数
readLocks().catch(console.error);