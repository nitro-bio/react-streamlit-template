// App.tsx
import { useRef } from "react";
import { useStreamlit, useStreamlitMock } from "./hooks/useStreamlit";
import { z } from "zod";

const StreamlitDataSchema = z.object({
  count: z.number().optional().default(0),
});
type StreamlitData = z.infer<typeof StreamlitDataSchema>;

function App() {
  const ref = useRef<HTMLDivElement>(null);
  const { data, setData } = useStreamlit<StreamlitData>({
    ref,
    zodSchema: StreamlitDataSchema,
  });
  const { sendToReact } = useStreamlitMock({
    zodSchema: StreamlitDataSchema,
  });

  const { count } = data ?? { count: 0 };
  return (
    <div
      ref={ref}
      className="text-zinc-100 min-h-screen flex items-center px-8 py-32 bg-zinc-800 flex-col gap-8"
    >
      Streamlit + React
      <button onClick={() => setData({ count: count + 1 })} className="btn">
        Counter: {count}
      </button>
      <button onClick={() => sendToReact({ count: count - 1 })} className="btn">
        Decrement from mock
      </button>
    </div>
  );
}

export default App;

// useStreamlit.ts
import { useEffect, useRef, useState } from "react";
import { z, ZodSchema } from "zod";

export const useStreamlit = <T extends Record<string, unknown>>({
  ref,
  zodSchema,
}: {
  ref: React.RefObject<HTMLDivElement>;
  zodSchema: ZodSchema<T>;
}) => {
  const [data, setData] = useState<T | null>(null);

  const sendToStreamlit = (next: T) => {
    // update(next);
    console.debug(`sending message to streamlit`);
    sendMessageToStreamlitClient("streamlit:componentChanged", next);
  };

  useEffect(function subscribeToStreamlit() {
    sendMessageToStreamlitClient("streamlit:componentReady", { apiVersion: 1 });
    function onDataFromStreamlit(event: {
      data: {
        type: string;
        args: { key: string; value: T };
      };
    }) {
      if (event.data.type !== "streamlit:render") {
        console.debug("Not a value message, ignoring");
        return;
      } else {
        console.debug("[Streamlit] Received message", event.data.args);
        const parsed = zodSchema.safeParse(event.data.args);
        if (parsed.success) {
          console.debug(`Setting state to`, parsed);
          setData(parsed.data);
        } else {
          console.error(parsed.error);
          throw new Error(
            `Invalid data from Streamlit: ${JSON.stringify(event.data.args)}`,
          );
        }
      }
    }

    window.addEventListener("message", onDataFromStreamlit);
  }, []);

  useEffect(
    function resizeStreamlitFrameDebounced() {
      const timeoutId = setTimeout(function resizeStreamlitFrame() {
        if (ref.current) {
          console.debug(`resizing component`);
          sendMessageToStreamlitClient("streamlit:setFrameHeight", {
            height: ref.current.scrollHeight,
          });
        }
      }, 100);
      return function cleanup() {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    },
    [ref.current?.scrollHeight],
  );
  return { data, setData: sendToStreamlit };
};

type StreamlitType =
  | "streamlit:componentChanged"
  | "streamlit:componentReady"
  | "streamlit:render"
  | "streamlit:setFrameHeight";

function sendMessageToStreamlitClient(type: StreamlitType, data: unknown) {
  console.debug("[Streamlit]", type, data);
  const outData = Object.assign(
    {
      isStreamlitMessage: true,
      type: type,
    },
    data,
  );
  window.parent.postMessage(outData, "*");
}

export const useStreamlitMock = <T extends Record<string, unknown>>({
  zodSchema,
}: {
  zodSchema: ZodSchema<T>;
}) => {
  useEffect(function setupMock() {
    const receiveFromReact = (event: MessageEvent) => {
      if (event.data.type !== "streamlit:componentChanged") {
        console.debug("Not a componentChanged message, ignoring");
        return;
      } else {
        console.debug(`received message from react`, event.data);
        console.debug(`sending back to react`);
        const parsed = zodSchema.parse(event.data);
        sendToReact(parsed);
      }
    };
    window.addEventListener("message", receiveFromReact);
  }, []);

  const sendToReact = (next: T) => {
    console.debug(`sending ${JSON.stringify(next)} to react`);
    const mapped = Object.fromEntries(Object.entries(next));
    window.parent.postMessage({
      isStreamlitMessage: true,
      type: "streamlit:render",
      args: mapped,
    });
  };

  return { sendToReact };
};
