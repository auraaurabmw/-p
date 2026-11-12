// Para añadir una etapa, agrega un objeto a esta lista.
var etapas = [
  {tab:"Los inicios", year:"1972", title:"Nace BMW Motorsport GmbH", text:"BMW crea en Múnich su propia división de competición. Su primer objetivo es ganar en turismos y llevar esa experiencia a modelos de calle."},
  {tab:"Los 70", year:"1973", title:"El reinado del 3.0 CSL", text:"El 3.0 CSL domina el campeonato europeo de turismos y se hace famoso por su aerodinámica extrema."},
  {tab:"Fórmula 1 turbo", year:"1983", title:"Campeón con Brabham", text:"Nelson Piquet gana el título mundial con motor BMW turbo, el primero en lograrlo con un motor turbo."},
  {tab:"Le Mans", year:"1999", title:"Victoria en las 24 Horas", text:"El BMW V12 LMR gana la carrera de resistencia más famosa del mundo."},
  {tab:"Williams y Sauber", year:"2000–2009", title:"BMW vuelve a la F1", text:"Primero como proveedor de motores de Williams y después con su propio equipo, BMW Sauber."},
  {tab:"Hoy", year:"2022 en adelante", title:"GT3 e híbridos", text:"El M4 GT3 compite en campeonatos GT y el M Hybrid V8 lleva la marca a IMSA y al Mundial de Resistencia."}
];
var tabs = document.querySelector(".years");
function show(i){
  var e = etapas[i];
  document.getElementById("d-title").textContent = e.title;
  document.getElementById("d-year").textContent = e.year;
  document.getElementById("d-text").textContent = e.text;
  [].forEach.call(tabs.children, function(b, j){ b.setAttribute("aria-selected", j === i); });
}
etapas.forEach(function(e, i){
  var b = document.createElement("button");
  b.setAttribute("role", "tab");
  b.textContent = e.tab;
  b.addEventListener("click", function(){ show(i); });
  tabs.appendChild(b);
});
show(0);

// Flujo: Entrar → video en pantalla completa → al terminar, la página y el audio.
var audio = document.getElementById("audio"), video = document.getElementById("video"),
    intro = document.getElementById("intro"), entrada = document.getElementById("entrada"),
    btnSonido = document.getElementById("sonido"), listo = false;

function etiqueta(){ btnSonido.textContent = audio.paused ? "Activar sonido" : "Silenciar"; }
function terminar(){
  if (listo) return; listo = true;
  try { if (document.fullscreenElement) document.exitFullscreen(); } catch(e){}
  video.pause();
  intro.classList.remove("on");
  document.body.classList.add("dentro");
  btnSonido.hidden = false;
  audio.currentTime = 0;
  audio.play().then(etiqueta).catch(etiqueta);
}
document.getElementById("entrar").addEventListener("click", function(){
  // "Desbloquea" el audio dentro del toque, para poder iniciarlo luego sin otro toque.
  audio.play().then(function(){ audio.pause(); audio.currentTime = 0; }).catch(function(){});
  entrada.style.display = "none";
  intro.classList.add("on");
  try { if (intro.requestFullscreen) intro.requestFullscreen().catch(function(){}); } catch(e){}
  video.play().catch(terminar);
});
video.addEventListener("ended", terminar);
video.addEventListener("error", terminar);
document.getElementById("saltar").addEventListener("click", terminar);
document.addEventListener("fullscreenchange", function(){ if (!document.fullscreenElement && intro.classList.contains("on")) terminar(); });
btnSonido.addEventListener("click", function(){
  if (audio.paused) audio.play().then(etiqueta); else { audio.pause(); etiqueta(); }
});
// --- Más interacción ---
document.getElementById("anios").dataset.to = new Date().getFullYear() - 1972;

// Barra de progreso al hacer scroll
var prog = document.getElementById("progreso");
addEventListener("scroll", function(){
  var h = document.documentElement;
  prog.style.transform = "scaleX(" + (h.scrollTop / ((h.scrollHeight - h.clientHeight) || 1)) + ")";
}, {passive:true});

// Aparecer al hacer scroll, y contar los números
function contar(b){
  var to = +b.dataset.to, t0 = null;
  (function f(t){ t0 = t0 || t; var p = Math.min((t - t0) / 1400, 1);
    b.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(f); })(performance.now());
}
var io = new IntersectionObserver(function(es){
  es.forEach(function(e){
    if (!e.isIntersecting) return;
    e.target.classList.add("vis"); io.unobserve(e.target);
    var b = e.target.querySelector("b[data-to]"); if (b) contar(b);
  });
}, {threshold:.2});
document.querySelectorAll("section h2,.intro,.timeline,.car,.stat").forEach(function(el){
  el.classList.add("rev");
  el.style.transitionDelay = (Array.prototype.indexOf.call(el.parentNode.children, el) * 90) + "ms";
  io.observe(el);
});

// El logo se mueve un poco con el mouse
var heroEl = document.querySelector(".hero");
heroEl.addEventListener("mousemove", function(e){
  var r = heroEl.getBoundingClientRect();
  heroEl.style.setProperty("--tx", ((e.clientX - r.left) / r.width - .5) * -40 + "px");
  heroEl.style.setProperty("--ty", ((e.clientY - r.top) / r.height - .5) * -40 + "px");
});

// Tarjetas que se inclinan y brillan donde pasa el mouse
document.querySelectorAll(".car").forEach(function(c){
  c.addEventListener("mousemove", function(e){
    var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    c.style.setProperty("--mx", x * 100 + "%"); c.style.setProperty("--my", y * 100 + "%");
    c.style.transform = "perspective(700px) rotateX(" + (.5 - y) * 12 + "deg) rotateY(" + (x - .5) * 12 + "deg)";
  });
  c.addEventListener("mouseleave", function(){ c.style.transform = ""; });
});

// Línea de tiempo: el panel se anima y se maneja con las flechas
var cur = 0, panel = document.querySelector(".detail"), _show = show;
show = function(i){
  cur = i; _show(i);
  panel.classList.remove("cambia"); void panel.offsetWidth; panel.classList.add("cambia");
};
tabs.addEventListener("keydown", function(e){
  var k = {ArrowDown:1, ArrowRight:1, ArrowUp:-1, ArrowLeft:-1}[e.key]; if (!k) return;
  e.preventDefault();
  var n = (cur + k + etapas.length) % etapas.length; show(n); tabs.children[n].focus();
});

// Galería: clic para ver la foto grande
var lb = document.getElementById("lightbox");
document.querySelectorAll(".galeria img").forEach(function(im){
  im.addEventListener("click", function(){ lb.querySelector("img").src = im.src; lb.hidden = false; });
});
lb.addEventListener("click", function(){ lb.hidden = true; });
addEventListener("keydown", function(e){ if (e.key === "Escape") lb.hidden = true; });

// Botón troll
var troll = document.getElementById("troll"), gemi2 = document.getElementById("gemi2"), saturada = document.getElementById("saturada");
document.getElementById("troll-btn").addEventListener("click", function(){
  audio.pause(); etiqueta();
  troll.hidden = false;
  gemi2.currentTime = 0; gemi2.play().catch(function(){});
});
gemi2.addEventListener("ended", function(){
  troll.classList.add("shake");
  saturada.currentTime = 0; saturada.play().catch(function(){});
});
document.getElementById("troll-volver").addEventListener("click", function(){
  troll.hidden = true; troll.classList.remove("shake");
  gemi2.pause(); saturada.pause();
  audio.play().then(etiqueta).catch(etiqueta);
});
