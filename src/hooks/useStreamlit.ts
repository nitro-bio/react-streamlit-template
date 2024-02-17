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
    console.log(`sending message to streamlit`);
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
        console.log("[Streamlit] Received message", event.data.args);
        const parsed = zodSchema.safeParse(event.data.args);
        if (parsed.success) {
          console.log(`Setting state to`, parsed);
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
          console.log(`resizing component`);
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
  console.log("[Streamlit]", type, data);
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
        console.log(`received message from react`, event.data);
        console.log(`sending back to react`);
        const parsed = zodSchema.parse(event.data);
        sendToReact(parsed);
      }
    };
    window.addEventListener("message", receiveFromReact);
  }, []);

  const sendToReact = (next: T) => {
    console.log(`sending ${JSON.stringify(next)} to react`);
    const mapped = Object.fromEntries(Object.entries(next));
    window.parent.postMessage({
      isStreamlitMessage: true,
      type: "streamlit:render",
      args: mapped,
    });
  };

  return { sendToReact };
};
