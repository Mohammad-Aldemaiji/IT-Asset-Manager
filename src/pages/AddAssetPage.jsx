import { useNavigate } from 'react-router-dom';
import AssetForm from '../components/AssetForm';
import PageHeader from '../components/PageHeader';
import { useAssets } from '../context/useAssets';

/** Page with an empty form for creating a new asset. */
export default function AddAssetPage() {
  const { addAsset } = useAssets();
  const navigate = useNavigate();

  const handleSubmit = (values) => {
    const result = addAsset(values);
    if (result.ok) {
      navigate(`/assets/${result.id}`, {
        state: { notice: `Asset ${result.id} was added.` },
      });
    }
    return result;
  };

  return (
    <>
      <PageHeader title="Add asset" subtitle="Fields marked * are required." />
      <AssetForm onSubmit={handleSubmit} onCancel={() => navigate('/assets')} submitLabel="Add asset" />
    </>
  );
}
