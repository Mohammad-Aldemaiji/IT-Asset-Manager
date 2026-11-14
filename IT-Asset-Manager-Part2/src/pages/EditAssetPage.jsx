import { useNavigate, useParams } from 'react-router-dom';
import AssetForm from '../components/AssetForm';
import PageHeader from '../components/PageHeader';
import { useAssets } from '../context/useAssets';
import RequestState from '../components/RequestState';
import { useAssetQuery } from '../context/useAssetQuery';
import AssetNotFound from './AssetNotFound';

/** Page with the form filled in with an existing asset's values. */
export default function EditAssetPage() {
  const { id } = useParams();
  const { updateAsset } = useAssets();
  const navigate = useNavigate();
  const response = useAssetQuery('get', { id });
  const asset = response.data;
  if (response.error?.status === 404) return <AssetNotFound id={id} />;
  if (!asset) return <RequestState {...response} />;

  const handleSubmit = async (values) => {
    const result = await updateAsset(id, values);
    if (result.ok) {
      navigate(`/assets/${id}`, { state: { notice: 'Changes saved.' } });
    }
    return result;
  };

  return (
    <>
      <PageHeader title={`Edit ${asset.name}`} subtitle={`Asset ID ${asset.id} · fields marked * are required.`} />
      {/* key={id} makes the form start fresh if the user switches to another asset */}
      <AssetForm
        key={id}
        initialValues={{ ...asset, warrantyExpiry: asset.warrantyExpiry || '', purchasePrice: String(asset.purchasePrice) }}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/assets/${id}`)}
        submitLabel="Save changes"
      />
    </>
  );
}
