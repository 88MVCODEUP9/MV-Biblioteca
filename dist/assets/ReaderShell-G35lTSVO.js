import{r as t,j as e}from"./react-BjeeCjb0.js";import{X as we,M as Re,Z as ge,d as ye,C as oe,e as le,R as Se,D as Le,f as $e,g as Ae,b as De,B as Fe}from"./icons-gUXPaTbR.js";function je(s,a,l){return Math.min(Math.max(s,a),l)}function Ze(s){const[a,l]=t.useState(!1);t.useEffect(()=>{const c=()=>{l(!!document.fullscreenElement&&document.fullscreenElement===s.current)};return document.addEventListener("fullscreenchange",c),()=>{document.removeEventListener("fullscreenchange",c)}},[s]);const o=t.useCallback(async()=>{try{document.fullscreenElement?await document.exitFullscreen():await s.current?.requestFullscreen()}catch(c){console.warn("Não foi possível alternar o fullscreen.",c)}},[s]);return{isFullscreen:a,toggleFullscreen:o}}function _e(s=!0){t.useEffect(()=>{if(!s)return;const a=document.documentElement,l=document.body.style.overflow,o=a.style.overscrollBehavior;return document.body.style.overflow="hidden",a.style.overscrollBehavior="none",()=>{document.body.style.overflow=l,a.style.overscrollBehavior=o}},[s])}function Oe({idleMs:s=3200,suspended:a=!1}={}){const[l,o]=t.useState(!0),c=t.useRef(null),i=t.useCallback(()=>{c.current!==null&&(window.clearTimeout(c.current),c.current=null)},[]),d=t.useCallback(()=>{i(),!a&&(c.current=window.setTimeout(()=>{o(!1)},s))},[i,s,a]),f=t.useCallback(()=>{o(!0),d()},[d]),N=t.useCallback(()=>{o(h=>{const p=!h;return p?d():i(),p})},[d,i]);return t.useEffect(()=>{if(a){o(!0),i();return}return d(),i},[a,d,i]),{visible:l,wake:f,toggle:N}}async function qe(s,a){const l=a.replace(/[\\/:*?"<>|]+/g," ").trim()||"livro",o=(c,i)=>{const d=document.createElement("a");d.href=c,d.download=l,i&&(d.target="_blank",d.rel="noopener noreferrer"),document.body.appendChild(d),d.click(),d.remove()};try{const c=await fetch(s,{mode:"cors",credentials:"omit"});if(!c.ok)throw new Error(`HTTP ${c.status}`);const i=URL.createObjectURL(await c.blob());o(i,!1),window.setTimeout(()=>URL.revokeObjectURL(i),6e4)}catch{o(s,!0)}}function Be(){const[s,a]=t.useState(!1);return t.useEffect(()=>{const l=requestAnimationFrame(()=>a(!0));return()=>cancelAnimationFrame(l)},[]),s?"opacity-100 scale-100":"opacity-0 scale-[0.98]"}const q=.15,ce=4,ie=1,F=Array.from({length:78},(s,a)=>Math.round((q+a*.05)*100)/100),Ge=595,We=842;function Ie(){const s=()=>({width:typeof window<"u"?window.innerWidth:1280,height:typeof window<"u"?window.innerHeight:800}),[a,l]=t.useState(s);return t.useEffect(()=>{const o=()=>l(s());return window.addEventListener("resize",o),window.addEventListener("orientationchange",o),()=>{window.removeEventListener("resize",o),window.removeEventListener("orientationchange",o)}},[]),{...a,isMobile:a.width<640,isTablet:a.width>=640&&a.width<1024,isDesktop:a.width>=1024}}function Pe({containerRef:s,viewport:a,pageWidth:l,pageHeight:o,rotation:c,enabled:i}){const[d,f]=t.useState(ie),[N,h]=t.useState("fit"),{isMobile:p,isTablet:E}=a,C=t.useCallback(()=>{const u=s.current;if(!u)return ie;const x=u.clientWidth,Z=u.clientHeight;if(!x||!Z)return ie;const k=c%180!==0,W=k?o:l,_=k?l:o,O=p?0:32,z=p?24:48,M=Math.max(x-O,200)/W,T=Math.max(Z-z,200)/_,Y=p||E?M:Math.min(M,T);return je(Y,q,ce)},[s,p,E,o,l,c]);t.useEffect(()=>{if(!i||N!=="fit")return;const u=window.setTimeout(()=>{f(C())},100);return()=>window.clearTimeout(u)},[C,i,N,a.width,a.height]);const G=t.useCallback(u=>{h("manual"),f(je(u,q,ce))},[]),$=t.useCallback(()=>{h("manual"),f(u=>F.find(x=>x>u+.001)??ce)},[]),A=t.useCallback(()=>{h("manual"),f(u=>{for(let x=F.length-1;x>=0;x-=1)if(F[x]<u-.001)return F[x];return q})},[]),v=t.useCallback(()=>{h("fit"),f(C()),window.requestAnimationFrame(()=>{s.current?.scrollTo({top:0,left:0,behavior:"smooth"})})},[C,s]);return{scale:d,zoomMode:N,zoomPercentage:`${Math.round(d*100)}%`,zoomIn:$,zoomOut:A,setManualZoom:G,fitToScreen:v}}const Ue=`
  flex items-center justify-center
  rounded-xl
  transition-all duration-200
  text-[var(--text-sub)]
  hover:text-[var(--gold)]
  hover:bg-[var(--gold-glow)]
  active:scale-95
  disabled:opacity-30
  disabled:pointer-events-none
`,He=`
  text-[var(--gold)]
  bg-[var(--gold-glow)]
`,b=Ue,Ke=He;function Ye({ref:s,title:a,author:l,formatLabel:o,coverUrl:c,onClose:i,loading:d,loadingTitle:f,loadingSubtitle:N,error:h,errorTitle:p,errorPrimary:E,pageNumber:C,numPages:G,canPrev:$,canNext:A,onPrev:v,onNext:u,pageWidth:x,pageHeight:Z,onDownload:k,headerExtras:W,panel:_,panelTitle:O,panelOpen:z=!1,onClosePanel:M,onTogglePanel:T,children:Y}){const de=t.useRef(null),J=t.useRef(null),ue=t.useRef(null),me=t.useRef(null),he=Ie(),{isMobile:B,isTablet:Ne,isDesktop:ke}=he,[D,Ee]=t.useState(0),[w,I]=t.useState(!1),P=!d&&!h,Ce=Pe({containerRef:J,viewport:he,pageWidth:x,pageHeight:Z,rotation:D,enabled:P}),{scale:g,zoomMode:Q,zoomPercentage:U,zoomIn:R,zoomOut:S,setManualZoom:ee,fitToScreen:L}=Ce,{isFullscreen:te,toggleFullscreen:ne}=Ze(de);_e();const{visible:H,wake:y}=Oe({suspended:d||!!h||w||z}),ze=Be(),ae=t.useCallback(()=>{Ee(n=>(n+90)%360)},[]);t.useEffect(()=>{const n=r=>{const m=r.target;if(!(m?.tagName==="INPUT"||m?.tagName==="TEXTAREA"||m?.isContentEditable)&&!(r.ctrlKey||r.metaKey||r.altKey))switch(y(),r.key){case"Escape":w?I(!1):z?M?.():document.fullscreenElement?document.exitFullscreen().catch(()=>{}):i();break;case"ArrowRight":case"PageDown":case" ":r.preventDefault(),u();break;case"ArrowLeft":case"PageUp":r.preventDefault(),v();break;case"+":case"=":r.preventDefault(),R();break;case"-":case"_":r.preventDefault(),S();break;case"0":r.preventDefault(),L();break;case"r":case"R":r.preventDefault(),ae();break;case"f":case"F":r.preventDefault(),ne();break;case"t":case"T":T&&(r.preventDefault(),T());break}};return document.addEventListener("keydown",n),()=>document.removeEventListener("keydown",n)},[L,i,M,u,v,T,z,ae,w,ne,y,R,S]);const K=t.useCallback(n=>{n<0?R():S()},[R,S]);t.useEffect(()=>{const n=J.current;if(!n)return;const r=m=>{m.ctrlKey&&(m.preventDefault(),K(m.deltaY))};return n.addEventListener("wheel",r,{passive:!1}),()=>n.removeEventListener("wheel",r)},[K]),t.useEffect(()=>{if(!w)return;const n=r=>{ue.current?.contains(r.target)||I(!1)};return document.addEventListener("mousedown",n),document.addEventListener("touchstart",n),()=>{document.removeEventListener("mousedown",n),document.removeEventListener("touchstart",n)}},[w]),t.useEffect(()=>{w&&me.current?.scrollIntoView({block:"center"})},[w]);const j=t.useRef(null),V=t.useRef(0),se=t.useRef(g),xe=t.useRef(D);t.useEffect(()=>{se.current=g,xe.current=D},[g,D]);const re=t.useCallback((n,r)=>{if(y(),Math.hypot(n,r)<10){const m=Date.now();m-V.current<300?(V.current=0,Q==="manual"?L():ee(g*1.5)):V.current=m;return}V.current=0,Math.abs(n)>60&&Math.abs(r)<100&&g<=1.3&&(n<0?u():v())},[L,u,v,g,ee,y,Q]),Me=n=>{if(y(),n.touches.length!==1){j.current=null;return}j.current={x:n.touches[0].clientX,y:n.touches[0].clientY}},Te=n=>{const r=j.current;if(j.current=null,!r)return;const m=n.changedTouches[0];re(m.clientX-r.x,m.clientY-r.y)};t.useImperativeHandle(s,()=>({wake:y,localTouchStart:(n,r)=>{j.current={x:n,y:r}},localTouchEnd:(n,r)=>{const m=j.current;if(j.current=null,!m)return;const X=xe.current*Math.PI/180,fe=n-m.x,pe=r-m.y,ve=se.current;re((fe*Math.cos(X)-pe*Math.sin(X))*ve,(fe*Math.sin(X)+pe*Math.cos(X))*ve)},localTouchCancel:()=>{j.current=null},isPanMode:()=>se.current>1.3,wheelZoom:K}),[re,y,K]);const be=`${C??"—"} / ${G??"—"}`;return e.jsxs("div",{ref:de,role:"dialog","aria-modal":"true","aria-label":`Leitor de ${a}`,className:`
        pdf-reader-root
        fixed inset-0 z-[1000]
        flex flex-col
        bg-[#09090b]
        text-[var(--text)]
        overflow-hidden
        transition-[opacity,transform]
        duration-300 ease-out
        ${ze}
      `,onMouseMove:y,onClick:n=>{n.target===n.currentTarget&&y()},children:[e.jsxs("header",{"aria-hidden":!H,className:`
          relative
          z-30
          flex
          items-center
          gap-2
          px-3 sm:px-4
          py-2
          min-h-[56px]
          shrink-0
          bg-[var(--bg-2)]
          border-b
          border-[var(--border)]
          shadow-lg
          transition-[opacity,transform]
          duration-300 ease-out
          ${H?"opacity-100 translate-y-0 pointer-events-auto":"opacity-0 -translate-y-3 pointer-events-none"}
        `,children:[e.jsx("button",{type:"button",onClick:i,className:`${b} w-10 h-10 hover:text-red-400 hover:bg-red-400/10`,"aria-label":"Fechar leitor",title:"Fechar (Esc)",children:e.jsx(we,{className:"w-5 h-5"})}),!B&&c&&e.jsx("img",{src:c,alt:"",className:"w-8 h-11 object-cover rounded-md shadow-lg shrink-0",onError:n=>{n.target.style.display="none"}}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("p",{className:"text-sm font-semibold truncate",children:a}),!B&&e.jsxs("p",{className:"text-[11px] text-[var(--text-muted)] truncate",children:[l," · ",o]})]}),e.jsxs("div",{ref:ue,className:"relative hidden sm:flex items-center",children:[e.jsxs("div",{className:`
              flex
              items-center
              gap-0.5
              p-1
              rounded-xl
              bg-[var(--bg-3)]
              border
              border-[var(--border)]
              shadow-sm
            `,children:[e.jsx("button",{type:"button",onClick:L,className:`
                ${b}
                w-9 h-9
                ${Q==="fit"?Ke:""}
              `,title:"Ajustar à tela (0)","aria-label":"Ajustar à tela",children:e.jsx(Re,{className:"w-4 h-4"})}),e.jsx("button",{type:"button",onClick:S,className:`${b} w-9 h-9`,title:"Diminuir zoom (-)","aria-label":"Diminuir zoom",children:e.jsx(ge,{className:"w-4 h-4"})}),e.jsx("button",{type:"button",onClick:()=>I(n=>!n),className:`
                min-w-[64px]
                h-9
                px-2
                rounded-lg
                text-xs
                font-semibold
                text-[var(--text)]
                hover:bg-[var(--gold-glow)]
                transition-colors
              `,title:"Selecionar zoom","aria-label":`Zoom atual ${U}`,"aria-expanded":w,children:U}),e.jsx("button",{type:"button",onClick:R,className:`${b} w-9 h-9`,title:"Aumentar zoom (+)","aria-label":"Aumentar zoom",children:e.jsx(ye,{className:"w-4 h-4"})})]}),w&&e.jsxs("div",{className:`
                absolute
                top-[calc(100%+8px)]
                right-0
                z-50
                w-44
                max-h-[60vh]
                overflow-y-auto
                p-2
                rounded-2xl
                bg-[var(--bg-2)]
                border
                border-[var(--border)]
                shadow-2xl
              `,children:[e.jsx("p",{className:`
                  px-3 py-2
                  text-[10px]
                  uppercase
                  tracking-wider
                  text-[var(--text-muted)]
                `,children:"Nível de zoom"}),e.jsx("div",{className:"grid grid-cols-2 gap-1",children:F.map(n=>{const r=Math.abs(g-n)<.01;return e.jsxs("button",{type:"button",ref:r?me:void 0,onClick:()=>{ee(n),I(!1)},className:`
                        px-2
                        py-2
                        rounded-lg
                        text-xs
                        transition-colors
                        ${r?"bg-[var(--gold-glow)] text-[var(--gold)]":"text-[var(--text-sub)] hover:bg-[var(--bg-3)]"}
                      `,children:[Math.round(n*100),"%"]},n)})})]})]}),e.jsxs("div",{className:`
            hidden md:flex
            items-center
            gap-1
            px-1
            py-1
            rounded-xl
            bg-[var(--bg-3)]
            border
            border-[var(--border)]
          `,children:[e.jsx("button",{type:"button",onClick:v,disabled:!$,className:`${b} w-9 h-9`,title:"Página anterior","aria-label":"Página anterior",children:e.jsx(oe,{className:"w-5 h-5"})}),e.jsx("span",{className:`
              min-w-[80px]
              text-center
              text-xs
              font-medium
              text-[var(--text)]
            `,children:be}),e.jsx("button",{type:"button",onClick:u,disabled:!A,className:`${b} w-9 h-9`,title:"Próxima página","aria-label":"Próxima página",children:e.jsx(le,{className:"w-5 h-5"})})]}),W,e.jsx("button",{type:"button",onClick:ae,className:`${b} w-10 h-10`,title:"Rotacionar página (R)","aria-label":"Rotacionar página",children:e.jsx(Se,{className:"w-4 h-4"})}),!B&&k&&e.jsx("button",{type:"button",onClick:k,className:`${b} w-10 h-10`,title:`Baixar ${o}`,"aria-label":`Baixar ${o}`,children:e.jsx(Le,{className:"w-4 h-4"})}),e.jsx("button",{type:"button",onClick:()=>{ne()},className:`${b} w-10 h-10`,title:te?"Sair da tela cheia (F)":"Tela cheia (F)","aria-label":te?"Sair da tela cheia":"Tela cheia",children:te?e.jsx($e,{className:"w-4 h-4"}):e.jsx(Ae,{className:"w-4 h-4"})})]}),e.jsxs("main",{ref:J,className:`
          relative
          flex-1
          min-h-0
          overflow-auto
          bg-[#18181c]
          scrollbar-thin
        `,onTouchStart:Me,onTouchEnd:Te,children:[e.jsx("div",{className:`
            pointer-events-none
            fixed
            inset-0
            opacity-30
            bg-[radial-gradient(circle_at_center,rgba(255,255,255,.04),transparent_60%)]
          `}),d&&!h&&e.jsxs("div",{className:`
              absolute
              inset-0
              z-20
              flex
              flex-col
              items-center
              justify-center
              gap-4
              bg-[#18181c]
            `,children:[e.jsx("div",{className:`
                w-14 h-14
                rounded-2xl
                flex
                items-center
                justify-center
                bg-[var(--gold-glow)]
              `,children:e.jsx(De,{className:"w-7 h-7 animate-spin text-[var(--gold)]"})}),e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-sm font-medium",children:f}),e.jsx("p",{className:"mt-1 text-xs text-[var(--text-muted)]",children:N})]})]}),h&&e.jsx("div",{className:`
              absolute
              inset-0
              z-20
              flex
              items-center
              justify-center
              p-6
            `,children:e.jsxs("div",{className:`
                max-w-md
                w-full
                p-8
                rounded-3xl
                text-center
                bg-[var(--bg-2)]
                border
                border-[var(--border)]
                shadow-2xl
              `,children:[e.jsx("div",{className:`
                  mx-auto
                  mb-5
                  w-16 h-16
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                  bg-red-500/10
                `,children:e.jsx(Fe,{className:"w-8 h-8 text-red-400"})}),e.jsx("h2",{className:"text-base font-semibold",children:p}),e.jsx("p",{className:"mt-2 text-sm leading-relaxed text-[var(--text-muted)]",children:h}),e.jsxs("div",{className:"mt-6 flex flex-wrap justify-center gap-2",children:[E&&e.jsx("button",{type:"button",onClick:E.onClick,className:`
                      px-4 py-2.5
                      rounded-xl
                      text-sm
                      font-medium
                      bg-[var(--gold)]
                      text-[var(--bg)]
                      hover:brightness-110
                      transition
                    `,children:E.label}),k&&e.jsx("button",{type:"button",onClick:k,className:`
                      px-4 py-2.5
                      rounded-xl
                      text-sm
                      font-medium
                      bg-[var(--bg-3)]
                      border
                      border-[var(--border)]
                      hover:bg-[var(--bg-4)]
                      transition
                    `,children:"Baixar"}),e.jsx("button",{type:"button",onClick:i,className:`
                    px-4 py-2.5
                    rounded-xl
                    text-sm
                    font-medium
                    bg-red-500/10
                    text-red-400
                    hover:bg-red-500/20
                    transition
                  `,children:"Fechar"})]})]})}),e.jsx("div",{className:`
            relative
            z-10
            flex
            min-h-full
            px-0
            sm:px-4
            py-3
            sm:py-6
          `,style:{touchAction:g>1.25?"pan-x pan-y":"pan-y"},children:e.jsx("div",{className:"m-auto select-none",children:Y({scale:g,rotation:D})})}),P&&e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",onClick:v,disabled:!$,className:`
                hidden sm:flex
                fixed
                left-4
                top-1/2
                -translate-y-1/2
                z-20
                w-11 h-20
                items-center
                justify-center
                rounded-2xl
                bg-transparent
                text-white/35
                hover:bg-black/20
                hover:text-white/80
                disabled:opacity-0
                transition-all
              `,title:"Página anterior","aria-label":"Página anterior",children:e.jsx(oe,{className:"w-6 h-6"})}),e.jsx("button",{type:"button",onClick:u,disabled:!A,className:`
                hidden sm:flex
                fixed
                right-4
                top-1/2
                -translate-y-1/2
                z-20
                w-11 h-20
                items-center
                justify-center
                rounded-2xl
                bg-transparent
                text-white/35
                hover:bg-black/20
                hover:text-white/80
                disabled:opacity-0
                transition-all
              `,title:"Próxima página","aria-label":"Próxima página",children:e.jsx(le,{className:"w-6 h-6"})})]}),z&&_&&e.jsxs("aside",{className:`
              fixed
              left-0
              bottom-0
              z-40
              w-[300px]
              max-w-[85vw]
              bg-[var(--bg-2)]
              border-r
              border-[var(--border)]
              shadow-2xl
              overflow-y-auto
            `,style:{top:56},children:[e.jsxs("div",{className:`
                sticky
                top-0
                z-10
                flex items-center
                justify-between
                px-4 py-3
                bg-[var(--bg-2)]
                border-b
                border-[var(--border)]
              `,children:[e.jsx("h2",{className:"text-sm font-semibold text-[var(--text)]",children:O}),e.jsx("button",{type:"button",onClick:M,className:`${b} w-8 h-8`,"aria-label":`Fechar ${O??"painel"}`,children:e.jsx(we,{className:"w-4 h-4"})})]}),e.jsx("nav",{className:"p-2",children:_})]})]}),(B||Ne)&&P&&e.jsxs("footer",{"aria-hidden":!H,className:`
            relative
            z-30
            flex
            items-center
            justify-between
            gap-2
            px-3
            py-2
            min-h-[58px]
            bg-[var(--bg-2)]
            border-t
            border-[var(--border)]
            transition-[opacity,transform]
            duration-300 ease-out
            ${H?"opacity-100 translate-y-0 pointer-events-auto":"opacity-0 translate-y-3 pointer-events-none"}
          `,children:[e.jsx("button",{type:"button",onClick:v,disabled:!$,className:`
              w-11 h-11
              flex
              items-center
              justify-center
              rounded-xl
              text-[var(--text-sub)]
              hover:text-[var(--gold)]
              hover:bg-[var(--gold-glow)]
              disabled:opacity-30
            `,"aria-label":"Página anterior",children:e.jsx(oe,{className:"w-6 h-6"})}),e.jsxs("div",{className:`
              flex
              items-center
              gap-1
              px-1
              py-1
              rounded-xl
              bg-[var(--bg-3)]
            `,children:[e.jsx("button",{type:"button",onClick:S,className:`
                w-9 h-9
                flex
                items-center
                justify-center
                rounded-lg
                hover:bg-[var(--gold-glow)]
                hover:text-[var(--gold)]
              `,"aria-label":"Diminuir zoom",children:e.jsx(ge,{className:"w-4 h-4"})}),e.jsx("button",{type:"button",onClick:L,className:"min-w-[55px] text-xs font-semibold",title:"Ajustar à tela","aria-label":`Zoom atual ${U}. Toque para ajustar à tela`,children:U}),e.jsx("button",{type:"button",onClick:R,className:`
                w-9 h-9
                flex
                items-center
                justify-center
                rounded-lg
                hover:bg-[var(--gold-glow)]
                hover:text-[var(--gold)]
              `,"aria-label":"Aumentar zoom",children:e.jsx(ye,{className:"w-4 h-4"})})]}),e.jsx("span",{className:`
              absolute
              left-1/2
              -translate-x-1/2
              bottom-[-1px]
              px-2
              py-0.5
              rounded-t-lg
              bg-[var(--bg-3)]
              text-[9px]
              text-[var(--text-muted)]
            `,children:be}),e.jsx("button",{type:"button",onClick:u,disabled:!A,className:`
              w-11 h-11
              flex
              items-center
              justify-center
              rounded-xl
              text-[var(--text-sub)]
              hover:text-[var(--gold)]
              hover:bg-[var(--gold-glow)]
              disabled:opacity-30
            `,"aria-label":"Próxima página",children:e.jsx(le,{className:"w-6 h-6"})})]}),ke&&P&&e.jsxs("div",{className:`
            pointer-events-none
            fixed
            bottom-4
            left-1/2
            -translate-x-1/2
            z-20
            px-4
            py-2
            rounded-full
            bg-black/50
            backdrop-blur-md
            border
            border-white/10
            text-[10px]
            text-white/60
            opacity-0
            hover:opacity-100
            transition-opacity
          `,children:["← → páginas · + − zoom · 0 ajustar · R girar · F tela cheia",T?" · T sumário":""," · Ctrl + roda zoom"]})]})}function Je({width:s,height:a,scale:l,rotation:o,children:c}){const i=o%180!==0;return e.jsx("div",{className:"relative shrink-0",style:{width:(i?a:s)*l,height:(i?s:a)*l},children:e.jsx("div",{className:"absolute",style:{left:"50%",top:"50%",width:s,height:a,transform:`translate(-50%, -50%) rotate(${o}deg) scale(${l})`,transformOrigin:"center center"},children:c})})}export{We as P,Ye as R,Je as S,Ge as a,Ue as b,He as c,qe as t};
