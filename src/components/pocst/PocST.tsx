import "./PocST.css"
import {IdentityInstance, SmartAssetInstance, Wallet} from "@arianee/wallet";
import {useState} from "react";
import {BrandIdentity, ChainType} from "@arianee/common-types";
import {useParams, useNavigate} from "react-router-dom";

function PocST() {
  const { arianeeParams } = useParams();
  const navigate = useNavigate();
  const [nft, setNft] = useState<SmartAssetInstance<ChainType, 'WAIT_TRANSACTION_RECEIPT'>|undefined>();
  const [issuerIdentity, setIssuerIdentity] = useState<IdentityInstance<BrandIdentity>|undefined>();
  const [identityLogo, setIdentityLogo] = useState<string|undefined>();
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
            wallet.identity.get(nft.data.issuer).then
            ((issuerIdentity)=>{
              setIssuerIdentity(issuerIdentity);
              extractAndSetIdentityLogo(issuerIdentity)
            });
          })
    }
    catch (e) {
      // Handle error if needed
    }
  }

  const handleAddEvent = () => {
    if (arianeeParams) {
      navigate(`/pocSt/form/${arianeeParams}`);
    }
  };

  const extractAndSetIdentityLogo = (identity:IdentityInstance<BrandIdentity>)=>{
    const logo = identity?.data.content.pictures?.find(picture=>picture.type==="brandLogoSquare")
    if(logo)
      setIdentityLogo(logo.url);
  }
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp*1000);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(',', '');
  };

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

        {/* List Section */}
        {nft && <h2 className="history-title">History</h2>}
        <div className="list-section">
          {nft && nft.arianeeEvents.map((item, index) => (
              <div key={index} className="list-item">
                {identityLogo && <div className="list-item-logo">
                    <img src={identityLogo} />
                </div>}
                <div className="list-item-content">
                  <div className="list-item-header">
                    <h3 className="list-item-title">{item.content.title}</h3>
                    <span className="list-item-date">{formatDate(item.timestamp)}</span>
                  </div>
                  <p className="list-item-description">{item.content.description}</p>
                </div>
              </div>
          ))}
        </div>

        {/* Add Event Button */}
        {nft &&<button
            onClick={handleAddEvent}
            className="add-event-button"
        >
          Add an event
        </button>}
      </div>
  );
}

export default PocST;
