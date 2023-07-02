import React, { Component } from "react";
import auth from "../services/authService";
import chat from "../services/chatService";
import Search from './common/searchBox'
import http from '../services/httpService';
import io from 'socket.io-client';
import moment from 'moment';
import DropZone from 'react-dropzone';
import { toast } from "react-toastify";


export default class Chat extends Component {
    state = {
        allChats: [],
        curSelectedChat : null,
        chatName: null,
        openSearch: false,
        searchUsers: [],
        roomMembers: [],
        curChatMsg : [],
        curMsg : "",
        searchValue : ""
    };
    async componentDidMount() {
        const allChats = await chat.getAllChats();
        this.setState({allChats})
        this.socket = io('http://localhost:3900/');
        this.socket.on('Chat-Message', (data)=> {
            //console.log(data);
            if (data.roomid && this.state.curSelectedChat.roomid._id == data.roomid) {
                // console.log('chat msg', this.state.curChatMsg);
                this.setState({curChatMsg: this.state.curChatMsg.concat(data)});
            }
            if (data.chatid && this.state.curSelectedChat && this.state.curSelectedChat._id == data.chatid) {
                this.setState({curChatMsg: this.state.curChatMsg.concat(data)});
            }
        });
        allChats.map((room) => {
            if (room.roomid) {
                this.socket.emit('join-room', {roomid: room.roomid._id});
            }
            if (room._id) {
                this.socket.emit('join-room', {chatid: room._id});
            }
        })

    }
    handleSelectChat = async (chat) => {
        this.setState({curSelectedChat: chat});
        let chatName;
        let chatMsg
        if (chat.roomid) {
            chatName = chat.roomid.roomname;
            const {data: msg} = await http.get('/room/getRoomMsg/' + chat.roomid._id);
            if (msg.roomMsg)
                chatMsg = msg.roomMsg;
            else
                chatMsg = []
        }
        else {
            let curUser = auth.getCurrentUser();
            // console.log(curUser, chat.user1);
            chatName = (curUser._id == chat.user1._id) ? chat.user2.fname + ' ' + chat.user2.lname
            : chat.user1.fname + ' ' + chat.user1.lname
            
            const {data: msg} = await http.get('/chat/getChatMsg/' + chat._id);
            if (msg.chatMsg)
                chatMsg = msg.chatMsg;
            else
                chatMsg = []
            
        }
        console.log(chatMsg);
        this.setState({chatName, curChatMsg: chatMsg});
    }

    handleSearchClick = async () => {
        let chat = this.state.curSelectedChat;
        let {data: members} = await http.get('/room/allMembers/' + chat.roomid._id);
        // console.log(members.result);
        this.setState({roomMembers: members.result});
        this.setState({openSearch: true})
    }

    handleSearch = async (value) => {
        this.setState({searchValue: value});
        console.log("val: ", value);
        if (value === "") {
            return;
        }
        const {data:users} = await http.get('/chat/getUser/' + value)
        let searchUsers = [...users.result];
        searchUsers = searchUsers.map((user, idx)=> {
            let findMember = this.state.roomMembers.find((member)=> {
                //console.log(member.userid, user);
                return member.userid._id == user._id
            })
            // console.log('findMember ', findMember);
            if (!findMember) {
                // console.log('inter', {...user, flag: 0});
                return {...user, flag: 0}
            }
            return {...user, flag: 1}
        });

        this.setState({searchUsers});
    }

    addMember = async (userid, idx) => {
        let data = {roomid:this.state.curSelectedChat.roomid._id, members:[userid]};
        const {data: members} = await http.post('/room/addNewMembers', data);
        console.log("members: ", members);
        if (members.isAdmin === 0) {
            toast(members.message, {
                className: {
                    background: "#00FF00 !important"
                }
              });
        }
        if (members && members.members) {
            if (members.members[0].flag === 1) {
                // console.log("members.flag: ", members.members[0].flag);
                await this.handleSearchClick();
                this.handleSearch(this.state.searchValue);
            }
        }
    }

    removeMember = async(userid, idx) => {
        let data = {members:[userid], roomid: this.state.curSelectedChat.roomid._id};
        const {data: members} = await http.post('/room/remove', data);
        if (members.isAdmin === 0) {
            toast(members.message, {
                className: {
                    background: "#00FF00 !important"
                }
              });
        }
        if (members && members.members) {
            if (members.members[0].flag === 1) {
                await this.handleSearchClick();
                // let searchUsers = [...this.state.searchUsers];
                // searchUsers[idx].flag = 0;
                // this.setState({searchUsers});
                this.handleSearch(this.state.searchValue);
            }
        }
    }

    isEnterKey = (e)=> {
        if (e.key == 'Enter') {
            this.sendMsg();
        }
    }

    sendMsg = () => {
        if (!this.state.curMsg || !this.state.curMsg.length)
            return;
        let currentChat = this.state.curSelectedChat;
        let token = localStorage.getItem('token');
        let formattype = 1;
        let text = this.state.curMsg;
        let data = {token, text, formattype, currentChat};
        this.socket.emit('msg', data);
        this.setState({curMsg: ''});
    }

    uploadMediaFiles = async (media) => {
        let formData = new FormData();
        formData.append('file', media[0]);
        const {data: result} = await http.post('/msg/uploadMediaFiles', formData,  {headers: {'content-type': 'multipart/form-data'}});
        if (result.upload) {
            let currentChat = this.state.curSelectedChat;
            let token = localStorage.getItem('token');
            let formattype = 0;
            let media = result.url;
            let data = {token, media, formattype, currentChat};
            this.socket.emit('msg', data);
        }
    }

    render() {
        let curUser = auth.getCurrentUser();
        return (
            <div className="container d-flex justify-content-center align-items-center" style= {{height:"100vh", width: "90%"}}>
            <div className="row" style = {{width: "100vw"}}>
              <div className="col-3" style = {{height: "78vh", border: "2px solid #b2bec3", overflowY: "scroll"}} >
              <ul className="list-group">
                {this.state.allChats.map(chat=> {
                    if (chat.roomid) {
                        return <li id = {chat._id} className={chat == this.state.curSelectedChat ? "list-group-item active" : "list-group-item"} style = {{cursor:"pointer"}} onClick={() => this.handleSelectChat(chat)}>{chat.roomid.roomname}</li>
                    }
                    else {
                        let user1 = chat.user1._id;
                        let user2 = chat.user2._id;
                        return curUser._id == user1 
                                        ? <li id = {chat._id} className={chat == this.state.curSelectedChat ? "list-group-item active" : "list-group-item"} style = {{cursor:"pointer"}} onClick={() => this.handleSelectChat(chat)}>{chat.user2.fname + ' ' + chat.user2.lname}</li>
                                        : <li id = {chat._id} className={chat == this.state.curSelectedChat ? "list-group-item active" : "list-group-item"} style = {{cursor:"pointer"}} onClick={() => this.handleSelectChat(chat)}>{chat.user1.fname + ' ' + chat.user1.lname}</li>
                        }
                })}
              </ul>
            </div>

              <div className="col-9">
                  <div className = "container"> 
                    <div className = "row" style = {{border: "2px solid #b2bec3", height: "8vh"}}> 
                        <div className = "col-4">
                            <h5 class="my-3" style = {{fontStyle: "none"}}>{this.state.chatName}</h5>
                        </div>
                        <div className = "col-8">
                            {!this.state.openSearch && this.state.curSelectedChat && this.state.curSelectedChat.roomid &&<i class="bi bi-search" style = {{float: "right",marginTop: "15px"}} onClick={this.handleSearchClick}></i>}
                            {this.state.openSearch && <><Search onChange={this.handleSearch} value={this.state.searchValue}>
                            </Search>
                            <div style = {{zIndex : 1, overflowY: "scroll", position : "absolute", height : "300px", width : "93%", border: "1px solid grey", background : "white", boxShadow : "2px 2px 1px 1px #dfe6e9"}}>
                                
                                <ul style = {{listStyle: "none"}} className="list-group">
                                    {this.state.searchUsers.map((user, idx)=> {
                                        // console.log("user.flag", user.flag);
                                        if (user._id != curUser._id)
                                            return <li className = "p-2" style = {{marginTop : "10px"}}>
                                                <div className = "row">
                                                    <div className = "col-7"> 
                                                        {user.fname + ' ' + user.lname}
                                                    </div>
                                                    <div className = "col-2"> 
                                                        <button type = "button" disabled = {user.flag} className = {user.flag ? "btn btn-sm btn-secondary" : "btn btn-sm btn-primary"} onClick={()=> this.addMember(user._id, idx)}>
                                                            Add
                                                        </button>
                                                    </div>
                                                    <div className = "col-2" style = {{marginLeft: "1px"}}>
                                                    <button type = "button" disabled = {!user.flag} className = {user.flag ? "btn btn-sm btn-danger" : "btn btn-sm btn-secondary"} onClick={()=> this.removeMember(user._id, idx)}>
                                                            Delete
                                                    </button>
                                                    </div>
                                                </div>
                                            </li>
                                    })}
                                </ul>
                            </div></>}
                        </div>
                    </div>
                  </div>
                  <div style = {{height: "70vh", border: "2px solid grey"}} onClick = {()=> this.setState({openSearch: false, searchValue : ""})}>
                    <div style = {{height: "64vh" , overflowY: "scroll"}} class="px-4 py-5 chat-box bg-white">
                        {this.state.curChatMsg && this.state.curChatMsg.length > 0 && this.state.curChatMsg.map((msg)=> {
                            let msgTime = moment(msg.createdAt).format('LT');
                            let msgDate = moment(msg.createdAt).format('MMM DD');
                            let typeofmsg = msg.messageid.formattype;
                            let mediaElement;
                            // console.log(msg.messageid);
                            if (typeofmsg == 0) {
                                let ext = msg.messageid.media.split('.')[1].toLowerCase();
                                if (ext == 'png' || ext == 'jpeg' || ext == 'jpg') {
                                    // console.log("http://localhost:3900/accessfile/" + msg.messageid.media);
                                    mediaElement = <img style = {{height:"300px", width: "100%"}}src = {"http://localhost:3900/accessfile/" + msg.messageid.media}></img>
                                }
                                else if (ext == 'mp4') {
                                    mediaElement = <video style = {{maxHeight:"500px", width: "100%"}} autoplay controls src = {"http://localhost:3900/accessfile/" + msg.messageid.media}></video>
                                }
                                else {
                                    mediaElement = 
                                    <div className = "row">
                                        <div className = "col-2">
                                        <a style = {(msg.senderid._id == curUser._id) ? {color:"white"}: {color:"black"}} href={"http://localhost:3900/accessfile/" + msg.messageid.media} download>
                                                    <i class="bi bi-file-earmark-arrow-down"></i>
                                        </a>  
                                        </div>
                                        <div className = "col-10">
                                        <p class={(msg.senderid._id == curUser._id) ? "text-small mb-0 text-white"
                                        : "text-small mb-0 text-black"}>{msg.messageid.media}</p>
                                        </div>
                                    </div>
                                       
                                }
                            }
                            if (msg.senderid._id == curUser._id) {
                                // console.log("message", msg);
                                return <div class="media w-50 ml-auto mb-3">
                                    <div class="media-body"> 
                                        <div class="bg-primary rounded py-2 px-3 mb-2">
                                            {msg.messageid.formattype == 1 ? <p class="text-small mb-0 text-white">{msg.messageid.text}</p>
                                                                 : mediaElement}
                                        </div>
                        
                                        <p class="small text-muted">{"You "}|{msgTime + " "}|{msgDate}</p>
                                    </div>
                                </div>
                            }
                            else {
                                return <div class="media w-50 mb-3">
                                <div class="media-body ml-3">
                                    <div class="bg-light rounded py-2 px-3 mb-2">
                                    {msg.messageid.formattype == 1 ? <p class="text-small mb-0 text-muted">{msg.messageid.text}</p>
                                                                 : mediaElement}
                                    </div>
                                    <p class="small text-muted">{msg.senderid.userid + " "}|{msgTime + " "}|{msgDate}</p>
                                </div>
                                </div>
                            }
                        })}
                    </div>

                    <div class="input-group mb-3">
                        <input value = {this.state.curMsg} onChange = {(e)=> this.setState({curMsg: e.target.value})} type="text" class="form-control" aria-label="Amount (to the nearest dollar)" onKeyDown = {this.isEnterKey}/>
                        <div class="input-group-prepend">
                        <DropZone onDrop={this.uploadMediaFiles}>
                            {({ getRootProps, getInputProps }) => (
                                <div {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    <span class="input-group-text"><i class="bi bi-paperclip"></i></span>
                                </div>
                            )}
                        </DropZone>
                        
                        </div>
                        <div class="input-group-append">
                            <span class="input-group-text"><i class="bi bi-send" onClick = {this.sendMsg}></i></span>
                        </div>
                    </div>
              </div>
            </div>
          </div>
          </div>
        )
    }
}

