import { site } from '../../config/site.ts';
import type { SocialLink } from '../../types/content.ts';
import { useT } from '../../lib/i18n.tsx';
import { Icon } from './Icon.tsx';

interface Props {
  variant?: 'inline' | 'stack' | 'big';
  className?: string;
  /** Channels to leave out (e.g. ['email'] on social-first sections). */
  exclude?: SocialLink['id'][];
}

/**
 * Email / LinkedIn / GitHub. Links without a confirmed destination render
 * as a non-interactive "PENDING" placeholder — never as a fake URL.
 */
export function SocialLinks({ variant = 'inline', className = '', exclude = [] }: Props) {
  const t = useT();
  return (
    <ul className={`social social--${variant} ${className}`}>
      {site.social.filter((s) => (s.href || !s.optional) && !exclude.includes(s.id)).map((s) => {
        const label = s.id === 'email' && variant === 'big' ? t.contact.email : s.label;
        const content = (
          <>
            <span className="social__icon"><Icon name={s.id} size={variant === 'big' ? 22 : 16} /></span>
            <span className="social__label">{label}</span>
            <span className="social__arrow"><Icon name="arrow-ne" size={variant === 'big' ? 28 : 14} /></span>
          </>
        );
        if (!s.href) {
          return (
            <li key={s.id}>
              <span className="social__link is-pending" aria-disabled="true">
                {content}
                <span className="pending">Pending</span>
              </span>
            </li>
          );
        }
        const external = !s.href.startsWith('mailto:');
        return (
          <li key={s.id}>
            <a
              className="social__link"
              href={s.href}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {content}
              {external && <span className="sr-only"> ({t.a11y.external})</span>}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
