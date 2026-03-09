import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { useEffect, useState } from "react";
import api from "../api";

export default function ThreatChart(){

  const [data,setData] = useState([]);

  useEffect(()=>{
    api.get("/phish/all").then(res=>{
      const h = res.data.filter(r=>r.risk==="HIGH").length;
      const m = res.data.filter(r=>r.risk==="MEDIUM").length;
      const l = res.data.filter(r=>r.risk==="LOW").length;

      setData([
        {name:"High",value:h},
        {name:"Medium",value:m},
        {name:"Low",value:l}
      ]);
    });
  },[]);

  return (
    <BarChart width={400} height={250} data={data}>
      <XAxis dataKey="name"/>
      <YAxis/>
      <Tooltip/>
      <Bar dataKey="value"/>
    </BarChart>
  );
}
