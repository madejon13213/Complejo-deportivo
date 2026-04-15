
let timer = null;

self.onmessage = (e) => {
  if (e.data === "start") {
    if (timer) clearInterval(timer);
    
    timer = setInterval(() => {
      self.postMessage("tick");
    }, 60000); 
    
    console.log("[Worker] Temporizador de sesión iniciado");
  }

  if (e.data === "stop") {
    clearInterval(timer);
    timer = null;
    console.log("[Worker] Temporizador de sesión detenido");
  }
};