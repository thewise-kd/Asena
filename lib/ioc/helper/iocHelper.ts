import type { Component } from '../types';
import type { Class } from '../../server/types';

// make it proper class
export const getStrategyClass = (interfaceName: string, injectables: Component[]): Class[] => {
  if (!interfaceName) {
    return [];
  }

  return injectables
    .filter((injectable) => injectable.interface === interfaceName)
    .map((injectable) => injectable.Class);
};
