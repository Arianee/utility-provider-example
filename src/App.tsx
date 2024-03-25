import "./App.css";

import React, { useState } from "react";
import styled from "styled-components";
import { ethers } from "ethers";

import Button from "./components/Button";
import Input from "./components/Input";
import Separator from "./components/Separator";
import { DAPP_QUERY_PARAM, DAPP_URL, PRIVATE_KEY } from "./constants";
import { AccessRequest, useRequestor } from "./hooks/useRequestor";

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

const Wallet = new ethers.Wallet(PRIVATE_KEY);

function App() {
  const [serialNumber, setSerialNumber] = useState<string>("");

  const [requestAccess] = useRequestor(Wallet);
  const baseAccessRequest: AccessRequest = {
    requesterAddress: Wallet.address,
    issuerAddress: ethers.ZeroAddress,
    type: "sst",
    label: "repair",
    redirectTo: "http://localhost:3000",
  };

  const promptUserBeforeRedirect = (signedAccessRequest: string) => {
    if (window.confirm("You are about to be redirected to app.arianee.com.\nDo you want to proceed?")) {
      window.location.href = `${DAPP_URL}?${DAPP_QUERY_PARAM}=${signedAccessRequest}`;
    }
  }

  const onBtnReqAccessNoFilterClick = async () => {
    const accessRequest = await requestAccess({ ...baseAccessRequest });
    console.info(`[onBtnReqAccessNoFilterClick] ${DAPP_URL}?${DAPP_QUERY_PARAM}=${accessRequest}`);
    promptUserBeforeRedirect(accessRequest);
  };

  const onBtnReqAccessWithFilterClick = async () => {
    if (!serialNumber || serialNumber.length === 0) {
      window.alert("Please enter a serial number");
      return;
    }
    const accessRequest = await requestAccess({ ...baseAccessRequest, filter: { serialNumber } });
    console.info(`[onBtnReqAccessWithFilterClick] ${DAPP_URL}?${DAPP_QUERY_PARAM}=${accessRequest}`);
    promptUserBeforeRedirect(accessRequest);
  };

  return (
    <div className="App">
      <header className="App-header">
        <Title>Awesome Utility Provider</Title>
        <ActionPanel>
          <p>Connect your wallet</p>
          <Button $theme="green" disabled>Your wallet: {Wallet.address}</Button>
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
      </header>
    </div>
  );
}

export default App;
