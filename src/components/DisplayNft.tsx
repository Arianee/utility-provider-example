import React, {useEffect, useState} from "react";
import Core from "@arianee/core";
import {ServiceProvider} from "@arianee/service-provider";
import {Wallet} from "@arianee/wallet";
import {ChainType, Language} from '@arianee/common-types';
import styled from 'styled-components';
import SmartAssetInstance from "@arianee/wallet/src/lib/services/smartAsset/instances/smartAssetInstance";
import Input from "./Input";
import Button from "./Button";

export interface WalletNftsProps {
  wallet: Wallet<ChainType>;
  language: Language;
}

const NftDisplay = styled.div`
  /* Add your CSS here */
  font-size: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 35%;
`;

const NftDisplayTitle = styled.h2`
  font-size: 36px;
`
const NftImage = styled.img`
  width: 100px;
`
const Loader = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 300px;
  height: 100px;
  transform: translate(-50%, -50%);
  background: black;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white; 
  font-size: 25px;
`

function DisplayNft({wallet, transferPermit}:{wallet:any, transferPermit:string}){

  const [nft, setNft] = useState<
      SmartAssetInstance<ChainType, 'WAIT_TRANSACTION_RECEIPT'>
  >()
  const [receiverAddress, setreceiverAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);


  const core = Core.fromWallet(wallet as any);
  const serviceProvider = new ServiceProvider(core)

  function onBtnReqTransferNft(){
    try{
      setIsLoading(true);

      serviceProvider.transferSmartAsset({sst:transferPermit, to:receiverAddress})
          .then(tx=>{
            console.info(tx);
            tx.wait().then(()=>{
              setIsLoading(false);

              alert('Transfer success!')
            })
          })
    }
    catch (e) {
      console.error(e)
      setIsLoading(false);
      alert('Transfer failed!')
    }
  }
  if(!nft){
    serviceProvider.getSmartAssetFromSST({sst:transferPermit})
        .then((nft) => {
          setNft(nft)
        })
  }


  return (
        <NftDisplay>
          {isLoading && <Loader>Transfer in progress...</Loader>}
          <NftDisplayTitle>Permit Transfer Detected</NftDisplayTitle>
          {nft && <p>{nft.data.content.name}</p>}
          {nft && <p>{nft.data.content.description}</p>}
          {nft && nft.data.content.medias && <img src={nft.data.content.medias[0].url} />}
          <Input type="text" value={receiverAddress} onChange={e => setreceiverAddress(e.target.value)} placeholder="ReceiverAddress" />
          <Button onClick={onBtnReqTransferNft} $theme="pink">Transfer NFT</Button>
        </NftDisplay>
  )
}

export default DisplayNft;
