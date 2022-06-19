import type { Component } from 'solid-js';
import { createSignal, createEffect, For, onMount } from 'solid-js';
import * as Tone from 'tone';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { IndexeddbPersistence } from 'y-indexeddb';
import { WebsocketProvider } from 'y-websocket';

const scale = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];

const majorScales = {
  "C": ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"],
  "C#": ["C#4", "D#4", "E#4", "F#4", "G#4", "A#4", "B#4", "C#5"],
  "Db": ["Db4", "Eb4", "F4", "Gb4", "Ab4", "Bb4", "C5"],
  "D": ["D4", "E4", "F#4", "G4", "A4", "B4", "C5", "D5"],
  "D#": ["D#4", "E#4", "F##4", "G#4", "A#4", "B#4", "C#5", "D#5"],
  "Eb": ["Eb4", "F4", "G4", "Ab4", "Bb4", "C5", "D5"],
  "E": ["E4", "F#4", "G#4", "A4", "B4", "C#5", "D5", "E5"],
  "F": ["F4", "G4", "A4", "B4", "C5", "D5", "E5", "F5"],
  "F#": ["F#4", "G#4", "A#4", "B4", "C#5", "D#5", "E#5", "F#5"],
  "Gb": ["Gb4", "Ab4", "Bb4", "C5", "Db5", "Eb5", "F5"],
  "G": ["G4", "A4", "B4", "C5", "D5", "E5", "F#5", "G5"],
  "G#": ["G#4", "A#4", "B#4", "C#5", "D#5", "E#5", "F##5", "G#5"],
  "Ab": ["Ab4", "Bb4", "C5", "Db5", "Eb5", "F5", "G5"],
  "A": ["A4", "B4", "C#5", "D5", "E5", "F#5", "G#5", "A5"],
  "A#": ["A#4", "B#4", "C##5", "D#5", "E#5", "F##5", "G##5", "A#5"],
  "Bb": ["Bb4", "C5", "D5", "Eb5", "F5", "G5", "A5"],
  "B": ["B4", "C#5", "D#5", "E5", "F#5", "G#5", "A#5", "B5"],
}


// const NoteButton: Component<{ note: string; beat: number; onClick: (note: string, beat: number) => void}> = (props) => {
//   const [foo, setFoo] = createSignal();

  
  
//   return <button class="border-gray-500 border h-8" classList={{ "bg-pink-500": !!ybeats.get(props.beat)?.has(props.note)}} onClick={props.onClick}></button>
// }

const GridBoard: Component<{ydoc: any; synth: any; numBeats: number; currentBeat: number; scale: Array; track: any}> = (props) => {
  // console.log("The track",props.track);
  const [beats, setBeats] = createSignal([...Array(props.numBeats).keys()]);
  const ybeats = props.track.get('beats')
  const beatsTemplate = [...Array(props.numBeats).keys()]

  ybeats.observeDeep(() => {
    console.log("new ybeat")
  })

  function handleNoteClick(note: string, iBeat: number) {
    // console.log("====>",note, iBeat, ybeats)
    props.ydoc.transact(() => {
      const currBeat = ybeats.get(iBeat)
      // console.log("Curr beat ===> ", currBeat.toJSON())
      if (currBeat.has(note)) {
        currBeat.delete(note);
      } else {
        currBeat.set(note, true)
      }
    })
  }
  
  return (
    <>
      <div class="grid ml-16 border border-gray-500" style={{"grid-template-columns": "repeat(32, 32px)"}}>
        <For each={beatsTemplate}>
          {beat => 
            <button 
              class="h-8 w-8 text-sm grid place-content-center border border-gray-500" 
              classList={{
                "bg-pink-200": beat === props.currentBeat
              }}>
            {beat + 1}
          </button>}
        </For>
      </div>
      <div class="grid select-none border border-gray-500" style={{"grid-template-columns": "64px repeat(32, 32px)"}}>
        <For each={scale.reverse()}>
          {note => <>
            <button class="border border-gray-500 text-sm min-h-full" onClick={() => {
                synth.triggerAttackRelease(note, "8n");
              }}>{note}</button>
            
            <Index each={beatsTemplate}>
              {(iBeat) => {
                const [isActive, setIsActive] = createSignal(false);
                const currBeat = ybeats.get(iBeat())
                currBeat.observe(() => {
                  if (currBeat.has(note)) {
                    setIsActive(true)
                  } else {
                    setIsActive(false)
                  }
                })
                return <button class="border-gray-500 border h-8"  classList={{ "bg-pink-500": isActive(), "bg-pink-200": iBeat() % 4 === 0 && !isActive()}} onClick={() => handleNoteClick(note, iBeat())}></button>
              }}
            </Index>
          </>}
        </For>
      </div>
    </>
  );
}

// <GridBoard instrument="synth" scale="Db"  />

const App: Component = () => {
  const synth = new Tone.PolySynth().toDestination();
  const compositionId = "composition-1";
  const ydoc = new Y.Doc();
  // const indexeddbProvider = new IndexeddbPersistence(compositionId, ydoc);
  // const wsProvider = new WebsocketProvider(
  //   'wss://repliano.lawrencecchen.repl.co/ws',
  //   compositionId,
  //   ydoc
  // )
  const webrtcProvider = new WebrtcProvider(compositionId, ydoc);
  const ymetadata = ydoc.getMap(compositionId);
  const ybeats = ydoc.getArray("notes")
  const ytracks = ydoc.getArray("tracks")

  console.log("ytracks:", ytracks.toJSON())

  function createTrack(name: string, instrument: string, numBeats: number) {
    const track = new Y.Map();
    track.set('name', name);
    track.set('instrument', instrument);
    const beats = new Y.Array()
    track.set('beats', beats)
    const newBeats = []
    for (let i = 0; i < numBeats; ++i) {
      newBeats.push(new Y.Map());
      // beats.insert(i, new Y.Map())
    }
    beats.insert(0, newBeats)
    // console.log
    return track;
  }

  // Resets to a single track
  function resetTracks(numBeats: number) {
    ydoc.transact(() => {
      console.log("Resetting tracks...")
      ytracks.delete(0, ytracks.length);
      ytracks.insert(0, [createTrack('track1', 'synth', 32), createTrack('track2', 'synth', 32)]);
    })
  }

  // Resets the beats in a single track
  function reset() {
    ydoc.transact(() => {
      ybeats.delete(0, ybeats.length);
      const newBeats = [];
      for (let i = 0; i < 32; ++i) {
        const ybeat = new Y.Map();
        ybeat.set("notes", new Y.Map());
        newBeats.push(ybeat);
      }
      ybeats.insert(0, newBeats);
    })
    console.log('RESETTED')
  }
  
  ymetadata.observe(() => {
    if (!ymetadata.has("tempo")) {
      ymetadata.set("tempo", 120);
    }
    const json = ymetadata.toJSON();
    setTempo(Number(json.tempo))
  });

  ytracks.observe(() => {
    if (ytracks.length < 1) {
      console.log('RESET TRACKS');
      resetTracks();
    }
    setTracks(ytracks)
  })

  function handleTempoChange(e) {
    ymetadata.set("tempo", e.target.value);
  }

  // ybeats.observeDeep(() => {
  //   if (ybeats.length != 32) {
  //     console.log("LENGHKDLASFJ", ybeats)
  //     reset();
  //   }
  //   setBeats(ybeats.toJSON());
  // })
  
  const [tempo, setTempo] = createSignal(120)
  const ms = () =>  60000 / tempo();
  const numBeats = 32;
  const [currentBeat, setCurrentBeat] = createSignal(0);
  
  const [playing, setPlaying] = createSignal(false);
  const [tracks, setTracks] = createSignal()

  let interval;
  createEffect(() => {
    clearInterval(interval);
    if (playing()) {
      interval = setInterval(() => {
        const currBeat = beats()?.[currentBeat()];
        const notes = Object.keys(currBeat.notes);
        synth.triggerAttackRelease(notes, "16n");
        setCurrentBeat(beat => (beat + 1) % numBeats)
      }, ms() / 4);
    }
  })

 
  
  return (
    <div>
      <h1>Repliano</h1>
      <input onInput={handleTempoChange} value={tempo()} type="range" min="1" max="244" /> {tempo()}

      <div class="flex justify-center mb-2 space-x-2">
        <Show when={playing()} fallback={<button class="px-4 py-2 text-white bg-green-500 
          rounded-lg text-lg font-semibold" onClick={() => setPlaying(true)}>Play</button>}>
          <button class="px-4 py-2 text-white bg-gray-500 
          rounded-lg text-lg font-semibold" onClick={() => setPlaying(false)}>Pause</button>
        </Show>
        
        <button class="px-4 py-2 text-white bg-red-500 rounded-lg text-lg font-semibold" onClick={resetTracks}>Reset Tracks</button>
      </div>

      <h1>Melody</h1>
      <Show when={tracks()?.length}>
        <For each={tracks().toJSON()}>
          {(track, iTrack) => 
            <GridBoard 
              ydoc={ydoc}
              synth={synth}
              numBeats={numBeats} 
              currentBeat={currentBeat()} 
              scale={scale} 
              track={tracks().get(iTrack)} />
          }
        </For>
      </Show>
    </div>
  );
};

export default App;
