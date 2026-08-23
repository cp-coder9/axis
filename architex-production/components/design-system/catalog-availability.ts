export function isDesignSystemCatalogAvailable(environment = process.env.NODE_ENV) {
  return environment !== 'production';
}
