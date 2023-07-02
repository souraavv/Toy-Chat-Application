const mongoose = require('mongoose');
const _ = require("lodash");
const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const {User, validateUser} = require('../models/user');
const {Room, validateRoom} = require('../models/room');
const RoomUser = require('../models/roomuser');
const RoomMsg = require('../models/roommsg');


router.get('/allMembers/:roomid', auth, async(req, res)=> {
    const {roomid} = req.params;
    try {
        const result = await RoomUser.find({roomid}).populate({path: 'userid', select: 'userid fname lname'});
        if (result) {
            res.status(200).json({
                result
            })
        }
    }
    catch(err) {
        res.status(500).json({
            message: 'Internal server Error',
            status: 500
        })
    }
});


router.post('/createRoom', auth, async(req, res)=> {
    const {error} = validateRoom(req.body);
    if (error) {
        return res.status(400).json({
            message: error.details[0].message,
            status: 400
        });
    }
    let {roomname} = req.body;
    let curUserId = req.user._id;
    try{
        const allRooms = await RoomUser.find({userid:curUserId, isadmin: 1}).populate('roomid');
        if(allRooms && allRooms.length > 0) {
            const isSameNameRoom = allRooms.find((cur)=> {
                return cur.roomid.roomname == roomname
            });
            if (isSameNameRoom) {
                return res.json({
                    message: 'Same Room Already Exists',
                    status: 403
                });
            }
        }
        const newRoom = new Room({roomname:roomname});
        await newRoom.save();
        const newRoomUser = new RoomUser({
            roomid: newRoom._id,
            userid: curUserId,
            isadmin: 1
        });
        await newRoomUser.save();
        return res.json({
            message: 'Created a New Room',
            roomname: roomname
        })
    }
    catch(err) {
        res.status(500).json({
            message: 'Internal Server Error',
            status: 500
        });
    }
});

router.post('/addNewMembers', auth, async(req, res)=> {
    const curUserId = req.user._id;
    const {roomid, members} = req.body;
    try {
        const isAdminOfRoom = await RoomUser.findOne({roomid, userid:curUserId, isadmin:1});
        if (isAdminOfRoom) {
            const canAddMembers = await members.map(async(cur, idx)=> {
                const isValidUser = await User.findById(cur);
                if (!isValidUser) {
                    return res.status(403).json({
                        flag: 0,
                        message: 'User is not a valid user',
                        status: 403
                    })
                }
                const isMemberOfRoom = await RoomUser.findOne({userid:cur, roomid, isadmin: 0});
                if (isMemberOfRoom) {
                    return {flag : 0, message: 'Member already exists', userid: cur};
                }
                const newUserRoom = new RoomUser({roomid, userid:cur, isadmin:0});
                await newUserRoom.save();
                return {flag : 1, message: 'Added new member', userid: newUserRoom._id};
            })
            Promise.all(canAddMembers)
                   .then((resolved)=> {
                       return res.json({
                           members: resolved
                       })
                   })
        }
        else {
            res.json({
                isAdmin: 0,
                message: 'Only Admin is Allowed to Add members',
                status: 403
            });     
        }
    }
    catch(err) {
        return res.status(500).json({
            message: 'Internal Server Error',
            status: 500
        })
    }
});


router.get('/getRoom', auth, async(req, res)=> {
    const curUserId = req.user._id;
    await RoomUser.find({userid: curUserId})
                  .populate({path : "roomid", select: "roomname lastmsgtime"})
                  .exec((reject, resolve)=> {
                      if (reject) {
                          return res.status(500).json({
                              message: 'Internal Server Error',
                              status: 500
                          })
                      }
                      return res.status(200).json({
                          result: resolve,
                          status: 200
                      })
                  });
});

// router.post('/leaveRoom', auth, async(req, res)=> {
//     const curUserId = req.user._id;
//     const {roomid} = req.body;
//     try {
//         const isValidRoom = await Room.findById(roomid);
//         if (!isValidRoom) {
//             return res.status(403).json({
//                 message: 'Room Does not exists',
//                 status: 403
//             })
//         }
//         const curUser = await RoomUser.findOne({userid: curUserId, roomid});
//         if (!curUser) {
//             return res.status(403).json({
//                 message: 'Not a member of room',
//                 status: 403
//             })
//         }
//         const isAdmin = curUser.isadmin;
//         if (!isAdmin) {
//             const {deletedCount: cnt} = await RoomUser.deleteOne({userid: curUserId, roomid});
//             if (cnt > 0) {
//                 return res.status(200).json({
//                     message: 'Leaved Room successfully'
//                 })   
//             }
//             else {
//                 return res.json({
//                     message: 'Can not leave'
//                 })
//             }
//         }
//         await RoomUser.deleteMany({roomid});
//         await Room.findByIdAndDelete(roomid);
//         return res.json({
//             message: 'Removed Room although'
//         })
//     }
//     catch(err) {
//         res.status(500).json({
//             message: 'Internal Server Error',
//             status: 500
//         })
//     }
// });

router.get('/getRoomMsg/:roomid', auth, async(req, res)=> {
    const userid = req.user._id;
    const {roomid} = req.params;
    try {
        const roomMsg = await RoomMsg.find({roomid})
                                     .populate({path: 'messageid', select:'formattype text media'})
                                     .populate({path: 'senderid', select: 'userid fname lname'});
        if (roomMsg && roomMsg.length > 0) {
            res.status(200).json({
                roomMsg,
                status: 200
            })
        }
        else {
            res.status(200).json({
                message: 'No Chat found',
                status: 200
            })
        }
    }
    catch(err) {
        res.status(500).json({
            message: 'Internal Server Error',
            status: 500
        })
    }
})


router.post('/remove', auth, async(req, res)=> {
    const userid = req.user._id;
    const {members, roomid} = req.body;
    try {
        const isValidRoom = await Room.findById(roomid);
        if (!isValidRoom) {
            return res.status(403).json({
                message: 'No room in request exists',
                status: 403
            })
        }
        const isOwner = await RoomUser.findOne({roomid, userid, isadmin:1});
        if (!isOwner) {
            return res.json({
                isAdmin: 0,
                message: 'Only admin can remove members',
                status: 403
            })
        }
        const membersToDelete = await members.map(async(cur, idx)=> {
            const isValidMember = await RoomUser.find({userid: cur, roomid, isadmin: 0});
            if (!isValidMember || isValidMember.length == 0) {
                return {isAdmin: 0, userid: cur, message: 'Cannot remove'};
            }
            const res = await RoomUser.deleteOne({userid: cur, roomid, isadmin:0});
            if (res) {
                return {
                    flag: 1,
                    userid: cur,
                    message: 'Removed the user'
                }
            }
    }); 
    Promise.all(membersToDelete)
           .then((resolvedDelMembers)=> {
               return res.status(200).json({
                    members:resolvedDelMembers,
                    status: 200
               });
           })
           .catch((err)=> {
                return res.status(500).json({
                    message: 'Internal Server Error',
                    status: 500
                })
           });
    }
    catch(err) {
        res.status(500).json({
            message: 'Internal Server Error',
            status: 500
        })
    }
    
}); 


module.exports = router;