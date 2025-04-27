import { toNano } from '@ton/core';
import { ContractTwo } from '../wrappers/ContractTwo';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const contractTwo = provider.open(await ContractTwo.fromInit());

    await contractTwo.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(contractTwo.address);

    // run methods on `contractTwo`
}
