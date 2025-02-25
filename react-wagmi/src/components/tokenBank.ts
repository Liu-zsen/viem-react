const bankABI = [{
	"type": "constructor",
	"inputs": [{
		"name": "_tokenAddress",
		"type": "address",
		"internalType": "address"
	}],
	"stateMutability": "nonpayable"
}, {
	"type": "function",
	"name": "balances",
	"inputs": [{
		"name": "",
		"type": "address",
		"internalType": "address"
	}, {
		"name": "",
		"type": "address",
		"internalType": "address"
	}],
	"outputs": [{
		"name": "",
		"type": "uint256",
		"internalType": "uint256"
	}],
	"stateMutability": "view"
}, {
	"type": "function",
	"name": "deposit",
	"inputs": [{
		"name": "amount",
		"type": "uint256",
		"internalType": "uint256"
	}],
	"outputs": [],
	"stateMutability": "nonpayable"
}, {
	"type": "function",
	"name": "getBalance",
	"inputs": [{
		"name": "user",
		"type": "address",
		"internalType": "address"
	}],
	"outputs": [{
		"name": "",
		"type": "uint256",
		"internalType": "uint256"
	}],
	"stateMutability": "view"
}, {
	"type": "function",
	"name": "tokenAddress",
	"inputs": [],
	"outputs": [{
		"name": "",
		"type": "address",
		"internalType": "address"
	}],
	"stateMutability": "view"
}, {
	"type": "function",
	"name": "withdraw",
	"inputs": [{
		"name": "amount",
		"type": "uint256",
		"internalType": "uint256"
	}],
	"outputs": [],
	"stateMutability": "nonpayable"
}]


	export default bankABI;
