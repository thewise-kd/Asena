import { defineMetadata, getMetadata } from 'reflect-metadata/no-conflict';
import type { Class } from '../../../server/types';
import type { Injectable, Strategies } from '../../types';
import { ComponentConstants } from '../../constants';

/**
 * Property decorator to inject a dependency.
 *
 * @param {Class | string} Injection - The class or string identifier of the dependency to inject.
 * @returns {PropertyDecorator} - The property decorator function.
 */
export const Inject = (Injection: Class | string): PropertyDecorator => {
  return (target: Object, propertyKey: string) => {
    const dependencies: Injectable = getMetadata(ComponentConstants.DependencyKey, target.constructor) || {};

    defineMetadata('design:type', Injection, target, propertyKey);

    if (typeof Injection === 'string') {
      const strategies: Strategies = getMetadata(ComponentConstants.StrategyKey, target.constructor) || {};

      if (!strategies[propertyKey]) {
        strategies[propertyKey] = Injection;
      }

      defineMetadata(ComponentConstants.StrategyKey, strategies, target.constructor);
    } else {
      if (!dependencies[propertyKey]) {
        dependencies[propertyKey] = Injection;
      }

      defineMetadata(ComponentConstants.DependencyKey, dependencies, target.constructor);
    }
  };
};
