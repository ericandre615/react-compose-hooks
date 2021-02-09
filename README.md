# React Hooks Compose

React hooks are nice. They solve some issues with functional components like
using state and lifecycle methods. However, they also tend to tightly couple
hooks to React components. This leads to less composability of components, 
more difficulty and complexity in unit testing components. This library allows
you to pass your hooks to your component. It also allows your hooks to `compose`
and by attaching what is returned from each hook to the overall `props` that are 
passed to the next hook.

### Install
`npm install react-hooks-compose`

### Basic Usage
The `compose` function takes in an arbitrary amount of React `hooks` or you could just
use any `functions` you want. It calls them from left-to-right/top-to-bottom.
The preferred way is to have your `hooks` return an object with `key`/`value` pairs, but this
is not completely necessary. This way you can access the returned vales from `props`. However,
if you return something like a single value or an array (`[someState, setSomeState]`) it will
use the name of the `hook`/`function` as the key on props to access that value.

```js
import React, { useState, useEffect } from 'react';
import compose from 'react-hooks-compose';

const useFirstName 
```

