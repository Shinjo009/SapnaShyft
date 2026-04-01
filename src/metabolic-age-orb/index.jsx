import { useState } from "react";
import Orb, { defaultConfig } from "./Orb";
import OrbEditor from "./OrbEditor";

const Index = () => {
  const [config, setConfig] = useState(defaultConfig);

  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", gap: 24, padding: 24, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, minWidth: 300 }}>
        <Orb config={config} />
      </div>
      <OrbEditor config={config} onChange={setConfig} />
    </div>
  );
};

export default Index;
