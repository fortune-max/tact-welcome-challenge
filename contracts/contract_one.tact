import "@stdlib/deploy";

message Add {
    number: Int as int8;
}

message Substract {
    number: Int as int8;
}

message Multiply {
    number: Int as int8;
}

message Devide {
    number: Int as int8;
}


contract ContractOne with Deployable {
    id: Int as uint32;
    counter: Int as uint32;

    init(id: Int) {
        self.id = id;
        self.counter = 0;
    }

    receive(msg: Add) {
        self.counter += msg.number;
    }

    receive(msg: Substract) {
        self.counter -= msg.number;
    }

    receive(msg: Multiply) {
        self.counter *= msg.number;
    }

    receive(msg: Devide) {
        self.counter /= msg.number;
    }

    get fun counter(): Int {
        return self.counter;
    }

    get fun id(): Int {
        return self.id;
    }
}
