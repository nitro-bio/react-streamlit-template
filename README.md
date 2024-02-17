# Streamlit-ready React Template

This project demonstrates a React app that is ready to integrate with Streamlit using custom hooks that handle/mock communication between the two layers.

[Demo](https://streamlit-ready-react-component.vercel.app/)

Open the browser console and check the debug messages sent and received between the Streamlit mock and the React app as you interact with the buttons.

## useStreamlit hook

The integration between Streamlit and the React app is performed through `window.postMessage`, facilitating communication between the iframe (containing the React app) and the Streamlit parent window. This is abstracted away via the useStreamlit hook.

**Example usage**:

```tsx
// 1. Write a Zod schema for the expected data from Streamlit
const StreamlitDataSchema = z.object({
  count: z.number().optional()
});
type StreamlitData = z.infer<typeof StreamlitDataSchema>;

function App() {
  // 2. Create a ref so we can resize the iframe Streamlit puts us in
  const ref = useRef<HTMLDivElement>(null);

  // 3. Use the useStreamlit hook to listen for data from Streamlit
  const { data, setData } = useStreamlit<StreamlitData>({
    ref,
    zodSchema: StreamlitDataSchema,
  });

  // 4. Use the data and setData functions to interact with Streamlit
  const count = data?.count ?? 0;
  return (
    <div ref={ref}>
      Streamlit + React
      <button onClick={() => setData({ count: count + 1 })}>
        Counter: {count}
      </button>
    </div>
  );
}
```

## useStreamlitMock hook

To facilitate frontend-only development, a `useStreamlitMock` hook is provided to simulate the sending and receiving of messages to and from Streamlit. This allows for testing the React app without the Streamlit backend.

```tsx
const StreamlitDataSchema = z.object({
  count: z.number().optional()
});
type StreamlitData = z.infer<typeof StreamlitDataSchema>;

function App() {
  const ref = useRef<HTMLDivElement>(null);
  const { data, setData } = useStreamlit<StreamlitData>({
    ref,
    zodSchema: StreamlitDataSchema,
  });
  // 1. Use the useStreamlitMock hook to simulate Streamlit sending messages to React
  const { sendToReact } = useStreamlitMock({
    zodSchema: StreamlitDataSchema,
  });

  const count = data?.count ?? 0;
  return (
    <div
      ref={ref}
    >
      Streamlit + React
      <button onClick={() => setData({ count: count + 1 })} >
        Counter: {count}
      </button>
      {/* 2. Use the sendToReact function to simulate Streamlit sending messages to React */}
      <button onClick={() => sendToReact({ count: count - 1 })}>
        Decrement from mock
      </button>
    </div>
  );
}
```
