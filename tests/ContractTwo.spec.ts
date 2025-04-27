import { Blockchain, SandboxContract, TreasuryContract, BlockchainSnapshot } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { ContractTwo } from '../wrappers/ContractTwo';
import '@ton/test-utils';

describe('ContractTwo', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let contractTwo: SandboxContract<ContractTwo>;
    let snapshot: BlockchainSnapshot;

    const tonLimit = toNano("0.01");

    let sizeLimit = 10n;

    beforeAll(async () => {
        blockchain = await Blockchain.create();

        contractTwo = blockchain.openContract(await ContractTwo.fromInit(sizeLimit));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await contractTwo.send(
            deployer.getSender(),
            {
                value: tonLimit,
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: contractTwo.address,
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
        // blockchain and contractTwo are ready to use
        console.log("deployer", await contractTwo.getWhoDeployed());
    });

    it("should create and delete items and map", async () => {
        for (let i = 1; i <= sizeLimit; i++) {
          await contractTwo.send(
            deployer.getSender(),
            {
              value: tonLimit,
            },
            {
              $$type: "ChangeItem",
              key: BigInt(i),
              value: BigInt(i),
            }
          );
    
          let val = await contractTwo.getMapItem(BigInt(i));
          expect(val).toEqual(BigInt(i));
        }
    
        let sz = await contractTwo.getCurrentSize();
        expect(sz).toEqual(sizeLimit);
    
        let res = await contractTwo.send(
          deployer.getSender(),
          {
            value: tonLimit,
          },
          {
            $$type: "ChangeItem",
            key: 1n,
            value: 100n,
          }
        );
    
        expect(res.transactions).toHaveTransaction({
          from: deployer.address,
          to: contractTwo.address,
          success: true,
        });
    
        let val = await contractTwo.getMapItem(1n);
        expect(val).toEqual(100n);
    
        sz = await contractTwo.getCurrentSize();
        expect(sz).toEqual(sizeLimit);
    
        res = await contractTwo.send(
          deployer.getSender(),
          {
            value: tonLimit,
          },
          {
            $$type: "ChangeItem",
            key: 1n,
            value: null,
          }
        );
    
        expect(res.transactions).toHaveTransaction({
          from: deployer.address,
          to: contractTwo.address,
          success: true,
        });
    
        sz = await contractTwo.getCurrentSize();
        expect(sz).toEqual(sizeLimit - 1n);
    
        res = await contractTwo.send(
          deployer.getSender(),
          {
            value: tonLimit,
          },
          {
            $$type: "DeleteMap",
          }
        );
    
        sz = await contractTwo.getCurrentSize();
        expect(sz).toEqual(0n);
    
        expect(res.transactions).toHaveTransaction({
          from: deployer.address,
          to: contractTwo.address,
          success: true,
        });
    
        for (let i = 1; i <= sizeLimit; i++) {
          let val = await contractTwo.getMapItem(BigInt(i));
          expect(val).toEqual(null);
        }
    });

    it("should limit access", async () => {
        let sender2 = await blockchain.treasury("sender 2");
    
        let res = await contractTwo.send(
          sender2.getSender(),
          {
            value: tonLimit,
          },
          {
            $$type: "ChangeItem",
            key: 1n,
            value: 100n,
          }
        );
    
        expect(res.transactions).toHaveTransaction({
          from: sender2.address,
          to: contractTwo.address,
          success: false,
        });
    
        let sz = await contractTwo.getCurrentSize();
        expect(sz).toEqual(0n);
    
        let val = await contractTwo.getMapItem(1n);
        expect(val).toEqual(null);
    });
});
