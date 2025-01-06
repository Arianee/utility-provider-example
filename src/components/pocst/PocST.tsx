import "./PocST.css"
import {SmartAssetInstance, Wallet} from "@arianee/wallet";
import {useState} from "react";
import {ChainType} from "@arianee/common-types";
import {useParams} from "react-router-dom";

function PocST() {
  const { arianeeParams } = useParams();
  const [nft, setNft] = useState<SmartAssetInstance<ChainType, 'WAIT_TRANSACTION_RECEIPT'>|undefined>();
  const wallet = new Wallet();

  if(!nft){
    try{
      if(!arianeeParams){
        throw new Error("no arianeeParams provided")
      }

      const [id,passphrase,network]= arianeeParams.split(",")
      wallet.smartAsset.get(network, {id,passphrase})
          .then((nft)=>{
            setNft(nft);
          })
    }
    catch (e) {
      // Handle error if needed
    }
  }

  return (
      <div className="passport-container">
        {nft && nft.data.content.medias && nft.data.content.medias.length > 0 && (
            <div className="image-container">
              <img
                  src={nft.data.content.medias[0].url}
                  alt={nft.data.content.name || "NFT image"}
                  className="nft-image"
              />
            </div>
        )}

        {/* Title */}
        {nft && <h1 className="passport-title">{nft.data.content.name}</h1>}

        {/* Scrollable Technical Description */}
        {nft && <div className="description-section">
            <div className="description-content">
                <p>{nft.data.content.description}</p>
            </div>
        </div>}
      </div>
  );
}

export default PocST;
