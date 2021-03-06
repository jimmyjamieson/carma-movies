import clsx from 'clsx';
import { FunctionComponent } from 'react';
import { ILink, Link } from '~components/atoms/link';
import styles from './nav-item.module.scss';

export interface INavItem extends ILink {
  id?: string | number;
  [x: string]: any;
}

export const NavItem: FunctionComponent<INavItem> = ({ text, href, className }) => {

  const classNames = clsx(className, {
    [styles.root]: true,
  });

  return (
    <div className={classNames}>
      <Link href={href}>{text}</Link>
    </div>
  );
};
