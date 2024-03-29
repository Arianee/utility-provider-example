import { Wallet } from "ethers";
import { Buffer } from "buffer";

interface AccessRequestBase {
  requesterAddress: string;
  issuerAddress: string;
  filter?: {
    serialNumber: string;
  };
  refresh?: {
    previousToken: string;
  };
  label: "repair" | "resell";
  redirectTo: string;
}

interface AccessRequestSst extends AccessRequestBase {
  type: "sst";
}

interface AccessRequestAat extends AccessRequestBase {
  type: "aat";
  scope: "wallet" | "nft";
}

type AccessRequest = AccessRequestSst | AccessRequestAat;

function useRequestor(wallet: Wallet|null) {
  const requestAccess = async (accessRequest: AccessRequest) => {
    if(!wallet) {
      throw new Error("Wallet is not defined");
    }
    console.log(accessRequest);
    // Encode the access request with base64
    const encodedAccessRequest = Buffer.from(
      JSON.stringify(accessRequest)
    ).toString("base64");

    // Sign the encoded access request
    const signedAccessRequest = await wallet.signMessage(encodedAccessRequest);

    return `${encodedAccessRequest}.${signedAccessRequest}`;
  };

  return [requestAccess];
}

export {
  type AccessRequest,
  type AccessRequestSst,
  type AccessRequestAat,
  useRequestor,
};
