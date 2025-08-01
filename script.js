/**
 * PRELOADER INITIALIZATION
 * Handles the loading screen animation and progress bar functionality
 * This section manages the transition from loading screen to main content
 */
document.addEventListener('DOMContentLoaded', function () {
  // DOM element selectors for preloader components
  const progressBar = document.querySelector('.preloader .progress');
  const preloader = document.querySelector('.preloader');
  const mainContent = document.querySelector('.main-content');
  const classImage = document.querySelector('.preloader .class-image');

  // Get the animation duration from your CSS
  // Your expand animation is 2.5s as defined in your CSS
  const animationDuration = 3000; // 3 seconds in milliseconds

  /**
   * Updates the progress bar visual appearance
   * @param {number} currentProgress - Current progress value (0-100)
   * @returns {number} - Clamped progress value
   */
  function updateProgress(currentProgress) {
    let progress = Math.min(currentProgress, 100); // Ensure progress doesn't exceed 100%

    // Update progress bar width only
    progressBar.style.width = progress + '%';

    // Add pulse effect when near completion to indicate final loading phase
    if (progress > 90) {
      progressBar.classList.add('pulse-animation');
    }

    return progress;
  }

  // Calculate how often to update to match animation duration
  const totalSteps = 100; // For 0% to 100%
  const intervalTime = animationDuration / totalSteps;

  let currentProgress = 0;

  // Start the progress bar animation with incremental updates
  const interval = setInterval(() => {
    currentProgress += 1;
    const progress = updateProgress(currentProgress);

    // When progress reaches 100%, complete the loading
    if (progress >= 100) {
      clearInterval(interval);
      completeLoading();
    }
  }, intervalTime);

  /**
   * Completes the loading process and initiates transition to main content
   */
  function completeLoading() {
    // Automatically transition to main content after a short delay
    setTimeout(() => {
      fadeOutPreloader();
    }, 1300); // 1300ms delay to allow user to see completion
  }

  /**
   * Fades out the preloader and shows the main content
   */
  function fadeOutPreloader() {
    preloader.style.opacity = '0';
    mainContent.style.display = 'block';

    // Remove preloader from DOM after fade out
    setTimeout(() => {
      preloader.style.display = 'none';

      // Initialize placeholder effects after preloader
      if (typeof enhanceForm === 'function') {
        enhanceForm(); // Ensure this function initializes your floating placeholders
      }
    }, 500);
  }

  // Alternative approach - sync with animation events
  // This is a backup in case the timing approach doesn't work perfectly
  classImage.addEventListener('animationend', function () {
    // When image animation ends, ensure progress bar is at 100%
    progressBar.style.width = '100%';

    // Add small delay to ensure progress bar is visible at 100%
    setTimeout(() => {
      completeLoading();
    }, 200);
  });

  // Function to complete loading (duplicate declaration removed in implementation)
  function completeLoading() {
    setTimeout(() => {
      fadeOutPreloader();
    }, 1300);
  }

  /**
   * Preloads the class image before starting animations
   * @param {Function} callback - Function to call after image is loaded
   */
  function preloadImage(callback) {
    const img = new Image();
    // Support for both <img> src and background-image CSS property
    img.src = classImage.src || window.getComputedStyle(classImage).backgroundImage.slice(5, -2);

    img.onload = function () {
      classImage.style.backgroundImage = `url(${img.src})`; // Ensure image is displayed
      classImage.style.opacity = '1'; // Make sure it's visible
      callback(); // Start animation after image is loaded
    };
  }

  // Start only after image is fully loaded
  preloadImage(startProgressBar);

});

/**
 * GLOBAL APPLICATION STATE
 * These variables store the current state of the timeline application
 */

// Global variables
let allEvents = []; // Array to store all events fetched from the server
let filteredEvents = []; // Array to store currently filtered/displayed events
let currentView = 'all'; // Current filter view: 'all', 'year', 'month'
let currentYear = new Date().getFullYear(); // Currently selected year for filtering
let currentMonth = new Date().getMonth(); // Currently selected month for filtering

/**
 * EVENT DATA MANAGEMENT
 * Functions to fetch, filter, and display timeline events
 */

/**
 * Fetches all events from the server and initializes the display
 */
const fetchEvents = async () => {
  try {
    const response = await fetch('https://college-memories-timeline.onrender.com/api/timeline');
    allEvents = await response.json();

    // Initial filter setup - apply current filter settings
    filterEvents();

  } catch (error) {
    console.error('Error fetching events:', error);
    showNotification('Error loading events. Please try again.', 'error');
  }
};

/**
 * Filters events based on the current view settings (all, year, or month)
 * Updates the filteredEvents array and triggers display update
 */
const filterEvents = () => {
  switch (currentView) {
    case 'year':
      // Filter events to show only those from the current selected year
      filteredEvents = allEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getFullYear() === currentYear;
      });
      break;
    case 'month':
      // Filter events to show only those from the current selected month and year
      filteredEvents = allEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getFullYear() === currentYear && eventDate.getMonth() === currentMonth;
      });
      break;
    default: // 'all'
      // Show all events (create a copy of the array)
      filteredEvents = [...allEvents];
  }

  // Sort filtered events by date (chronological order)
  filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Display filtered events
  displayEvents();

  // Update filter controls UI
  updateFilterDisplay();
};

/**
 * Displays filtered events in the timeline interface
 * Creates rows of events with alternating directions and animations
 */
const displayEvents = () => {
  const eventsContainer = document.getElementById('eventsContainer');
  eventsContainer.innerHTML = ''; // Clear any existing events

  // If no events, show a message
  if (filteredEvents.length === 0) {
    const noEventsMsg = document.createElement('div');
    noEventsMsg.classList.add('no-events-message');
    noEventsMsg.textContent = 'No events to display. Add your first memory!';
    eventsContainer.appendChild(noEventsMsg);
    return;
  }

  // Create event rows
  const eventsPerRow = 4; // Define how many events per row
  let rows = [];
  for (let i = 0; i < filteredEvents.length; i += eventsPerRow) {
    rows.push(filteredEvents.slice(i, i + eventsPerRow));
  }

  // Loop through the rows and append events to each row
  rows.forEach((row, rowIndex) => {
    const rowElement = document.createElement('div');
    rowElement.classList.add('event-row');

    // Add alternating direction classes for visual flow
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
      eventElement.setAttribute('data-id', event._id);

      // Format the date nicely for display
      const eventDate = new Date(event.date);
      const formattedDate = eventDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      // Create event content HTML
      eventElement.innerHTML = `
        <div class="event-content">
          <h3>${event.eventName}</h3>
          <p class="event-date">${formattedDate}</p>
          ${event.picHolder ? `<p class="pic-holder"><strong>Pic Holder:</strong> ${event.picHolder}</p>` : ''}
          <p class="pics-received">
            <strong>Pictures:</strong> 
            <span class="status ${event.picsReceived ? 'received' : 'pending'}">
              ${event.picsReceived ? '✓ Received' : '⏳ Pending'}
            </span>
          </p>
        </div>
      `;

      // Add click handler to show event details
      eventElement.addEventListener('click', () => {
        showEventDetails(event);
      });

      // Add the delete button with proper event handling
      const deleteButton = document.createElement('button');
      deleteButton.classList.add('delete-btn');
      deleteButton.innerHTML = '❌';
      deleteButton.onclick = (e) => {
        e.stopPropagation(); // Prevent event bubbling to parent click handler
        confirmDelete(event._id, event.eventName);
      };

      eventElement.appendChild(deleteButton);
      eventWrapper.appendChild(eventElement);
      rowElement.appendChild(eventWrapper);
    });

    // Add initial animation state (hidden)
    rowElement.style.opacity = '0';
    rowElement.style.transform = 'translateY(20px)';

    // Append the row to the container
    eventsContainer.appendChild(rowElement);

    // Add C-shaped connectors between rows for visual continuity
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

    // Animate the row appearance with staggered timing
    setTimeout(() => {
      rowElement.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      rowElement.style.opacity = '1';
      rowElement.style.transform = 'translateY(0)';
    }, 100 * rowIndex); // Delay increases with each row
  });

  // Add hover effect for event rows to highlight connectors
  document.querySelectorAll('.event-row').forEach(row => {
    row.addEventListener('mouseenter', () => {
      // Get the previous row to highlight connector
      const prevRow = row.previousElementSibling;
      if (prevRow && prevRow.classList.contains('event-row')) {
        // Add an active class to the previous row
        prevRow.classList.add('connector-active');
      }
    });

    row.addEventListener('mouseleave', () => {
      // Remove active class from all rows when not hovering
      document.querySelectorAll('.event-row').forEach(r => {
        r.classList.remove('connector-active');
      });
    });
  });
};

/**
 * USER INTERFACE FUNCTIONS
 * Functions to manage UI elements, modals, and user interactions
 */

/**
 * Updates the filter display text to show current filtering state
 */
const updateFilterDisplay = () => {
  const filterStatus = document.getElementById('filterStatus');
  if (!filterStatus) return;

  switch (currentView) {
    case 'year':
      filterStatus.textContent = `Showing events from ${currentYear}`;
      break;
    case 'month':
      const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });
      filterStatus.textContent = `Showing events from ${monthName} ${currentYear}`;
      break;
    default:
      filterStatus.textContent = 'Showing all events';
  }
};

/**
 * Shows detailed information about an event in a modal popup
 * @param {Object} event - The event object containing event details
 */
const showEventDetails = (event) => {
  // Check if modal already exists to avoid creating duplicates
  let modal = document.getElementById('eventModal');

  if (!modal) {
    // Create modal if it doesn't exist
    modal = document.createElement('div');
    modal.id = 'eventModal';
    modal.classList.add('modal');
    document.body.appendChild(modal);
  }

  // Format the date nicely for better readability
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Calculate days since event for additional context
  const today = new Date();
  const diffTime = Math.abs(today - eventDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Populate modal content with event information and action buttons
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-modal">&times;</span>
      <h2>${event.eventName}</h2>
      <p class="event-date-full">${formattedDate}</p>
      <p class="event-time-ago">${diffDays} days ago</p>
      ${event.picHolder ? `<p class="modal-pic-holder"><strong>Picture Holder:</strong> ${event.picHolder}</p>` : ''}
      <p class="modal-pics-received">
        <strong>Pictures Status:</strong> 
        <span class="status ${event.picsReceived ? 'received' : 'pending'}">
          ${event.picsReceived ? '✓ Pictures Received' : '⏳ Pictures Pending'}
        </span>
      </p>
      <div class="event-actions">
        <button class="edit-event-btn">Edit</button>
        <button class="delete-event-btn">Delete</button>
      </div>
    </div>
  `;

  // Show the modal with smooth animation
  modal.style.display = 'block';
  setTimeout(() => {
    modal.querySelector('.modal-content').style.transform = 'translateY(0)';
    modal.querySelector('.modal-content').style.opacity = '1';
  }, 10);

  // Set up event listeners for modal interactions
  modal.querySelector('.close-modal').addEventListener('click', closeModal);
  modal.querySelector('.edit-event-btn').addEventListener('click', () => {
    closeModal();
    showEditEventForm(event);
  });
  modal.querySelector('.delete-event-btn').addEventListener('click', () => {
    closeModal();
    confirmDelete(event._id, event.eventName);
  });

  // Close modal when clicking outside the modal content
  window.onclick = (e) => {
    if (e.target === modal) {
      closeModal();
    }
  };
};

// Function to close modal
const closeModal = () => {
  const modal = document.getElementById('eventModal');
  if (modal) {
    modal.querySelector('.modal-content').style.transform = 'translateY(-20px)';
    modal.querySelector('.modal-content').style.opacity = '0';

    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
    // Remove the window click event listener
    window.removeEventListener('click', closeModalOnClickOutside);
  }
};

// Function to close modal when clicking outside
const closeModalOnClickOutside = (e) => {
  const modal = document.getElementById('eventEventModal');
  if (e.target === editModal) {
    closeEditModal();
  }
};

// Function to show edit event form
const showEditEventForm = (event) => {
  // Create edit form modal
  let editModal = document.getElementById('editEventModal');

  if (!editModal) {
    editModal = document.createElement('div');
    editModal.id = 'editEventModal';
    editModal.classList.add('modal');
    document.body.appendChild(editModal);
  }

  // Format date for the date input (YYYY-MM-DD)
  const formattedDate = new Date(event.date).toISOString().split('T')[0];

  // Populate modal content
  editModal.innerHTML = `
    <div class="modal-content">
      <span class="close-modal">&times;</span>
      <h2>Edit Event</h2>
      <form id="editEventForm">
        <div class="form-group">
          <input type="text" id="editEventName" placeholder="Event Name" value="${event.eventName}" required>
          <label for="editEventName">Event Name</label>
        </div>
        <div class="form-group">
          <input type="date" id="editEventDate" placeholder="Date" value="${formattedDate}" required>
          <label for="editEventDate">Date</label>
        </div>
        <div class="form-group">
          <input type="text" id="editPicHolder" placeholder="Picture Holder" value="${event.picHolder || ''}" >
          <label for="editPicHolder">Picture Holder</label>
        </div>
        <div class="form-group checkbox-group">
          <input type="checkbox" id="editPicsReceived" ${event.picsReceived ? 'checked' : ''}>
          <label for="editPicsReceived">Pictures Received</label>
        </div>
        <button type="submit" class="save-btn">Save Changes</button>
      </form>
  </div>
  `;

  // Show the modal with animation
  editModal.style.display = 'block';
  setTimeout(() => {
    editModal.querySelector('.modal-content').style.transform = 'translateY(0)';
    editModal.querySelector('.modal-content').style.opacity = '1';
  }, 10);

  // Close modal when clicking the X
  editModal.querySelector('.close-modal').addEventListener('click', () => {
    closeEditModal();
  });

  // Close modal when clicking outside
  window.onclick = (e) => {
    if (e.target === editModal) {
      closeEditModal();
    }
  };

  // Handle form submission
  document.getElementById('editEventForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const updatedName = document.getElementById('editEventName').value;
    const updatedDate = document.getElementById('editEventDate').value;
    const updatedPicHolder = document.getElementById('editPicHolder').value;
    const updatedPicsReceived = document.getElementById('editPicsReceived').checked;

    console.log('Submitting form with:', { updatedName, updatedDate, updatedPicHolder, updatedPicsReceived });

    const isValidObjectId = (id) => {
      return /^[0-9a-fA-F]{24}$/.test(id);
    };

    if (!isValidObjectId(event._id)) {
      console.error('Invalid event ID:', event._id);
      showNotification('Invalid event ID. Please try again.', 'error');
      return;
    }

    try {
      const url = `https://college-memories-timeline.onrender.com/api/timeline/${event._id}`;
      console.log('PUT request URL:', url);
      console.log('Event ID:', event._id);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventName: updatedName,
          date: updatedDate,
          picHolder: updatedPicHolder,
          picsReceived: updatedPicsReceived
        }),
      });

      if (response.ok) {
        const updatedEvent = await response.json();
        console.log('Event updated:', updatedEvent);
        closeEditModal();
        showNotification('Event updated successfully!', 'success');
        fetchEvents(); // Refresh events
      } else {
        const errorText = await response.text();
        console.error('Failed to update event:', errorText);
        throw new Error('Failed to update event');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      showNotification('Error updating event. Please try again.', 'error');
    }
  });
};

/**
 * EVENT MANAGEMENT FUNCTIONS
 * Functions to handle creating, editing, and deleting events
 */

// Function to close edit modal
const closeEditModal = () => {
  const editModal = document.getElementById('editEventModal');
  if (editModal) {
    editModal.querySelector('.modal-content').style.transform = 'translateY(-20px)';
    editModal.querySelector('.modal-content').style.opacity = '0';

    setTimeout(() => {
      editModal.style.display = 'none';
    }, 300);
  }
};

/**
 * Shows a confirmation dialog before deleting an event
 * @param {string} eventId - The unique ID of the event to delete
 * @param {string} eventName - The name of the event for confirmation message
 */
const confirmDelete = (eventId, eventName) => {
  // Create confirmation modal
  let confirmModal = document.getElementById('confirmModal');

  if (!confirmModal) {
    confirmModal = document.createElement('div');
    confirmModal.id = 'confirmModal';
    confirmModal.classList.add('modal');
    document.body.appendChild(confirmModal);
  }

  // Populate modal content with confirmation message
  confirmModal.innerHTML = `
    <div class="modal-content">
      <h2>Confirm Delete</h2>
      <p>Are you sure you want to delete the event "${eventName}"?</p>
      <div class="modal-actions">
        <button class="cancel-btn">Cancel</button>
        <button class="delete-confirm-btn">Delete</button>
      </div>
    </div>
  `;

  // Show the modal with animation
  confirmModal.style.display = 'block';
  setTimeout(() => {
    confirmModal.querySelector('.modal-content').style.transform = 'translateY(0)';
    confirmModal.querySelector('.modal-content').style.opacity = '1';
  }, 10);

  // Set up event listeners for user response
  confirmModal.querySelector('.cancel-btn').addEventListener('click', closeConfirmModal);
  confirmModal.querySelector('.delete-confirm-btn').addEventListener('click', async () => {
    await deleteEvent(eventId);
    closeConfirmModal();
  });

  // Close modal when clicking outside
  window.onclick = (e) => {
    if (e.target === confirmModal) {
      closeConfirmModal();
    }
  };
};

// Function to close confirmation modal
const closeConfirmModal = () => {
  const confirmModal = document.getElementById('confirmModal');
  if (confirmModal) {
    confirmModal.querySelector('.modal-content').style.transform = 'translateY(-20px)';
    confirmModal.querySelector('.modal-content').style.opacity = '0';

    setTimeout(() => {
      confirmModal.style.display = 'none';
    }, 300);
  }
};

/**
 * Deletes an event from the server and updates the UI
 * @param {string} eventId - The unique ID of the event to delete
 */
const deleteEvent = async (eventId) => {
  try {
    const response = await fetch(`https://college-memories-timeline.onrender.com/api/timeline/${eventId}`, {
      method: 'DELETE',
    });
    const deletedEvent = await response.json();
    console.log('Event deleted:', deletedEvent);

    // Animation for deleting event - fade out and scale down
    const eventElement = document.querySelector(`.event[data-id="${eventId}"]`);
    if (eventElement) {
      eventElement.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      eventElement.style.opacity = '0';
      eventElement.style.transform = 'scale(0.8)';
    }

    // Refresh the timeline after animation completes
    setTimeout(() => {
      fetchEvents(); // Re-fetch and display events after deletion
      showNotification('Event deleted successfully!', 'success');
    }, 500);
  } catch (error) {
    console.error('Error deleting event:', error);
    showNotification('Error deleting event. Please try again.', 'error');
  }
};

/**
 * Creates a new event and adds it to the timeline
 * @param {Event} e - The form submission event
 */
const addEvent = async (e) => {
  e.preventDefault();

  const eventName = document.getElementById('eventTitle').value;
  const eventDate = document.getElementById('eventDate').value;
  const picHolder = document.getElementById('picHolder').value;
  const picsReceived = document.getElementById('picsReceived').checked;

  // Validate form inputs
  if (!eventName || !eventDate) {
    showNotification('Please enter both event title and date', 'error');
    return;
  }

  try {
    // Show loading state on button
    document.getElementById('addEventButton').disabled = true;
    document.getElementById('addEventButton').textContent = 'Adding...';

    // Send POST request to create new event
    const response = await fetch('https://college-memories-timeline.onrender.com/api/timeline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName,
        date: eventDate,
        picHolder,
        picsReceived
      }),
    });

    const newEvent = await response.json();
    console.log('Event added:', newEvent);

    // Reset form fields
    document.getElementById('eventTitle').value = '';
    document.getElementById('eventDate').value = '';
    document.getElementById('picHolder').value = '';
    document.getElementById('picsReceived').checked = false;

    // Show success message
    showNotification('Event added successfully!', 'success');

    // Reset button state
    document.getElementById('addEventButton').disabled = false;
    document.getElementById('addEventButton').textContent = 'Add Event';

    // Refresh events with animation
    fetchEvents();
  } catch (error) {
    console.error('Error adding event:', error);
    showNotification('Error adding event. Please try again.', 'error');

    // Reset button state on error
    document.getElementById('addEventButton').disabled = false;
    document.getElementById('addEventButton').textContent = 'Add Event';
  }
};

/**
 * UTILITY FUNCTIONS
 * Helper functions for notifications, filters, search, and form enhancements
 */

/**
 * Shows a notification message to the user
 * @param {string} message - The message to display
 * @param {string} type - The type of notification ('success', 'error', etc.)
 */
const showNotification = (message, type) => {
  // Create notification element if it doesn't exist
  let notification = document.getElementById('notification');

  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    document.body.appendChild(notification);
  }

  // Set notification content and type
  notification.textContent = message;
  notification.className = 'notification ' + type;

  // Show notification with animation
  notification.style.display = 'block';
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  }, 10);

  // Auto-hide notification after 3 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-20px)';
    setTimeout(() => {
      notification.style.display = 'none';
    }, 300);
  }, 3000);
};

/**
 * Initializes filter controls for the timeline view (all, year, month filters)
 * Creates UI elements and sets up event listeners for filtering functionality
 */
const initializeFilterControls = () => {
  // Create filter controls container
  const filterControls = document.createElement('div');
  filterControls.className = 'filter-controls';

  // Create view select dropdown
  const viewSelect = document.createElement('select');
  viewSelect.id = 'viewSelect';
  viewSelect.innerHTML = `
    <option value="all">All Events</option>
    <option value="year">This Year</option>
    <option value="month">This Month</option>
  `;

  // Create year navigation controls
  const yearNav = document.createElement('div');
  yearNav.className = 'year-nav';
  yearNav.innerHTML = `
    <button id="prevYear">◀</button>
    <span id="currentYearDisplay">${currentYear}</span>
    <button id="nextYear">▶</button>
  `;

  // Create month navigation controls
  const monthNav = document.createElement('div');
  monthNav.className = 'month-nav';
  monthNav.innerHTML = `
    <button id="prevMonth">◀</button>
    <span id="currentMonthDisplay">${new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })}</span>
    <button id="nextMonth">▶</button>
  `;

  // Create filter status display
  const filterStatus = document.createElement('div');
  filterStatus.id = 'filterStatus';
  filterStatus.className = 'filter-status';
  filterStatus.textContent = 'Showing all events';

  // Add elements to container
  filterControls.appendChild(viewSelect);
  filterControls.appendChild(yearNav);
  filterControls.appendChild(monthNav);
  filterControls.appendChild(filterStatus);

  // Insert filter controls before timeline in DOM
  const timelineEl = document.querySelector('.timeline');
  if (timelineEl) {
    timelineEl.insertAdjacentElement('beforebegin', filterControls);
  } else {
    console.error('Timeline element not found!');
  }

  // Set up event listeners for view selection
  viewSelect.addEventListener('change', () => {
    currentView = viewSelect.value;
    filterEvents();

    // Toggle visibility of year/month navigation based on selected view
    if (currentView === 'year' || currentView === 'month') {
      yearNav.style.display = 'flex';
    } else {
      yearNav.style.display = 'none';
    }

    if (currentView === 'month') {
      monthNav.style.display = 'flex';
    } else {
      monthNav.style.display = 'none';
    }
  });

  // Year navigation listeners
  document.getElementById('prevYear').addEventListener('click', () => {
    currentYear--;
    document.getElementById('currentYearDisplay').textContent = currentYear;
    filterEvents();
  });

  document.getElementById('nextYear').addEventListener('click', () => {
    currentYear++;
    document.getElementById('currentYearDisplay').textContent = currentYear;
    filterEvents();
  });

  // Month navigation listeners - handle year rollover
  document.getElementById('prevMonth').addEventListener('click', () => {
    if (currentMonth === 0) {
      currentMonth = 11; // December
      currentYear--;
      document.getElementById('currentYearDisplay').textContent = currentYear;
    } else {
      currentMonth--;
    }
    document.getElementById('currentMonthDisplay').textContent = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });
    filterEvents();
  });

  document.getElementById('nextMonth').addEventListener('click', () => {
    if (currentMonth === 11) {
      currentMonth = 0; // January
      currentYear++;
      document.getElementById('currentYearDisplay').textContent = currentYear;
    } else {
      currentMonth++;
    }
    document.getElementById('currentMonthDisplay').textContent = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });
    filterEvents();
  });

  // Initially hide year/month navigation until specific view is selected
  yearNav.style.display = 'none';
  monthNav.style.display = 'none';
};

/**
 * Creates and sets up search functionality for filtering events by name or date
 */
const setupSearch = () => {
  // Create search container with input and clear button
  const searchContainer = document.createElement('div');
  searchContainer.className = 'search-container';

  // Create search input and clear button HTML
  searchContainer.innerHTML = `
    <input type="text" id="searchEvents" placeholder="Search events...">
    <button id="clearSearch">Clear</button>
  `;

  // Insert search container before timeline in DOM
  const timelineEl = document.querySelector('.timeline');
  if (timelineEl) {
    timelineEl.insertAdjacentElement('beforebegin', searchContainer);
  } else {
    console.error('Timeline element not found!');
  }

  // Add search functionality with real-time filtering
  const searchInput = document.getElementById('searchEvents');
  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();

    if (searchTerm.length === 0) {
      // If search is empty, restore filtered view
      filterEvents();
      return;
    }

    // Filter events based on search term (matches event name, date, or pic holder)
    filteredEvents = allEvents.filter(event =>
      event.eventName.toLowerCase().includes(searchTerm) ||
      new Date(event.date).toLocaleDateString().includes(searchTerm) ||
      (event.picHolder && event.picHolder.toLowerCase().includes(searchTerm))
    );

    // Display filtered search results
    displayEvents();

    // Update status to show search results
    const filterStatus = document.getElementById('filterStatus');
    if (filterStatus) {
      filterStatus.textContent = `Search results for "${searchTerm}"`;
    }
  });

  // Add clear button functionality to reset search
  document.getElementById('clearSearch').addEventListener('click', () => {
    searchInput.value = '';
    filterEvents(); // Restore regular filtered view
  });
};

/**
 * Enhances the add event form with floating labels and improved UX
 * Adds visual animations and keyboard navigation
 */
const enhanceForm = () => {
  const form = document.getElementById('addEventForm');

  // Add visual enhancements class
  form.classList.add('enhanced-form');

  // Add keyboard navigation - Enter key moves between fields
  document.getElementById('eventTitle').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('eventDate').focus();
    }
  });

  document.getElementById('eventDate').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('picHolder').focus();
    }
  });

  document.getElementById('picHolder').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('picsReceived').focus();
    }
  });

  document.getElementById('picsReceived').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('addEventButton').click();
    }
  });

  // Add event listener for the "Add Event" button
  document.getElementById('addEventButton').addEventListener('click', addEvent);

  // Add animated floating label effect to inputs
  const inputs = form.querySelectorAll('input[type="text"], input[type="date"]');
  inputs.forEach(input => {
    // Create a wrapper div for each input
    const wrapper = document.createElement('div');
    wrapper.className = 'input-wrapper';

    // Create a floating label from the placeholder text
    const label = document.createElement('label');
    label.setAttribute('for', input.id);
    label.textContent = input.getAttribute('placeholder');

    // Replace the input in the DOM with the new wrapper structure
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(label);
    wrapper.appendChild(input);

    // Remove placeholder as we now have a floating label
    input.removeAttribute('placeholder');

    // Add focus/blur events for floating label animation
    input.addEventListener('focus', () => {
      wrapper.classList.add('active');
    });

    input.addEventListener('blur', () => {
      if (input.value === '') {
        wrapper.classList.remove('active');
      }
    });

    // Set initial state if input already has value
    if (input.value !== '') {
      wrapper.classList.add('active');
    }
  });

  // Handle checkbox separately (no floating label needed)
  const checkbox = form.querySelector('input[type="checkbox"]');
  if (checkbox && !checkbox.parentNode.classList.contains('checkbox-wrapper')) {
    // Only create wrapper if checkbox is not already wrapped
    const wrapper = document.createElement('div');
    wrapper.className = 'checkbox-wrapper';

    // Create a label for the checkbox
    const label = document.createElement('label');
    label.setAttribute('for', checkbox.id);
    label.textContent = 'Pictures Received';

    // Replace the checkbox in the DOM with the new wrapper structure
    checkbox.parentNode.insertBefore(wrapper, checkbox);
    wrapper.appendChild(checkbox);
    wrapper.appendChild(label);
  }
};

/**
 * APPLICATION INITIALIZATION
 * Main initialization function that sets up all components
 */

/**
 * Initializes the complete timeline application
 * Sets up all components and functionality
 */
const initApp = () => {
  fetchEvents();           // Load events from server
  initializeFilterControls(); // Set up filtering UI
  setupSearch();          // Set up search functionality
  enhanceForm();          // Enhance the add event form
};

// Start the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);