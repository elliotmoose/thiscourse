 class DB {
    constructor(firestore, FieldValue) {
        this.firestore = firestore;
        this.FieldValue = FieldValue;
    }

    async initRoom(payload) {
        console.log("Initializing Room");
        //Setting up Collection 1: Users, Document: Usernames, Field: User/Userid/Email/password/Events attended
        let colRef_rooms = this.firestore.collection("Rooms");
        let docRef_room = colRef_rooms.doc(payload.roomId);
        await docRef_room.set({data : payload.roomData});
        
        console.log("Initializing User");
        let colRef_users = this.firestore.collection("Users");
        let docRef_user = colRef_users.doc(payload.username);
        const doc = await docRef_user.get();
        if (!doc.exists){
            await docRef_user.set({roomIds : [], roomOwnedIds:[payload.roomId]});
        }
        else{
            const updateUser = await docRef_user.update({roomOwnedIds : this.FieldValue.arrayUnion(payload.roomId)})
        }
        
        console.log("INITIALISATION DONE \n")
    }

    async addUser({username}){
        console.log(`Creating user: ${username}...`);
        let colRef_users = this.firestore.collection("Users");
        let docRef_user = colRef_users.doc(username);
        const doc = await docRef_user.get();
        if (!doc.exists){
            await docRef_user.set({roomIds : [], roomOwnedIds:[]});
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
            return doc.data;
        }
        else {
            return null;
        }
    }

    async addJoinedRoomToUser({username, roomId}) {
        let colRef_users = this.firestore.collection("Users");
        let docRef_user = colRef_users.doc(username);
        const doc = await docRef_user.get();
        if (!doc.exists){
            throw new Error("User does not exist");
        }
        const updateUser = await docRef_user.update({roomIds : this.FieldValue.arrayUnion(roomId)})
    }
    
    async addOwnedRoomToUser({username, roomId}) {
        let colRef_users = this.firestore.collection("Users");
        let docRef_user = colRef_users.doc(username);
        const doc = await docRef_user.get();
        if (!doc.exists){
            throw new Error("User does not exist");
        }

        const updateUser = await docRef_user.update({roomOwnedIds : this.FieldValue.arrayUnion(roomId)})
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
    
    async getRefreshedRoom(payload){
        console.log('retrieving room')
        let colRef_rooms = this.firestore.collection("Rooms");
        let colRef_users = this.firestore.collection("Users");
        let docRef_user = colRef_users.doc(payload.username);        
        
        const doc_user = await docRef_user.get();
        if (!doc_user.exists){
            console.log('No such user!')
            return null;
        }
        else{
            const roomOwnedIds = doc_user.roomOwnedIds();
            if (roomOwnedIds.includes(payload.roomId)){
                let docRef_room = colRef_rooms.doc(payload.roomId);
                const doc_room = await docRef_room.get();
                const data = doc_room.data();
                return data.data;
            }
            else{
                return null;
            }
        }

    }

}

module.exports = DB