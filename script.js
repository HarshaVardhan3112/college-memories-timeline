// Function to fetch and display events
// Function to fetch and display events
const fetchEvents = async () => {
  try {
    const response = await fetch('https://college-memories-timeline.onrender.com/api/timeline');
    const events = await response.json();

    const eventsContainer = document.getElementById('eventsContainer');
    eventsContainer.innerHTML = ''; // Clear any existing events

    // Sort events by date to ensure proper timeline order
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Create event rows
    const eventsPerRow = 4; // Define how many events per row
    let rows = [];
    for (let i = 0; i < events.length; i += eventsPerRow) {
      rows.push(events.slice(i, i + eventsPerRow));
    }

    // Loop through the rows and append events to each row
    rows.forEach((row, rowIndex) => {
      const rowElement = document.createElement('div');
      rowElement.classList.add('event-row');

      // Add alternating direction classes
      if (rowIndex % 2 === 0) {
        rowElement.classList.add('left-to-right');
      } else {
        rowElement.classList.add('right-to-left');
      }

      // Create each event element in the row
      row.forEach((event, index) => {
        const eventWrapper = document.createElement('div');
        eventWrapper.classList.add('event-wrapper');

        const eventElement = document.createElement('div');
        eventElement.classList.add('event');
        eventElement.innerHTML = `
          <div>
            <strong>${event.eventName}</strong><br>
            Date: ${new Date(event.date).toLocaleDateString()}
          </div>
        `;

        // Add the delete button with the correct event ID
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-btn');
        deleteButton.innerHTML = '❌'; // Using a red cross icon for the delete button
        deleteButton.onclick = () => deleteEvent(event._id); // Call the deleteEvent function with the event's ID

        eventElement.appendChild(deleteButton);
        eventWrapper.appendChild(eventElement);

        // Add a connector line if it's not the last event in the row
        if (index < row.length - 1) {
          const connector = document.createElement('div');
          connector.classList.add('connector');
          eventWrapper.appendChild(connector);
        }

        rowElement.appendChild(eventWrapper);
      });

      // Append the row to the container
      eventsContainer.appendChild(rowElement);

      // If it's not the last row, create a connector between the current row and the next row
      if (rowIndex > 0) {
        // Even rows have connectors at the start
        if (rowIndex % 2 === 0) {
          rowElement.lastChild.classList.add('c-connector-start');
        }
        // Odd rows have connectors at the end
        else {
          rowElement.firstChild.classList.add('c-connector-end');
        }
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
  }
};


// Function to add a new event
const addEvent = async (event) => {
  event.preventDefault();

  const eventName = document.getElementById('eventTitle').value;
  const eventDate = document.getElementById('eventDate').value;

  try {
    const response = await fetch('https://college-memories-timeline.onrender.com/api/timeline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName,  // Correct field name
        date: eventDate,  // Correct field name
      }),
    });
    const newEvent = await response.json();
    console.log('Event added:', newEvent);
    fetchEvents(); // Re-fetch and display events after adding

    // Clear the event name field after submission
    document.getElementById('eventTitle').value = '';

  } catch (error) {
    console.error('Error adding event:', error);
  }
};

// Function to delete an event
const deleteEvent = async (eventId) => {
  try {
    const response = await fetch(`https://college-memories-timeline.onrender.com/api/timeline/${eventId}`, {
      method: 'DELETE',
    });
    const deletedEvent = await response.json();
    console.log('Event deleted:', deletedEvent);
    fetchEvents(); // Re-fetch and display events after deletion
  } catch (error) {
    console.error('Error deleting event:', error);
  }
};

// Add event listener to the form
document.getElementById('addEventButton').addEventListener('click', addEvent);

// Call fetchEvents to display events when the page loads
window.onload = fetchEvents;

// Function to handle the "Enter" key behavior to move focus to the next field or submit form
const handleEnterPress = (event) => {
  if (event.key === 'Enter') {
    const currentInput = event.target;
    const nextInput = currentInput.nextElementSibling;

    // Move focus to next input if it's the right type (input)
    if (nextInput && nextInput.tagName === 'INPUT') {
      nextInput.focus();
    }

    // If both fields are filled and Enter is pressed, trigger the submit button
    if (document.getElementById('eventTitle').value && document.getElementById('eventDate').value) {
      document.getElementById('addEventButton').click();
    }
  }
};

// Add event listeners to the input fields for Enter key behavior
document.getElementById('eventTitle').addEventListener('keydown', handleEnterPress);
document.getElementById('eventDate').addEventListener('keydown', handleEnterPress);
