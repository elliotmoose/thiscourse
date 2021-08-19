 class DB {
    constructor(firestore, FieldValue) {
        this.firestore = firestore;
        this.FieldValue = FieldValue;
    }

    async initRoom({roomId, roomData}) {
        console.log("Initializing Room");
        //Setting up Collection 1: Users, Document: Usernames, Field: User/Userid/Email/password/Events attended
        let colRef_rooms = this.firestore.collection("Rooms");
        let docRef_room = colRef_rooms.doc(roomId);
        await docRef_room.set({data : roomData});  
        console.log('room created on database:', roomId);
    }

    async addUser({username}){
        console.log(`Creating user: ${username}...`);
        let colRef_users = this.firestore.collection("Users");
        let docRef_user = colRef_users.doc(username);
        const doc = await docRef_user.get();
        if (!doc.exists){
            await docRef_user.set({prevRooms : [], ownedRooms:[]});
            console.log("User created");
        }
        else{
            throw new Error("User already exists")
        }
    }

    async getUser({username}) {
        let colRef_users = this.firestore.collection("Users");
        let docRef_user = colRef_users.doc(username);
        const doc = await docRef_user.get();
        if (doc.exists){
            return doc.data();
        }
        else {
            return null;
        }
    }

    async addJoinedRoomToUser({username, roomSummary}) {
        let colRef_users = this.firestore.collection("Users");
        let docRef_user = colRef_users.doc(username);
        const doc = await docRef_user.get();
        if (!doc.exists){
            throw new Error("User does not exist");
        }

        let user = doc.data();

        let isDuplicateSummary = user.prevRooms.findIndex((each)=>each.id == roomSummary.id) != -1;

        if(!isDuplicateSummary) {
            const updateUser = await docRef_user.update({prevRooms : this.FieldValue.arrayUnion(roomSummary)})
            return updateUser;
        }

        return user;
    }
    
    async addOwnedRoomToUser({username, roomSummary}) {
        let colRef_users = this.firestore.collection("Users");
        let docRef_user = colRef_users.doc(username);
        const doc = await docRef_user.get();
        if (!doc.exists){
            throw new Error("User does not exist");
        }

        const updateUser = await docRef_user.update({ownedRooms : this.FieldValue.arrayUnion(roomSummary)})
        return updateUser;
    }


    async updateRoom(payload){
        console.log('updating room')
        let colRef_rooms = this.firestore.collection("Rooms");
        let docRef_room = colRef_rooms.doc(payload.roomId);
        await docRef_room.set({data : payload.roomData});
    }

    async roomExists({roomId})  {
        let colRef_rooms = this.firestore.collection("Rooms");
        let docRef_room = colRef_rooms.doc(roomId);
        const doc = await docRef_room.get();
        return doc.exists;
    }
    
    async getRoom({roomId}){
        let colRef_rooms = this.firestore.collection("Rooms");
        let docRef_room = colRef_rooms.doc(roomId);
        const doc_room = await docRef_room.get();
        if(!doc_room.exists) {
            console.log("retrieving room but does not exist: ", roomId);
            return null;
        }
        const room = doc_room.data();
        return room.data;
    }

}

module.exports = DB