import { Request, Response } from 'express'

export enum SitemapSection {
  index = '/sitemap.xml',
  main = '/sitemap/main.xml',
}

type UrlItem = {
  url: string
  updatedAt: string
}

type SitemapGeneratorProps = {
  siteOrigin: string
}

const generateSitemapXML = (
  items: UrlItem[],
  {
    siteOrigin,
    priority = 0.9,
  }: SitemapGeneratorProps & {
    priority?: number
  },
): string => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

  items.forEach((item) => {
    xml += '  <url>\n'
    xml += `    <loc>${siteOrigin}${item.url}</loc>\n`
    xml += `    <lastmod>${item.updatedAt}</lastmod>\n`
    xml += `    <priority>${priority}</priority>\n`
    xml += '  </url>\n'
  })

  xml += '</urlset>'
  return xml
}

export const generateSitemapIndex = async ({
  siteOrigin,
}: SitemapGeneratorProps): Promise<string> => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <sitemap>
        <loc>${siteOrigin}/sitemap/main.xml</loc>
    </sitemap>
</sitemapindex>`
}

export const generateSitemapMain = async (
  props: SitemapGeneratorProps,
): Promise<string> => {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const monday = new Date(now)
  monday.setDate(now.getDate() - diffToMonday)

  const xmlData: UrlItem[] = [
    {
      url: `/`,
      updatedAt: monday.toISOString().split('T')[0],
    },
  ]

  return generateSitemapXML(xmlData, props)
}

/**
 * Обрабатывает запрос для генерации sitemap
 * @param type тип sitemap (cities или companies)
 * @param res объект ответа Express
 */
export const generateSitemap = async (req: Request, res: Response) => {
  res.header('Content-Type', 'application/xml')

  const siteOrigin = `${req.protocol}://${req.headers.host}`

  switch (req.url) {
    case SitemapSection.index:
      res.send(await generateSitemapIndex({ siteOrigin }))
      break
    case SitemapSection.main:
      res.send(await generateSitemapMain({ siteOrigin }))
      break
    default:
      res.status(404).send('Not found')
  }
}
