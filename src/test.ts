{
  id: 1,
  tempo: 123,
  ybeats: [
    {
      notes: [
        {
          note: 'C4',
          instrument: 'synth',
        },
        {
          note: 'C4',
          instrument: 'piano',
        }
      ]
    },
    {
      notes: {
        'G5': 'synth',
        'E4': 'synth'
      }
    },
    {
      notes: ['G5']
    }
  ]
}
// ==============================
// <GridBoards onNoteClick={...} track={track1} />
// <GridBoards onNoteClick={...} track={track2} />

  
const ydoc = {
  id: 1,
  tempo: 123,
  tracks: [
    {
      name: "track1",
      instrument: 'synth'
      ybeats: [
        {
          "C4": true,
          "G4": true,
        },
      ]
    }
  ]
}

singleBeat =  {
    'piano': Set('C4', 'G5'),
    'synth': Set(),
    'drums': Set('C5')
  }

// YJS -> tonejs parsable music...
function playBeat(tracks, iBeat) {
  const currBeatNotes = {}
  for (let i = 0; i < tracks.length; i++){
    const currTrack = tracks[i];
    const currInstrument = currTrack['instrument']
    let currInstrumentNotes = currBeatNotes[currInstrument];
    if (!currInstrumentNotes) {
      currBeatNotes[currInstrument] = new Set()
      currInstrumentNotes = currBeatNotes[currInstrument]
    }
    for (let note of currTrack['ybeats']) { 
      currInstrumentNotes.add(note)
    }
  }
  tonejs.play(notes)
}

function playAll():
  for iBeat in numBeats:
    playBeat(tracks, iBeat)
