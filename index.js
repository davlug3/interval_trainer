  window.addEventListener('load', async function () {
    
  const synth = new WebAudioTinySynth({quality:0, useReverb:0});
  synth.setTsMode(0)
  const audioContext = synth.getAudioContext()
  const LS_KEY = "intervals"

  const _fetch1 = await fetch("./notes.json")
  const _fetch2 = await fetch("./intervals.json")
  const notes = await _fetch1.json()
  const intervals = await _fetch2.json()
  
  let interval = 3000
  const noteDuration = 3000
  const ch = 1

  let interval_obj = undefined
  const btn_play = document.getElementById("play")
  const sel_interval = document.getElementById("interval")
  const el_note_name = document.getElementById("note_name")
  const sel_timbre1 = document.getElementById("timbre1")
  const sel_timbre2 = document.getElementById("timbre2")
  const vel_timbre1 = document.getElementById("vel_timbre1")
  const vel_timbre2 = document.getElementById("vel_timbre2")


  intervals.forEach((element, index) => {
    const el_option = document.createElement("option")
    el_option.setAttribute("value", index)
    el_option.innerHTML = element
    sel_interval.appendChild(el_option)
  });

  timbres.forEach((element, index) => {
    const el_option = document.createElement("option")
    el_option.setAttribute("value", index)
    el_option.innerHTML = element.name
    const el_option2 = el_option.cloneNode(true)
    sel_timbre1.appendChild(el_option)
    sel_timbre2.appendChild(el_option2)
  })

  btn_play.innerHTML = "Play"



  btn_play.addEventListener("click", (x, y)  => {
    interval = parseFloat(document.getElementById("item_interval").value)*1000 ?? interval


    if (interval) {
      if (interval_obj){
          clearInterval(interval_obj)
          interval_obj = undefined
          btn_play.innerHTML = "Play" 
      }
      else{
          play(interval)
          btn_play.innerHTML = "Stop"
        }
    }
  })


  const el_keep = document.querySelectorAll("[data-keep]") 
  let from_localStorage = JSON.parse(localStorage.getItem(LS_KEY) ?? "{}")
  

  el_keep.forEach(x=>{
    x.addEventListener("change", function (event) {
      from_localStorage = JSON.parse(localStorage.getItem(LS_KEY) ?? "{}")
      const id = event.target.getAttribute('id')
      const val = event.target.value
      const checked = event.target.checked

      const setObj = {...from_localStorage}

      if (id=='panned') 
      setObj[id] = checked
      else
      setObj[id] = val

      localStorage.setItem(LS_KEY, JSON.stringify(setObj))
    })

    const temp = from_localStorage[x.getAttribute('id')]

    if (temp) {
      if (x.getAttribute("id")=='panned') x.checked = temp
      else  x.value = temp
    }
  })
  document.querySelector(".wrapper").style.display = 'flex'


  
  const play= (interval)  => {
      audioContext.resume()


      function interval_callback () {
          const random = Math.ceil(randn_bm_minmax(0,1,1) * notes.length)
          const musical_interval = parseInt(sel_interval.value)
          const panned = document.getElementById("panned").checked
          const note_interval = parseFloat(document.getElementById("note_interval").value) * 1000 ?? 0
          const is_asc = document.getElementById("asc").checked
          const is_desc = document.getElementById("desc").checked



          const panL = 0
          const panR = 254

          synth.setPan(ch,panned? panL : 64)
          synth.setPan(ch+1,panned ? panR : 64)
          synth.setProgram(ch, sel_timbre1.value)
          synth.setProgram(ch+1, sel_timbre2.value)

          synth.setTimbre(0, sel_timbre1.value, program0[sel_timbre1.value])
          synth.setTimbre(0, sel_timbre2.value, program1[sel_timbre2.value])

          let i = random-musical_interval

          if (is_asc) i = random-musical_interval
          if (is_desc) i = random+musical_interval

          const note1 = notes[random]
          const note2 = notes[i]




          synth.noteOn(ch, note1.midi, vel_timbre1.value , 0)
          setTimeout(function () {
            synth.noteOn(ch+1, note2.midi, vel_timbre2.value, 0)
          }, note_interval)

          setTimeout(()=> {
              synth.noteOff(ch, note1.midi)
              synth.noteOff(ch, note2.midi)
          }, noteDuration)

          el_note_name.innerHTML =`${note1.sharp} and ${note2.sharp}`

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