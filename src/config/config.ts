import { useLocalStorage } from '@vueuse/core';
import { Configurations } from '@/enums';

export interface IConfig {
  browserUrl: string;
}
export const ProductionConfig: IConfig = {
  browserUrl: 'https://browser-v3.jimber.io',
};

export const StagingConfig = {
  browserUrl: 'https://browser-v3.staging.jimber.io',
};

export const TestingConfig = {
  browserUrl: 'https://browser-v3.jimbertesting.be',
};

export const CustomConfig = {
  browserUrl: 'http://localhost:3000',
};

export const environment = useLocalStorage<Configurations>('environment', Configurations.STAGING);
