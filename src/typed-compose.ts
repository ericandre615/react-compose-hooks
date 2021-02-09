import React from 'react';

const duckType = obj => Object.prototype.toString.call(obj);
const isObject = obj => duckType(obj) === '[object Object]';
const compose = (...fns) => arg => fns.reduce((acc, fn) => {
  const value = fn({ ...acc, ...arg });
  const finalVal = isObject(value) ? value : ({ [fn.name]: value });

  return ({ ...finalVal, ...acc, ...arg });
}, arg);

export const composeHooks = (...hooks) => Component => props => (
  <Component { ...props } { ...compose(...hooks)(props) } />
);

export default composeHooks;
