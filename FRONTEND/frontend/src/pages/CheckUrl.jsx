import { useState } from "react";
import axios from "axios";

export default function CheckURL(){
 const [url,setUrl]=useState("");
 const [result,setResult]=useState(null);

 const check = async ()=>{
  const res = await axios.post("/api/phish/check",{url});
  setResult(res.data);
 };

 return (
  <div className="p-10 space-y-3">
   <input placeholder="Enter URL"
    onChange={e=>setUrl(e.target.value)} />

   <button onClick={check}>Check</button>

   {result && <div>{result.status}</div>}
  </div>
 );
}
