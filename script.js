const menu=document.querySelector('.menu-toggle');
const mobile=document.querySelector('.mobile-menu');
const cv=document.querySelector('.cv-modal');
const close=document.querySelector('.close-cv');
const progress=document.querySelector('.page-progress span');
const cursorGlow=document.querySelector('.cursor-glow');

function toggleMenu(){
  const open=mobile.classList.toggle('open');
  menu.setAttribute('aria-expanded',open);
  mobile.setAttribute('aria-hidden',!open);
  document.body.style.overflow=open?'hidden':'';
}
menu?.addEventListener('click',toggleMenu);
document.querySelectorAll('.mobile-menu a').forEach(a=>a.addEventListener('click',()=>{if(mobile.classList.contains('open'))toggleMenu()}));

function openCV(){
  cv.classList.add('open');
  cv.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
}
function closeCV(){
  cv.classList.remove('open');
  cv.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
}
document.querySelectorAll('[data-open-cv]').forEach(b=>b.addEventListener('click',openCV));
close?.addEventListener('click',closeCV);
cv?.addEventListener('click',e=>{if(e.target===cv)closeCV()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&cv.classList.contains('open'))closeCV()});
document.getElementById('year').textContent=new Date().getFullYear();

const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{
  if(e.isIntersecting)e.target.classList.add('visible');
}),{threshold:.12,rootMargin:'0px 0px -30px 0px'});
document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));

const sections=[...document.querySelectorAll('[data-section]')];
const navLinks=[...document.querySelectorAll('.desktop-nav .nav-link')];
const sectionObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      navLinks.forEach(link=>link.classList.toggle('active',link.getAttribute('href')==='#'+entry.target.id));
    }
  });
},{threshold:.15,rootMargin:'-35% 0px -55% 0px'});
sections.forEach(section=>sectionObserver.observe(section));

function updateProgress(){
  const scrollTop=window.scrollY;
  const docHeight=document.documentElement.scrollHeight-window.innerHeight;
  progress.style.width=(docHeight>0?(scrollTop/docHeight)*100:0)+'%';
}
window.addEventListener('scroll',updateProgress,{passive:true});
window.addEventListener('resize',updateProgress);
updateProgress();

if(window.matchMedia('(pointer:fine)').matches){
  window.addEventListener('pointermove',e=>{
    cursorGlow.style.left=e.clientX+'px';
    cursorGlow.style.top=e.clientY+'px';
  },{passive:true});

  document.querySelectorAll('.magnetic').forEach(el=>{
    el.addEventListener('pointermove',e=>{
      const r=el.getBoundingClientRect();
      const x=(e.clientX-r.left-r.width/2)*.08;
      const y=(e.clientY-r.top-r.height/2)*.08;
      el.style.transform=`translate(${x}px,${y}px)`;
    });
    el.addEventListener('pointerleave',()=>el.style.transform='');
  });

  document.querySelectorAll('.tilt-card').forEach(card=>{
    card.addEventListener('pointermove',e=>{
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`perspective(900px) rotateY(${x*2}deg) rotateX(${-y*2}deg) translateY(-3px)`;
    });
    card.addEventListener('pointerleave',()=>card.style.transform='');
  });
}
