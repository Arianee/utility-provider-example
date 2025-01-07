import React, { useState } from 'react';
import './PocSTForm.css';
import {useParams, useNavigate} from "react-router-dom";
import {ArianeeApiClient} from "@arianee/arianee-api-client";
import Core from "@arianee/core";
import {ArianeeAccessToken} from "@arianee/arianee-access-token";

interface FormData {
  title: string;
  description: string;
}

const POCSTForm: React.FC = () => {
  const navigate = useNavigate();
  const { arianeeParams } = useParams();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    if (arianeeParams) {
      navigate(`/pocSt/${arianeeParams}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const arianeeApiClient = new ArianeeApiClient();
  const getNmpUrl = async ():Promise<string|undefined>=> {
    if (!arianeeParams) {
      throw new Error("no arianeeParams provided")
    }
    const [id, passphrase, network] = arianeeParams.split(",")
    const nftInfo = await arianeeApiClient.network.getNft(network, id)
    if (nftInfo.issuer) {
      const identity = await arianeeApiClient.network.getIdentity(network, nftInfo.issuer)
      if (identity && identity.rpcEndpoint) {
        const url = new URL(identity.rpcEndpoint)
        return url.hostname.replace('rpc', 'api');
      }
    }
    return undefined
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!arianeeParams) {
        throw new Error("no arianeeParams provided")
      }
      const [id, passphrase, network] = arianeeParams.split(",")

      const core = Core.fromPassPhrase(passphrase);
      const arianeeAccessToken = new ArianeeAccessToken(core);
      const aat = await arianeeAccessToken.createWalletAccessToken();

      const url = await getNmpUrl();
      const response = await fetch(`https://${url}/api/createAndStoreArianeeEvent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aat}`
        },
        body: JSON.stringify([
          {
            certificateId: parseInt(id),
            content:{"$schema":"https://cert.arianee.org/version1/ArianeeEvent-i18n.json","title":formData.title,"description":formData.description}
          }
        ])
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      // Reset form after successful submission
      setFormData({ title: '', description: '' });
      // You might want to add success feedback here
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div>
        <div className="header-container">
          <button onClick={handleBack} className="back-button">
            ‹
          </button>
          <h2 className="form-title">Create a new event</h2>
        </div>
        <form onSubmit={handleSubmit} className="simple-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                disabled={isLoading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
  );
};

export default POCSTForm;
