import "@stdlib/deploy";

//------- Messages -------//

message ChangeItem {
    key: Int as uint32;
    value: Int? as uint32;
}

message DeleteMap {}

//------- Contract -------//

contract ContractTwo with Deployable {
    deployerAddress: Address;
    sizeLimit: Int as uint8;
    currentSize: Int as uint8 = 0;
    myMap: map<Int as uint32, Int as uint32>;


    init(sizeLimit: Int) {
        self.sizeLimit = sizeLimit;
        self.deployerAddress = sender();
    }

    receive() {}

    receive(msg: ChangeItem) {
        require(sender() == self.deployerAddress, "Wrong address");

        let key = msg.key;
        let value = msg.value;

        if (self.myMap.get(key) == null) {
            if (value != null) {
                // not in dict, create
                self.myMap.set(key, value);
                self.currentSize += 1;
            }
        } else {
            // in dict, update or delete
            if (value == null) {
                self.myMap.del(key);
                self.currentSize -= 1;
            } else {
                self.myMap.set(key, value);
            }
        }
    }

    receive(msg: DeleteMap) {
        require(sender() == self.deployerAddress, "Wrong address");

        foreach (key, value in self.myMap) {
            self.myMap.set(key, null);
        }
        self.currentSize = 0;
    }

    get fun currentSize(): Int {
        return self.currentSize;
    }

    get fun mapItem(key: Int): Int? {
        return self.myMap.get(key);
    }

    get fun whoDeployed(): Address {
        return self.deployerAddress;
    }
}
