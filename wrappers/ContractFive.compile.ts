import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/contract_five.tact',
    options: {
        debug: true,
    },
};
