import { Link } from 'react-router-dom';
import { cx } from '../lib/format';

export function LogoMark({ className = '' }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cx('h-8 w-8 shrink-0', className)}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="9.5" fill="#C9F65D" />
      <circle cx="13.5" cy="17.2" r="8" fill="#08100B" />
      <circle cx="19.8" cy="11.6" r="7.2" fill="#C9F65D" />
      <circle cx="24.3" cy="8.2" r="1.7" fill="#08100B" />
    </svg>
  );
}

const sizes = {
  sm: { mark: 'h-7 w-7', word: 'text-[19px]' },
  md: { mark: 'h-8 w-8', word: 'text-[22px]' },
  lg: { mark: 'h-10 w-10', word: 'text-[27px]' },
};

export default function Logo({
  theme = 'dark',
  size = 'md',
  to,
  className = '',
}) {
  const content = (
    <>
      <LogoMark className={sizes[size].mark} />
      <span
        className={cx(
          'font-display font-semibold tracking-[-0.055em]',
          sizes[size].word,
          theme === 'dark' ? 'text-cream' : 'text-ink',
        )}
      >
        paylune
      </span>
    </>
  );

  const classes = cx('inline-flex items-center gap-2.5', className);

  if (to) {
    return (
      <Link to={to} className={classes} aria-label="Paylune home">
        {content}
      </Link>
    );
  }

  return <span className={classes}>{content}</span>;
}
