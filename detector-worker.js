importScripts("https://cdn.jsdelivr.net/gh/arenaxr/apriltag-js-standalone@master/html/apriltag_wasm.js");
importScripts("https://unpkg.com/comlink/dist/umd/comlink.js");

class Detector {
  constructor(ready) {
    this.ready=ready;
    AprilTagWasm({
      locateFile:(p)=> p.endsWith(".wasm")
        ? "https://cdn.jsdelivr.net/gh/arenaxr/apriltag-js-standalone@master/html/apriltag_wasm.wasm"
        : p
    }).then(M=>{
      this.M=M;
      this.init=M.cwrap("atagjs_init","number",[]);
      this.setopts=M.cwrap("atagjs_set_detector_options","number",
        ["number","number","number","number","number","number","number"]);
      this.setbuf=M.cwrap("atagjs_set_img_buffer","number",["number","number","number"]);
      this.detectC=M.cwrap("atagjs_detect","number",[]);
      this.init();
      // Detection only for this first test; pose is intentionally disabled.
      this.setopts(1.5,0.0,1,1,0,0,0);
      this.ready();
    });
  }
  detect(gray,w,h){
    const ptr=this.setbuf(w,h,w);
    this.M.HEAPU8.set(gray,ptr);
    const jp=this.detectC();
    const len=this.M.getValue(jp,"i32");
    if(!len) return [];
    const sp=this.M.getValue(jp+4,"i32");
    const view=new Uint8Array(this.M.HEAP8.buffer,sp,len);
    let s="";
    for(let i=0;i<len;i++) s+=String.fromCharCode(view[i]);
    return JSON.parse(s);
  }
}
Comlink.expose(Detector);