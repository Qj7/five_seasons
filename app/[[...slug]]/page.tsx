import App from '../../src/App'

/**
 * Single optional catch-all route: every storefront URL (/, /catalog,
 * /product/[id], /cart, /brands/[slug], /admin, ...) resolves here and seeds
 * the client app with the initial navigation state. This gives real,
 * deep-linkable URLs + Back/Forward without a per-screen rewrite.
 */
export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>
}) {
  const { slug } = await params
  const initialPath = '/' + (slug ?? []).map(encodeURIComponent).join('/')
  return <App initialPath={initialPath} />
}
