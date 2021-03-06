declare module 'compose-hooks-react' {
  export function composeHooks(...hooks: Function[]): <P extends object>(Component: React.ComponentType<P>) => (props: Object) => JSX.Element;
  export default composeHooks;
}
