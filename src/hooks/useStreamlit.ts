import { useEffect, useState } from "react";

export const useStreamlit = <T>({
  ref,
}: {
  ref: React.RefObject<HTMLDivElement>;
}) => {
  const [data, setData] = useState<Map<string, T>>(new Map());

  const update = ({ key, value }: { key: string; value: T }) => {
    const nextData = new Map(data);
    nextData.set(key, value);
    setData(nextData);
  };

  const updateAndPush = ({ key, value }: { key: string; value: T }) => {
    update({ key, value });
    sendMessageToStreamlitClient("streamlit:componentChanged", { key, value });
  };

  useEffect(function subscribeToStreamlit() {
    sendMessageToStreamlitClient("streamlit:componentReady", { apiVersion: 1 });
    function onDataFromStreamlit(event: {
      data: {
        type: string;
        args: { key: string; value: T };
      };
    }) {
      console.log("[Streamlit] Received message", event.data);
      if (event.data.type !== "streamlit:render") {
        console.log("Not a value message, ignoring");
        return;
      } else {
        update(event.data.args);
      }
    }

    window.addEventListener("message", onDataFromStreamlit);
  }, []);

  useEffect(function resizeStreamlitFrameDebounced() {
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
  });

  return { data, updateAndPush };
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
