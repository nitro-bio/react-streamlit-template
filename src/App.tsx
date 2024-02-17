// App.tsx
import { useRef } from "react";
import { useStreamlit, useStreamlitMock } from "./hooks/useStreamlit";
import { z } from "zod";

const StreamlitDataSchema = z.object({
  count: z.number().optional(),
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

  const count = data?.count ?? 0;
  return (
    <div
      ref={ref}
      className="text-zinc-100 min-h-screen flex items-center px-8 py-32 bg-zinc-800 flex-col gap-8"
    >
      {"Streamlit + React"}
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
