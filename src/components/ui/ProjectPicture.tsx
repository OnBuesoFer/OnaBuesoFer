import type { ProjectImage } from '../../types/content.ts';
import { posterUrl, srcSet, variantUrl, widthsFor } from '../../lib/media.ts';
import { useL } from '../../lib/i18n.tsx';

interface Props {
  image: ProjectImage;
  /** `full` = entire page; `poster` = 16:10 crop from the top. */
  mode?: 'full' | 'poster';
  sizes?: string;
  className?: string;
  eager?: boolean;
  decorative?: boolean;
}

/** AVIF → WebP → fallback, with intrinsic size to prevent layout shift. */
export function ProjectPicture({ image, mode = 'full', sizes = '100vw', className, eager, decorative }: Props) {
  const l = useL();
  const alt = decorative ? '' : l(image.alt);
  const loading = eager ? 'eager' : 'lazy';
  if (mode === 'poster') {
    return (
      <picture className={className}>
        <source type="image/avif" srcSet={`${posterUrl(image.file, 960, 'avif')} 960w, ${posterUrl(image.file, 1200, 'avif')} 1200w`} sizes={sizes} />
        <source type="image/webp" srcSet={`${posterUrl(image.file, 960, 'webp')} 960w, ${posterUrl(image.file, 1200, 'webp')} 1200w`} sizes={sizes} />
        <img src={posterUrl(image.file, 960, 'jpg')} width={1200} height={750} alt={alt} loading={loading} decoding="async" />
      </picture>
    );
  }
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={srcSet(image, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(image, 'webp')} sizes={sizes} />
      <img
        src={variantUrl(image.file, Math.max(...widthsFor(image.width).filter((w) => w <= 1080)), 'webp')}
        width={image.width}
        height={image.height}
        alt={alt}
        loading={loading}
        decoding="async"
        {...(eager ? { fetchPriority: 'high' as const } : {})}
      />
    </picture>
  );
}
