import { notFound } from 'next/navigation';
import { isDesignSystemCatalogAvailable } from '../../components/design-system/catalog-availability';
import { DesignSystemCatalog } from '../../components/design-system/DesignSystemCatalog';

export default function DesignSystemPage() {
  if (!isDesignSystemCatalogAvailable()) notFound();
  return <DesignSystemCatalog />;
}
