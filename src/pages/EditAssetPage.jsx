import { useNavigate, useParams } from 'react-router-dom';
import AssetForm from '../components/AssetForm';
import PageHeader from '../components/PageHeader';
import { useAssets } from '../context/useAssets';
import AssetNotFound from './AssetNotFound';

/** Page with the form filled in with an existing asset's values. */
export default function EditAssetPage() {
  const { id } = useParams();
  const { getAsset, updateAsset } = useAssets();
  const navigate = useNavigate();
  const asset = getAsset(id);

  if (!asset) return <AssetNotFound id={id} />;

  const handleSubmit = (values) => {
    const result = updateAsset(id, values);
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
        initialValues={{ ...asset, purchasePrice: String(asset.purchasePrice) }}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/assets/${id}`)}
        submitLabel="Save changes"
      />
    </>
  );
}
