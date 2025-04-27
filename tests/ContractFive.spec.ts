import { Blockchain, SandboxContract, TreasuryContract, BlockchainSnapshot } from "@ton/sandbox";
import { toNano } from '@ton/core';
import { ContractFive } from '../wrappers/ContractFive';
import '@ton/test-utils';

function getTimeBasedRandom(min: number, max: number): bigint {
  const now = Date.now();
  const range = max - min + 1;
  const randomValue = min + (now % range);
  return BigInt(randomValue);
}

describe('ContractFive', () => {
  let blockchain: Blockchain;
  let deployer: SandboxContract<TreasuryContract>;
  let petition: SandboxContract<ContractFive>;
  let snapshot: BlockchainSnapshot;

  const tonLimit = toNano("0.02");

  beforeAll(async () => {
    blockchain = await Blockchain.create();

    petition = blockchain.openContract(await ContractFive.fromInit(0n));

    deployer = await blockchain.treasury("deployer");

    const deployResult = await petition.send(
      deployer.getSender(),
      {
        value: tonLimit,
      },
      null
    );

    expect(deployResult.transactions).toHaveTransaction({
      from: deployer.address,
      to: petition.address,
      deploy: true,
      success: true,
    });

    snapshot = blockchain.snapshot();
  });

  beforeEach(async () => {
    await blockchain.loadFrom(snapshot);
  });

  it("should deploy", async () => {});

  it("accept votes", async () => {
    const increaseTimes = getTimeBasedRandom(5, 10);
    for (let i = 0; i < increaseTimes; i++) {
      const voter = await blockchain.treasury("voter" + i);

      const votesBefore = await petition.getResults();
      const option = getTimeBasedRandom(1, 2);

      const increaseResult = await petition.send(
        voter.getSender(),
        {
          value: tonLimit,
        },
        {
          $$type: "Vote",
          option: option,
        }
      );

      expect(increaseResult.transactions).toHaveTransaction({
        from: voter.address,
        to: petition.address,
        success: true,
      });

      const votesAfter = await petition.getResults();

      let votesExpected = votesBefore;
      if (option == 1n) {
        votesExpected.option1 += 1n;
      } else {
        votesExpected.option2 += 1n;
      }

      expect(votesAfter.option1).toBe(votesExpected.option1);
      expect(votesAfter.option2).toBe(votesExpected.option2);
    }
  });

  it("should not accept dublicated votes", async () => {
    const increaseTimes = 10n;
    const voters: Awaited<ReturnType<typeof blockchain.treasury>>[] = [];
    for (let i = 0; i < increaseTimes; i++) {
      const voter = await blockchain.treasury("voter" + i);
      voters.push(voter);

      const votesBefore = await petition.getResults();
      const option = getTimeBasedRandom(1, 2);

      const increaseResult = await petition.send(
        voter.getSender(),
        {
          value: tonLimit,
        },
        {
          $$type: "Vote",
          option: option,
        }
      );

      expect(increaseResult.transactions).toHaveTransaction({
        from: voter.address,
        to: petition.address,
        success: true,
      });

      const votesAfter = await petition.getResults();

      let votesExpected = votesBefore;
      if (option == 1n) {
        votesExpected.option1 += 1n;
      } else {
        votesExpected.option2 += 1n;
      }

      expect(votesAfter.option1).toBe(votesExpected.option1);
      expect(votesAfter.option2).toBe(votesExpected.option2);
    }

    for (let i = 0; i < 10; i++) {
      let ind = Number(getTimeBasedRandom(0, 9));
      const randomVoter = voters[ind];

      const votesBefore = await petition.getResults();

      const option = getTimeBasedRandom(1, 2);

      const increaseResult = await petition.send(
        randomVoter.getSender(),
        {
          value: tonLimit,
        },
        {
          $$type: "Vote",
          option: option,
        }
      );

      const votesAfter = await petition.getResults();

      expect(votesBefore.option1).toBe(votesAfter.option1);
      expect(votesBefore.option2).toBe(votesAfter.option2);
    }
  });

  it("storage should be efficient", async () => {
    const time1 = Math.floor(Date.now() / 1000);
    const time2 = time1 + 3 * 365 * 24 * 60 * 60;

    blockchain.now = time1;

    const increaseTimes = 100;
    for (let i = 0; i < increaseTimes; i++) {
      const voter = await blockchain.treasury("voter" + i);

      const votesBefore = await petition.getResults();
      const option = getTimeBasedRandom(1, 2);

      await petition.send(
        voter.getSender(),
        {
          value: tonLimit,
        },
        {
          $$type: "Vote",
          option: option,
        }
      );
    }

    blockchain.now = time2;

    let res2 = await petition.send(
      deployer.getSender(),
      {
        value: tonLimit,
      },
      {
        $$type: "Vote",
        option: 1n,
      }
    );

    const tx2 = res2.transactions[1];
    if (tx2.description.type !== "generic") {
      throw new Error("Generic transaction expected");
    }

    console.log("STOAGE: ", tx2.description.storagePhase?.storageFeesCollected);

    expect(tx2.description.storagePhase?.storageFeesCollected).toBeLessThanOrEqual(toNano("0.018"));
  });
});
