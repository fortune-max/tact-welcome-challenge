import { toNano } from '@ton/core';
import { ContractFive } from '../wrappers/ContractFive';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const contractFive = provider.open(await ContractFive.fromInit());

    await contractFive.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(contractFive.address);

    // run methods on `contractFive`
}
