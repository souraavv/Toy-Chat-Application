import React, { Component } from "react";

const Select = ({ name, label, options, error, ...rest }) => {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <select style = {{width:"50%"}}name={name} id={name} {...rest} className="form-control">
        <option value=""></option>
        {options.map(option => (
          <option key={option._id} value={option._id}>
            {option.fname + ' ' + option.lname}
          </option>
        ))}
      </select>
      {error && <div className="alert alert-danger">{error}</div>}{" "}
    </div>
  );
};

export default Select;
