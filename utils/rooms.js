const rooms=[];

function createRoom(index,room){
    const new_room={index,room};
    rooms.push(new_room);
    return room;
}

function getRoom(index){
    return room.find(room=>room.index===index);
}

module.exports={
    createRoom,
    getRoom
}

