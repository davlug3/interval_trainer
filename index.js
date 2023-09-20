window.addEventListener('load', async function () {
    
  const synth = new WebAudioTinySynth({quality:0, useReverb:0});
  const audioContext = synth.getAudioContext()


  const _fetch = await fetch("/notes.json")
  const notes = await _fetch.json()
  
  const interval = 3000
  const noteDuration = 3000
  const ch = 1

  let interval_obj = undefined


  console.log("notes: ", notes);

  const btn_play = document.getElementById("play")
  btn_play.addEventListener("click", (x, y)  => {
      if (interval_obj){
          console.log("clearing interval: ", interval_obj);
          clearInterval(interval_obj)
          interval_obj = undefined
          console.log("cleared");
      }
      else
          play(interval)
  })


  
  const play= (interval)  => {
      audioContext.resume()


      function interval_callback () {
          const random = Math.ceil(randn_bm_minmax(0,1,1) * notes.length)
          const musical_interval = parseInt(document.getElementById("interval").value)
          const el_note_name = document.getElementById("note_name")

          console.log("random: ", random);


          const note1 = notes[random]
          const note2 = notes[random-musical_interval]




          synth.noteOn(ch, note1.midi, 127, 0)
          synth.noteOn(ch, note2.midi, 127, 0)

          setTimeout(()=> {
              synth.noteOff(ch, note1.midi)
              synth.noteOff(ch, note2.midi)
          }, noteDuration)

          el_note_name.innerHTML =`<pre>${note1.sharp} and ${note2.sharp}</pre>`

      }

      interval_callback()

      interval_obj = setInterval (interval_callback, interval)
  }
  


}, false);




//from stackoverflow
function randn_bm() {
  let u = 0, v = 0;
  while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while(v === 0) v = Math.random();
  let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) return randn_bm() // resample between 0 and 1
  return num
}


function randn_bm_minmax(min, max, skew) {
  let u = 0, v = 0;
  while(u === 0) u = Math.random() //Converting [0,1) to (0,1)
  while(v === 0) v = Math.random()
  let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v )
  
  num = num / 10.0 + 0.5 // Translate to 0 -> 1
  if (num > 1 || num < 0) 
    num = randn_bm(min, max, skew) // resample between 0 and 1 if out of range
  
  else{
    num = Math.pow(num, skew) // Skew
    num *= max - min // Stretch to fill range
    num += min // offset to min
  }
  return num
}