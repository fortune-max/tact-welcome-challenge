import "@stdlib/deploy";

message Vote {
    option: Int as uint2;
}

struct VoteResults {
    option1: Int as uint2;
    option2: Int as uint2;
}

contract ContractFive with Deployable {
    id: Int as uint8;
    voterMap: map<Int as uint32, Address>;
    lastIdx: Int as uint32 = 0;

    // Expected: <= 18000000n
    // Received:    194776761n
    // Received:    193766239n
    // Received:    193766239n
    // Received:    126667547n

    option1: Int as uint32 = 0;
    option2: Int as uint32 = 0;

    init(id: Int) {
        self.id = id;
    }

    receive() {}

    receive(msg: Vote) {
        let voter: Address = sender();
        let notProcessedBefore: Bool = true;

        foreach (key, value in self.voterMap) {
            if (value == voter) {
                notProcessedBefore = false;
                require(false, "Duplicate vote");
            }
        }
        
        if (notProcessedBefore) {
            self.voterMap.set(self.lastIdx, voter);
            self.lastIdx += 1;
            if (msg.option == 1) {
                self.option1 += 1;
            } else {
                self.option2 += 1;
            }
        }
    }

    get fun results(): VoteResults {
        return VoteResults{
            option1: self.option1,
            option2: self.option2,
        };
    }
}
