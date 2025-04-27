import { Blockchain, SandboxContract, TreasuryContract, BlockchainSnapshot } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { ContractOne } from '../wrappers/ContractOne';
import '@ton/test-utils';

describe('ContractOne', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let contractOne: SandboxContract<ContractOne>;
    let snapshot: BlockchainSnapshot;

    beforeAll(async () => {
        blockchain = await Blockchain.create();

        contractOne = blockchain.openContract(await ContractOne.fromInit(0n));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await contractOne.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: contractOne.address,
            deploy: true,
            success: true,
        });

        snapshot = blockchain.snapshot();
    });

    beforeEach(async () => {
        await blockchain.loadFrom(snapshot);
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and contractOne are ready to use
    });

    it('should increase and decrease counter', async () => {
        const increaseTimes = 3;
        for (let i = 0; i < increaseTimes; i++) {
            console.log(`increase ${i + 1}/${increaseTimes}`);

            const increaser = await blockchain.treasury('increaser' + i);

            const counterBefore = await contractOne.getCounter();

            console.log('counter before increasing', counterBefore);

            const increaseBy = BigInt(Math.floor(Math.random() * 100));

            console.log('increasing by', increaseBy);

            const increaseResult = await contractOne.send(
                increaser.getSender(),
                {
                    value: toNano('0.05'),
                },
                {
                    $$type: 'Add',
                    number: increaseBy,
                }
            );

            expect(increaseResult.transactions).toHaveTransaction({
                from: increaser.address,
                to: contractOne.address,
                success: true,
            });

            const counterAfter = await contractOne.getCounter();

            console.log('counter after increasing', counterAfter);

            expect(counterAfter).toBe(counterBefore + increaseBy);
        }

        const decreaseTimes = 3;
        for (let i = 0; i < decreaseTimes; i++) {
            console.log(`decrease ${i + 1}/${decreaseTimes}`);

            const decreaser = await blockchain.treasury('decreaser' + i);

            const counterBefore = await contractOne.getCounter();

            console.log('counter before decreasing', counterBefore);

            const decreaseBy = BigInt(Math.floor(Math.random() * 10));

            console.log('decreasing by', decreaseBy);

            const decreaseResult = await contractOne.send(
                decreaser.getSender(),
                {
                    value: toNano('0.05'),
                },
                {
                    $$type: 'Substract',
                    number: decreaseBy,
                }
            );

            expect(decreaseResult.transactions).toHaveTransaction({
                from: decreaser.address,
                to: contractOne.address,
                success: true,
            });

            const counterAfter = await contractOne.getCounter();

            console.log('counter after decreasing', counterAfter);

            expect(counterAfter).toBe(counterBefore - decreaseBy);
        }
    });

    it('should multiply and divede number', async () => {
        await contractOne.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Add',
                number: 1n,
            }
        );

        const counterOne = await contractOne.getCounter();
        expect(counterOne).toEqual(1n)
        
        const N = 3;
        for (let i = 0; i < N; i++) {
            const counterBefore = await contractOne.getCounter();
            const multiplyBy = BigInt(Math.floor(Math.random() * 100) + 1);
            const multiplyResult = await contractOne.send(
                deployer.getSender(),
                {
                    value: toNano('0.05'),
                },
                {
                    $$type: 'Multiply',
                    number: multiplyBy,
                }
            );

            expect(multiplyResult.transactions).toHaveTransaction({
                from: deployer.address,
                to: contractOne.address,
                success: true,
            });

            const counterAfter = await contractOne.getCounter();
            expect(counterAfter).toBe(counterBefore * multiplyBy);
        }

        for (let i = 0; i < N; i++) {
            const counterBefore = await contractOne.getCounter();
            const devideBy = BigInt(Math.floor(Math.random() * 10) + 1);
            const devideResult = await contractOne.send(
                deployer.getSender(),
                {
                    value: toNano('0.05'),
                },
                {
                    $$type: 'Devide',
                    number: devideBy,
                }
            );

            expect(devideResult.transactions).toHaveTransaction({
                from: deployer.address,
                to: contractOne.address,
                success: true,
            });

            const counterAfter = await contractOne.getCounter();
            expect(counterAfter).toBe(counterBefore / devideBy);
        }
    });
});
