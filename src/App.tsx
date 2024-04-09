import "./App.css";

import React, {useState} from "react";
import styled from "styled-components";
import {ethers} from "ethers";

import Button from "./components/Button";
import Input from "./components/Input";
import Separator from "./components/Separator";
import {DAPP_QUERY_PARAM, DAPP_URL} from "./constants";
import {AccessRequest, useRequestor} from "./hooks/useRequestor";
import DisplayNft from "./components/DisplayNft";

const Title = styled.h1`
  font-size: 1.5em;
  text-align: center;
  margin-bottom: 3rem;
`;

const ActionPanel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

//let Wallet:ethers.Wallet|null = null;

function App() {
  const [serialNumber, setSerialNumber] = useState<string>("");
  const [privateKey, setPrivateKey] = useState<string>("");
  const [issuerAddress, setIssuerAddress] = useState<string>("0x305051e9a023fe881EE21cA43fd90c460B427Caa");
  const [brandAppUrl, setBrandAppUrl] = useState<string>("https://app.arianee.com");
  const [Wallet, setWallet] = useState<ethers.Wallet|null>(null);
  const [baseAccessRequest, setBaseAccessRequest] = useState<AccessRequest>({
    requesterAddress: "",
    issuerAddress: "",
    type: "sst",
    label: "resell",
    redirectTo: window.location.href
  })
  const [requestAccess] = useRequestor(Wallet);

  const configWallet = (privateKey: string) => {
    const wallet = new ethers.Wallet(privateKey);
    baseAccessRequest.requesterAddress = wallet.address;
    setBaseAccessRequest(baseAccessRequest);
    setWallet(wallet);
    return wallet;
  }

  const privateKeyStored = localStorage.getItem('privatekey');
  if (privateKeyStored && !Wallet) {
    setPrivateKey(privateKeyStored);
    configWallet(privateKeyStored);
  }


  const onBtnConnectWalletClick = async () => {
    if (!privateKey || privateKey.length !== 66) {
      window.alert("Please enter a valid private key");
      return;
    }
    localStorage.setItem('privatekey', privateKey);
    const wallet = configWallet(privateKey);
    console.info(`[onBtnConnectWalletClick] ${wallet.address}`);
  };

  const promptUserBeforeRedirect = (signedAccessRequest: string) => {
    if (window.confirm("You are about to be redirected to app.arianee.com.\nDo you want to proceed?")) {
      window.location.href = `${DAPP_URL}?${DAPP_QUERY_PARAM}=${signedAccessRequest}`;
    }
  }

  const onBtnReqAccessNoFilterClick = async () => {
    if(!Wallet) {
        window.alert("Please connect your wallet first");
        return;
    }

    const accessRequest = await requestAccess({ ...baseAccessRequest, issuerAddress, redirectTo:brandAppUrl });
    console.info(`[onBtnReqAccessNoFilterClick] ${DAPP_URL}?${DAPP_QUERY_PARAM}=${accessRequest}`);
    promptUserBeforeRedirect(accessRequest);
  };

  const onBtnReqAccessWithFilterClick = async () => {
    if(!Wallet) {
      window.alert("Please connect your wallet first");
      return;
    }
    if (!serialNumber || serialNumber.length === 0) {
      window.alert("Please enter a serial number");
      return;
    }
    const accessRequest = await requestAccess({ ...baseAccessRequest, filter: { serialNumber }, issuerAddress, redirectTo:brandAppUrl});
    console.info(`[onBtnReqAccessWithFilterClick] ${DAPP_URL}?${DAPP_QUERY_PARAM}=${accessRequest}`);
    promptUserBeforeRedirect(accessRequest);
  };

  const location = window.location;
  const queryParams = new URLSearchParams(location.search);
  const transferPermit = queryParams.get('transferPermit');

  return (
    <div className="App">
      <header className="App-header">
        <Title>Awesome Utility Provider</Title>
        <ActionPanel>
          <p>1/ Enter the private key that will sign the brand connect request</p>
          <Input type="password" value={privateKey} onChange={e => setPrivateKey(e.target.value)} placeholder="PrivateKey" />
          {Wallet ? <Button $theme="green" disabled>Your wallet: {Wallet.address}</Button> : <Button $theme="green" onClick={onBtnConnectWalletClick}>Connect Wallet</Button> }
        </ActionPanel>
        <ActionPanel>
          <p>2/ Enter the address of the brand that issued the DPP you want to request</p>
          <Input type="text" value={issuerAddress} onChange={e => setIssuerAddress(e.target.value)} placeholder="PrivateKey" />
        </ActionPanel>
        <ActionPanel>
          <p>3/ Enter the URL of the brand app</p>
          <Input type="text" value={brandAppUrl} onChange={e => setBrandAppUrl(e.target.value)} placeholder="PrivateKey" />
        </ActionPanel>
        <ActionPanel>
          <p>Make a request</p>
          <Button onClick={onBtnReqAccessNoFilterClick} $theme="blue">Request access to one of your NFT</Button>
        </ActionPanel>
        <Separator />
        <ActionPanel>
          <Input type="text" value={serialNumber} onChange={e => setSerialNumber(e.target.value)} placeholder="Serial number" />
          <Button onClick={onBtnReqAccessWithFilterClick} $theme="pink">Request access to a specific NFT</Button>
        </ActionPanel>
        <Separator />
        {transferPermit && <DisplayNft wallet={Wallet} transferPermit={transferPermit} />}
      </header>
    </div>
  );
}

export default App;
