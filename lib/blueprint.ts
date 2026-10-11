/* Blueprint intro gate (see components/home/Blueprint.tsx).

   Inlined in <head> so the homepage is held back before first paint. Only a
   full load of "/" can start it: client-side navigation back home never does.
   Plays on the first visit of a session and on every reload.
     ?bp        always play
     ?bp=0      never play
     ?bp=still  play, then hold on the finished sheet (click to continue)
   Reduced motion skips it. If the component never mounts, a failsafe lets
   the page show after 5s. */

export const BLUEPRINT_SEEN_KEY = "bp-seen";

export const blueprintBootScript = `(function(){var d=document.documentElement,q=location.search;if(location.pathname!=="/"||/[?&]bp=0(&|$)/.test(q))return;var seen=false,reload=false;try{seen=!!sessionStorage.getItem("${BLUEPRINT_SEEN_KEY}")}catch(e){}try{var n=performance.getEntriesByType("navigation")[0];reload=!!n&&n.type==="reload"}catch(e){}var force=/[?&]bp(=|&|$)/.test(q),calm=matchMedia("(prefers-reduced-motion: reduce)").matches;if(force||(!calm&&(!seen||reload))){d.classList.add("bp-run");window.__bpFailsafe=setTimeout(function(){d.classList.remove("bp-run")},5000)}})()`;
