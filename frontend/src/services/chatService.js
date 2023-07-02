import http from "./httpService";

const apiEndPoint2 = "/chat";
const apiEndPoint1 = "/room";

const tokenKey = "token";

const compare = (obj1, obj2) =>{
    let time1, time2;
    if (obj1.roomid) {
        time1 = obj1.roomid.lastmsgtime;
    }
    else { 
        time1 = obj1.lastmsgtime;
    }
    if (obj2.roomid) {
        time2 = obj2.roomid.lastmsgtime;
    }
    else {
        time2 = obj2.lastmsgtime;
    }
    if (time1 > time2) {
        return -1;
    }
    return 1;
}

async function getAllChats(user) {
    const {data:rooms} = await http.get(apiEndPoint1 + '/getRoom'); // We get the token and store it in the localStorage
    const {data:chats} = await http.get(apiEndPoint2 + '/getChat');
    
    let userRoomChats = [...rooms.result, ...chats.chat];
    userRoomChats.sort(compare);
    return userRoomChats;
}

export default {getAllChats}; 