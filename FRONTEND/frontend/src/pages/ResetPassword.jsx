import { useParams } from "react-router-dom";
import { useState } from "react";
import api from "../api";

export default function ResetPassword(){

 const {token} = useParams();
 const [p,setP]=useState("");

 const save = async ()=>{
  await api.post("/auth/reset/"+token,{password:p});
  alert("Password updated");
 };

 return (
  <div className="p-10">
   <input onChange={e=>setP(e.target.value)} />
   <button onClick={save}>Save</button>
  </div>
 );
}
