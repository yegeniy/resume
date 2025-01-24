<script>                                                                        // `make` copies this into index.html
document.addEventListener("DOMContentLoaded", () => {                           // Entry point waits for DOM load.
  const aboveTheFold = ((hr = document.querySelector('hr')) =>                  // An IIFE that returns a helper to
    node => !hr || (                                                            // check that a given node precedes
      node.compareDocumentPosition(hr) & Node.DOCUMENT_POSITION_FOLLOWING))();  // the first <hr>, if any.
  const walker = document.createTreeWalker(                                     // Walks DOM for words above the fold:
    document.body,                                                              // starting at document body,
    NodeFilter.SHOW_TEXT,                                                       // only looking at text nodes that are
    node => node.textContent.trim() && aboveTheFold(node) ?                     // non-empty & above the fold, rejecting
      NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT                       // if they are empty/whitespace/too low.
  );                                                                            //
                                                                                //
  const textNodes = [];                                                         // Store found text nodes list,
  while (walker.nextNode()) textNodes.push(walker.currentNode);                 // collecting the via the walker above.
                                                                                //
  textNodes.forEach(node => {                                                   // Process each text node
    const words = node.textContent.match(/\S+|\s+/g) || [];                     // splitting into words/spaces,
    const frag = document.createDocumentFragment();                             // creating fragment for efficiency.
                                                                                //
    words.forEach(word => {                                                     // Process each word.
      if (/\s+/.test(word)) {                                                   // If whitespace,
        frag.appendChild(document.createTextNode(word));                        // keep as plain text.
      } else {                                                                  // If word,
        const sp = document.createElement("span");                              // create span wrapper with
        sp.textContent = word;                                                  // word as the content,
        sp.dataset.rgb = "255,255,255";                                         // custom "white" RGB data (important!),
        sp.style.cssText = "color:black;text-shadow:0 0 25px rgb(255,255,255)"; // and black text over a white shadow;
        frag.appendChild(sp);                                                   // save this span into the fragment.
      }                                                                         //
    });                                                                         //
    node.replaceWith(frag);                                                     // Replace original text with fragment.
  });                                                                           // Now all text is in a span.
  const spans = [...document.querySelectorAll("span")];                         // Spreads out all the created spans.
  const nudge = (rgb, by) => {                                                  // Nudge shifts the shadow of the R,G,B
    const channel = Math.random() * 3 | 0;                                      // picking a random color channel
    const shift = by[Math.random() * 3 | 0];                                    //              and shift amount,
    rgb[channel] = Math.min(Math.max(rgb[channel] + shift, 0), 255);            // but constrained to valid values only
    return rgb;                                                                 // returning the [R,G,B] array.
  };                                                                            // Next we set up 3 animation "phases".
  let frame = null;                                                             // Shared reference, to stop a phase.
  const twinkle = (shift_shade, shift_background) => {                          // This shifts shadow/background colors.
    if (frame) cancelAnimationFrame(frame);                                     // First it stops any running phase.
    function loop() {                                                           // Then it starts a self-repeating loop:
      frame = requestAnimationFrame(loop);                                      // by queuing itself as the next frame.
      const rgbs = spans.map(span =>                                            // First, Read: gather all RGB values
        span.dataset.rgb.split(",").map(Number));                               // from each span's dataset
      const bg = document.body.style.background.match(/\d+/g)?.map(Number)      // and get current background RGB
        || [255,255,255];                                                       // defaulting to white if none.
      spans.forEach((span, i) => {                                              // Then, Write: for each span
        const nudged = nudge(rgbs[i], shift_shade);                             // calculate its new shadow color
        span.dataset.rgb = nudged.join();                                       // save it to dataset and
        span.style.textShadow = `0 0 25px rgb(${nudged})`;                      // apply that rgb value to shadow.
      });                                                                       // Rs before Ws avoids layout thrashing!
      document.body.style.background = `rgb(${                                  // Finally, update the background by
        nudge(bg, shift_background).map(v => Math.max(190, v))})`;              // nudging it, but not so it's too dark.
    };                                                                          // The animation loop is now declared,
    frame = requestAnimationFrame(loop);                                        // so we can start running it.
  };                                                                            //
  const phase = (start, until, animate) => {                                    // Defines a phase of the sequence,
    setTimeout(() => animate(), start);                                         // by starting the animation, and then
    setTimeout(() => cancelAnimationFrame(frame), until);                       // using the shared frame to stop it.
  };                                                                            //
  setInterval(function again_again() {                                          // sequence that starts immediately:
    phase(15*1000,   45*1000, () => twinkle([-25,0,25], [-1,1]));               // 1) @ 00s after 15s, twinkle for 30s.
    phase(45*1000,   60*1000, () => twinkle(   [2,2,2],  [1,1]));               // 2) @ 45s for 15s fades back to white.
    phase(60*1000,  105*1000, () => twinkle(   [0,0,0],  [0,0]));               // 3) @ 60s for 45s stays put as white.
    return again_again;                                                         // and then restarts itself
  }(), 105*1000);                                                               // so that it loops every 1:45 seconds.
});                                                                             //
</script>
