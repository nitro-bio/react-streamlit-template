# Streamlit-ready React Template

The provided code demonstrates a React application that integrates with Streamlit using custom hooks that handle inter-process communication. It leverages various technologies and libraries, including React, TypeScript, Vite, Streamlit, Zod, Tailwind CSS, and DaisyUI.

## Overview

- **React**: A JavaScript library for building user interfaces.
- **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
- **Vite**: A modern frontend build tool that significantly improves the frontend development experience.
- **Streamlit**: An open-source app framework for Machine Learning and Data Science teams.
- **Zod**: A TypeScript-first schema declaration and validation library.
- **Tailwind CSS**: A utility-first CSS framework for rapidly building custom user interfaces.
- **DaisyUI**: A Tailwind CSS plugin that provides styled components.

## App.tsx

### Description

`App.tsx` is the main React component of the application. It interfaces with the Streamlit Python backend through custom hooks, demonstrating how messages can be sent and received to control a counter in the React app.

### Components

- **`<App />`**: A functional component that uses the `useStreamlit` hook to listen for data and the `useStreamlitMock` hook for mock interactivity with the Streamlit backend.

### Custom Hooks

#### useStreamlit

- **Purpose**: Connects to Streamlit, listens for messages, and sends updates.
- **Usage**: It accepts a reference to a DOM element and a Zod schema to validate incoming messages. It provides data and a `setData` function that sends messages back to Streamlit.

#### useStreamlitMock

- **Purpose**: Mimics the communication with Streamlit for development without the backend.
- **Usage**: It provides a `sendToReact` function to simulate receiving messages from Streamlit.

### StreamlitData and Validation

- **StreamlitData**: A TypeScript type that represents the expected shape of data from Streamlit.
- **Validation**: Uses the Zod library to validate the shape of the incoming data against the `StreamlitDataSchema`.

## useStreamlit.ts

### Description

Contains logic for the `useStreamlit` hook that enables communication between a React component and Streamlit, as well as for sending messages to the Streamlit client.

### Functions

- **sendMessageToStreamlitClient**: Sends a message to the Streamlit client.
- **useStreamlit**: A hook that sets up an event listener to receive messages from Streamlit, validates them using Zod, and allows sending messages back.
- **useStreamlitMock**: A hook that mimics the sending and receiving of messages to and from Streamlit.

## Integration Approach

The integration between Streamlit and the React app is performed through `window.postMessage`, facilitating communication between the iframe (containing the React app) and the Streamlit parent window.

## Example Usage

In the `App.tsx` file, the React component displays a simple UI with a counter. The counter can be incremented through a button using the `setData` function provided by `useStreamlit`. Additionally, a mock button is provided to test the decrement functionality without Streamlit backend interaction using `useStreamlitMock`.

```tsx
<button onClick={() => setData({ count: count + 1 })} className="btn">
  Counter: {count}
</button>
<button onClick={() => sendToReact({ count: count - 1 })} className="btn">
  Decrement from mock
</button>
```

To run and test this code, ensure that you have the Streamlit backend running for the `useStreamlit` hook or use the `useStreamlitMock` hook for frontend-only development.
