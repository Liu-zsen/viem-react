import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains';
// import erc721ABI from '../abi/erc721.json' assert { type: "json" };


const abi = [  
  {  
      "name": "ownerOf",  
      "inputs": [{"name": "tokenId", "type": "uint256"}],  
      "outputs": [{"name": "", "type": "address"}],  
      "stateMutability": "view",  
      "type": "function"  
  },  
  {  
      "name": "tokenURI",  
      "inputs": [{"name": "tokenId", "type": "uint256"}],  
      "outputs": [{"name": "", "type": "string"}],  
      "stateMutability": "view",  
      "type": "function"  
  }  
];  

// 创建客户端
const client = createPublicClient({
  chain: mainnet,
  transport: http()
})

const NFT_ADDRESS = '0x0483b0dfc6c78062b9e999a82ffb795925381415'

async function getNFTInfo(tokenId: number) {
  try {
    // 1. 获取 NFT持有人地址
    const owner = await client.readContract({
      address: NFT_ADDRESS,
      abi,
      functionName: 'ownerOf',
      args: [tokenId]
    })

    // 2. 获取 NFT的元数据
    const tokenURI = await client.readContract({
      address: NFT_ADDRESS,
      abi,
      functionName: 'tokenURI',
      args: [tokenId]
    })

    console.log(`Token ID ${tokenId}:`)
    console.log(`持有人地址: ${owner}`)
    console.log(`TokenURI: ${tokenURI}`)
    
    return { owner, tokenURI }
  } catch (error) {
    console.error('获取 NFT 信息失败:', error)
    throw error
  }
}

// 使用示例
getNFTInfo(11) // 替换为你想查询的 tokenId
