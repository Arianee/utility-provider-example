import "./PocST.css"
import { IdentityInstance, SmartAssetInstance, Wallet } from "@arianee/wallet";
import { useCallback, useState, useEffect, useRef } from "react";
import { BrandIdentity, ChainType } from "@arianee/common-types";
import { useParams, useNavigate } from "react-router-dom";
import { getSmartAssetWithCache, smartAssetCache } from "../../services/SmartAssetCache";

function PocST() {
  const { arianeeParams } = useParams();
  const navigate = useNavigate();
  const [nft, setNft] = useState<SmartAssetInstance<ChainType, 'WAIT_TRANSACTION_RECEIPT'>|undefined>();
  const [issuerIdentity, setIssuerIdentity] = useState<IdentityInstance<BrandIdentity>|undefined>();
  const [identityLogo, setIdentityLogo] = useState<string|undefined>();
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const wallet = new Wallet();
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const scrollStartPosition = useRef<number>(0);

  const loadData = useCallback(async () => {
    if (!arianeeParams) {
      throw new Error("no arianeeParams provided");
    }

    const [id, passphrase, network] = arianeeParams.split(",");
    try {
      const nftData = await getSmartAssetWithCache(wallet, network, { id, passphrase });
      setNft(nftData);
      const identity = await wallet.identity.get(nftData.data.issuer);
      setIssuerIdentity(identity);
      extractAndSetIdentityLogo(identity);
    } catch (error) {
      console.error('Error fetching NFT:', error);
    }
  }, [arianeeParams, wallet]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Clear the cache
    smartAssetCache.clear();
    // Reload data
    await loadData();
    setIsRefreshing(false);
  }, [loadData]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      scrollStartPosition.current = container.scrollTop;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (container.scrollTop === 0) {
        const touchY = e.touches[0].clientY;
        const diff = touchY - touchStartY.current;

        if (diff > 100 && !isRefreshing) {
          handleRefresh();
        }
      }
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, [handleRefresh, isRefreshing]);

  const extractAndSetIdentityLogo = useCallback((identity: IdentityInstance<BrandIdentity>): void => {
    const logo = identity?.data.content.pictures?.find(
        (picture) => picture.type === "brandLogoSquare"
    );
    if (logo) {
      setIdentityLogo(logo.url);
    }
  }, []);

  useEffect(() => {
    if (!nft) {
      loadData();
    }
  }, [nft, loadData]);

  const handleAddEvent = useCallback(() => {
    if (arianeeParams) {
      navigate(`/pocSt/form/${arianeeParams}`);
    }
  }, [arianeeParams, navigate]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
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
      <div className="passport-container" ref={containerRef}>
        {isRefreshing && (
            <div className="refresh-indicator">
              Refreshing...
            </div>
        )}

        {nft && nft.data.content.medias && nft.data.content.medias.length > 0 && (
            <div className="image-container">
              <img
                  src={nft.data.content.medias[0].url}
                  alt={nft.data.content.name || "NFT image"}
                  className="nft-image"
              />
            </div>
        )}

        {nft && <h1 className="passport-title">{nft.data.content.name}</h1>}

        {nft && (
            <div className="description-section">
              <div className="description-content">
                <p>{nft.data.content.description}</p>
              </div>
            </div>
        )}

        {nft && <h2 className="history-title">History</h2>}
        <div className="list-section">
          {nft && nft.arianeeEvents.map((item, index) => (
              <div key={index} className="list-item">
                {identityLogo && (
                    <div className="list-item-logo">
                      <img src={identityLogo} alt="Brand logo" />
                    </div>
                )}
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

        {nft && (
            <button
                onClick={handleAddEvent}
                className="add-event-button"
            >
              Add an event
            </button>
        )}
      </div>
  );
}

export default PocST;
