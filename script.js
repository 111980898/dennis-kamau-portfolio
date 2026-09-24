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

function base64ToBlob(base64,mime){
  const bin=atob(base64);
  const bytes=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
  return new Blob([bytes],{type:mime});
}

function openCV(){
  cv.classList.add('open');
  cv.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
  // If running inside a sandboxed preview that embedded the CV as base64
  // (window.__cvAssets), swap the iframe to a blob URL so the PDF actually renders.
  const frame=document.querySelector('[data-pdf-frame]');
  if(frame&&window.__cvAssets&&window.__cvAssets.pdf&&!frame.dataset.blobSet){
    try{
      const blob=base64ToBlob(window.__cvAssets.pdf.base64,window.__cvAssets.pdf.mime);
      frame.src=URL.createObjectURL(blob)+'#toolbar=0&navpanes=0&view=FitH';
      frame.dataset.blobSet='1';
    }catch(err){/* keep original src as a fallback */}
  }
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

// --- CV download feedback: "DOWNLOADING… / DOWNLOADED ✓" on every download control ---
document.querySelectorAll('[data-download]').forEach(el=>{
  const label=el.querySelector('.btn-label');
  const original=label?label.textContent:null;
  const setState=(text,cls)=>{
    if(label)label.textContent=text;
    el.classList.remove('download-active','download-done');
    if(cls)el.classList.add(cls);
  };
  const reset=()=>{ setState(original,null); };

  el.addEventListener('click',async(e)=>{
    const kind=el.getAttribute('data-download'); // 'pdf' or 'docx'
    const asset=window.__cvAssets&&window.__cvAssets[kind];
    // Sandboxed preview environments treat plain <a download> as inert,
    // so when an embedded asset + the platform's downloads capability exist, use it directly.
    if(asset&&window.claude&&typeof window.claude.use==='function'){
      try{
        const downloads=await window.claude.use('downloads');
        if(downloads){
          e.preventDefault();
          setState('DOWNLOADING…','download-active');
          try{
            const blob=base64ToBlob(asset.base64,asset.mime);
            await downloads.save({filename:asset.filename,data:blob});
            setState('DOWNLOADED ✓','download-done');
          }catch(err){
            setState('CANCELLED',null);
          }
          setTimeout(reset,2200);
          return;
        }
      }catch(err){/* fall through to normal link behaviour below */}
    }
    // Normal hosted site: let the browser's native download proceed; show matching feedback.
    setState('DOWNLOADING…','download-active');
    setTimeout(()=>{setState('DOWNLOADED ✓','download-done');setTimeout(reset,1800);},700);
  });
});

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

const phoneBtn=document.querySelector('.contact-phone');
phoneBtn?.addEventListener('click',async()=>{
  const number=phoneBtn.getAttribute('data-copy');
  const hint=phoneBtn.querySelector('.contact-phone-hint');
  try{
    if(navigator.clipboard&&window.isSecureContext){
      await navigator.clipboard.writeText(number);
    }else{
      const ta=document.createElement('textarea');
      ta.value=number;ta.style.position='fixed';ta.style.opacity='0';
      document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();
    }
    phoneBtn.classList.add('copied');
    if(hint)hint.textContent='COPIED ✓';
  }catch(err){
    if(hint)hint.textContent='COPY FAILED';
  }
  clearTimeout(phoneBtn._copyTimeout);
  phoneBtn._copyTimeout=setTimeout(()=>{
    phoneBtn.classList.remove('copied');
    if(hint)hint.textContent='TAP TO COPY';
  },2000);
});

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
