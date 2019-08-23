 // Client ID and API key from the Developer Console
 var CLIENT_ID = '1048109730739-asvsqqu7o7ejo5l98tvu906r80fqt5mo.apps.googleusercontent.com';
 var API_KEY = 'AIzaSyDPSDRbeULm6JPecT5X7TvxNzgSonlJQVA';

 // Array of API discovery doc URLs for APIs used by the quickstart
 var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

 // Authorization scopes required by the API; multiple scopes can be
 // included, separated by spaces.
 var SCOPES = "https://www.googleapis.com/auth/calendar";

 var authorizeButton = document.getElementById('authorize_button');
 var signoutButton = document.getElementById('signout_button');

 var startDate = document.getElementById('startDateInput');
 var endDate = document.getElementById('endDateInput');

 var globalEventData_google;
 /**
  *  On load, called to load the auth2 library and API client library.
  */
 function handleClientLoad() {
   gapi.load('client:auth2', initClient);
 }

 /**
  *  Initializes the API client library and sets up sign-in state
  *  listeners.
  */
 function initClient() {
     auth2 = gapi.client.init({
     apiKey: API_KEY,
     clientId: CLIENT_ID,
     discoveryDocs: DISCOVERY_DOCS,
     scope: SCOPES
   }).then(function () {
     // Listen for sign-in state changes.
     gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

     // Handle the initial sign-in state.
     updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
     authorizeButton.onclick = handleAuthClick;
     signoutButton.onclick = handleSignoutClick;
   }, function(error) {
     appendPre(JSON.stringify(error, null, 2));
   });
 }

 /**
  *  Called when the signed in status changes, to update the UI
  *  appropriately. After a sign-in, the API is called.
  */
 function updateSigninStatus(isSignedIn) {
   if (isSignedIn) {
     authorizeButton.style.display = 'none';
     signoutButton.style.display = 'block';
     listUpcomingEvents();
   } else {
     authorizeButton.style.display = 'block';
     signoutButton.style.display = 'none';
   }
 }

 /**
  *  Sign in the user upon button click.
  */
 function handleAuthClick(event) {
   gapi.auth2.getAuthInstance().signIn();
 }

 /**
  *  Sign out the user upon button click.
  */
 function handleSignoutClick(event) {
   gapi.auth2.getAuthInstance().signOut();
 }

 /**
  * Append a pre element to the body containing the given message
  * as its text node. Used to display the results of the API call.
  *
  * @param {string} message Text to be placed in pre element.
  */
 function appendPre(message) {
   var pre = document.getElementById('content');
   var textContent = document.createTextNode(message + '\n');
   pre.appendChild(textContent);
 }

 /**
  * Print the summary and start datetime/date of the next ten events in
  * the authorized user's calendar. If no events are found an
  * appropriate message is printed.
  */
 async function listUpcomingEvents() {
   new Promise(resolve => {
    document.getElementById('content').innerHTML = '';
    gapi.client.calendar.events.list({
     'calendarId': 'primary',
     'timeMax': (new Date(endDate.value + 'T23:59:59')).toISOString(),
     'timeMin': (new Date(startDate.value + 'T00:00:00')).toISOString(),
     'showDeleted': false,
     'singleEvents': true,
     'orderBy': 'startTime'
   }).then(function(response) {
     var events = response.result.items;
     
     appendPre('Upcoming events:');

     if (events.length > 0) {
       for (i = 0; i < events.length; i++) {
         var event = events[i];
         var when = event.start.dateTime;
        //  if (!when) {
        //    when = event.start.date;
        //  }
        //  appendPre(event.summary + ' (' + when + ')')
        appendPre(when);
       }

       globalEventData_google = events;
     } else {
       appendPre('No upcoming events found.');
     }
   });
   resolve();
  });
 }

 async function getGlobalEventData_google(){

     await new Promise(async resolve => {
         await listUpcomingEvents().then(() => resolve());
     });
    
     return globalEventData_google;
 }
 
 function createEvent_Google(dateTime, description) {
     dT = new Date(dateTime);
     
     var event = {
         'summary': description,
         'description': 'From Paul Gurman\'s script',
         'start': {
             dateTime: dateTime
         },
         'end': {
             dateTime: new Date(dT.getTime() + 1800000)
         }
     }

     var request = gapi.client.calendar.events.insert({
         'calendarId': 'primary',
         'resource': event
     });

     request.execute(function(event) {
        appendPre('Event created: ' + event.htmlLink);
        listUpcomingEvents();
      });

      console.log("Google script complete");
 };