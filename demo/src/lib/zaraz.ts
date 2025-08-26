import { Zaraz } from '../types/zaraz';

export const ZARAZ_FUNCTIONAL_PURPOSE_ID = 'dqVA';

export const getZaraz = (): Zaraz.ZarazGlobal | undefined => {
  return typeof window !== 'undefined' ? window.zaraz : undefined;
};

export const isZarazEnabled = (): boolean => {
  return !!getZaraz();
};

export const isSentryManagedComponentEnabled = (): boolean => {
  return !!getZaraz()?.consent?.get(ZARAZ_FUNCTIONAL_PURPOSE_ID);
};
