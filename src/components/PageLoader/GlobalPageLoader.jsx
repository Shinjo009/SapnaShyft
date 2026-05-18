import { useEffect, useState } from 'react';
import { subscribeBootstrapLoading } from '../../loading/globalLoading';
import PageLoader from './PageLoader';

/** Shown only while restoring an existing session on app open (replaces splash cube). */
export default function GlobalPageLoader() {
  const [active, setActive] = useState(false);

  useEffect(() => subscribeBootstrapLoading(setActive), []);

  return <PageLoader active={active} />;
}