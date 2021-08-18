 class DB {
    constructor(firestore) {
        this.firestore = firestore;
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
        await docRef_user.set({roomIds : [payload.roomId]});
        
        console.log("INITIALISATION DONE \n")
    }

    async addUser(payload){
        let colRef_users = this.firestore.collection("Users");
        let docRef_user = colRef_users.doc(payload.username);
        const doc = await docRef_user.get();
        if (!doc.exists){
            await docRef_user.set({roomIds : [payload.roomId]});
        }
        else{
            const updateUser = await docRef_user.update({roomIds : admin.firestore.FieldValue.arrayUnion(payload.room_id)})
        }
    }

    async refreshRoom(payload){
        console.log('updating room')
        let colRef_rooms = this.firestore.collection("Rooms");
        let docRef_room = colRef_rooms.doc(payload.roomId);
        await docRef_room.set({data : payload.roomData});
    }

}

module.exports = DB