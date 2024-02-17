import { useRef } from "react";
import { useStreamlit } from "./hooks/useStreamlit";
import Plot from "react-plotly.js";

function App() {
  const ref = useRef<HTMLDivElement>(null);
  const {} = useStreamlit<[string, Record<string, any>]>({
    ref,
  });

  return (
    <div ref={ref} className="text-white flex items-center content-center">
      <Plot
        data={[
          {
            x: [1, 2, 3],
            y: [2, 6, 3],
            type: "scatter",
            mode: "lines+markers",
            marker: { color: "red" },
          },
          { type: "bar", x: [1, 2, 3], y: [2, 5, 3] },
        ]}
        layout={{ width: "100%", height: "100%"
, title: "A Fancy Plot" }}
      />
    </div>
  );
}

export default App;



