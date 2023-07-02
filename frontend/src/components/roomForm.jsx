import React, { Component } from "react";
import Joi from "joi-browser";
import Form from "./common/form";
import http from '../services/httpService';
import { toast } from "react-toastify";

class RoomForm extends Form {
  state = {
    data: { roomname:""},
    errors: {}
  };

  schema = {
    roomname: Joi.string()
      .min(1)
      .max(15)
      .required()
      .label("Room Name")
  };

  doSubmit = async () => {
    try {
      const { data } = this.state;
      const {data: rooms} = await http.post('/room/createRoom', data);
      // console.log(rooms);
      if (rooms.status === 403) {
        toast(rooms.message, {
          className: {
              background: "#00FF00 !important"
          }
        });
      }
      else window.location = "/chat";
    } 
    catch (ex) {
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
        <h1>Create New Room </h1>
        <form onSubmit={this.handleSubmit}>
          {this.renderInput("roomname", "Room Name")}
          {this.renderButton("Create Room")}
        </form>
      </div>
    );
  }
}

export default RoomForm;
