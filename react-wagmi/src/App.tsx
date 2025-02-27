import { createAppKit } from '@reown/appkit/react'

import { WagmiProvider } from 'wagmi'
import { useState } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ActionButtonList } from './components/ActionButtonList'
import { SmartContractActionButtonList } from './components/SmartContractActionButtonList'
import { InfoList } from './components/InfoList'
import { projectId, metadata, networks, wagmiAdapter } from './config'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'

import "./App.css"
import Permit from './pages/Permit'

const queryClient = new QueryClient()

const generalConfig = {
  projectId,
  networks,
  metadata,
  themeMode: 'light' as const,
  themeVariables: {
    '--w3m-accent': '#000000',
  }
}

// Create modal
createAppKit({
  adapters: [wagmiAdapter],
  ...generalConfig,
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  }
})

export function App() {
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>(undefined);
  const [signedMsg, setSignedMsg] = useState('');
  const [balance, setBalance] = useState('');
  const [bankBalance, setBankBalance] = useState('');

  const receiveHash = (hash: `0x${string}`) => {
    setTransactionHash(hash); // Update the state with the transaction hash
  };

  const receiveSignedMsg = (signedMsg: string) => {
    setSignedMsg(signedMsg); // Update the state with the transaction hash
  };

  const receivebalance = (balance: string) => {
    setBalance(balance)
  }

  const receivebankBalance = (bankBalance: string) => {
    setBankBalance(bankBalance)
  }


  return (
    <BrowserRouter>
      <div className={"pages"}>
        {/* <img src="/reown.svg" alt="Reown" style={{ width: '150px', height: '150px' }} /> */}
        <h1>AppKit Wagmi React dApp Example</h1>
        
        {/* 添加导航链接 */}
        <nav>
          <Link to="/" className="link-button">Home</Link>
          <Link to="/permit" className="link-button">Permit</Link>
        </nav>

        <WagmiProvider config={wagmiAdapter.wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <Routes>
              <Route path="/" element={
                <>
                  <appkit-button />
                  <ActionButtonList sendHash={receiveHash} sendSignMsg={receiveSignedMsg} sendBalance={receivebalance} sendBankBalance={receivebankBalance}/>
                  <SmartContractActionButtonList />
                  <div className="advice">
                    <p>
                      This projectId only works on localhost. <br/>
                      Go to <a href="https://cloud.reown.com" target="_blank" className="link-button" rel="Reown Cloud">Reown Cloud</a> to get your own.
                    </p>
                  </div>
                  <InfoList hash={transactionHash} signedMsg={signedMsg} balance={balance} bankBalance={bankBalance}/>
                </>
              } />
              <Route path="/permit" element={<Permit />} />
            </Routes>
          </QueryClientProvider>
        </WagmiProvider>
      </div>
    </BrowserRouter>
  )
}

export default App
