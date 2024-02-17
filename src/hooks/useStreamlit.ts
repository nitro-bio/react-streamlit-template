import { useEffect, useState } from "react";
import { ZodSchema } from "zod";

export const useStreamlit = <T extends Record<string, unknown>>({
  ref,
  zodSchema,
}: {
  ref: React.RefObject<HTMLDivElement>;
  zodSchema: ZodSchema<T>;
}) => {
  const [data, setData] = useState<T | null>(null);

  const sendToStreamlit = (next: T) => {
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
        return;
      } else {
        console.debug("[useStreamlit] Received message", event.data.args);
        const parsed = zodSchema.safeParse(event.data.args);
        if (parsed.success) {
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
  console.debug("[useStreamlit]", type, data);
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
        return;
      } else {
        console.debug("[useStreamlitMock] received", event.data, "from react");
        const parsed = zodSchema.parse(event.data);
        sendToReact(parsed);
      }
    };
    window.addEventListener("message", receiveFromReact);
  }, []);

  const sendToReact = (next: T) => {
    const mapped = Object.fromEntries(Object.entries(next));
    window.parent.postMessage({
      isStreamlitMessage: true,
      type: "streamlit:render",
      args: mapped,
    });
    console.debug("[useStreamlitMock] sent", next, "to react");
  };

  return { sendToReact };
};
