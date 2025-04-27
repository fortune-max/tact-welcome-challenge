import { toNano } from '@ton/core';
import { ContractOne } from '../wrappers/ContractOne';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const contractOne = provider.open(await ContractOne.fromInit(BigInt(Math.floor(Math.random() * 10000))));

    await contractOne.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(contractOne.address);

    console.log('ID', await contractOne.getId());
}
