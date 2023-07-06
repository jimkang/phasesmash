"use strict";const i=require("electron");i.contextBridge.exposeInMainWorld("fsPromises",{readFile(e,n){return i.ipcRenderer.invoke("readFile",e,n)},writeFile(e,n){return i.ipcRenderer.invoke("writeFile",e,n)}});i.contextBridge.exposeInMainWorld("electronDialog",{showSaveDialog(e){return i.ipcRenderer.invoke("showSaveDialog",e)},showOpenDialog(e){return i.ipcRenderer.invoke("showOpenDialog",e)}});function d(e=["complete","interactive"]){return new Promise(n=>{e.includes(document.readyState)?n(!0):document.addEventListener("readystatechange",()=>{e.includes(document.readyState)&&n(!0)})})}const r={append(e,n){Array.from(e.children).find(t=>t===n)||e.appendChild(n)},remove(e,n){Array.from(e.children).find(t=>t===n)&&e.removeChild(n)}};function s(){const e="loaders-css__square-spin",n=`
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${e} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `,t=document.createElement("style"),o=document.createElement("div");return t.id="app-loading-style",t.innerHTML=n,o.className="app-loading-wrap",o.innerHTML=`<div class="${e}"><div></div></div>`,{appendLoading(){r.append(document.head,t),r.append(document.body,o)},removeLoading(){r.remove(document.head,t),r.remove(document.body,o)}}}const{appendLoading:c,removeLoading:a}=s();d().then(c);window.onmessage=e=>{e.data.payload==="removeLoading"&&a()};setTimeout(a,4999);
