import React, { Component } from "react";
import Joi from "joi-browser";
import Form from "./common/form";
import http from '../services/httpService';

class ChatForm extends Form {
  state = {
    data: { user2:""},
    errors: {},
    getUsers: []
  };

  schema = {
      user2: Joi.string().min(0).max(255)
  };

  async componentDidMount() {
      const {data: getUsers} = await http.get('/user/getAllUsers');
      const {data:chats} = await http.get('/chat/getChat');
      
      const otherUsers = chats.chat;
      const allUsers = getUsers.result;

      const remUsers = allUsers.filter(user=> {
        const findUser = otherUsers.find(cur => {
            return cur.user1._id == user._id || cur.user2._id == user._id;
        })
        if (!findUser) {
            return user;
        }
      });
      // console.log(remUsers);
      this.setState({getUsers: remUsers});
      
  }
  doSubmit = async () => {
     try {
      let {data} = this.state;
      data.userid2 = data.user2;
      delete data.user2;
      // console.log(data);
      await http.post('/chat/createChat', data);
      window.location = "/chat";
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        const errors = { ...this.state.errors };
        errors.roomname = ex.response.data;
        this.setState({ errors });
      }
    }
  };

  render() {
    return (
      <div>
        <h1>Create New Chat </h1>
        <form onSubmit={this.handleSubmit}>
          {this.renderSelect("user2", "Search For UserName", this.state.getUsers)}
          {this.renderButton("Create Chat")}
        </form>
      </div>
    );
  }
}

export default ChatForm;
