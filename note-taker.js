document.addEventListener('DOMContentLoaded', function() {
  var noteTitleInput = document.getElementById('note-title');
  var noteTextArea = document.getElementById('note-text');
  var saveNoteButton = document.getElementById('save-note');
  var noteList = document.getElementById('note-list');

  // Load saved notes from Chrome storage
  loadNotes();

  saveNoteButton.addEventListener('click', function() {
    var title = noteTitleInput.value.trim();
    var text = noteTextArea.value.trim();
    if (title && text) {
      var note = { title, text, timestamp: new Date().getTime() }; // Add timestamp for sorting
      saveOrUpdateNote(note); // Save or update note
      noteTitleInput.value = '';
      noteTextArea.value = '';
    }
  });

  noteList.addEventListener('click', function(event) {
    if (event.target.tagName.toLowerCase() === 'li') {
      var note = JSON.parse(event.target.dataset.note);
      noteTitleInput.value = note.title;
      noteTextArea.value = note.text;
      saveNoteButton.dataset.noteIndex = event.target.dataset.index; // Store index for update
    } else if (event.target.tagName.toLowerCase() === 'button') {
      var noteIndex = Array.from(noteList.children).indexOf(event.target.parentElement);
      deleteNote(noteIndex);
    }
  });

  function saveOrUpdateNote(note) {
    chrome.storage.sync.get('notes', function(data) {
      var notes = data.notes || [];

      if (saveNoteButton.dataset.noteIndex) {
        // Update existing note
        var index = parseInt(saveNoteButton.dataset.noteIndex);
        notes[index].title = note.title;
        notes[index].text = note.text;
        notes[index].timestamp = note.timestamp;
      } else {
        // Save new note
        notes.push(note);
      }

      // Sort notes by timestamp in descending order
      notes.sort((a, b) => b.timestamp - a.timestamp);

      chrome.storage.sync.set({ 'notes': notes }, function() {
        console.log('Note saved/updated!');
        displayNotes(notes); // Display sorted notes
        delete saveNoteButton.dataset.noteIndex; // Clear stored index
      });
    });
  }

  function deleteNote(index) {
    chrome.storage.sync.get('notes', function(data) {
      var notes = data.notes || [];
      notes.splice(index, 1);
      chrome.storage.sync.set({ 'notes': notes }, function() {
        console.log('Note deleted!');
        displayNotes(notes); // Display updated notes after deletion
      });
    });
  }

  function loadNotes() {
    chrome.storage.sync.get('notes', function(data) {
      var notes = data.notes || [];
      displayNotes(notes); // Display notes on load
    });
  }

  function displayNotes(notes) {
    noteList.innerHTML = ''; // Clear existing list

    notes.forEach(function(note, index) {
      var li = document.createElement('li');
      li.textContent = note.title;
      li.dataset.note = JSON.stringify(note);
      li.dataset.index = index; // Store index for update

      var deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      li.appendChild(deleteButton);

      noteList.appendChild(li); // Append li to noteList
    });
  }
});
