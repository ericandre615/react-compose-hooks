# React Hooks Compose

React hooks are nice. They solve some issues with functional components like
using state and lifecycle methods. However, they also tend to tightly couple
hooks to React components. This leads to less composability of components, 
more difficulty and complexity in unit testing components. This library allows
you to pass your hooks to your component. It also allows your hooks to `compose`
and by attaching what is returned from each hook to the overall `props` that are 
passed to the next hook.

Note there is also a `compose.d.ts` file that has typings for `composeHooks` so
that you can use this package withing a TypeScript project without any additional 
dependencies for `@types`.

### Basic Usage
The `compose` function takes in an arbitrary amount of React `hooks` or you could just
use any `functions` you want. It calls them from left-to-right/top-to-bottom.
The preferred way is to have your `hooks` return an object with `key`/`value` pairs, but this
is not completely necessary. This way you can access the returned vales from `props`. However,
if you return something like a single value or an array (`[someState, setSomeState]`) it will
use the name of the `hook`/`function` as the key on props to access that value.

```js
import React from 'react';
import composeHooks from 'react-compose-hooks';

const useFirstName = () => 'Jeremy';
const useLastName = () => ({ lastName: 'Pivens' });
const useFullName = props => ({ fullName: `Sir ${props.useFirstName} ${props.lastName}` });

export const TestComponent = ({ fullName }) => (<p>Hello, { fullName }</p>);
export const Composed = compose(
  useFirstName,
  useLastName,
  useFullName,
)(TestComponent);

export default Composed;
```

Notice a few things here. We can separately export our component without
it being coupled to any hooks at all. As long as in the end we pass in a `fullName` on `props`
that's all the component needs. We can no write unit tests very easily for this component.
Maybe it uses `redux` and `connect`? Maybe it uses `hooks` or maybe it using something completely
different. Doesn't matter. And we can export our `compose`d version as well. 

Notice that `useFullName` accesses props which are values computed by previous hooks. The hooks
must be passed into compose in an order were the output will be piped to the next function.
If we changed the above code to

```js
export const Composed = compose(
  useFullName,
  useFirstName,
  useLastName,
)(TestComponent)
```

Then `useFullName` will not be able to access any `props` or values from the other hooks. 
Although it will still have access to any `props` that are passed to the component. Lastly,
notice that 2 of the hooks were returning objects. This is nice because it is the same type as 
`props` for components. However, notice in `useFullName` we access `props.useFirstName` for the value
that was returned by the `useFirstName` hook. Whenever a hook exports any value other than an `Object` 
`composeHooks` will try to use the `Function.name` as the key on the `props` object.

You can compose hooks that use hooks including `async` hooks and `useState`, `useContext`, `useEffect`, etc.


