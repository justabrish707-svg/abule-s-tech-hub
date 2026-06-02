import { Helmet } from "react-helmet-async";

const SITE_URL = "https://abule-tech.lovable.app";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  ogType?: "website" | "article";
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageType?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export const SEO = ({
  title,
  description,
  path,
  ogType = "website",
  image,
  imageWidth = 1200,
  imageHeight = 630,
  imageType,
  jsonLd,
}: SEOProps) => {
  const url = `${SITE_URL}${path}`;
  const ldArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="Abule Tech" />
      {image && <meta property="og:image" content={image} />}
      {image && <meta property="og:image:width" content={String(imageWidth)} />}
      {image && <meta property="og:image:height" content={String(imageHeight)} />}
      {image && imageType && <meta property="og:image:type" content={imageType} />}
      {image && <meta property="og:image:alt" content={title} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      {ldArray.map((ld, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(ld)}</script>
      ))}
    </Helmet>
  );
};

export default SEO;
