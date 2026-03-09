import { useState } from "react";
import api from "../api";

export default function ForgotPassword(){
 const [email,setEmail]=useState("");

 const send = async ()=>{
  await api.post("/auth/forgot",{email});
  alert("Reset link sent");
 };

 return (
  <div className="p-10">
   <input onChange={e=>setEmail(e.target.value)} />
   <button onClick={send}>Send Reset</button>
  </div>
 );
}
